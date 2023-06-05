/*
 * Name: Suzanne and Miya
 * Date:
 * Section: CSE 154 AA
 * This is the app.js file for our e-commerce final project webpage. It's in charge of all the
 * api endpoints our website gets its data from to display to the user.
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
const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(multer().none()); // requires the "multer" module

/**
 * ENDPOINT 1: GET
 * Fetches the id, name, webname, type, color, and price of items.
 * An option query parameter item can be passed which includes search values
 * seperated by commas
 *
 */
app.get("/clothes", async (req, res) => {
  try {
    let db = await getDBConnection();
    let result = null;
    if (req.query.item) {
      let query = makeSearchQuery(Array.from(req.query.item.split(",")));
      result = await db.all(query);
    } else {
      let query = "SELECT * FROM items";
      result = await db.all(query);
    }
    await db.close();
    res.json(result);
  } catch (err) {
    res.type('text');
    res.status(SERVER_ERROR).send(SERVER_ERROR_MSG);
  }
});

/**
 * ENDPOINT 2: POST
 * Checks the user's username and password against the database's information to confirm if the
 * user is valid/exists.
 */
app.post("/login", async (req, res) => {
  try {
    let username = req.body.username;
    let password = req.body.password;
    if (username && password) {
      let db = await getDBConnection();
      let query = 'SELECT username FROM users WHERE username = ? AND password = ?';
      let result = await db.get(query, [username, password]);
      await db.close();
      if (result) {
        res.type('text').send(result['username']);
      } else {
        res.type('text');
        res.status(INVALID_PARAM_ERROR).send('Username/password is incorrect.');
      }
    } else {
      res.type('text');
      res.status(INVALID_PARAM_ERROR).send('Please enter a valid username and password.');
    }
  } catch (err) {
    res.type('text');
    res.status(SERVER_ERROR).send(SERVER_ERROR_MSG);
  }
});

/**
 * ENDPOINT 3: POST
 * Searches for and sends the transaction history, username, and email of a given user
 */
app.post('/user/history', async (req, res) => {
  if (req.body.username && req.body.password) {
    try {
      let username = req.body.username;
      let password = req.body.password;
      let db = await getDBConnection();
      let query = 'SELECT username, email FROM users WHERE username = ? AND password = ?';
      let result = await db.get(query, [username, password]);
      if (result) {
        query = 'SELECT * FROM transactions t, users u, items WHERE t.user = ? AND ' +
        'u.username = ? AND t.itemID = items.itemID ORDER BY datetime(date) DESC';
        let transactions = await db.all(query, [username, username]);
        await db.close();
        let jsontxt = processHistoryResults(result['username'], result['email'], transactions);
        let obj = JSON.parse(jsontxt);
        res.json(obj);
      } else {
        res.type('text');
        res.status(INVALID_PARAM_ERROR).send('Username/password is incorrect.');
      }
    } catch (err) {
      res.type('text');
      res.status(SERVER_ERROR).send(SERVER_ERROR_MSG);
    }
  } else {
    res.type('text').status(INVALID_PARAM_ERROR);
    res.send('Please enter a valid username and password to access account details');
  }
});

/**
 * ENDPOINT 4
 * Adds transaction to the database given a valud username and a list of items to purchase.
 * The inventory is checked to verify that sizes are in stock before purchasing
 * The items parameter must be a list of jsons in the format [{"shortname": name, "size": size}]
 * the json must be converted to a string before being sent to endpoint.
 */
