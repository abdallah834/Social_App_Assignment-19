"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const redis_1 = require("redis");
const config_1 = require("../config/config");
class RedisService {
    client;
    constructor() {
        this.client = (0, redis_1.createClient)({ url: config_1.REDIS_URL });
    }
}
exports.RedisService = RedisService;
