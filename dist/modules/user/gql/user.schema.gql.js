"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserGQLSchemaFields = void 0;
const user_args_gql_1 = require("./user.args.gql");
const user_resolver_1 = require("./user.resolver");
const graphql_1 = require("graphql");
const user_types_gql_1 = require("./user.types.gql");
class UserGQLSchemaFields {
    userResolver;
    constructor() {
        this.userResolver = user_resolver_1.userGQLResolver;
    }
    registerQuery() {
        return {
            profile: {
                description: "register profile",
                type: user_types_gql_1.profileType,
                args: user_args_gql_1.profileArgs,
                resolve: this.userResolver.profile,
            },
        };
    }
    registerMutation() {
        return {
            sayHi: {
                type: new graphql_1.GraphQLObjectType({
                    name: "testMutationApi",
                    fields: {
                        greeting: { type: graphql_1.GraphQLString },
                    },
                }),
                resolve: () => {
                    return { greeting: "240" };
                },
            },
        };
    }
}
exports.UserGQLSchemaFields = UserGQLSchemaFields;
const userGQLSchemaFields = new UserGQLSchemaFields();
exports.default = userGQLSchemaFields;