app.post("/checkout", async (req, res) => {
  try {
    if (req.body.username && req.body.items) {
      let items = (JSON.parse(req.body.items));
      let db = await getDBConnection();
      let code = null;
      let failed = '';
      let user = await db.get(`SELECT username FROM users WHERE username=?`, req.body.username);
      if (user) {
        code = confirmationCode(8, true, await db.all('SELECT confirmation FROM transactions'));
        for (let i = 0; i < items.length; i++) {
          let size = items[i]["size"];
          let id = await db.get('SELECT itemID from items WHERE name=?', items[i]["shortname"]);
          let inv = await validateTransactionRequest(id, db, items[i]["size"]);
          if (inv) {
            let date = new Date().toJSON();
            let query = `INSERT INTO transactions (confirmation, user, date, itemID, size)
                    VALUES (?, ?, ?, ?, ?)`;
            await db.run(query, [code, req.body.username, date.slice(0, 10), id["itemID"], size]);
            await db.run(`UPDATE inventory SET ` + size + ' = ' + size + ` - 1
                  WHERE ` + size + ` > 0 AND itemID = ?`, id["itemID"]); // dec. inventory
          } else {failed = "Failed to checkout " + items[i]["shortname"] + size + inv;}
        }
        res.type('text').send(code + " " + failed);
      } else {res.status(INVALID_PARAM_ERROR).send("Invalid User, Not found in user list");}
      await db.close();
    } else {res.status(INVALID_PARAM_ERROR).send("Missing one or more of the required params.");}
  } catch (err) {res.status(SERVER_ERROR).send(SERVER_ERROR_MSG);}
});

/**
 * ENDPOINT 5: POST
 * Creates new user with valid username, email, and password data.
 */
app.post('/newuser', (req, res) => {
  try {
    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;
    let newUserObj = {'username': username, 'password': password, 'email': email};
    userParamsCheck(res, newUserObj);
  } catch (err) {
    res.type('text').status(SERVER_ERROR);
    res.send(SERVER_ERROR_MSG);
  }
});

/**
 * ENDPOINT 6
 * Adds a review to the database for a specific item given a valud username, confirmation code,
 * rating between 1-5, and an optional query parameter of comment.
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
      } else if (!([1, 2, 3, 4, 5].includes(Number(req.body.rating)))) {
        res.status(INVALID_PARAM_ERROR).send('Please enter a value between 1 and 5.');
      } else {
        if (req.query.comment) {
          query = "INSERT INTO reviews (itemID, user, stars, comments) VALUES (?, ?, ?, ?)";
          await db.run(query, [id["itemID"], req.body.username, req.body.rating,
          req.query.comment]);
        } else {
          query = "INSERT INTO reviews (itemID, user, stars) VALUES (?, ?, ?)";
          await db.run(query, [id["itemID"], req.body.username, req.body.rating]);
        }
        res.type("text").send("Added a " + req.body.rating + " star review");
      }
      await db.close();
    } catch (err) {
      res.status(SERVER_ERROR).send(SERVER_ERROR_MSG);
    }
  } else {
    res.status(INVALID_PARAM_ERROR).send("Missing one or more of the required params.");
  }
});

/**
 * ENDPOINT 7
 * Given a valud shortname path parameter, a list of all the reviews posted for a specific item
 * in json form is returned including itemID, user, stars, and comments
 * If the shortname passed in the path is invalid, it will return an error that
 * no item is found
 */
app.get("/getreviews/:shortname", async (req, res) => {
  try {
    let db = await getDBConnection();
    let shortname = req.params.shortname;
    if (!(await db.get(`SELECT name FROM items WHERE name=?`, shortname))) {
      res.status(INVALID_PARAM_ERROR).send("There are no items under this name.");
    } else {
      let result = await db.all(`SELECT r.itemID, r.user, r.stars, r.comments FROM reviews r,
                              items i WHERE i.name = ? and r.itemID=i.itemID`, shortname);
      res.json(result);
    }
    await db.close();
  } catch (err) {
    res.type('text');
    res.status(SERVER_ERROR).send(SERVER_ERROR_MSG);
  }
});

/**
 * ENDPOINT 8
 * Returns the inventory for the items in the database.
 * If a shortname if passed as a query param, it will fetch only the inventory for the one item
 * otherwise all inventory information is sent in a json including the name and stock for
 * XS S M L XL and XXL
 */
