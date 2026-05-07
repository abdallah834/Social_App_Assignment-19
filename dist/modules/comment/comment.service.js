"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentService = exports.CommentService = void 0;
const mongoose_1 = require("mongoose");
const exceptions_1 = require("../../common/exceptions");
const services_1 = require("../../common/services");
const post_1 = require("../../common/utils/post");
const repository_1 = require("../../DB/repository");
const s3_service_1 = require("./../../common/services/aws-sdk/s3.service");
class CommentService {
    userRepo;
    redis;
    commentRepo;
    notification;
    postRepo;
    s3;
    constructor() {
        this.userRepo = new repository_1.UserRepo();
        this.redis = services_1.redisService;
        this.postRepo = new repository_1.PostRepo();
        this.notification = services_1.notificationService;
        this.s3 = s3_service_1.s3Service;
        this.commentRepo = new repository_1.CommentRepo();
    }
    async createComment({ postId }, { content, files, tags }, user) {
        const post = await this.postRepo.findOne({
            filter: { _id: postId, $or: (0, post_1.getPostsAvailability)(user) },
        });
        if (!post) {
            throw new exceptions_1.BadRequestException("Failed to comment on this post");
        }
        const mentions = [];
        const fcmTokens = [];
        if (tags?.length) {
            const mentionedAccounts = await this.userRepo.find({
                filter: { _id: { $in: tags } },
            });
            if (mentionedAccounts.length !== tags.length) {
                throw new exceptions_1.NotFoundException("Couldn't find mentioned user accounts");
            }
            tags.map(async (tag) => {
                mentions.push(mongoose_1.Types.ObjectId.createFromHexString(tag));
                ((await this.redis.getFCMs(tag)) || []).map((token) => {
                    fcmTokens.push(token);
                });
            });
        }
        let attachments = [];
        const folderId = post.folderId;
        if (files?.length) {
            attachments = await this.s3.uploadMultipleAssets({
                files: files,
                path: `Post/${folderId}`,
            });
        }
        const comment = await this.commentRepo.createOne({
            data: {
                createdBy: user._id,
                content,
                attachments,
                postId: post._id,
                tags: mentions,
            },
        });
        if (!comment) {
            if (attachments?.length) {
                await this.s3.deleteMultipleAssets({
                    Keys: attachments.map((attachment) => {
                        return { Key: attachment };
                    }),
                });
            }
            throw new exceptions_1.BadRequestException("Failed to create comment");
        }
        if (fcmTokens.length) {
            await this.notification.sendMultipleNotifications({
                data: {
                    title: "Comment mention",
                    body: JSON.stringify({
                        message: `${user.username} mentioned you in a recent comment`,
                        postId: post._id,
                        commentId: comment._id,
                    }),
                },
                tokens: fcmTokens,
            });
        }
        return comment.toJSON();
    }
    async createCommentReply({ postId, commentId }, { content, files, tags }, user) {
        const comment = await this.commentRepo.findOne({
            filter: { _id: commentId, postId },
            options: {
                populate: [
                    { path: "postId", match: { $or: (0, post_1.getPostsAvailability)(user) } },
                ],
            },
        });
        if (!comment?.postId) {
            throw new exceptions_1.BadRequestException("Failed to reply to this comment");
        }
        const mentions = [];
        const fcmTokens = [];
        if (tags?.length) {
            const mentionedAccounts = await this.userRepo.find({
                filter: { _id: { $in: tags } },
            });
            if (mentionedAccounts.length !== tags.length) {
                throw new exceptions_1.NotFoundException("Couldn't find mentioned user accounts");
            }
            tags.map(async (tag) => {
                mentions.push(mongoose_1.Types.ObjectId.createFromHexString(tag));
                ((await this.redis.getFCMs(tag)) || []).map((token) => {
                    fcmTokens.push(token);
                });
            });
        }
        let attachments = [];
        const post = comment.postId;
        const folderId = post.folderId;
        if (files?.length) {
            attachments = await this.s3.uploadMultipleAssets({
                files: files,
                path: `Post/${folderId}`,
            });
        }
        const reply = await this.commentRepo.createOne({
            data: {
                createdBy: user._id,
                content,
                attachments,
                postId: comment.postId,
                commentId: comment._id,
                tags: mentions,
            },
        });
        if (!reply) {
            if (attachments?.length) {
                await this.s3.deleteMultipleAssets({
                    Keys: attachments.map((attachment) => {
                        return { Key: attachment };
                    }),
                });
            }
            throw new exceptions_1.BadRequestException("Failed to create reply");
        }
        if (fcmTokens.length) {
            await this.notification.sendMultipleNotifications({
                data: {
                    title: "Comment mention",
                    body: JSON.stringify({
                        message: `${user.username} mentioned you in a recent reply`,
                        postId: post._id,
                        commentId: comment._id,
                        replyId: reply._id,
                    }),
                },
                tokens: fcmTokens,
            });
        }
        return reply.toJSON();
    }
}
exports.CommentService = CommentService;
exports.commentService = new CommentService();
