import { ApolloServer, gql } from "apollo-server";
import { schema } from "schema";

import { resolvers } from "./resolvers";

const typeDefs = gql(schema.idl);

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
