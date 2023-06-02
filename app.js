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
 *descrip
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
      console.log('username: ' + username + ' and password: ' + password);
      // check database for a match
      let db = await getDBConnection();
      let query = 'SELECT username FROM users WHERE username = ? AND password = ?';
      let result = await db.get(query, [username, password]);
      await db.close();
      if (result) {
        console.log('here');
        console.log(result['username']);
        // res.type('text').send('Welcome ' + result['username']);
        res.type('text').send(result['username']);
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
      console.log(username);
      let password = req.body.password;
      console.log(password);
      // check if username & password are valid
      let db = await getDBConnection();
      let query = 'SELECT username, email FROM users WHERE username = ? AND password = ?';
      let result = await db.get(query, [username, password]);
      console.log(result);
      if (result) { // valid username & email. so get the info now
        query = 'SELECT * FROM transactions t, users u, items WHERE t.user = ? AND ' +
        'u.username = ? AND t.itemID = items.itemID';
        let transactions = await db.all(query, [username, username]);
        console.log('result from database');
        console.log(transactions);
        await db.close();
        let jsontxt = '{ "user" : "' + username + '", "email" : "' + result['email'] + '", ' +
                      '"transaction-history" : [';
        jsontxt += processHistoryResults(transactions);
        let obj = JSON.parse(jsontxt);
        res.json(obj);
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
 * ENDPOINT 5
 * Create new user
 */
app.post('/newuser', async (req, res) => {
  try {
    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;
    if (username && email && password) {
      let validNewUser = newUserChecks(res, username, password, email);
      if (validNewUser) {
        let query = 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)';
        let db = await getDBConnection();
        await db.run(query, [username, password, email]);
        await db.close();
        res.type('text').send(username);
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
      let query = null;
      let db = await getDBConnection();
      let id = await db.get(`SELECT itemID FROM transactions WHERE user=? AND
                              confirmation=?`, req.body.username, req.body.confirmation);
      if (!id) {
        res.status(INVALID_PARAM_ERROR).send('This user or transaction does not exist.');
      } else if (!([0, 1, 2, 3, 4, 5].includes(Number(req.body.rating)))) {
        res.status(INVALID_PARAM_ERROR).send('Please enter a value between 0 and 5');
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
 * Parses through data from the database to make a json object that endpoint 3 returns
 * @param {JSONObject} result - array of data from api endpoint 3
 * @returns {string} jsontxt - a string version of the json object to be returned from endpoint 3
 */
function processHistoryResults(result) {
  console.log(result);
  let jsontxt = '';
  for (let i = 0; i < result.length; i++) {
    if (i > 0) {
      jsontxt += ', ';
    }
    jsontxt += '{ "shortname" : "' + result[i]['name'] + '", ' +
                  '"name" : "' + result[i]['webname'] + '", ' +
                  '"size" : "' + result[i]['size'] + '", ' +
                  '"date-purchased" : "' + result[i]['date'] + '", ' +
                  '"confirmation" : "' + result[i]['confirmation'] + '" }';
  }
  jsontxt += ']}';
  return jsontxt;
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
        ' Please contact helpdesk at freePeopleAPI@help.com for assistance logging in');
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
