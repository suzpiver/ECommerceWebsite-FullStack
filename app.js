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

const INVALID_PARAM_ERROR = 400;
const SERVER_ERROR = 500;
const SERVER_ERROR_MSG = 'Something went wrong on the server.';

const multer = require("multer");
const sizes = ["XS", "S", "M", "L", "XL", "2XL"];

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
 * ENDPOINT 4
 *description
 */
app.post("/checkout", async (req, res) => {
  if (req.body.username && req.body.shortname && req.body.size) {
    try {
      let db = await getDBConnection();
      let user = await db.get(`SELECT username FROM users WHERE username=?`, req.body.username);
      let id = await db.get('SELECT itemID from items WHERE name=?', req.body.shortname);
      if (!id["itemID"]) {
        res.status(INVALID_PARAM_ERROR).send('This item does not exist');
      }
      let inv = await db.get("SELECT * FROM inventory WHERE itemID = ?", id["itemID"]);
      if (validateTransactionRequest(user, id, inv, res, req)) {
        let date = new Date().toJSON();
        let codes = await db.all('SELECT confirmation FROM transactions');
        let code = confirmationCode(8, true, codes);
        let query = `INSERT INTO transactions (confirmation, user, date, itemID, size)
                VALUES (?, ?, ?, ?, ?)`;
        await db.run(query, [code, req.body.username, date.slice(0, 10),
              id["itemID"], req.body.size]);
        await db.run(`UPDATE inventory SET ` + req.body.size + ' = ' + req.body.size + ` - 1
              WHERE ` + req.body.size + ` > 0 AND itemID = ?`, id["itemID"]);
        res.type('text').send(code);
      }
      await db.close();
    } catch (err) {
      res.status(SERVER_ERROR).send(SERVER_ERROR_MSG + err);
    }
  } else {res.status(INVALID_PARAM_ERROR).send("Missing one or more of the required params.");}
});

/**
 * ENDPOINT 6
 *description
 */
app.post("/review", async (req, res) => {
  if (req.body.username && req.body.confirmation && req.body.rating) {
    try {
      res.type("text");
      let query = null;
      let db = await getDBConnection();
      let id = await db.get(`SELECT itemID FROM transactions WHERE user=? AND
                              confirmation=?`, req.body.username, req.body.confirmation);
      if (!id) {
        res.status(INVALID_PARAM_ERROR).send('This user or transaction does not exist.');
      } else {
        if (req.body.comment) {
          query = "INSERT INTO reviews (itemID, user, stars, comments) VALUES (?, ?, ?, ?)";
          await db.run(query, [id["itemID"], req.body.username, req.body.rating, req.body.comment]);
        } else {
          query = "INSERT INTO reviews (itemID, user, stars) VALUES (?, ?, ?)";
          await db.run(query, [id["itemID"], req.body.username, req.body.rating]);
        }
        res.type("text").send("Added a " + req.body.rating + " star review");
      }
      await db.close();
    } catch (err) {
      res.status(SERVER_ERROR).send(SERVER_ERROR_MSG + err);
    }
  } else {
    res.status(INVALID_PARAM_ERROR).send("Missing one or more of the required params.");
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

/**
 * descrip
 * @param {string} size - length of code returned
 * @param {boolean} type - to include letters in randomization
 * @param {json} currentCodes -current list of values
 * @returns {string} - The database object for the connection.
 */
function confirmationCode(size, type, currentCodes) {
  let chars = null;
  if (type) {
    chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  } else {
    chars = '0123456789';
  }
  let code = '';
  const charsize = chars.length;
  let unique = false;
  while (!unique) {
    for (let i = 0; i < size; i++) {
      code += chars.charAt(Math.floor(Math.random() * charsize));
    }
    if (!currentCodes.some(num => num.confirmation === code)) {
      unique = true;
    }
  }
  return code;
}

/**
 * descrip
 * @param {json} user - json containing database response
 * @param {json} id - json containing database response
 * @param {json} inv - json containing database response
 * @param {Response} res - response for the endpoint
 * @param {Request} req - response for the endpoint
 * @returns {boolean} - The database object for the connection.
 */
function validateTransactionRequest(user, id, inv, res, req) {
  if (!user) {
    res.status(INVALID_PARAM_ERROR).send('This user does not exist');
    return false;
  } else if (!id) {
    res.status(INVALID_PARAM_ERROR).send('This item does not exist');
    return false;
  } else if (!sizes.includes(req.body.size)) {
    res.status(INVALID_PARAM_ERROR).send('Invalid item size');
    return false;
  } else if (inv[req.body.size] === 0) {
    res.status(INVALID_PARAM_ERROR).send('We are out of this item. Please select another size');
    return false;
  }
  return true;
}

app.use(express.static('public'));
const PORT = process.env.PORT || 8000;
app.listen(PORT);

