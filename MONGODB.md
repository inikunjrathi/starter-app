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

Changing data:

```js
db.books.updateOne({ name: "Dune" }, { $set: { price: 399 } })
db.books.deleteOne({ _id: ObjectId("6acdd635419047a46e5f4378") })
db.books.deleteMany({ category: "Children" })
db.users.deleteOne({ email: "nik@x.com" })  // delete an account
db.books.drop()                             // delete a whole collection
db.dropDatabase()                           // delete EVERYTHING in this database (careful!)
```

Comparison operators you can use in filters: `$gt` `$gte` `$lt` `$lte` `$ne` `$in`, e.g.
`db.books.find({ price: { $gte: 100, $lte: 500 } })`.

### Prefer a GUI?

**MongoDB Compass** (https://www.mongodb.com/products/compass) lets you browse, filter, edit and
delete documents with clicks. Connect with `mongodb://127.0.0.1:27017` (or your Atlas string),
then open your app's database (e.g. `bookstore`). This is how the class example shows saved data.

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
