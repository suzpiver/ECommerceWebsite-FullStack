# Free People API Documentation
The Free People API provides information on Free People's women's clothing, specifically tops, bottoms, and dresses. It also enables users to submit an account to purchase items, access transaction history, and reveiw purchased items.

## Endpoint 1: Get a list of clothes in this site and their information.
**Request Format:** /clothes

**QUERY PARAM 1:**

**Request Format:** /clothes

**Request Type:** GET

**Returned Data Format**: Plain text

**Description:** Returns a plain text response of all the items in the API with their full name and shortname seperated by a ":".
  eq. Full name:shortname
The shortname is used as the base string to access further details about the item such as its image and color whereas the Full name is the official company assigned name

**Example Request:** /clothes

**Example Response:**
```
FP One Lumi Maxi Dress:fp-one-lumi-maxi-dress
Love Letter Cami:love-letter-cami
Cool Harbor Wide-Leg Pants:cool-harbor-wide-leg-pants
Nina Tee:nina-tee
...
```

**QUERY PARAM 2:**

**Request Format:** /clothes?item={shortname}&type={type}&color={color};

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Given a valid query filter parameter (item, type, color) an item or list of items is returned containing the related clothes. If no query parameter given then all items are returned (see query1).

**Example Request:** /clothes?item=fp-one-lumi-maxi-dress

**Example Response:**
```json
{
    "name": "FP One Lumi Maxi Dress",
    "shortname": "fp-one-lumi-maxi-dress",
    "type": "dress",
    "sizes": {"small":25, "medium":0, "large":15},
    "color": "white",
    "image": "....whitedress.jpg",
    "description": "Just as effortless as it is ethereal, this head-turning maxi dress is featured
    in a strapless silhouette with crochet-adorned top piecing, sheer piecing at center, and
    handkerchief bottom hem for added dimension.",
    "averageRating": 4.2,
    "reviews": [
      {
        "Rating": 4,
        "comments": ["Love this dress! It's a little see through but perfect for summer."]
      },
      {
        "Rating": 5,
        "comments": ["Got so
      many compliments on this dress. BUY IT NOW!!"]
      },
      {
        "Rating": 3,
        "comments": ["It was alright"]
      }
    ]
}
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If no items match the passed in query parameters, returns an error with message: `No items found`
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
Welcome suzpiver
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

**Description:** given a valid username and password, a JSON is returned containing the users information including their email and all transaction history details.

**Example Request:** /user/history with POST parameters of `username=suzpiver` and `password=sh0pp1ng!`

**Example Response:**
```json
{
  "user":suzpiver,
  "email":suzpiver@uw.edu,
  "transaction-history":[
    {
      "shortname":"fp-one-lumi-maxi-dress",
      "name":"FP One Lumi Maxi Dress",
      "size":"S",
      "price": "$70",
      "date-purchased":"May-15-2023",
      "confirmation": AG678RDJF8P2B
    }
    {
      "shortname":"love-letter-cami",
      "name":"Love Letter Cami",
      "size":"M",
      "price":"$50",
      "date-purchased":"April-3-2023",
      "confirmation": JHGB87KH453GH
    }
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
**Request Format:** /checkout endpoint with POST parameters of `username`, `shortname`, and `size`

**Request Type:** POST

**Returned Data Format**: plain text

**Description:** Given that a user is logged in and there are items available, plain text containing a generated confirmation code is returned. This confirmation code is saved to the user's account

**Example Request:** /checkout with POST parameters of `username=suzpiver`, `shortname=fp-one-lumi-maxi-dress`, and `size=small`

**Example Response:**
```
AG678RDJF8P2B
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If passed in an invalid or empty username, returns an error with the message: `Please enter a valid user to purchase items`
  - If passed an invalid or empty shortname, returns an error with the message: `Invalid product name {shortname}`
  - If passed an invalid or empty size, returns an error with the message: `Invalid size or no size {size} available`
- Possible 500 errors (all plain text):
  - If something else goes wrong on the server, returns an error with the message: `Uh oh. Something went wrong. Please try again later.`

## Endpoint 5: Create a New User
**Request Format:** /newUser endpoint with POST parameters of `username`, `password`, and `email`

**Request Type:** POST

**Returned Data Format**: JSON

**Description:** Updates the user directory to add a new user if the username and email are unique. Returns a "welcome" message if a new user is created sucessfully.

**Example Request:** /newUser with POST parameters of `username=miyan`, `password=hehehoho`, and `email=miyan@uw.edu`

**Example Response:**
```json
{
  "username":"miyan",
  "message":"New user created. Welcome miyan"
}
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
**Request Format:** /review endpoint with POST parameters of `username`, `confirmation`, `rating`, and `comments`

**Request Type:** POST

**Returned Data Format**: plain text

**Description:** given a valid username, confirmation number, rating between 1 and 5, and an optional comment, a review is attached to the item for all other users to view. This also updates the average rating for the item.

**Example Request:** /review with POST parameters of `username=suzpiver`,`confirmation=AG678RDJF8P2B`, `rating=4` and `comments=It was alright`

**Example Response:**
```
added 4 star review for fp-one-lumi-maxi-dress.
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If invalid or empty username, returns an error with the message: `Enter a valid username`
  - If confirmation code is not found under user's transaction history or empty, returns error message: `No transaction {confirmation} found for user {username}`
  - If empty or rating outside of 1-5 range, returns error message: `Please enter a rating between 1 and 5`
  - If comments are more than 200 characters, returns error with message: `comments must be less that 200 characters`
- Possible 500 errors (all plain text):
  - If something else goes wrong on the server, returns an error with the message: `Uh oh. Something went wrong. Please try again later.`