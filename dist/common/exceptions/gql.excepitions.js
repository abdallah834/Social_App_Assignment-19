"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapGQLError = void 0;
const graphql_1 = require("graphql");
const mapGQLError = (error) => {
    throw new graphql_1.GraphQLError(error.message || "Internal server error", {
        extensions: {
            statusCode: error.statusCode || 500,
            cause: error.cause || [],
        },
    });
};
exports.mapGQLError = mapGQLError;
