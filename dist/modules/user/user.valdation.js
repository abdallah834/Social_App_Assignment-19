"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileGQLValidation = void 0;
const zod_1 = __importDefault(require("zod"));
exports.profileGQLValidation = zod_1.default.strictObject({
    search: zod_1.default
        .string({ error: "Search must be a string" })
        .min(2, { error: "Search must contain at least 2 characters" })
        .optional(),
});
