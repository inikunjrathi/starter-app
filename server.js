const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const fs = require('fs');
const vm = require('vm');
const { MongoClient, ObjectId } = require('mongodb');

const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017';
// SITE=examples/bookstore npm start -> files in that folder override the ones in public/
const SITE = process.env.SITE ? require('path').resolve(process.env.SITE) : null;
const configFile = SITE && fs.existsSync(SITE + '/config.js') ? SITE + '/config.js' : __dirname + '/public/config.js';
// Read settings from the same config.js the website uses
const CONFIG = vm.runInNewContext(fs.readFileSync(configFile, 'utf8') + ';CONFIG');
const DB_NAME = process.env.DB_NAME || CONFIG.database || 'starterapp';
const SHARED = CONFIG.shared || []; // collections every logged-in user can read in full

// Login token = email + HMAC signature. Set SECRET in production so tokens survive restarts.
const SECRET = process.env.SECRET || crypto.randomBytes(32).toString('hex');
const sign = email => email + '.' + crypto.createHmac('sha256', SECRET).update(email).digest('hex');
const userFrom = req => { // ponytail: tokens never expire, add an expiry timestamp if needed
  const token = (req.headers.authorization || '').replace(/^Bearer /, '');
  const email = token.slice(0, token.lastIndexOf('.'));
  const a = Buffer.from(token), b = Buffer.from(sign(email));
  return email && a.length === b.length && crypto.timingSafeEqual(a, b) ? email : null;
};

const app = express();
app.use(express.json());
if (SITE) app.use(express.static(SITE));
app.use(express.static(__dirname + '/public'));
// Bootstrap is served from node_modules so the site works without internet
app.use('/vendor/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use('/vendor/icons', express.static(__dirname + '/node_modules/bootstrap-icons/font'));

MongoClient.connect(MONGO_URL).then(async client => {
  const db = client.db(DB_NAME);
  const users = db.collection('users');
  await users.createIndex({ email: 1 }, { unique: true });

  app.post('/api/signup', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 6)
      return res.status(400).json({ error: 'Name, email and a 6+ char password are required' });
    try {
      const lower = String(email).toLowerCase();
      await users.insertOne({ name, email: lower, password: await bcrypt.hash(password, 10) });
      res.json({ name, email: lower, token: sign(lower) });
    } catch (e) {
      res.status(409).json({ error: 'Email already registered' });
    }
  });

  app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await users.findOne({ email: String(email).toLowerCase() });
    if (!user || !(await bcrypt.compare(String(password), user.password)))
      return res.status(401).json({ error: 'Wrong email or password' });
    res.json({ name: user.name, email: user.email, token: sign(user.email) });
  });

  // Generic save/list for any page: POST /api/data/contacts {..} , GET /api/data/contacts
  // Records are tagged with the logged-in user. GET returns only your own records,
  // or all records for collections listed in CONFIG.shared. Edit/delete is always own-only.
  const coll = (req, res) => {
    const name = req.params.name;
    if (!/^\w+$/.test(name) || name === 'users') { res.status(400).json({ error: 'Bad collection' }); return null; }
    return db.collection(name);
  };
  app.post('/api/data/:name', async (req, res) => {
    const c = coll(req, res); if (!c) return;
    const r = await c.insertOne({ ...req.body, user: userFrom(req), createdAt: new Date() });
    res.json({ ok: true, id: r.insertedId });
  });
  app.get('/api/data/:name', async (req, res) => {
    const user = userFrom(req);
    if (!user) return res.status(401).json({ error: 'Login required' });
    const c = coll(req, res); if (!c) return;
    res.json(await c.find(SHARED.includes(req.params.name) ? {} : { user }).sort({ createdAt: -1 }).limit(100).toArray());
  });
  // Update / delete one of your own records: PUT|DELETE /api/data/notes/<id>
  const own = async (req, res) => {
    const user = userFrom(req);
    if (!user) { res.status(401).json({ error: 'Login required' }); return null; }
    if (!ObjectId.isValid(req.params.id)) { res.status(400).json({ error: 'Bad id' }); return null; }
    const c = coll(req, res); if (!c) return null;
    return { c, filter: { _id: new ObjectId(req.params.id), user } };
  };
  app.put('/api/data/:name/:id', async (req, res) => {
    const o = await own(req, res); if (!o) return;
    const { _id, user, createdAt, ...fields } = req.body; // these can't be overwritten
    const r = await o.c.updateOne(o.filter, { $set: fields });
    res.status(r.matchedCount ? 200 : 404).json({ ok: !!r.matchedCount });
  });
  app.delete('/api/data/:name/:id', async (req, res) => {
    const o = await own(req, res); if (!o) return;
    const r = await o.c.deleteOne(o.filter);
    res.status(r.deletedCount ? 200 : 404).json({ ok: !!r.deletedCount });
  });

  app.listen(PORT, () => console.log(`Running on http://localhost:${PORT} (database: ${DB_NAME}${SITE ? ', site: ' + process.env.SITE : ''})`));
}).catch(e => { console.error('MongoDB connection failed:', e.message); process.exit(1); });
