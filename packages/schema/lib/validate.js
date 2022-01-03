module.exports = validateQuery;

const graphql = require("graphql");
const gql = require("graphql-tag");
const fs = require("fs");
const join = require("path").join;

const schemaString = fs.readFileSync(
  join(__dirname, "..", "schema.graphql"),
  "utf8"
);
const schema = graphql.buildSchema(schemaString);

function validateQuery(query) {
  return graphql.validate(schema, gql(query));
}
