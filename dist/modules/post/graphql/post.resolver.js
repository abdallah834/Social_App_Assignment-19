"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postResolver = exports.PostResolver = void 0;
const post_service_1 = require("../post.service");
class PostResolver {
    postService;
    constructor() {
        this.postService = post_service_1.postService;
    }
    listPosts = async (parent, args) => {
        const data = await this.postService.allPosts(args, {});
        return { message: "listed posts", data };
    };
}
exports.PostResolver = PostResolver;
exports.postResolver = new PostResolver();
