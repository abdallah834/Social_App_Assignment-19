"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postReactArgs = exports.postListArgs = exports.reactGQLEnumTypes = void 0;
const graphql_1 = require("graphql");
exports.reactGQLEnumTypes = new graphql_1.GraphQLEnumType({
    name: "reactTypes",
    values: { Dislike: { value: 0 }, like: { value: 1 } },
});
exports.postListArgs = {
    page: { type: graphql_1.GraphQLInt },
    limit: { type: graphql_1.GraphQLInt },
    search: { type: graphql_1.GraphQLString },
};
exports.postReactArgs = {
    postId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
    react: {
        type: exports.reactGQLEnumTypes,
    },
};
