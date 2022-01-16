const { ApolloServer, gql } = require('apollo-server');
const { schema } = require("schema");

const typeDefs = gql(schema.idl);
const resolvers = {
    Query: {
        locales: () => ({
            edges: []
        }),
        books: () => ({
            edges: []
        })
    },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});