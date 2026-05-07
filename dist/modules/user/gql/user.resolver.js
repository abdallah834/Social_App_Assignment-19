"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userGQLResolver = exports.UserResolver = void 0;
const user_service_1 = __importDefault(require("../user.service"));
class UserResolver {
    userService;
    constructor() {
        this.userService = user_service_1.default;
    }
    profile = async (parent, args) => {
        const data = await this.userService.profile({});
        return { message: "User", data };
    };
}
exports.UserResolver = UserResolver;
exports.userGQLResolver = new UserResolver();
