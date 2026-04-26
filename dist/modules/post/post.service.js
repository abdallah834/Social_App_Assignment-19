"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postService = exports.PostService = void 0;
const services_1 = require("../../common/services");
const repository_1 = require("../../DB/repository");
const exceptions_1 = require("../../common/exceptions");
class PostService {
    userRepo;
    redis;
    notification;
    postRepo;
    constructor() {
        this.userRepo = new repository_1.UserRepo();
        this.redis = services_1.redisService;
        this.postRepo = new repository_1.PostRepo();
        this.notification = services_1.notificationService;
    }
    async createPost({ availability, content, files, tags }, user) {
        if (tags?.length) {
            const mentionedAccounts = await this.userRepo.find({
                filter: { _id: { $in: tags } },
            });
            if (mentionedAccounts.length !== tags.length) {
                throw new exceptions_1.NotFoundException("Couldn't find mentioned user accounts");
            }
        }
    }
}
exports.PostService = PostService;
exports.postService = new PostService();
