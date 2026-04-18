"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const response_1 = require("../../common/response");
const middleware_1 = require("../../middleware");
const user_service_1 = __importDefault(require("./user.service"));
const user_authorization_1 = require("./user.authorization");
const enums_1 = require("../../common/enums");
const router = (0, express_1.Router)();
router.get("/profile", (0, middleware_1.authentication)(), (0, middleware_1.authorization)(user_authorization_1.endpoint.profile), async (req, res, next) => {
    const data = await user_service_1.default.profile(req.user);
    return (0, response_1.successResponse)({ res, data });
});
router.post("/logout", (0, middleware_1.authentication)(), async (req, res, next) => {
    const data = await user_service_1.default.logout(req.body, req.user, req.decoded);
    return (0, response_1.successResponse)({
        res,
        data,
        message: req.body.flag === 0
            ? "Logged out from all devices successfully"
            : "Logged out from one device successfully",
    });
});
router.post("/rotateToken", (0, middleware_1.authentication)(enums_1.TokenType.REFRESH), async (req, res, next) => {
    const data = await user_service_1.default.rotateToken(req.user, req.decoded, `${req.protocol}://${req.host}`);
    return (0, response_1.successResponse)({ res, data });
});
exports.default = router;
