"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongoDBConnection = void 0;
const mongoose_1 = require("mongoose");
const config_1 = require("../common/config/config");
const models_1 = require("./models");
const mongoDBConnection = async () => {
    try {
        await (0, mongoose_1.connect)(config_1.DB_URI);
        await models_1.userModel.syncIndexes();
        console.log(`Connected to mongoDB successfully`);
    }
    catch (error) {
        console.log(`Failed to connect to mongoDB ${error}`);
    }
};
exports.mongoDBConnection = mongoDBConnection;
