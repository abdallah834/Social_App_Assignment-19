"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postGQLSchema = exports.PostGQLSchema = void 0;
const post_args_gql_1 = require("./post.args.gql");
const post_resolver_1 = require("./post.resolver");
const post_types_gql_1 = require("./post.types.gql");
class PostGQLSchema {
    postResolver;
    constructor() {
        this.postResolver = post_resolver_1.postResolver;
    }
    registerQuery() {
        return {
            postList: {
                type: post_types_gql_1.postListType,
                args: post_args_gql_1.postListArgs,
                resolve: this.postResolver.listPosts,
            },
        };
    }
    registerMutation() {
        return {};
    }
}
exports.PostGQLSchema = PostGQLSchema;
exports.postGQLSchema = new PostGQLSchema();