app.get("/inventory", async (req, res) => {
  try {
    let db = await getDBConnection();
    let result = null;
    if (req.query.shortname) {
      if (await db.get('SELECT name FROM items WHERE name=?', req.query.shortname)) {
        result = await db.get(`SELECT p.name, i.XS, i.S, i.M, i.L, i.XL, i.XXL  FROM inventory i,
                items p WHERE p.name=? AND p.itemID=i.itemID`, req.query.shortname);
        res.json(result);
      } else {res.status(INVALID_PARAM_ERROR).send("Invalid item name " + req.query.shortname);}
    } else {
      result = await db.all(`SELECT p.name, i.XS, i.S, i.M, i.L, i.XL, i.XXL  FROM inventory i,
                      items p WHERE i.itemID=p.itemID`);
      res.json(result);
    }
    await db.close();
  } catch (err) {
    res.type('text');
    res.status(SERVER_ERROR).send(SERVER_ERROR_MSG);
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
 * Creates a query out of the multiple strings passed in so that individual words
 * can be searched
 * @param {array} search -array of search words
 * @returns {string} query - a query string to search for each word
 */
function makeSearchQuery(search) {
  let query = "SELECT * FROM items WHERE ";
  let word = null;
  for (let i = 0; i < search.length; i++) {
    word = search[i];
    query = query + '(name LIKE "%' + word + '%" OR color LIKE "%' + word +
                      '%" OR type LIKE "%' + word + '%")';
    if (!(i === search.length - 1)) {
      query = query + ' AND ';
    }
  }
  return query;
}

/**
 * Parses through data from the database to make a json object that endpoint 3 returns
 * @param {string} username - username of user
 * @param {string} email - email of user
 * @param {JSONObject} transactions - array of data from api endpoint 3
 * @returns {string} jsontxt - a string version of the json object to be returned from endpoint 3
 */
function processHistoryResults(username, email, transactions) {
  let jsontxt = '{ "user" : "' + username + '", "email" : "' + email + '", ' +
  '"transaction-history" : [';
  for (let i = 0; i < transactions.length; i++) {
    if (i > 0) {
      jsontxt += ', ';
    }
    jsontxt += '{ "shortname" : "' + transactions[i]['name'] + '", ' +
                  '"name" : "' + transactions[i]['webname'] + '", ' +
                  '"size" : "' + transactions[i]['size'] + '", ' +
                  '"price" : "$' + transactions[i]['price'] + '", ' +
                  '"date-purchased" : "' + transactions[i]['date'] + '", ' +
                  '"confirmation" : "' + transactions[i]['confirmation'] + '" }';
  }
  jsontxt += ']}';
  return jsontxt;
}

/**
 * Generates a unqiue confirmation code given a length, and type(letters and numbers or
 * just numbers), and a list of the current codes present to prevent duplicates
 * @param {string} size - length of code returned
 * @param {boolean} type - true is to include letters and numbers
 * @param {json} currentCodes -current list of values
 * @returns {string} - The generated code
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
 * Checks that item transaction will be valid based on the parameters given by the client
 * checks that the item exists, and sizes are available
 * @param {json} id - json containing database response about item details
 * @param {Database} db - database connection
 * @param {Request} size - string containing size of transaction item
 * @returns {json} - json containing inventory for item or a false if failed
 */
async function validateTransactionRequest(id, db, size) {
  let response = null;
  if (id) {
    response = 'This item does not exist';
  } else {
    let inv = await db.get("SELECT * FROM inventory WHERE itemID=?", id["itemID"]);
    if (!inv) {
      response = 'an error occured on the server'; // if id passes this isn't client's err
    } else {
      if (!sizes.includes(size)) {
        response = 'Invalid item size';
      } else if (inv[size] === 0) {
        response = 'Item out of stock: select another size';
      } else {
        return inv;
      }
      return response;
    }
  }
  return response;
}

/**
 * Checks if all the parameters are present to create a new user
 * @param {object} res - the response object of the post request
 * @param {object} newUserObj - contains all information of the new user including: the response
 * object of the post request, the intended username of the user, the intended password of the user,
 * and the intended email of the user
 */
function userParamsCheck(res, newUserObj) {
  if (newUserObj['username'] && newUserObj['password'] && newUserObj['email']) {
    // go onto next user check
    userPasswordCheck(res, newUserObj);
  } else {
    res.type('text').status(INVALID_PARAM_ERROR);
    res.send('Missing one or more of the required params.');
  }
}

/**
 * Checks if new user's password is valid
 * @param {object} res - the response object of the post request
 * @param {object} newUserObj - contains all information of the new user including: the response
 * object of the post request, the intended username of the user, the intended password of the user,
 * and the intended email of the user
 */
function userPasswordCheck(res, newUserObj) {
  if (newUserObj['password'].length > 6) {
    userUsernameCheck(res, newUserObj);
  } else {
    res.type('text').status(INVALID_PARAM_ERROR);
    res.send('Password must be longer than 6 characters.');
  }
}

/**
 * Checks if the new user's username is valid
 * @param {object} res - the response object of the post request
 * @param {object} newUserObj - contains all information of the new user including: the response
 * object of the post request, the intended username of the user, the intended password of the user,
 * and the intended email of the user
 */
async function userUsernameCheck(res, newUserObj) {
  try {
    let db = await getDBConnection();
    let query = 'SELECT username FROM users WHERE username = ?';
    let result = await db.get(query, newUserObj['username']);
    await db.close();
    if (!result) {
      userEmailCheck1(res, newUserObj);
    } else {
      res.type('text').status(INVALID_PARAM_ERROR);
      res.send('Username already exists.');
    }
  } catch (err) {
    res.type('text').status(SERVER_ERROR);
    res.send(SERVER_ERROR_MSG);
  }
}

/**
 * Checks if the new user's email is a valid one
 * @param {object} res - the response object of the post request
 * @param {object} newUserObj - contains all information of the new user including: the response
 * object of the post request, the intended username of the user, the intended password of the user,
 * and the intended email of the user
 */
function userEmailCheck1(res, newUserObj) {
  if (newUserObj['email'].includes('@')) {
    userEmailCheck2(res, newUserObj);
  } else {
    res.type('text').status(INVALID_PARAM_ERROR);
    res.send('Please enter a valid email address.');
  }
}

/**
 * Checks if an existing user is already using the email of the new user. This is the last check
 * for a new user. If a new user passes this test, a new user profile will be created for them
 * in the database.
 * @param {object} res - the response object of the post request
 * @param {object} newUserObj - contains all information of the new user including: the response
 * object of the post request, the intended username of the user, the intended password of the user,
 * and the intended email of the user
 */
async function userEmailCheck2(res, newUserObj) {
  try {
    let validNewUser = false;
    let db = await getDBConnection();
    let query = 'SELECT email FROM users WHERE email = ?';
    let result = await db.get(query, newUserObj['email']);
    await db.close();
    if (!result) {
      createNewUser(res, newUserObj);
    } else {
      res.status(INVALID_PARAM_ERROR).send('Account already exists under this email address.' +
      ' Please contact helpdesk at freePeopleAPI@help.com for assistance logging in');
    }
    return validNewUser;
  } catch (err) {
    res.type('text').status(SERVER_ERROR);
    res.send(SERVER_ERROR_MSG);
  }
}

/**
 * Creates a new user if all the new user checks are passed
 * @param {object} res - the response object of the post request
 * @param {object} newUserObj - contains all information of the new user including: the response
 * object of the post request, the intended username of the user, the intended password of the user,
 * and the intended email of the user
 */
async function createNewUser(res, newUserObj) {
  try {
    let username = newUserObj['username'];
    let password = newUserObj['password'];
    let email = newUserObj['email'];
    let query = 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)';
    let db = await getDBConnection();
    await db.run(query, [username, password, email]);
    await db.close();
    res.type('text').send(username);
  } catch (err) {
    res.type('text').status(SERVER_ERROR);
    res.send(SERVER_ERROR_MSG);
  }
}

app.use(express.static('public'));
const PORT = process.env.PORT || 8000;
app.listen(PORT);