"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../../common/config/config");
const enums_1 = require("../../common/enums");
const exceptions_1 = require("../../common/exceptions");
const services_1 = require("../../common/services");
const user_repo_1 = require("../../DB/repository/user.repo");
class UserService {
    userRepo;
    redis;
    tokenService;
    constructor() {
        this.userRepo = new user_repo_1.UserRepo();
        this.tokenService = new services_1.TokenService();
        this.redis = services_1.redisService;
    }
    async profile(user) {
        return user;
    }
    async logout({ flag }, user, { jti, iat, sub, }) {
        let statusCode = 200;
        switch (flag) {
            case enums_1.LoggedOutDevices.ALL:
                await this.userRepo.findByIdAndUpdate({
                    _id: user._id,
                    update: { changedCredentialsTime: new Date() },
                });
                await this.redis.redisDelKeys(await this.redis.redisKeys(this.redis.redisBaseRevokeTokenKey(sub)));
                statusCode = 201;
                break;
            default:
                await this.tokenService.createRevokeToken({
                    userId: sub,
                    jti,
                    ttl: iat + Number(config_1.REFRESH_TOKEN_EXPIRATION_TIME),
                });
                statusCode = 201;
                break;
        }
        return statusCode;
    }
    async rotateToken(user, { sub, jti, iat, }, issuer) {
        if (Date.now() - iat < 25 * 60 * 1000) {
            throw new exceptions_1.ConflictException("Current access token is still valid");
        }
        await this.tokenService.createRevokeToken({
            userId: sub,
            jti,
            ttl: iat + Number(config_1.REFRESH_TOKEN_EXPIRATION_TIME),
        });
        return await this.tokenService.createLoginTokens(user, issuer);
    }
}
exports.default = new UserService();
