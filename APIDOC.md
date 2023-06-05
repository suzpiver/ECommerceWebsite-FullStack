# Free People API Documentation
The Free People API provides information on Free People's women's clothing, specifically tops, bottoms, and dresses. It also enables users to submit an account to purchase items, access transaction history, and reveiw purchased items.

## Endpoint 1: Get a list of clothes in this site and their information.
**Request Format:** /clothes

**QUERY PARAM 1:**

**Request Format:** /clothes

**Request Type:** GET

**Returned Data Format**: json

**Description:** Returns a json response of all the items including their id, name, webname, type, color, and price. The name is used to access images and whereas the webname is it's display name

**Example Request:** /clothes

**Example Response:**
```json
[
  {
    "itemID": 10314,
    "name": "saltwater-shirt",
    "webname": "Saltwater Shirt",
    "type": "top",
    "color": "white",
    "price": 55
  },
  {
    "itemID": 51658,
    "name": "amelia-corset",
    "webname": "Amelia Corset",
    "type": "top",
    "color": "pink red",
    "price": 84
  },
  ...
]
```

**QUERY PARAM 2:**

**Request Format:** /clothes?item={search};

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Given a valid item parameter an item or list of items is returned containing the related clothes as a json. If no query parameter is given then all items are returned (see query1).

