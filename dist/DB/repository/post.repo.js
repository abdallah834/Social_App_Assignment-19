"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostRepo = void 0;
const models_1 = require("../models");
const base_repo_1 = require("./base.repo");
class PostRepo extends base_repo_1.DataBaseRepo {
    constructor() {
        super(models_1.postModel);
    }
}
exports.PostRepo = PostRepo;
