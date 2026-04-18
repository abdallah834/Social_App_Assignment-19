"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepo = void 0;
const models_1 = require("../models");
const base_repo_1 = require("./base.repo");
class UserRepo extends base_repo_1.DataBaseRepo {
    constructor() {
        super(models_1.userModel);
    }
}
exports.UserRepo = UserRepo;