Users can input any number and combination of item name, color, or type as long as they are seperated by commas with no prefixed or trailing whitespace. If no items match the request (for example an item doesn't exist or a search is mispelled), no items will be returned.

**Example Request:** /clothes?item=red,dress

**Example Response:**
```json
[
  {
    "itemID": 53283,
    "name": "sundrenched-printed-maxi-dress",
    "webname": "Sundrenched Printed Maxi Dress",
    "type": "dress",
    "color": "white red",
    "price": 170
  },
  {
    "itemID": 60413,
    "name": "east-side-lace-up-mini-dress",
    "webname": "East Side Lace Up Mini Dress",
    "type": "dress",
    "color": "red",
    "price": 176
  },
  ...
]
```

**Error Handling:**
- Possible 500 errors (all plain text):
  - If something else goes wrong on the server, returns an error with the message: `Uh oh. Something went wrong. Please try again later.`

## Endpoint 2: Check username and password when a user logs in
**Request Format:** /login endpoint with POST parameters of `username` and `password`

**Request Type:** POST

**Returned Data Format**: plain text

**Description:** Given a valid username and password, returns the username.

**Example Request:** /login with POST parameters of `username=suzpiver` and `password=sh0pp1ng!`

**Example Response:**
```
suzpiver
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If either a username or password is not given, returns error with message: `Please enter a valid username and password.`
  - If passed an invalid username or password combination, returns error with message: `Username/password is incorrect.`
- Possible 500 errors (all plain text):
  - If something else goes wrong on the server, returns an error with the message: `Something went wrong on the server.`

## Endpoint 3: Returns the user's account information and transaction history
**Request Format:** /user/history with POST parameters of `username` and `password`

**Request Type:** POST

**Returned Data Format**: JSON

**Description:** given a valid username and password, a JSON is returned containing the users information including their email and all transaction history details. The returned transaction history information is ordered by descending date (most recent to least recent).

**Example Request:** /user/history with POST parameters of `username=suzpiver` and `password=sh0pp1ng!`

**Example Response:**
```json
{
  "user": "suzpiver",
  "email": "suzpiver@uw.edu",
  "transaction-history": [
    {
      "shortname": "float-away-shirt",
      "name": "Float Away Shirt",
      "size": "M",
      "price": "$90",
      "date-purchased": "2023-06-04",
      "confirmation": "02A4YIL5"
    },
    {
      "shortname": "amelia-corset",
      "name": "Amelia Corset",
      "size": "M",
      "price": "$84",
      "date-purchased": "2023-06-03",
      "confirmation": "JDMMWW0G"
    },...
  ]
}
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If passed an invalid username or password, an error is returned with the message: `Username/password incorrect`
  - If passed an empty username or password, an error is returned with the message: `Please enter a valid username and password to access account details`
- Possible 500 errors (all plain text):
  - If something else goes wrong on the server, returns an error with the message: `Something went wrong on the server.`

## Endpoint 4: Make a transaction
**Request Format:** /checkout endpoint with POST parameters of `username`and `items`
where `items` is a list of all item in a transaction in json format with fields `shortname` and `size`. User MUST stringify list before sending post request.
example: [{"shortname": saltwater-shirt, "size": M},...]

**Request Type:** POST

**Returned Data Format**: plain text

**Description:** Given that a user is logged in and there are items available, plain text containing an 8 character confirmation code is returned. This confirmation code is saved under transaction history. Users can purchase multiple items at once by listing multiple items in the `items` parameter. They will all have the same confirmation code.

**Example Request:** /checkout with POST parameters of `username=suzpiver`, `items=[{"shortname":"cya-later-skate-trouser","size":"XL"},{"shortname":"jainsons-jewel-margaux-beaded-set","size":"M"}]`

**Example Response:**
```
ON3ZBKKJ
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If not passed a username and items parameter, returns an error with the message: `Missing one or more of the required params.`
  - If passed an invalid username, returns an error with the message: `Invalid User, Not found in user list`
  - If passed an invalid or empty shortname, returns an error with the message: `This item does not exist`
  - If passed an invalid or out of stock size, returns an error with the message: `Item out of stock: select another size`
  - If passed an invalid or out of stock size, returns an error with the message: `Failed to checkout {itemName, size},."see inventory"`
- Possible 500 errors (all plain text):
  - If something else goes wrong on the server, returns an error with the message: `Uh oh. Something went wrong. Please try again later.`

## Endpoint 5: Create a New User
**Request Format:** /newUser endpoint with POST parameters of `username`, `password`, and `email`

**Request Type:** POST

**Returned Data Format**: JSON

**Description:** Updates the user directory to add a new user if the username and email are unique. Returns the user's selected username.

**Example Request:** /newUser with POST parameters of `username=miyan`, `password=B3stSt0r3`, and `email=miyan@uw.edu`

**Example Response:**
```
miyan
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If username already exists, returns an error with the message: `Username already exists`
  - If email does not contain an "@" symbol, returns an error with the message: `Please enter a valid email address`
  - If email is already associated with a user: `Account already exists under this email address. Please contact helpdesk at freePeopleAPI@help.com for assistance logging in`
  - If password is less than 6 characters, returns an error with the message: `Password must be longer than 6 characters`
  - If missing a body parameter, returns an error with the message: `Missing one or more of the required params.`
- Possible 500 errors (all plain text):
  - If something else goes wrong on the server, returns an error with the message: `Uh oh. Something went wrong. Please try again later.`

## Endpoint 6: Add a review
**Request Format:** /review endpoint with POST parameters of `username`, `confirmation`, `rating`, and option query parameter `comment`

**Request Type:** POST

**Returned Data Format**: plain text

**Description:** given a valid username, confirmation number, rating between 1 and 5, and an optional comment, a review is added to the list of reviews uncluding the username

**Example Request:** /review with POST parameters of `username=suzpiver`,`confirmation=YGX669HT`, `rating=4` and `comments=Not bad`

**Example Response:**
```
Added a 4 star review
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If missing any of the parameters, returns an error with the message: `Missing one or more of the required params.`
  - If the username and confirmation number does not match a transaction, returns an error with the message: `This user or transaction does not exist.`
  - If the passed a rating that is not between 1 and 5: `Please enter a value between 1 and 5.`
- Possible 500 errors (all plain text):
  - If something else goes wrong on the server, returns an error with the message: `Uh oh. Something went wrong. Please try again later.`

## Endpoint 7: Gets a list reviews for a specfic item.
**Request Format:** /getreviews/:shortname

**Request Type:** GET

**Returned Data Format**: json

**Description:** Given a valid item shortname (name of the item seperated by hyphens), endpoint returns a json response of all the reviews posted for the specific item including the itemID, user, stars, and comment. If an invalid shortname is given, no reviews are returned

**Example Request:** /getreviews/saltwater-shirt

**Example Response:**
```json
[
  {
    "itemID": 10314,
    "user": "suzpiver",
    "stars": 4,
    "comments": "Great shirt but I wish it wasn't as see through"
  },
  {
    "itemID": 10314,
    "user": "miyan",
    "stars": 5,
    "comments": ""
  },
  ...
]
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If an invalid shortname is given, returns an error with the message: `There are no items under this name.`
- Possible 500 errors (all plain text):
  - If something else goes wrong on the server, returns an error with the message: `Uh oh. Something went wrong. Please try again later.`

## Endpoint 8: Gets the current inventory
**Request Format:** /inventory

**QUERY PARAM 1:**

**Request Format:** /inventory

**Request Type:** GET

**Returned Data Format**: json

**Description:** Returns a json response of all the inventory stock including the shortname, and number of items in stock for sizes XS, S, M, L, XL, and XXL

**Example Request:** /inventory

**Example Response:**
```json
[
  {
    "name": "saltwater-shirt",
    "XS": 0,
    "S": 5,
    "M": 23,
    "L": 29,
    "XL": 24,
    "XXL": 2
  },
  {
    "name": "shayla-lace-mini-dress",
    "XS": 5,
    "S": 1,
    "M": 17,
    "L": 22,
    "XL": 30,
    "XXL": 23
  },
  ...
]
```

**QUERY PARAM 2:**

**Request Format:** /inventory?shortname={search};

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Given a valid shortname parameter, a json containing the inventory stock including the shortname, and number of items in stock for sizes XS, S, M, L, XL, and XXL is returned. If no query parameter is passed then all inventory is returned (see query 1).

**Example Request:** /inventory?shortname=saltwater-shirt

**Example Response:**
```json
{
  "name": "saltwater-shirt",
  "XS": 0,
  "S": 5,
  "M": 23,
  "L": 29,
  "XL": 24,
  "XXL": 2
}
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If an invalid shortname is given, returns an error with the message: `Invalid item name {shortname}.`
- Possible 500 errors (all plain text):
  - If something else goes wrong on the server, returns an error with the message: `Uh oh. Something went wrong. Please try again later.`