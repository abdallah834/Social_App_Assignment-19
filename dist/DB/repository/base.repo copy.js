"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepo = void 0;
class BaseRepo {
    model;
    constructor(model) {
        this.model = model;
    }
    create({ data, options, }) {
        return this.model.create(data, options);
    }
}
exports.BaseRepo = BaseRepo;
