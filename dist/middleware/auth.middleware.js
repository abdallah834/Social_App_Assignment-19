"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authentication = void 0;
const enums_1 = require("../common/enums");
const exceptions_1 = require("../common/exceptions");
const services_1 = require("../common/services");
const authentication = (tokenType = enums_1.TokenType.ACCESS) => {
    return async (req, res, next) => {
        const tokenService = new services_1.TokenService();
        if (!req.headers?.authorization) {
            throw new exceptions_1.BadRequestException("Missing authorization key");
        }
        const { authorization } = req.headers;
        const [flag, token] = authorization.split(" ");
        if (!flag || !token) {
            throw new exceptions_1.BadRequestException("Missing authorization parts");
        }
        switch (flag) {
            default: {
                const { decodedToken, userAccount } = await tokenService.decodeToken({
                    token,
                    tokenType,
                });
                req.user = userAccount;
                req.decoded = decodedToken;
                break;
            }
        }
        next();
    };
};
exports.authentication = authentication;
