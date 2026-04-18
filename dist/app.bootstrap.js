"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrap = void 0;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const db_connections_1 = require("./DB/db.connections");
const config_1 = require("./common/config/config");
const redis_1 = require("./common/services/redis");
const middleware_1 = require("./middleware");
const modules_1 = require("./modules");
const user_1 = require("./modules/user");
const user_repo_1 = require("./DB/repository/user.repo");
const mongoose_1 = require("mongoose");
const bootstrap = async () => {
    const app = (0, express_1.default)();
    await (0, db_connections_1.mongoDBConnection)();
    await redis_1.redisService.connect();
    const userRepository = new user_repo_1.UserRepo();
    const user = await userRepository.deleteOne({
        filter: {
            _id: mongoose_1.Types.ObjectId.createFromHexString("69e3ee560e844d1bc1efb5dd"),
            force: true,
        },
    });
    console.log(user);
    app.use((0, cors_1.default)(), express_1.default.json());
    app.use("/auth", modules_1.authRouter);
    app.use("/user", user_1.userRouter);
    app.use("/*dummy", (req, res, next) => {
        return res.status(404).json({ Error: "Invalid route" });
    });
    app.get("/", (req, res, next) => {
        res.status(200).json({ Success: "Hello World" });
    });
    app.use(middleware_1.globalErrorHandler);
    app.listen(config_1.PORT, (err) => {
        try {
            console.log("app is running on port 3100");
        }
        catch (error) {
            console.error(err);
        }
    });
};
exports.bootstrap = bootstrap;
