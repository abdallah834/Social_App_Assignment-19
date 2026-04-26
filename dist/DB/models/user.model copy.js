"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userModel = void 0;
const mongoose_1 = require("mongoose");
const enums_1 = require("../../common/enums");
const security_1 = require("../../common/utils/security");
const userSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    phone: { type: String, maxLength: 67 },
    bio: { type: String, maxLength: 200 },
    DOB: { type: Date, required: false },
    profileImage: { type: String },
    coverImages: { type: [String] },
    confirmedAt: { type: Date },
    paranoid: { type: Boolean, default: false },
    deletedAt: { type: Date },
    restoredAt: { type: Date },
    role: {
        type: Number,
        enum: enums_1.RoleEnum,
        default: enums_1.RoleEnum.USER,
    },
    gender: {
        type: Number,
        enum: enums_1.GenderEnum,
        default: enums_1.GenderEnum.MALE,
    },
    provider: { type: Number, default: 0 },
    extra: {
        _name: String,
    },
}, {
    timestamps: true,
    strict: true,
    strictQuery: true,
    collection: "Users",
    virtuals: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
});
userSchema
    .virtual("username")
    .get(function () {
    return `${this.firstName} ${this.lastName}`;
})
    .set(function (value) {
    const [firstName, lastName] = value.split(" ");
    this.firstName = firstName;
    this.lastName = lastName;
});
userSchema.pre("save", async function () {
    this.wasNew = this.isNew;
    if (this.isModified("password")) {
        this.password = await (0, security_1.generateHash)(this.password);
    }
    if (this.phone && this.isModified("phone")) {
        this.phone = await (0, security_1.encrypt)(this.phone);
    }
});
userSchema.pre("updateOne", { document: true }, function () { });
userSchema.pre("deleteOne", { document: true }, function () { });
userSchema.pre("insertMany", function (docs) {
});
userSchema.post("insertMany", function (docs) {
});
userSchema.pre(["findOne", "find"], function () {
    const query = this.getFilter();
    if (query.paranoid === false) {
        this.setQuery({ ...query });
    }
    this.setQuery({ ...query, deletedAt: { $exists: false } });
});
userSchema.pre(["updateOne", "findOneAndUpdate"], function () {
    const updateQuery = this.getUpdate();
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
userSchema.pre(["deleteOne", "findOneAndDelete"], function () {
    const query = this.getFilter();
    if (query.force) {
        this.setQuery({ ...query });
    }
    else {
        this.setQuery({ deletedAt: { $exists: true }, ...query });
    }
});
exports.userModel = mongoose_1.models.User || (0, mongoose_1.model)("user", userSchema);
