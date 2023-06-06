CREATE TABLE "inventory" (
	"itemID"	INTEGER NOT NULL,
	"XS"	INTEGER NOT NULL,
	"S"	INTEGER NOT NULL,
	"M"	INTEGER NOT NULL,
	"L"	INTEGER NOT NULL,
	"XL"	INTEGER NOT NULL,
	"XXL"	INTEGER NOT NULL,
	PRIMARY KEY("itemID")
)
CREATE TABLE "items" (
	"itemID"	NUMERIC NOT NULL,
	"name"	TEXT NOT NULL,
	"webname"	TEXT NOT NULL,
	"type"	TEXT NOT NULL,
	"color"	TEXT NOT NULL,
	"price"	NUMERIC NOT NULL,
	PRIMARY KEY("itemID")
)
CREATE TABLE "reviews" (
	"rid"	INTEGER NOT NULL,
	"itemID"	INTEGER NOT NULL,
	"user"	TEXT NOT NULL,
	"stars"	INTEGER NOT NULL,
	"comments"	TEXT,
	PRIMARY KEY("rid")
)
CREATE TABLE "transactions" (
	"id"	INTEGER NOT NULL,
	"confirmation"	TEXT NOT NULL,
	"user"	TEXT NOT NULL,
	"date"	INTEGER NOT NULL,
	"itemID"	INTEGER NOT NULL,
	"size"	INTEGER NOT NULL,
	PRIMARY KEY("id")
)
CREATE TABLE "users" (
	"username"	TEXT NOT NULL,
	"password"	TEXT NOT NULL,
	"email"	TEXT NOT NULL,
	PRIMARY KEY("username")
)
