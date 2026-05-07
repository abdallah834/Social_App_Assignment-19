"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gqlSchema = void 0;
const graphql_1 = require("graphql");
const user_schema_gql_1 = __importDefault(require("../user/gql/user.schema.gql"));
const post_1 = require("../post");
const query = new graphql_1.GraphQLObjectType({
    name: "RootQuerySchema",
    description: "Additional info for the api",
    fields: {
        ...user_schema_gql_1.default.registerQuery(),
        ...post_1.postGQLSchema.registerQuery(),
    },
});
const mutation = new graphql_1.GraphQLObjectType({
    name: "RootMutationSchema",
    description: "Additional info for the api",
    fields: {
        ...user_schema_gql_1.default.registerMutation(),
        ...post_1.postGQLSchema.registerMutation(),
    },
});
exports.gqlSchema = new graphql_1.GraphQLSchema({
    query,
    mutation,
});
