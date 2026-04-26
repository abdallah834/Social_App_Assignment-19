"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Service = exports.S3Service = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const node_crypto_1 = require("node:crypto");
const node_fs_1 = require("node:fs");
const config_1 = require("../../config/config");
const enums_1 = require("../../enums");
const exceptions_1 = require("../../exceptions");
class S3Service {
    client;
    constructor() {
        this.client = new client_s3_1.S3Client({
            region: config_1.AWS_REGION,
            credentials: {
                accessKeyId: config_1.AWS_ACCESS_KEY_ID,
                secretAccessKey: config_1.AWS_SECRET_ACCESS_KEY,
            },
        });
    }
    async uploadAsset({ storageApproach = enums_1.StorageApproachEnum.MEMORY, Bucket = "Social_App", path = "General", file, ACL = client_s3_1.ObjectCannedACL.private, ContentType, }) {
        const command = new client_s3_1.PutObjectCommand({
            Bucket: config_1.AWS_BUCKET_NAME,
            Key: `Social_App/${path}/${(0, node_crypto_1.randomUUID)()}__${file.originalname}`,
            ACL,
            Body: storageApproach === enums_1.StorageApproachEnum.MEMORY
                ? file.buffer
                : (0, node_fs_1.createReadStream)(file.path),
            ContentType: file.mimetype || ContentType,
        });
        if (!command.input.Key) {
            throw new exceptions_1.internalServerError("Failed to upload this asset");
        }
        await this.client.send(command);
        return command.input?.Key;
    }
    async uploadLargeAssets({ storageApproach = enums_1.StorageApproachEnum.DISK, Bucket = "Social_App", path = "General", file, ACL = client_s3_1.ObjectCannedACL.private, ContentType, partSize = 5, }) {
        const uploadFile = new lib_storage_1.Upload({
            client: this.client,
            params: {
                Bucket: config_1.AWS_BUCKET_NAME,
                Key: `Social_App/${path}/${(0, node_crypto_1.randomUUID)()}__${file.originalname}`,
                ACL,
                Body: storageApproach === enums_1.StorageApproachEnum.MEMORY
                    ? file.buffer
                    : (0, node_fs_1.createReadStream)(file.path),
                ContentType: file.mimetype || ContentType,
            },
            partSize: partSize * 1024 * 1024,
        });
        uploadFile.on("httpUploadProgress", (progress) => {
            console.log(progress);
            console.log(`File upload is at ${(progress.loaded / progress.total) * 100}%`);
        });
        return await uploadFile.done();
    }
    async uploadMultipleAssets({ storageApproach = enums_1.StorageApproachEnum.MEMORY, uploadApproach = enums_1.UploadApproachEnum.SMALL, Bucket, path = "General", files, ACL = client_s3_1.ObjectCannedACL.private, ContentType, }) {
        let urls = [];
        if (uploadApproach === enums_1.UploadApproachEnum.LARGE) {
            const data = await Promise.all(files.map((file) => {
                return this.uploadLargeAssets({
                    storageApproach,
                    file,
                    ACL,
                    Bucket,
                    ContentType,
                    path,
                });
            }));
            urls = data.map((urls) => urls.Key);
        }
        else {
            await Promise.all(files.map((file) => {
                return this.uploadAsset({
                    storageApproach,
                    file,
                    ACL,
                    Bucket,
                    ContentType,
                    path,
                });
            }));
        }
        return urls;
    }
    async createPresignedUploadLink({ Bucket = config_1.AWS_BUCKET_NAME, path, ContentType, expiresIn = config_1.AWS_EXPIRES_IN, originalName, }) {
        const command = new client_s3_1.PutObjectCommand({
            Bucket,
            Key: `Social_App/${path}/${(0, node_crypto_1.randomUUID)()}__${originalName}`,
            ContentType,
        });
        const url = await (0, s3_request_presigner_1.getSignedUrl)(this.client, command, {
            expiresIn,
        });
        if (!command.input.Key) {
            throw new exceptions_1.internalServerError("Failed to upload this asset");
        }
        return { url, Key: command.input.Key };
    }
    async createPresignedFetchLink({ Bucket = config_1.AWS_BUCKET_NAME, Key, expiresIn = config_1.AWS_EXPIRES_IN, filename, download, }) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket,
            Key,
            ResponseContentDisposition: download === "true"
                ? `attachment; filename="${filename || Key.split("/").pop()}"`
                : undefined,
        });
        const url = await (0, s3_request_presigner_1.getSignedUrl)(this.client, command, {
            expiresIn,
        });
        if (!Key) {
            throw new exceptions_1.internalServerError("Failed to get this asset no specified key received");
        }
        return url;
    }
    async getAsset({ Bucket = "Social_App", Key, }) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: config_1.AWS_BUCKET_NAME,
            Key,
        });
        if (!Key) {
            throw new exceptions_1.internalServerError("Failed to get this asset no specified key received");
        }
        return await this.client.send(command);
    }
    async deleteMultipleAssets({ Bucket = "Social_App", Keys, }) {
        const command = new client_s3_1.DeleteObjectsCommand({
            Bucket: config_1.AWS_BUCKET_NAME,
            Delete: {
                Objects: Keys,
                Quiet: false,
            },
        });
        if (!Keys) {
            throw new exceptions_1.internalServerError("Failed to get this asset no specified key received");
        }
        return await this.client.send(command);
    }
    async deleteAsset({ Bucket = "Social_App", Key, }) {
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket: config_1.AWS_BUCKET_NAME,
            Key,
        });
        if (!Key) {
            throw new exceptions_1.internalServerError("Failed to get this asset no specified key received");
        }
        return await this.client.send(command);
    }
    async listFolderDir({ Bucket = "Social_App", prefix, }) {
        const command = new client_s3_1.ListObjectsV2Command({
            Bucket,
            Prefix: `Social_App/${prefix}`,
        });
        if (!prefix) {
            throw new exceptions_1.internalServerError("A prefix is required in order to list folder dir");
        }
        return await this.client.send(command);
    }
    async deleteFolderByPrefix({ Bucket = "Social_App", prefix, }) {
        const result = await this.listFolderDir({ Bucket, prefix });
        const keys = result.Contents?.map((content) => {
            return { Key: content.Key };
        });
        return await this.deleteMultipleAssets({ Bucket, Keys: keys });
    }
}
exports.S3Service = S3Service;
exports.s3Service = new S3Service();
