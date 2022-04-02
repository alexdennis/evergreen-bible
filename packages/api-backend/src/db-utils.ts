/**
 * Module with DB utils.
 */
import sqlite3 from "sqlite3";

// Setup DB singleton
const sqlite3v = sqlite3.verbose();
const db = new sqlite3v.Database("./kjv.db");

export function select<T = unknown>(query, ...params) {
    return new Promise<T[]>((resolve, reject) => {
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