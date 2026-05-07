"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postListArgs = void 0;
const graphql_1 = require("graphql");
exports.postListArgs = {
    page: { type: graphql_1.GraphQLInt },
    limit: { type: graphql_1.GraphQLInt },
    search: { type: graphql_1.GraphQLString },
};
