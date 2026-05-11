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
        if (options?.skip)
            doc.skip(options.skip);
        if (options?.limit)
            doc.limit(options.limit);
        return await doc.exec();
    }
    async paginate({ filter, projection, options = {}, page = "0", limit = "3", }) {
        let count = -1;
        const pageInt = parseInt(page);
        const sizeInt = parseInt(limit);
        if (pageInt > 0) {
            options.skip = (pageInt - 1) * sizeInt;
            options.limit = sizeInt;
            count = await this.model.countDocuments({ filter });
        }
        const docs = await this.find({ filter: filter || {}, projection, options });
        return {
            docs,
            ...(pageInt > 0
                ? {
                    currentPage: pageInt,
                    limit: sizeInt,
                    pages: Math.ceil(count / sizeInt),
                }
                : {}),
        };
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
        if (Array.isArray(update)) {
            return await this.model.updateOne(filter, update, {
                ...options,
                updatePipeline: true,
            });
        }
        return await this.model.updateOne(filter, { ...update, $inc: { __v: 1 } }, options);
    }
    async findOneAndUpdate({ filter, update, options = { returnDocument: "after" }, populate = [], }) {
        if (Array.isArray(update)) {
            return await this.model
                .findOneAndUpdate(filter, update, {
                ...options,
                updatePipeline: true,
            })
                .populate(populate);
        }
        return await this.model
            .findOneAndUpdate(filter, { ...update, $inc: { __v: 1 } }, options)
            .populate(populate);
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
