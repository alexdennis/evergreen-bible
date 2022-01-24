var sqlite3 = require("sqlite3").verbose();

var db = new sqlite3.Database("./kjv.db");

// inspect all the records.
db.each(
  "SELECT docid as id, c0book as book, c1chapter as chapter, c2verse as verse, c3content as content FROM bible_fts_content",
  function (err, row) {
    console.log(row);
  }
);

// TODO: load to Graph DB
