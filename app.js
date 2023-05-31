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
 * ENDPOINT 2
 * User log-in
 */
app.post("/login", async (req, res) => {
  try {
    let username = req.body.username;
    let password = req.body.password;
    if (username && password) {
      // check database for a match
      let db = await getDBConnection();
      let query = 'SELECT username FROM users WHERE username = ? AND password = ?';
      let result = await db.get(query, [username, password]);
      await db.close();
      if (result) {
        res.type('text').send('Welcome ' + result['username']);
      } else {
        res.type('text');
        res.status(INVALID_PARAM_ERROR).send('Username/password is incorrect.')
      }
    } else {
      res.type('text');
      res.status(INVALID_PARAM_ERROR).send('Please enter a valid username and password.');
    }
  } catch (err) {
    console.log(err);
    res.type('text');
    res.status(SERVER_ERROR).send(SERVER_ERROR_MSG + ' ' + err);
  }
});

/**
 * ENDPOINT 3
 * Turn this into a POST request. have foreign key be the transactions.user and connect it w username of body param
 */
app.post('/user/history', async (req, res) => {
  if (req.body.username && req.body.password) {
    try {
      let username = req.body.username;
      let password = req.body.password;
      // check if username & password are valid
      let db = await getDBConnection();
      let query = 'SELECT username FROM users WHERE username = ? AND password = ?';
      let result = await db.get(query, [username, password]);
      if (result) { // valid username & email. so get the info now
        query = 'SELECT * FROM transactions t, users u WHERE t.user = ? AND u.username = ?';
        result = await db.all(query, [username, username]);
        console.log(result);
        await db.close();
        res.type('text').send('success');
      } else {
        res.type('text');
        res.status(INVALID_PARAM_ERROR).send('Username/password is incorrect.');
      }
    } catch (err) {
      res.type('text');
      res.status(SERVER_ERROR).send(SERVER_ERROR_MSG + ' ' + err);
    }
  } else {
    res.type('text').status(INVALID_PARAM_ERROR);
    res.send('Please enter a valid username and password to access account details');
  }
});

/**
 * ENDPOINT 4
 *description
 */
app.post("/checkout", async (req, res) => {
  if (req.body.username && req.body.shortname && req.body.size) {
    try {
      res.type("text");
      let query = null;
      let db = await getDBConnection();
      let user = await db.get(`SELECT username FROM users WHERE username=?`, req.body.username);
      let id = await db.get('SELECT itemID from items WHERE name=?', req.body.shortname);
      if (!user || !id) {
        res.status(INVALID_PARAM_ERROR).send('This user or transaction does not exist.');
      } else {
        let code = confirmationCode(8);
        let date = new Date().toJSON();
        query = `INSERT INTO transactions (confirmation, user, date, itemID, size),
                VALUES (?, ?, ?, ?, ?)`;
        await db.run(query, [code, req.body.username, date.slice(0, 10),
              id["itemID"], req.body.size]);
        let size = req.body.size;
        // await db.run(`UPDATE inventory SET ??=? - 1 WHERE ?? > 0`, size, size, size);
        res.send("Added a " + req.body.rating + " star review");
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
 * ENDPOINT 5
 * Create new user
 */
app.post('/newuser', async (req, res) => {
  try {
    let username = req.body.username;
    let password = req.body.password;
    let email = req.body.email;
    if (username && password && email) {
      let validNewUser = newUserChecks(res, username, password, email);
      if (validNewUser) {
        let query = 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)';
        let db = await getDBConnection();
        await db.run(query, [username, password, email]);
        await db.close();
        let jsontxt = '{ "username" : "' + username + '", "message" : "New user created. ' +
        'Welcome ' + username + '"}';
        let obj = JSON.parse(jsontxt);
        res.json(obj);
      }
    } else {
      res.status(INVALID_PARAM_ERROR).send('Missing one or more of the required params.');
    }
  } catch (err) {
    console.log(err);
    res.status(SERVER_ERROR).send(SERVER_ERROR_MSG);
  }
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
 * Establishes a database connection to a database and returns the database object.
 * Any errors that occur during connection should be caught in the function
 * that calls this one.
 * @param {string} size - length of code returned
 * @returns {string} - The database object for the connection.
 */
function confirmationCode(size) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = ' ';
  const charsize = chars.length;
  for (let i = 0; i < size; i++) {
    code += chars.charAt(Math.floor(Math.random() * charsize));
  }
  return code;
}

/**
 * Checks if the username, password, and email provided by the user are all valid
 * @param {pbject} res - the response object of the post request
 * @param {string} username - the intended username of the user
 * @param {string} password - the intended password of the user
 * @param {string} email - the intended email of the user
 * @returns {boolean} newUser - returns true if the user's inputs passes all the checks.
 * False if not.
 */
async function newUserChecks(res, username, password, email) {
  let newUser = false;
  if (!email.includes('@')) { //check for vaild email
    res.status(INVALID_PARAM_ERROR).send('Please enter a valid email address.');
  } else {
    if (password.length < 6) { // check for valid password
      res.status(INVALID_PARAM_ERROR).send('Password must be longer than 6 characters.');
    } else {
      let db = await getDBConnection();
      let query = 'SELECT email FROM users WHERE email = ?';
      let result = await db.get(query, email);
      if (result) {
        await db.close();
        res.status(INVALID_PARAM_ERROR);
        res.send('Account already exists under this email address.' +
        'Please contact helpdesk at freePeopleAPI@help.com for assistance logging in');
      } else {
        // check if username exists in database already
        query = 'SELECT username FROM users WHERE username = ?';
        result = await db.get(query, username);
        await db.close();
        if (result) {
          res.status(INVALID_PARAM_ERROR).send('Username already exists.');
        } else {
          newUser = true;
        }
      }
    }
  }
  return newUser;
}

app.use(express.static('public'));
const PORT = process.env.PORT || 8000;
app.listen(PORT);
