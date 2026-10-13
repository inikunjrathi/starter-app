# MongoDB Guide

The app needs a running MongoDB server. Pick **one** of the three options below, then use the
rest of this guide to look at and manage your data.

> **No internet later?** Install MongoDB (Option A) or pull the Docker image (Option C) while you're
> still online; after that it runs fully offline. Atlas (Option B) always needs internet.

- [Option A: install MongoDB on your computer](#option-a-install-locally)
- [Option B: MongoDB Atlas (free cloud database, nothing to install)](#option-b-mongodb-atlas-cloud)
- [Option C: Docker](#option-c-docker)

## Option A: install locally

Install **MongoDB Community Server** and **mongosh** (the MongoDB shell).
Official instructions for every OS: https://www.mongodb.com/docs/manual/administration/install-community/

### Windows
1. Download the `.msi` from https://www.mongodb.com/try/download/community
2. During setup choose **Complete** and keep **"Install MongoDB as a Service"** checked.
   It then starts automatically with Windows.
3. Install mongosh from https://www.mongodb.com/try/download/shell (or tick "Install Compass" for a GUI).

### macOS (Homebrew)
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Ubuntu / Debian
MongoDB is not in the default apt repositories. Follow the official page for your version
(it adds MongoDB's repository first):
https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/
Then start it:
```bash
sudo systemctl start mongod
sudo systemctl enable mongod   # start automatically on boot
```

### Arch / Manjaro / CachyOS
Install `mongodb-bin` and `mongosh-bin` from the AUR (e.g. `yay -S mongodb-bin mongosh-bin`), then:
```bash
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### Check it works
```bash
mongosh
```
You should get a `test>` prompt. Type `exit` to leave. The apps connect to `mongodb://127.0.0.1:27017`,
which is a local MongoDB, so `node index.js` works as is.

### Run without installing it as a service
If you just want to start MongoDB by hand (e.g. in a lab), point it at any empty folder:
```bash
mkdir -p ~/mongo-data
mongod --dbpath ~/mongo-data
```
Keep that terminal open while the app runs.

## Option B: MongoDB Atlas (cloud)

Free, and it works the same on every computer.

1. Sign up at https://www.mongodb.com/cloud/atlas and create a **free (M0) cluster**.
2. **Database Access** → *Add New Database User* → choose a username and password.
3. **Network Access** → *Add IP Address* → *Add Current IP Address*
   (or `0.0.0.0/0` to allow everywhere, which is less safe but handy for a demo).
4. **Connect** → *Drivers* → copy the connection string. It looks like:
   ```
   mongodb+srv://myuser:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your password, add the database name after `.net/`, and put the
   whole string in `mongoose.connect(...)` in `index.js`:
   ```js
   mongoose.connect("mongodb+srv://myuser:mypassword@cluster0.abcde.mongodb.net/bookstore")
   ```

If the password has special characters like `@ : / ? #`, URL-encode them (e.g. `@` → `%40`), or
choose a password with only letters and numbers.

To use mongosh with Atlas: `mongosh "mongodb+srv://cluster0.abcde.mongodb.net/" --username myuser`

## Option C: Docker

```bash
docker pull mongo      # do this while online
docker run -d --name mongo -p 27017:27017 -v mongo-data:/data/db mongo
```
Stop it with `docker stop mongo` and start it again with `docker start mongo`. Your data stays in
the `mongo-data` volume. Open a shell with `docker exec -it mongo mongosh`.

## What the apps store

The database name is the last part of the address in `mongoose.connect(...)` in each `index.js`,
e.g. `mongodb://127.0.0.1:27017/bookstore` → database `bookstore`. Each model is one collection:
model `Book` → collection `books`, model `User` → `users`.

| Collection | Saved by | Example document |
|------------|----------|------------------|
| `users` | Sign up form | `{ name: "Nik", email: "nik@x.com", password: "$2a$10$...", __v: 0 }` (password is a bcrypt hash, never plain text) |
| `books` | Book form on Home (bookstore) | `{ name: "Dune", author: "Frank Herbert", category: "Fiction", price: 499, __v: 0 }` |
| `foods`, `orders` | Food form and Order buttons (foodorder) | `{ food: "Paneer Tikka", price: 220, quantity: 2, customer: "Ann", __v: 0 }` |

Every document also has an automatic `_id`, and Mongoose adds `__v` (a version number you can ignore).
Databases and collections are created automatically the first time something is saved, so they only
appear in Compass after you submit a form. Click refresh in Compass to see them.

## Looking at your data with mongosh

Start the shell with `mongosh` (or the Atlas command above), then:

```js
show dbs                      // list databases
use bookstore                 // switch to the app's database
show collections              // users, books

db.books.find()                             // all documents
db.books.countDocuments()                   // how many
db.books.find({ category: "Fiction" })      // filter by a field
db.books.find({ price: { $gt: 300 } })      // price greater than 300
db.books.find().sort({ price: -1 }).limit(3)   // 3 most expensive
db.users.find({}, { password: 0 })          // users, hiding the password hash
db.books.findOne({ name: "Dune" })          // first match only
```

Comparison operators you can use in filters: `$gt` `$gte` `$lt` `$lte` `$ne` `$in`, e.g.
`db.books.find({ price: { $gte: 100, $lte: 500 } })`.

To add, change or delete data, see [Adding and changing data from the command line](#adding-and-changing-data-from-the-command-line).

### Prefer a GUI?

**MongoDB Compass** (https://www.mongodb.com/products/compass) lets you browse, filter, edit and
delete documents with clicks. Connect with `mongodb://127.0.0.1:27017` (or your Atlas string),
then open your app's database (e.g. `bookstore`). This is how the class example shows saved data.

## Adding and changing data from the command line

You can add, edit and delete records with `mongosh` instead of the website's forms, for example to fill a
database with sample data before a demo. The examples use the bookstore app (`bookstore` database, `books`
collection). For another app, change the database and collection names.

### Open the shell on your database

```bash
mongosh bookstore          # opens the shell with the bookstore database selected
```
or open `mongosh` and type `use bookstore`. The prompt changes to `bookstore>`. Type `exit` to leave.

Collection names are the lowercase plural of the model: model `Book` → `db.books`, `Patient` →
`db.patients`, `Food` → `db.foods`. Run `show collections` to check.

### Add records

**One record:**
```js
db.books.insertOne({ name: "Dune", author: "Frank Herbert", category: "Fiction", price: 499 })
```

**Several at once** (put them in a list `[ ... ]`):
```js
db.books.insertMany([
  { name: "Cosmos", author: "Carl Sagan", category: "Science", price: 350 },
  { name: "Matilda", author: "Roald Dahl", category: "Children", price: 199 }
])
```

MongoDB replies with `acknowledged: true` and the new `_id`s. The records show up straight away in the
website's list pages (refresh the page) and in Compass.

**Use the same field names as the model** (`models/Book.js`), spelled the same way. A record with
`Name` or `bookName` instead of `name` is saved, but the website shows that column as empty. If the database
or collection doesn't exist yet, MongoDB creates it on the first insert.

### Change records

`updateOne` changes the first record that matches. `updateMany` changes every record that matches. The
first `{ }` chooses which records, and the second says what to change.

```js
// set (or add) fields
db.books.updateOne({ name: "Dune" }, { $set: { price: 399 } })
db.books.updateOne({ name: "Dune" }, { $set: { price: 399, publisher: "Ace Books" } })

// change every matching record
db.books.updateMany({ category: "Science" }, { $set: { category: "Technology" } })

// add to a number (use a minus number to subtract)
db.books.updateMany({}, { $inc: { price: 50 } })          // every book costs 50 more

// remove a field
db.books.updateOne({ name: "Dune" }, { $unset: { publisher: "" } })

// rename a field in every record (e.g. after renaming it in the model)
db.books.updateMany({}, { $rename: { "author": "writer" } })

// add an item to a list field
db.books.updateOne({ name: "Dune" }, { $push: { tags: "classic" } })

// update if it exists, otherwise create it ("upsert")
db.books.updateOne(
  { name: "Emma" },
  { $set: { author: "Jane Austen", category: "Fiction", price: 250 } },
  { upsert: true }
)

// replace a whole record (fields you leave out are removed)
db.books.replaceOne({ name: "Matilda" }, { name: "Matilda", author: "Roald Dahl", category: "Children", price: 220 })
```

The reply shows `matchedCount` (how many records matched) and `modifiedCount` (how many changed).
`matchedCount: 0` means nothing matched: check the spelling and capitals, since `"dune"` doesn't match `"Dune"`.

**Change one exact record by its `_id`** (copy the id from `find()` or Compass):
```js
db.books.updateOne({ _id: ObjectId("6acdd635419047a46e5f4378") }, { $set: { price: 260 } })
```

**Forgot the `$set`?** `updateOne({ name: "Dune" }, { price: 399 })` gives an error. Every update needs
an operator such as `$set`, `$inc` or `$unset`.

### Delete records

```js
db.books.deleteOne({ name: "Dune" })                         // first match
db.books.deleteOne({ _id: ObjectId("6acdd635419047a46e5f4378") })
db.books.deleteMany({ category: "Children" })               // every match
db.books.deleteMany({})                                     // every record, but keep the collection
db.books.drop()                                             // delete the whole collection
db.dropDatabase()                                           // delete EVERYTHING in this database (careful!)
```

There is no undo. Run the same filter with `find()` first to see what would be deleted:
`db.books.find({ category: "Children" })`.

### Getting the types right

- **Numbers:** write `price: 499`, not `price: "499"`. With quotes it's saved as text, and number filters
  like `{ price: { $gt: 300 } }` skip it. To find and fix text numbers:
  ```js
  db.books.find({ price: { $type: "string" } })                                       // find them
  db.books.updateMany({ price: { $type: "string" } }, [{ $set: { price: { $toDouble: "$price" } } }])   // convert
  ```
- **Dates:** the apps save dates from `type="date"` inputs as text like `"2026-10-13"`, so add them the same
  way: `{ issueDate: "2026-10-13" }`. Comparing them works: `db.issues.find({ issueDate: { $gte: "2026-10-01" } })`.
- **Yes/No values** (like `popular` in foodorder) are text: `popular: "Yes"`.

### Users and passwords

Don't add users with `insertOne`. The login page compares a **bcrypt hash**, so a user inserted with
`password: "secret"` can never log in. Create accounts with the Sign Up page. You can still view and delete them:
```js
db.users.find({}, { password: 0 })            // list users without the password hash
db.users.updateOne({ email: "nik@x.com" }, { $set: { name: "Nikunj" } })
db.users.deleteOne({ email: "nik@x.com" })
```

### Run commands without opening the shell

**One command** from the normal terminal:
```bash
mongosh bookstore --eval 'db.books.insertOne({ name: "Godan", author: "Premchand", category: "Fiction", price: 150 })'
```

**A file of commands**, handy for sample data you want to load again later. Save as `sample-data.js`:
```js
db = db.getSiblingDB("bookstore");     // choose the database ("use bookstore" doesn't work inside a file)

db.books.insertMany([
  { name: "Malgudi Days", author: "R K Narayan", category: "Fiction", price: 180 },
  { name: "Wings of Fire", author: "APJ Abdul Kalam", category: "Biography", price: 299 }
]);
```
Run it:
```bash
mongosh sample-data.js
```
or, from inside `mongosh`: `load("sample-data.js")`.

### Import records from a JSON or CSV file

`mongoimport` comes with the **MongoDB Database Tools** (https://www.mongodb.com/try/download/database-tools),
a separate download from mongosh. It runs in the normal terminal, not inside mongosh.

**JSON file** (`books.json`, a list of records):
```json
[
  { "name": "Clean Code", "author": "Robert Martin", "category": "Technology", "price": 650 },
  { "name": "Sapiens", "author": "Yuval Harari", "category": "History", "price": 499 }
]
```
```bash
mongoimport --db bookstore --collection books --file books.json --jsonArray
```

**CSV file** (`books.csv`, first line = field names):
```
name,author,category,price
Gita,Vyasa,Fiction,199
Wings of Fire,APJ Abdul Kalam,Biography,299
```
```bash
mongoimport --db bookstore --collection books --type csv --headerline --file books.csv
```

Compass can do the same without the command line: open the collection, then **ADD DATA → Import JSON or CSV file**.

### Quick reference

| Task | Command |
|------|---------|
| Add one | `db.books.insertOne({ ... })` |
| Add many | `db.books.insertMany([ {...}, {...} ])` |
| Change one | `db.books.updateOne({ filter }, { $set: { ... } })` |
| Change all matching | `db.books.updateMany({ filter }, { $set: { ... } })` |
| Add to a number | `{ $inc: { price: 50 } }` |
| Remove a field | `{ $unset: { field: "" } }` |
| Rename a field | `{ $rename: { "old": "new" } }` |
| Update or create | add `{ upsert: true }` as the third argument |
| Delete one / many | `db.books.deleteOne({ filter })` / `db.books.deleteMany({ filter })` |
| Delete collection | `db.books.drop()` |

## Backup and restore

Uses the MongoDB Database Tools (https://www.mongodb.com/try/download/database-tools):

```bash
mongodump --db bookstore --out backup/          # save to ./backup/bookstore/
mongorestore --db bookstore backup/bookstore/   # load it back
```
Add `--uri "<your Atlas string>"` to either command for Atlas.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017` | MongoDB isn't running. Start it (`sudo systemctl start mongod`, `brew services start mongodb-community`, the Windows service, or `docker start mongo`). |
| No "MongoDB connected" message, and submitting a form gives `buffering timed out after 10000ms` | Same as above, or the address in `mongoose.connect(...)` is wrong. |
| `bad auth : authentication failed` (Atlas) | Wrong username or password in the URL, or a special character in the password isn't URL-encoded. |
| Atlas times out | Your IP isn't in **Network Access**. Add it again (home and college IPs differ). |
| `querySrv ENOTFOUND` (Atlas) | Typo in the cluster address, or your network blocks DNS SRV lookups. Try another network or use the "standard connection string" option in Atlas. |
| `Email already registered` on sign up | That email is in `db.users` already. Log in instead, or delete it: `db.users.deleteOne({ email: "..." })`. |
| `mongod` exits with `Data directory /data/db not found` | Pass a folder: `mongod --dbpath ~/mongo-data` (create it first). |
| Port 27017 already in use | MongoDB is already running (a service is probably started). Just use it. |
| Using `mongodb://localhost:27017` fails but `127.0.0.1` works | Node resolves `localhost` to IPv6 `::1`, and MongoDB listens on IPv4 by default. Use `127.0.0.1`. |
