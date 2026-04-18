"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataBaseRepo = void 0;
class DataBaseRepo {
    model;
    constructor(model) {
        this.model = model;
    }
    async create({ data, options, }) {
        return this.model.create(data, options);
    }
    async insertMany({ data, }) {
        return this.model.insertMany(data);
    }
    async createOne({ data, options, }) {
        const [doc] = await this.create({ data: [data], options });
        return doc;
    }
    async findOne({ filter, projection, options, }) {
        const doc = this.model.findOne(filter, projection);
        if (options?.populate)
            doc.populate(options.populate);
        if (options?.lean)
            doc.lean(options.lean);
        return await doc.exec();
    }
    async find({ filter, projection, options, }) {
        const doc = this.model.find(filter, projection);
        if (options?.populate)
            doc.populate(options.populate);
        if (options?.lean)
            doc.lean(options.lean);
        return await doc.exec();
    }
    async findByID({ _id, projection, options, }) {
        const doc = this.model.findById(_id, projection);
        if (options?.populate)
            doc.populate(options.populate);
        if (options?.lean)
            doc.lean(options.lean);
        return await doc.exec();
    }
    async updateOne({ filter, update, options, }) {
        return await this.model.updateOne(filter, { ...update, $inc: { __v: 1 } }, options);
    }
    async findOneAndUpdate({ filter, update, options = { returnDocument: "after" }, }) {
        return await this.model.findOneAndUpdate(filter, { ...update, $inc: { __v: 1 } }, options);
    }
    async findByIdAndUpdate({ _id, update, options = { returnDocument: "after" }, }) {
        return await this.model.findByIdAndUpdate(_id, { ...update, $inc: { __v: 1 } }, options);
    }
    async updateMany({ filter, update, options, }) {
        return await this.model.updateMany(filter, { ...update, $inc: { __v: 1 } }, options);
    }
    async deleteOne({ filter, options, }) {
        return await this.model.deleteOne(filter, options);
    }
    async findOneAndDelete({ filter, options = { new: true }, }) {
        return await this.model.findOneAndDelete(filter, options);
    }
    async findByIdAndDelete({ _id, options = { new: true }, }) {
        return await this.model.findByIdAndDelete(_id, options);
    }
    async deleteMany({ filter, options, }) {
        return await this.model.deleteMany(filter, options);
    }
}
exports.DataBaseRepo = DataBaseRepo;
