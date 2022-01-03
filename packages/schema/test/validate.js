const assert = require("assert");

const validate = require("../").validate;

const goodQuery = validate(`
{
  locales {
    totalCount
  }
}
`);
const badQuery = validate(`
{
  locales {
    foo
  }
}
`);

assert.strict.equal(
  goodQuery[0],
  undefined,
  "goodQuery validation returns no errors"
);
assert.match(
  badQuery[0].message,
  /Cannot query field "foo" on type "ListOfLocales"/,
  "badQuery validation returns GraphQLError error"
);
