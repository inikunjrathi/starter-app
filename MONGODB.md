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
You should get a `test>` prompt. Type `exit` to leave. Then run the app with `npm start`; the default
`MONGO_URL` (`mongodb://127.0.0.1:27017`) already points at a local MongoDB.

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
5. Replace `<password>` with your password and start the app with it:
   ```bash
   MONGO_URL="mongodb+srv://myuser:mypassword@cluster0.abcde.mongodb.net/" npm start
   ```
   Windows PowerShell:
   ```powershell
   $env:MONGO_URL="mongodb+srv://myuser:mypassword@cluster0.abcde.mongodb.net/"; npm start
   ```

If the password has special characters like `@ : / ? #`, URL-encode them (e.g. `@` → `%40`), or
choose a password with only letters and numbers.

The database name comes from `DB_NAME` (default `starterapp`), not from the URL.

To use mongosh with Atlas: `mongosh "mongodb+srv://cluster0.abcde.mongodb.net/" --username myuser`

## Option C: Docker

```bash
docker pull mongo      # do this while online
docker run -d --name mongo -p 27017:27017 -v mongo-data:/data/db mongo
```
Stop it with `docker stop mongo` and start it again with `docker start mongo`. Your data stays in
the `mongo-data` volume. Open a shell with `docker exec -it mongo mongosh`.

## What the app stores

Everything goes in the database `starterapp`, one collection per kind of data:

| Collection | Created by | Example document |
|------------|-----------|------------------|
| `users` | Sign up | `{ name: "Nik", email: "nik@x.com", password: "$2a$10$..." }` (password is a bcrypt hash, never plain text) |
| `contacts` | Form page | `{ name, email, phone, date, subject, gender, message, user, createdAt }` |
| `orders` | Cart checkout | `{ items: [{ name: "Watch", price: 3499, qty: 1 }], total: 3499, user: "nik@x.com", createdAt }` |
| `notes` | Notes page | `{ title: "Shopping", body: "milk", user: "nik@x.com", createdAt }` |

Every document also has an automatic `_id`. `user` is the email of whoever was logged in
(`null` if nobody was). Collections are created automatically the first time something is saved,
so a new page that calls `api('/api/data/anything', {...})` creates the `anything` collection.

## Looking at your data with mongosh

Start the shell with `mongosh` (or the Atlas command above), then:

```js
show dbs                      // list databases
use starterapp                // switch to the app's database
show collections              // users, contacts, orders, notes, ...

db.contacts.find()                          // all documents
db.contacts.find().sort({ createdAt: -1 }).limit(5)   // newest 5
db.contacts.countDocuments()                // how many
db.contacts.find({ subject: "Support" })    // filter by a field
db.orders.find({ total: { $gt: 5000 } })    // total greater than 5000
db.orders.find({ user: "nik@x.com" })       // one user's orders
db.users.find({}, { password: 0 })          // users, hiding the password hash
db.notes.findOne({ title: "Shopping" })     // first match only
```

Changing data:

```js
db.notes.updateOne({ title: "Shopping" }, { $set: { body: "milk, eggs" } })
db.contacts.deleteOne({ _id: ObjectId("6acdd635419047a46e5f4378") })
db.contacts.deleteMany({ user: null })      // delete all messages sent while logged out
db.users.deleteOne({ email: "nik@x.com" })  // delete an account
db.orders.drop()                            // delete a whole collection
db.dropDatabase()                           // delete EVERYTHING in starterapp (careful!)
```

Comparison operators you can use in filters: `$gt` `$gte` `$lt` `$lte` `$ne` `$in`, e.g.
`db.orders.find({ total: { $gte: 1000, $lte: 5000 } })`.

### Prefer a GUI?

**MongoDB Compass** (https://www.mongodb.com/products/compass) lets you browse, filter, edit and
delete documents with clicks. Connect with `mongodb://127.0.0.1:27017` (or your Atlas string),
then open `starterapp`.

## Backup and restore

Uses the MongoDB Database Tools (https://www.mongodb.com/try/download/database-tools):

```bash
mongodump --db starterapp --out backup/          # save to ./backup/starterapp/
mongorestore --db starterapp backup/starterapp/  # load it back
```
Add `--uri "<your Atlas string>"` to either command for Atlas.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `MongoDB connection failed: connect ECONNREFUSED 127.0.0.1:27017` | MongoDB isn't running. Start it (`sudo systemctl start mongod`, `brew services start mongodb-community`, the Windows service, or `docker start mongo`). |
| The app hangs for ~30 seconds and then fails | Same as above, or the `MONGO_URL` is wrong. |
| `bad auth : authentication failed` (Atlas) | Wrong username or password in the URL, or a special character in the password isn't URL-encoded. |
| Atlas times out | Your IP isn't in **Network Access**. Add it again (home and college IPs differ). |
| `querySrv ENOTFOUND` (Atlas) | Typo in the cluster address, or your network blocks DNS SRV lookups. Try another network or use the "standard connection string" option in Atlas. |
| `Email already registered` on sign up | That email is in `db.users` already. Log in instead, or delete it: `db.users.deleteOne({ email: "..." })`. |
| `mongod` exits with `Data directory /data/db not found` | Pass a folder: `mongod --dbpath ~/mongo-data` (create it first). |
| Port 27017 already in use | MongoDB is already running (a service is probably started). Just use it. |
| Using `mongodb://localhost:27017` fails but `127.0.0.1` works | Node resolves `localhost` to IPv6 `::1`, and MongoDB listens on IPv4 by default. Use `127.0.0.1`. |
