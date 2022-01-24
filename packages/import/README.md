### Overview

This package will contain logic to import content into DB. To start we have
a KJV sqlite DB from https://github.com/simoncozens/open-source-bible-data/blob/master/cooked/sqlite/kjv.db

### Schema

```
CREATE TABLE bible (book, chapter  INTEGER, verse INTEGER, content TEXT, PRIMARY KEY(book, chapter, verse));
CREATE VIRTUAL TABLE bible_fts USING fts3(book, chapter INTEGER, verse INTEGER, content TEXT)
/* bible_fts(book,chapter,verse,content) */;
CREATE TABLE IF NOT EXISTS 'bible_fts_content'(docid INTEGER PRIMARY KEY, 'c0book', 'c1chapter', 'c2verse', 'c3content');
CREATE TABLE IF NOT EXISTS 'bible_fts_segments'(blockid INTEGER PRIMARY KEY, block BLOB);
CREATE TABLE IF NOT EXISTS 'bible_fts_segdir'(level INTEGER,idx INTEGER,start_block INTEGER,leaves_end_block INTEGER,end_block INTEGER,root BLOB,PRIMARY KEY(level, idx));
CREATE TABLE metadata (k,v);
```
