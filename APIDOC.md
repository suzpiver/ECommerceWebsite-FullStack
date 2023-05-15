# Free People API Documentation
The Free People API provides information on Free People's womens clothing, specifically tops, bottoms, and dresses. It also enables users to maintian an account to purchase items, personalize item suggestions, and reveiw purchased items.

## Endpoint 1: Get a list of clothes in this site and their information.
**Request Format:** /clothes
**QUERY PARAM 1:**
**Request Format:** ?items=all;

**Request Type:** GET

**Returned Data Format**: Plain text

**Description:** Returns a plain text response of all the items in the API with their full name and shortname seperated by a ":".
  Full name:shortname
The shortname is used as the base string to access further details about the item such as its image and color.

**Example Request:** /clothes?items=all

**Example Response:**
```
FP One Lumi Maxi Dress:fp-one-lumi-maxi-dress
Love Letter Cami:love-letter-cami
Cool Harbor Wide-Leg Pants:cool-harbor-wide-leg-pants
Nina Tee:nina-tee
........etc.
```

**QUERY PARAM 2:**
**Request Format:** /clothes?item={name};

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Given a valid filter parameter (name, type, color) an item or list of items is returned containing the related clothes. If name="All" then all items are returned.

**Example Request:** /Dresses/fp-one-lumi-maxi-dress

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
  - If passed in an invalid clothing name, returns an error with the message: `Items not found`
  - If no items match their filtering, returns an error with message: `Items not found`
- Possible 500 errors (all plain text):
  - If something else goes wrong on the server, returns an error with the message: `Uh oh. Something went wrong. Please try again later.`

## Endpoint 2: Check username and password when a user logs in
**Request Format:** login/:username/:password

**Request Type:** POST

**Returned Data Format**: plain text

**Description:** Given a valid username and password, returns the username.

**Example Request:** login/suzpiver/sh0pp1ng!`

**Example Response:**
```
suzpiver
```

## Endpoint 3: Returns the user's information
**Request Format:** user/:username

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** given a valid username a JSON is returned containing the users information including, email and all transaction history details

**Example Request:** /user/suzpiver

**Example Response:**
```json
{
  "user":suzpiver,
  "email":suzpiver@uw.edu,
  "transaction-history":[
    {
      "shortname":"fp-one-lumi-maxi-dress",
      "size":"small",
      "date_purchased":"May-15-2023"
    }
    {
      "shortname":"love-letter-cami",
      "size":"medium",
      "date_purchased":"April-3-2023"
    }
  ]
}
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If passed in an invalid username or password, returns an error with the message: `Username/password incorrect`
- Possible 500 errors (all plain text):
  - If something else goes wrong on the server, returns an error with the message: `Uh oh. Something went wrong. Please try again later.`

## Endpoint 4: Check if transaction is successful
**Request Format:** /checkout/:username/:shortname/:size

**Request Type:** POST

**Returned Data Format**: plain text

**Description:** Given that a user is logged in and there are items available, plain text containing a generated confirmation code is returned.

**Example Request:** /checkout/suzpiver/fp-one-lumi-maxi-dress/small

**Example Response:**
```
AG678RDJF8P2B
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If passed in an invalid username, returns an error with the message: `Please login with a valid user to purchase items`
  - If passed in an invalid shortname, returns an error with the message: `Invalid product name`
  - If passed in an invalid size, returns an error with the message: `Invalid size or no sizes available`
- Possible 500 errors (all plain text):
  - If something else goes wrong on the server, returns an error with the message: `Uh oh. Something went wrong. Please try again later.`

## Endpoint 5: Create a New User
**Request Format:** newUser/:username/:password/:email

**Request Type:** POST

**Returned Data Format**: JSON

**Description:** Updates the user directory to add a new user if the username is unique, they included a password, and they included an email. Returns a "welcome" message if new user is created sucessfully.

**Example Request:** /miyan/hehehoho/miyan@uw.edu

**Example Response:**
```json
{
  "username":"miyan",
  "message":"New user created sucessfully"
}
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If username already exists, returns an error with the message: `Username already exists`
  - If email does not contain an "@" symbol, returns an error with the message: `Invalid email`
- Possible 500 errors (all plain text):
  - If something else goes wrong on the server, returns an error with the message: `Uh oh. Something went wrong. Please try again later.`

## Endpoint 6: Add a review
**Request Format:** /review endpoint with POST parameters of `username`,`shortname`, `rating`, `comments`

**Request Type:** POST

**Returned Data Format**: plain text

**Description:**

**Example Request:** /review endpoint with POST parameters of `name=suzpiver`,`shortname=fp-one-lumi-maxi-dress` `rating=5` and `comments=It was alright`

**Example Response:**
s



**Error Handling:**
*Fill in an example of the error handling*