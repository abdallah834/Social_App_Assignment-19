"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const google_auth_library_1 = require("google-auth-library");
const enums_1 = require("../../common/enums");
const provider_enums_1 = require("../../common/enums/provider.enums");
const exceptions_1 = require("../../common/exceptions");
const jwt_1 = require("../../common/services/jwt");
const redis_1 = require("../../common/services/redis");
const email_1 = require("../../common/utils/email");
const security_1 = require("../../common/utils/security");
const user_repo_1 = require("../../DB/repository/user.repo");
const config_1 = require("../../common/config/config");
class AuthService {
    userRepo;
    redis;
    tokenService;
    constructor() {
        this.userRepo = new user_repo_1.UserRepo();
        this.redis = redis_1.redisService;
        this.tokenService = new jwt_1.TokenService();
    }
    async signup({ username, email, password, phone, }) {
        const checkExistingUser = await this.userRepo.findOne({
            filter: { email },
            projection: "email",
            options: { lean: true },
        });
        if (checkExistingUser) {
            throw new exceptions_1.ConflictException("This email already exists");
        }
        const user = (await this.userRepo.createOne({
            data: {
                username,
                email,
                password: password,
                phone: phone ? phone : null,
            },
        })) || [];
        if (!user) {
            throw new exceptions_1.BadRequestException("Failed to create account");
        }
        email_1.emailEmitter.emit(enums_1.EmailEnum.CONFIRM_EMAIL, async () => {
            await this.generateAndSendConfirmationOtp(email, {
                subject: enums_1.EmailEnum.CONFIRM_EMAIL,
                title: "Email verification",
            });
        });
        return user;
    }
    async login({ email, password }, issuer) {
        const user = await this.userRepo.findOne({
            filter: {
                email,
                provider: provider_enums_1.ProviderEnums.SYSTEM,
                confirmedAt: { $exists: true },
            },
        });
        if (!user) {
            throw new exceptions_1.NotFoundException("Please make sure to verify you account before login");
        }
        if (!(await (0, security_1.compareHash)(user.password, password))) {
            throw new exceptions_1.BadRequestException("Invalid login credentials");
        }
        user.phone = await (0, security_1.decrypt)(user.phone);
        return this.tokenService.createLoginTokens(user, issuer);
    }
    async generateAndSendConfirmationOtp(email, { subject = enums_1.EmailEnum.CONFIRM_EMAIL, title = "Email verification", } = {}) {
        const blockKey = this.redis.otpBlockKey(email, { type: subject });
        const maxRequests = this.redis.maxOtpRequestsKey(email, {
            type: subject,
        });
        const [remainingBlockTime, checkMaxOtpRequests, maxRequestsTtl] = await Promise.all([
            this.redis.redisGetTtl(blockKey),
            Number(this.redis.redisGet(maxRequests) || 0),
            this.redis.redisGetTtl(this.redis.maxOtpRequestsKey(email)),
        ]);
        if (remainingBlockTime > 0) {
            throw new exceptions_1.ConflictException(`You have been blocked from requesting newer OTPs try again after ${remainingBlockTime} ${remainingBlockTime > 1 ? `seconds` : `second`}`);
        }
        if (checkMaxOtpRequests >= 3) {
            await this.redis.redisSet({
                key: blockKey,
                value: 1,
                ttl: 7 * 60,
            });
            throw new exceptions_1.ConflictException(`You have reached the maximum amount of requests for the OTP try again after ${maxRequestsTtl} ${maxRequestsTtl > 1 ? `second` : `seconds`}`);
        }
        const generatedOtp = (0, email_1.generateOTP)();
        await this.redis.redisSet({
            key: this.redis.otpKey(email, { type: subject }),
            value: await (0, security_1.generateHash)(`${generatedOtp}`),
            ttl: 120,
        });
        checkMaxOtpRequests > 0
            ? await this.redis.redisIncrKey(maxRequests)
            : await this.redis.redisSet({ key: maxRequests, value: 1, ttl: 300 });
        await (0, email_1.sendEmail)({
            to: email,
            subject: enums_1.EmailConfig[subject].title,
            html: `<span>The confirmation code for your account is</span><h2>${generatedOtp}</h2>`,
        });
        return;
    }
    async confirmEmail({ email, otp }) {
        const existingAcc = await this.userRepo.findOne({
            filter: {
                email,
                confirmedAt: { $exists: false },
                provider: provider_enums_1.ProviderEnums.SYSTEM,
            },
            options: { lean: true },
        });
        if (!existingAcc) {
            throw new exceptions_1.NotFoundException("This account is either already verified or doesn't exist");
        }
        const hashedOtp = await this.redis.redisGet(this.redis.otpKey(email, { type: enums_1.EmailEnum.CONFIRM_EMAIL }));
        if (!hashedOtp) {
            throw new exceptions_1.NotFoundException("Expired OTP");
        }
        if (!(await (0, security_1.compareHash)(`${hashedOtp}`, `${otp}`))) {
            throw new exceptions_1.BadRequestException("Invalid OTP");
        }
        await this.userRepo.updateOne({
            filter: { email },
            update: { confirmedAt: new Date() },
        });
        await this.redis.redisDelKeys(await this.redis.redisKeys(this.redis.otpKey(email, { type: enums_1.EmailEnum.CONFIRM_EMAIL })));
        return;
    }
    async resendConfirmationEmail({ email }) {
        const account = await this.userRepo.findOne({
            filter: {
                email,
                confirmedAt: { $exists: false },
                provider: provider_enums_1.ProviderEnums.SYSTEM,
            },
        });
        if (!account) {
            throw new exceptions_1.NotFoundException("Account is either already verified or not found");
        }
        const otpTtl = await this.redis.redisGetTtl(this.redis.otpKey(email, { type: enums_1.EmailEnum.CONFIRM_EMAIL }));
        if (otpTtl > 0) {
            throw new exceptions_1.ConflictException(`Can't send a new OTP while the older OTP is still valid try again after ${otpTtl} ${otpTtl > 1 ? `seconds` : `second`}.`);
        }
        email_1.emailEmitter.emit(enums_1.EmailEnum.CONFIRM_EMAIL, async () => {
            await this.generateAndSendConfirmationOtp(email);
        });
        return;
    }
    async verifyGoogleAccount(idToken) {
        const client = new google_auth_library_1.OAuth2Client();
        const ticket = await client.verifyIdToken({
            idToken,
            audience: config_1.WEB_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload)
            throw new exceptions_1.BadRequestException("No payload found");
        if (!payload.email_verified) {
            throw new exceptions_1.BadRequestException("Failed to authenticate this account with gmail");
        }
        return payload;
    }
    async loginWithGmail(idToken, issuer) {
        const payload = await this.verifyGoogleAccount(idToken);
        const existingUser = await this.userRepo.findOne({
            filter: {
                email: payload.email,
                provider: provider_enums_1.ProviderEnums.GOOGLE,
            },
        });
        if (!existingUser) {
            throw new exceptions_1.BadRequestException("Invalid login credentials or not a registered account");
        }
        return await this.tokenService.createLoginTokens(existingUser, issuer);
    }
    async signupWithGmail(idToken, issuer) {
        const payload = await this.verifyGoogleAccount(idToken);
        const existingUser = await this.userRepo.findOne({
            filter: {
                email: payload.email,
            },
        });
        if (existingUser) {
            if (existingUser.provider === provider_enums_1.ProviderEnums.SYSTEM) {
                throw new exceptions_1.ConflictException("Account already exists with different provider");
            }
            const account = await this.loginWithGmail(idToken, issuer);
            return { account, status: 200 };
        }
        const createdUser = await this.userRepo.createOne({
            data: {
                firstName: payload.given_name,
                lastName: payload.family_name,
                email: payload.email,
                provider: provider_enums_1.ProviderEnums.GOOGLE,
                profileImage: payload.picture,
                confirmedAt: new Date(),
            },
        });
        return await this.tokenService.createLoginTokens(createdUser, issuer);
    }
    async reqForgetPasswordOTP({ email }) {
        const checkExistingOTP = await this.redis.redisGetTtl(this.redis.otpKey(email, { type: enums_1.EmailEnum.FORGOT_PASSWORD }));
        if (checkExistingOTP > 0) {
            throw new exceptions_1.ConflictException("Can't request a new OTP while the older one is still valid");
        }
        const userAccount = await this.userRepo.findOne({
            filter: {
                email,
                confirmedAt: { $exists: true },
                provider: provider_enums_1.ProviderEnums.SYSTEM,
            },
        });
        if (!userAccount) {
            throw new exceptions_1.NotFoundException("Make sure to enter an existing account");
        }
        email_1.emailEmitter.emit(enums_1.EmailEnum.CONFIRM_EMAIL, async () => {
            await this.generateAndSendConfirmationOtp(email, {
                subject: enums_1.EmailEnum.FORGOT_PASSWORD,
                title: "Reset Password",
            });
        });
    }
    async verifyForgetPasswordOTP({ email, otp, }) {
        const hashedOTP = await this.redis.redisGet(this.redis.otpKey(email, { type: enums_1.EmailEnum.FORGOT_PASSWORD }));
        if (!hashedOTP) {
            throw new exceptions_1.NotFoundException("No OTP found for this account");
        }
        if (!(await (0, security_1.compareHash)(hashedOTP, otp))) {
            throw new exceptions_1.NotFoundException("The OTP you entered is invalid");
        }
    }
    async changeForgottenPassword({ email, otp, newPassword, }) {
        await this.verifyForgetPasswordOTP({ email, otp });
        const userAccount = await this.userRepo.findOneAndUpdate({
            filter: {
                email,
                confirmedAt: { $exists: true },
                provider: provider_enums_1.ProviderEnums.SYSTEM,
            },
            update: {
                password: await (0, security_1.generateHash)(newPassword),
                changedCredentialsTime: new Date(),
            },
        });
        if (!userAccount) {
            throw new exceptions_1.NotFoundException("Account doesn't exist");
        }
        const allOtpKeys = await this.redis.redisKeys(this.redis.otpKey(email, { type: enums_1.EmailEnum.FORGOT_PASSWORD }));
        const tokenKeys = await this.redis.redisKeys(this.redis.redisBaseRevokeTokenKey(userAccount._id));
        await this.redis.redisDelKeys([...allOtpKeys, ...tokenKeys]);
    }
}
exports.default = new AuthService();
