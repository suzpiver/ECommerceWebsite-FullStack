/*
 * Name: Suzanne and Miya
 * Date:
 * Section: CSE 154 AA
 *
 *
 */

"use strict";

const express = require('express');
const app = express();

const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');

// const INVALID_PARAM_ERROR = 400;
const SERVER_ERROR = 500;
const SERVER_ERROR_MSG = 'Something went wrong on the server.';

const multer = require("multer");

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(multer().none()); // requires the "multer" module

/**
 * ENDPOINT 1: GET
 *Returns a plain text response of all the items in the API with their full name
 *and shortname seperated by a ":".eq. Full name:shortname
 *The shortname is used as the base string to access further details about the
 *item such as its image and color whereas the Full name is the official company
 *assigned name
 *
 */
app.get("/clothes", async (req, res) => {
  try {
    let db = await getDBConnection();
    let result = null;
    if (req.query.item) {
      let item = "%" + req.query.item + "%";
      let query = "SELECT * FROM items WHERE name LIKE ? OR color LIKE ? OR type LIKE ?";
      result = await db.all(query, [item, item, item]);
    } else {
      let query = "SELECT * FROM items";
      result = await db.all(query);
    }
    await db.close();
    res.json(result);
  } catch (err) {
    res.type('text');
    res.status(SERVER_ERROR).send(SERVER_ERROR_MSG + err);
  }
});

/**
 * Establishes a database connection to a database and returns the database object.
 * Any errors that occur during connection should be caught in the function
 * that calls this one.
 * @returns {Object} - The database object for the connection.
 */
async function getDBConnection() {
  const db = await sqlite.open({
    filename: 'freepeople.db',
    driver: sqlite3.Database
  });
  return db;
}

app.use(express.static('public'));
const PORT = process.env.PORT || 8000;
app.listen(PORT);

