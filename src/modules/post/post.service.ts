import {
  S3Service,
  s3Service,
} from "./../../common/services/aws-sdk/s3.service";
import { HydratedDocument, Types } from "mongoose";
import { IPost, IUser } from "../../common/interfaces";
import {
  notificationService,
  NotificationService,
  redisService,
  RedisService,
} from "../../common/services";
import { PostRepo, UserRepo } from "../../DB/repository";
import { CreatePostBodyDto } from "./post.dto";
import {
  BadRequestException,
  NotFoundException,
} from "../../common/exceptions";
import { randomUUID } from "node:crypto";

export class PostService {
  private readonly userRepo: UserRepo;
  private readonly redis: RedisService;
  private readonly notification: NotificationService;
  private readonly postRepo: PostRepo;
  private readonly s3: S3Service;
  constructor() {
    this.userRepo = new UserRepo();
    this.redis = redisService;
    this.postRepo = new PostRepo();
    this.notification = notificationService;
    this.s3 = s3Service;
  }
  async createPost(
    { availability, content, files, tags }: CreatePostBodyDto,
    user: HydratedDocument<IUser>,
  ): Promise<IPost> {
    const mentions: Types.ObjectId[] = [];
    const fcmTokens: string[] = [];
    if (tags?.length) {
      const mentionedAccounts = await this.userRepo.find({
        // testing to check if the tagged user exists in the users collection
        filter: { _id: { $in: tags } },
      });
      if (mentionedAccounts.length !== tags.length) {
        throw new NotFoundException("Couldn't find mentioned user accounts");
      }
      tags.forEach(async (tag) => {
        mentions.push(Types.ObjectId.createFromHexString(tag));
        ((await this.redis.getFCMs(tag)) || []).map((token) => {
          fcmTokens.push(token);
        });
      });
      console.log({ mentions, fcmTokens });
    }
    const folderId = randomUUID();
    let attachments: string[] = [];
    if (files?.length) {
      attachments = await this.s3.uploadMultipleAssets({
        files: files as Express.Multer.File[],
        path: `Post/${folderId}`,
      });
    }
    const post = await this.postRepo.createOne({
      data: {
        createdBy: user._id,
        content,
        attachments,
        folderId,
        availability,
        tags: mentions,
      },
    });
    if (!post) {
      if (attachments?.length) {
        /////////// s3 multiple files functions require a certain format for the Keys {Key:attachment||Key}
        await this.s3.deleteMultipleAssets({
          Keys: attachments.map((attachment) => {
            return { Key: attachment };
          }),
        });
      }
      throw new BadRequestException("Failed to create post");
    }
    if (fcmTokens.length) {
      await this.notification.sendMultipleNotifications({
        data: {
          title: "Post mention",
          body: JSON.stringify({
            message: `${user.username} mentioned you in a recent post`,
            postId: post._id,
          }),
        },
        tokens: fcmTokens,
      });
    }
    return post.toJSON();
  }
}

export const postService = new PostService();
