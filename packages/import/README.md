# Overview

This package will contain logic to import content into DB. To start we have
a KJV sqlite DB from https://github.com/simoncozens/open-source-bible-data/blob/master/cooked/sqlite/kjv.db

# Schema

```
CREATE TABLE bible (book, chapter  INTEGER, verse INTEGER, content TEXT, PRIMARY KEY(book, chapter, verse));
CREATE VIRTUAL TABLE bible_fts USING fts3(book, chapter INTEGER, verse INTEGER, content TEXT)
/* bible_fts(book,chapter,verse,content) */;
CREATE TABLE IF NOT EXISTS 'bible_fts_content'(docid INTEGER PRIMARY KEY, 'c0book', 'c1chapter', 'c2verse', 'c3content');
CREATE TABLE IF NOT EXISTS 'bible_fts_segments'(blockid INTEGER PRIMARY KEY, block BLOB);
CREATE TABLE IF NOT EXISTS 'bible_fts_segdir'(level INTEGER,idx INTEGER,start_block INTEGER,leaves_end_block INTEGER,end_block INTEGER,root BLOB,PRIMARY KEY(level, idx));
CREATE TABLE metadata (k,v);
```

# Design

Before my attempts to enrich the graph, I need to build the graph. I had considered maybe just using AWS DDB, but given that my long term goal is enrich verses with variable types, I am going to go for a graph database using AWS neptune from day 1 to anticipate future scale and to get acquanted with those APIs.

The first task is to convert the sqlite database into vertices and edges so that I can load them up into the AWS Neptune database.

In order to do a bulk load we need to format the information as vertices and edges.
- https://docs.aws.amazon.com/neptune/latest/userguide/bulk-load-tutorial-format-gremlin.html


Each vertex and edge will need a unique id, for this we will use `nanoid`. We could have use uuid, but most likely we can save on some storage space with nanoid instead which has many options for tuning the id length.
- https://www.npmjs.com/package/nanoid

## Graph Model

```
              --->[Book]
              |     ^ 
              |     |- chapter_of_book
verse_of_book-| [Chapter]
              |     ^
              |     |- verse_of_chapter
              ---[Verse]
```              

## Entities

### [Book] vertex

```
~id, name:String, ~label
b1, "1 Corinthians", book
```

### [Chapter] vertex

```
~id, number:Int, ~label
c1, 13, chapter
```

### chapter_of_book edge

```
~id, ~from, ~to, ~label
e1, c1, b1, chapter_of_book
```

### [Verse] vertex

```
~id, number:Int, text:String, ~label 
v1, 13, "And now abideth faith, hope, charity, these three; but the greatest of these is charity.", verse
```

### verse_of_chapter edge

```
~id, ~from, ~to, ~label
e2, v1, c1, verse_of_chapter
```

### verse_of_book edge

```
~id, ~from, ~to, ~label
e3, v1, b1, chapter_of
```

## Scripts
- **npm run generate** - generates vertex and edge files.
- **npm run import** - connects to neptune and initializes the db.
