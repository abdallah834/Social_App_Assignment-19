"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const node_crypto_1 = require("node:crypto");
const config_1 = require("../../config/config");
const enums_1 = require("../../enums");
const exceptions_1 = require("../../exceptions");
const redis_1 = require("../redis");
const user_repo_1 = require("./../../../DB/repository/user.repo");
const token_enums_1 = require("./../../enums/token.enums");
class TokenService {
    userRepo;
    redisRepo;
    constructor() {
        this.userRepo = new user_repo_1.UserRepo();
        this.redisRepo = redis_1.redisService;
    }
    sign({ payload, secretOrPrivateKey = config_1.USER_TOKEN_SECRET_KEY, options, }) {
        return jsonwebtoken_1.default.sign(payload, secretOrPrivateKey, options);
    }
    verify({ token, secretOrPrivateKey = config_1.USER_TOKEN_SECRET_KEY, }) {
        return jsonwebtoken_1.default.verify(token, secretOrPrivateKey);
    }
    async getTokenSignature(role) {
        let signatures;
        let audience = enums_1.AudienceEnum.USER;
        switch (role) {
            case enums_1.RoleEnum.ADMIN:
                signatures = {
                    accessSignature: config_1.SYSTEM_TOKEN_SECRET_KEY,
                    refreshSignature: config_1.SYS_REFRESH_TOKEN_SECRET_KEY,
                };
                audience = enums_1.AudienceEnum.SYSTEM;
                break;
            default:
                signatures = {
                    accessSignature: config_1.USER_TOKEN_SECRET_KEY,
                    refreshSignature: config_1.USER_REFRESH_TOKEN_SECRET_KEY,
                };
                audience = enums_1.AudienceEnum.USER;
                break;
        }
        return { signatures, audience };
    }
    async getSignatureLevel(tokenType = token_enums_1.TokenType.ACCESS, signatureLevel) {
        let signatures = (await this.getTokenSignature(signatureLevel)).signatures;
        let result;
        switch (tokenType) {
            case token_enums_1.TokenType.REFRESH:
                result = signatures.refreshSignature;
                break;
            default:
                result = signatures.accessSignature;
                break;
        }
        return result;
    }
    async createLoginTokens(user, issuer) {
        const [accessAndRefreshSigns, audience] = await Promise.all([
            (await this.getTokenSignature(user.role)).signatures,
            (await this.getTokenSignature(user.role)).audience,
        ]);
        const jtId = (0, node_crypto_1.randomUUID)();
        const accessToken = this.sign({
            payload: { sub: user._id },
            options: {
                issuer,
                audience: [
                    token_enums_1.TokenType.ACCESS,
                    audience,
                ],
                expiresIn: Number(config_1.ACCESS_TOKEN_EXPIRATION_TIME),
                jwtid: jtId,
            },
        });
        const refreshToken = this.sign({
            payload: { sub: user._id },
            secretOrPrivateKey: accessAndRefreshSigns.refreshSignature,
            options: {
                issuer,
                audience: [
                    token_enums_1.TokenType.REFRESH,
                    audience,
                ],
                expiresIn: Number(config_1.REFRESH_TOKEN_EXPIRATION_TIME),
                jwtid: jtId,
            },
        });
        return { accessToken, refreshToken };
    }
    async decodeToken({ token, tokenType = token_enums_1.TokenType.ACCESS, }) {
        const decodedToken = jsonwebtoken_1.default.decode(token);
        if (!decodedToken?.aud?.length || decodedToken?.aud?.length <= 1) {
            throw new exceptions_1.BadRequestException("Failed to decode token without audience");
        }
        const [decodedTokenType, audienceType] = decodedToken.aud;
        const numDecodedTokenType = Number(decodedTokenType);
        const numAudienceType = Number(audienceType);
        if (numDecodedTokenType !== tokenType) {
            throw new exceptions_1.BadRequestException("Invalid token type");
        }
        if (decodedToken.jti &&
            (await this.redisRepo.redisGet(this.redisRepo.redisRevokeTokenKey({
                userId: decodedToken.sub,
                jti: decodedToken.jti,
            })))) {
            throw new exceptions_1.UnauthorizedException("Invalid login token");
        }
        const signatureLevel = await this.getSignatureLevel(numDecodedTokenType, numAudienceType);
        const { accessSignature, refreshSignature } = (await this.getTokenSignature(signatureLevel)).signatures;
        const verifiedData = this.verify({
            token,
            secretOrPrivateKey: tokenType === token_enums_1.TokenType.REFRESH ? refreshSignature : accessSignature,
        });
        const userAccount = await this.userRepo.findOne({
            filter: { _id: verifiedData.sub },
        });
        if (!userAccount) {
            throw new exceptions_1.UnauthorizedException("Not registered account");
        }
        if (userAccount.changedCredentialsTime &&
            userAccount.changedCredentialsTime?.getTime() >=
                (decodedToken.iat || 0) * 1000) {
            throw new exceptions_1.UnauthorizedException("Invalid login session");
        }
        return { userAccount, decodedToken };
    }
    async createRevokeToken({ userId, jti, ttl, }) {
        await this.redisRepo.redisSet({
            key: this.redisRepo.redisRevokeTokenKey({ userId, jti }),
            value: jti,
            ttl,
        });
        return;
    }
}
exports.TokenService = TokenService;
