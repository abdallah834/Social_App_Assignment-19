"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentRepo = void 0;
const models_1 = require("../models");
const base_repo_1 = require("./base.repo");
class CommentRepo extends base_repo_1.DataBaseRepo {
    constructor() {
        super(models_1.commentModel);
    }
}
exports.CommentRepo = CommentRepo;
