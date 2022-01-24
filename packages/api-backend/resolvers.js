/**
 * Module with graphql resolvers.
 */
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./kjv.db");

// const GET_ALL = "SELECT docid as id, c0book as book, c1chapter as chapter, c2verse as verse, c3content as content FROM bible_fts_content";
const GET_BOOKS = "SELECT DISTINCT(book) FROM bible;";
const GET_BOOKS_BY_ID = "SELECT DISTINCT(book) FROM bible WHERE book = ?;";
const GET_CHAPTERS_BY_BOOK =
  "SELECT DISTINCT(chapter) FROM bible WHERE book = ?";
const GET_VERSES_BY_BOOK_CHAPTER =
  "SELECT c2verse as number, c3content as text FROM bible_fts_content WHERE c0book = ? AND c1chapter = ?;";
const GET_VERSES_BY_BOOK_CHAPTER_VERSE =
  "SELECT c2verse as number, c3content as text FROM bible_fts_content WHERE c0book = ? AND c1chapter = ? AND c2verse = ?;";
const LOCALES = ["en-US"]; // for now
const UNSUPPORTED_LOCALE = "Unsupported locale";

const resolvers = {
  Query: {
    locales: () => ({
      edges: LOCALES.map((locale) => ({
        id: locale,
        node: locale,
      })),
    }),
    books: async (_, { locale, filter }) => {
      if (!LOCALES.includes(locale)) {
        throw new Error(UNSUPPORTED_LOCALE);
      }

      const books =
        filter != null && filter.id != null
          ? await select(GET_BOOKS_BY_ID, filter.id)
          : await select(GET_BOOKS);
      return {
        edges: books.map((book) => ({
          node: {
            id: book.book,
            name: book.book,
            locale: {
              id: locale,
              node: locale,
            },
          },
        })),
      };
    },
  },
  Book: {
    chapters: async (book, { number }) => {
      const chapters =
        number != null
          ? [{ chapter: number }]
          : await select(GET_CHAPTERS_BY_BOOK, book.id);
      return {
        edges: chapters.map((ch) => ({
          node: {
            id: ch.chapter,
            name: ch.chapter,
            number: ch.chapter,
            book,
          },
        })),
      };
    },
  },
  Chapter: {
    verses: async (chapter, { number }) => {
      const verses =
        number != null
          ? await select(
              GET_VERSES_BY_BOOK_CHAPTER_VERSE,
              chapter.book.id,
              String(chapter.number),
              String(number)
            )
          : await select(
              GET_VERSES_BY_BOOK_CHAPTER,
              chapter.book.id,
              String(chapter.number)
            );
      return {
        edges: verses.map((v) => ({
          node: {
            id: v.number,
            name: v.number,
            number: v.number,
            text: v.text,
            chapter,
          },
        })),
      };
    },
  },
};

exports.resolvers = resolvers;

// TODO: dbutils
function select(query, ...params) {
  return new Promise((resolve, reject) => {
    // const db = new sqlite3.Database(database);
    const queries = [];
    db.each(
      query,
      ...params,
      (err, row) => {
        if (err) {
          console.error(query, params, err);
          reject(err); // optional: you might choose to swallow errors.
        } else {
          queries.push(row); // accumulate the data
        }
      },
      (err) => {
        if (err) {
          console.error(query, params, err);
          reject(err); // optional: again, you might choose to swallow this error.
        } else {
          resolve(queries); // resolve the promise
        }
      }
    );
  });
}
