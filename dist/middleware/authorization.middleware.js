"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GQLAuthorization = exports.authorization = void 0;
const exceptions_1 = require("../common/exceptions");
const gql_excepitions_1 = require("../common/exceptions/gql.excepitions");
const authorization = (accessRoles) => {
    return async (req, res, next) => {
        if (!accessRoles.includes(req.user?.role)) {
            throw new exceptions_1.UnauthorizedException("Access denied");
        }
        next();
    };
};
exports.authorization = authorization;
const GQLAuthorization = (accessRoles, user) => {
    if (!accessRoles.includes(user?.role)) {
        throw (0, gql_excepitions_1.mapGQLError)(new exceptions_1.ForbiddenException("Access denied"));
    }
    return true;
};
exports.GQLAuthorization = GQLAuthorization;
