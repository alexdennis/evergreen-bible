import { ApolloServer, gql } from "apollo-server-lambda";
import {
  ApolloServerPluginLandingPageGraphQLPlayground,
} from "apollo-server-core";
import { schema } from "schema";

import { resolvers } from "./resolvers";

const typeDefs = gql(schema.idl);

const server = new ApolloServer({
  typeDefs,
  resolvers,

  // By default, the GraphQL Playground interface and GraphQL introspection
  // is disabled in "production" (i.e. when `process.env.NODE_ENV` is `production`).
  //
  // If you'd like to have GraphQL Playground and introspection enabled in production,
  // install the Playground plugin and set the `introspection` option explicitly to `true`.
  introspection: true,
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
});

exports.handler = server.createHandler();
