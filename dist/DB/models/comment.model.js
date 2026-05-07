"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentModel = void 0;
const mongoose_1 = require("mongoose");
const commentSchema = new mongoose_1.Schema({
    content: {
        type: String,
        required: function () {
            return !this.attachments?.length;
        },
    },
    postId: { type: mongoose_1.Types.ObjectId, ref: "Post" },
    commentId: { type: mongoose_1.Types.ObjectId, ref: "Comment" },
    attachments: { type: [String], default: [] },
    likes: {
        type: [{ user: mongoose_1.Types.ObjectId, react: Number }],
        ref: "User",
        default: [],
        _id: false,
        unique: true,
    },
    tags: { type: [{ type: mongoose_1.Types.ObjectId }], ref: "User", default: [] },
    createdBy: { type: mongoose_1.Types.ObjectId, required: true, ref: "User" },
    updatedBy: { type: mongoose_1.Types.ObjectId, ref: "User" },
    deletedAt: { type: Date },
    restoredAt: { type: Date },
}, {
    timestamps: true,
    strict: true,
    strictQuery: true,
    collection: "Comments",
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
commentSchema.virtual("replies", {
    localField: "_id",
    foreignField: "commentId",
    ref: "Comment",
    justOne: true,
});
commentSchema.pre("updateOne", { document: true }, function () { });
commentSchema.pre("deleteOne", { document: true }, function () { });
commentSchema.pre("insertMany", function (docs) {
});
commentSchema.post("insertMany", function (docs) {
});
commentSchema.pre(["findOne", "find", "countDocuments"], function () {
    const query = this.getFilter();
    if (query.paranoid === false) {
        this.setQuery({ ...query });
    }
    this.setQuery({ ...query, deletedAt: { $exists: false } });
});
commentSchema.pre(["updateOne", "findOneAndUpdate"], function () {
    const updateQuery = this.getUpdate();
    if (Array.isArray(updateQuery))
        return;
    if (updateQuery.deletedAt) {
        this.setUpdate({ ...updateQuery, $unset: { restoredAt: 1 } });
    }
    if (updateQuery.restoredAt) {
        this.setUpdate({ ...updateQuery, $unset: { deletedAt: 1 } });
        this.setQuery({ ...this.getQuery(), deletedAt: { $exists: true } });
    }
    const query = this.getFilter();
    if (query.paranoid === false) {
        this.setQuery({ ...query });
    }
    else {
        this.setQuery({ deletedAt: { $exists: false }, ...query });
    }
});
commentSchema.pre(["deleteOne", "findOneAndDelete"], function () {
    const query = this.getFilter();
    if (query.force) {
        this.setQuery({ ...query });
    }
    else {
        this.setQuery({ deletedAt: { $exists: true }, ...query });
    }
});
exports.commentModel = mongoose_1.models.Comment || (0, mongoose_1.model)("Comment", commentSchema);
