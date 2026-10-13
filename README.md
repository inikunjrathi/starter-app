# Starter App

A customizable website built with HTML, CSS, JavaScript, Bootstrap 5, Node.js (Express) and MongoDB.
Every feature is one file. To turn a feature on or off, add or remove its name in `public/config.js`.

## Run it

You need [Node.js](https://nodejs.org) 18+ and a running MongoDB server (local, Docker, or free
MongoDB Atlas in the cloud). **New to MongoDB? See [MONGODB.md](MONGODB.md)** for setup, viewing your
data, backups and fixing connection errors.

```bash
cd starter-app
npm install
npm start
```

Open http://localhost:3000

### Working offline

The website itself needs no internet: Bootstrap, the icons and the images are all served from
this folder. You only need internet **once**, beforehand, to:

1. Run `npm install` (downloads Express, MongoDB driver, bcrypt, Bootstrap and Bootstrap Icons into `node_modules/`).
2. Install MongoDB locally or via Docker (see [MONGODB.md](MONGODB.md)). MongoDB Atlas is a cloud
   service, so it won't work offline.

After that, `npm start` works with no connection. If you copy the project to another computer, copy
`node_modules/` along with it (or run `npm install` there while online).

### Settings (optional)

Set these as environment variables before `npm start`:

| Variable    | Default                     | Meaning |
|-------------|-----------------------------|---------|
| `PORT`      | `3000`                      | Port the website runs on |
| `MONGO_URL` | `mongodb://127.0.0.1:27017` | MongoDB address (use your Atlas URL here if you use MongoDB Atlas) |
| `DB_NAME`   | `starterapp`                | Database name |
| `SECRET`    | random on each start        | Key used to sign login tokens. Set it, or everyone gets logged out when the server restarts |

Example:

```bash
SECRET=some-long-random-text PORT=8080 npm start
```

On Windows (PowerShell): `$env:SECRET="some-long-random-text"; npm start`

## Customize it

### 1. Pick the features (`public/config.js`)

This is the main file. Each name in `pages` is a file in `public/pages/<name>.html`.

```js
const CONFIG = {
  title: 'My Website',     // shown in the topbar, tab title and footer
  layout: 'both',          // 'top' = topbar only, 'side' = sidebar only, 'both'
  theme: 'light',          // starting theme: 'light' or 'dark'
  themeToggle: true,       // show the light/dark switch in the topbar
  pages: [
    'home',                                   // a normal menu link
    'cart',
    { 'Games': ['quiz', 'tictactoe'] },       // a dropdown group
  ],
  authPages: ['login', 'signup'],             // shown at the right of the topbar
  protected: ['profile', 'notes'],            // only visible after login
};
```

- **Remove a feature:** delete its name.
- **Reorder the menu:** reorder the names.
- **Group pages:** put them in `{ 'Group name': [...] }`. Groups become dropdowns in the topbar and headings in the sidebar.
- **Require login:** also add the name to `protected`.

The first page in the list is the home page. Menu labels come from file names (`my-page` becomes "My page").

### 2. Available pages

| Page | What it does | Data stored in |
|------|--------------|----------------|
| `home` | Welcome banner and feature cards | – |
| `dashboard` | Stat cards, bar chart, goal progress bars | – |
| `gallery` | Image grid; click an image to enlarge it | – |
| `slider` | Image carousel and range slider | – |
| `components` | Accordion, tabs, modal, toast, tooltip, popover, alerts, badges, progress, spinners | – |
| `form` | Contact form with validation | MongoDB `contacts` |
| `upload` | Drag-and-drop image preview | – |
| `table` | Search, filter, sort by column, pagination | – |
| `cart` | Products, add to cart, quantities, total, checkout | browser + MongoDB `orders` |
| `calculator` | Calculator with brackets | – |
| `bmi` | BMI calculator | – |
| `converter` | Length, weight, data and temperature converter | – |
| `password` | Password generator and strength checker | – |
| `stopwatch` | Stopwatch with laps, countdown timer, clock | – |
| `todo` | To-do list | browser |
| `expenses` | Income/expense tracker with balance | browser |
| `quiz` | Multiple-choice quiz with score | – |
| `tictactoe` | Two-player tic-tac-toe with scores | – |
| `guess` | Guess-the-number game with best score | browser |
| `profile` | Your details and past orders (login required) | MongoDB `orders` |
| `notes` | Create, edit, delete notes (login required) | MongoDB `notes` |
| `messages` | Messages you sent from the form (login required) | MongoDB `contacts` |
| `login`, `signup` | Accounts with hashed passwords | MongoDB `users` |

"Browser" means the data is kept in `localStorage` on that computer only.

### 3. Change a page's content

Open the file in `public/pages/` and edit it. Most pages keep their editable data at the top of the
`<script>`. For example:

- `gallery.html`: the `images` list. The sample pictures are placeholder SVGs in `public/images/`;
  put your own photos there and write e.g. `'images/beach.jpg'`. The same goes for `slider.html` and `cart.html`
- `cart.html`: the `products` list
- `quiz.html`: the `questions` list
- `table.html`: the `rows` list
- `dashboard.html`: `stats`, `sales`, `goals`
- `converter.html`: the `units` list

Styling uses [Bootstrap 5 classes](https://getbootstrap.com/docs/5.3/). Put your own CSS in `public/style.css`.

### 4. Make a new page

1. Copy any file in `public/pages/`, e.g. `bmi.html`, to `public/pages/mypage.html`.
2. Edit the HTML and the `<script>`.
3. Add `'mypage'` to `pages` in `config.js`.

A page file is plain HTML plus an optional `<script>`:

```html
<h2>My Page</h2>
<button class="btn btn-primary" id="hello">Click</button>
<p id="out"></p>
<script>
document.getElementById('hello').onclick = () => {
  document.getElementById('out').textContent = 'Hello!';
};
</script>
```

Each page's script runs in its own scope, so variable names don't clash between pages.

Tips:
- **Read form inputs with `form.elements.name`**, not `form.name`. Names like `title`, `name`, `action` clash with built-in form properties.
- **Timers:** if your page uses `setInterval`, stop it when the user leaves:
  `window.onPageLeave = () => clearInterval(myTimer);`
- **Inline `onclick="fn()"`** needs the function on `window` (`window.fn = () => ...`), because page scripts have their own scope. Using `element.onclick = ...` in the script avoids this.
- **Showing user-typed text:** use `textContent`, not `innerHTML`, so typed HTML can't run as code.

### 5. Save data in MongoDB (no server changes needed)

Every page can use the `api()` helper. Replace `things` with any collection name.

```js
await api('/api/data/things', { title: 'Hi' });          // create
const list = await api('/api/data/things');               // read your records (login required)
await api(`/api/data/things/${id}`, { title: 'New' }, 'PUT');   // update yours
await api(`/api/data/things/${id}`, null, 'DELETE');            // delete yours
```

Records are tagged with the logged-in user, and each user can only read, edit and delete their own.
`api()` throws an `Error` with the server's message if a request fails.

Login helpers: `auth.user()` returns `{ name, email, token }` or `null`, and `auth.logout()` logs out.
See `notes.html` for a complete create/read/update/delete example.

## Project structure

```
starter-app/
├── server.js          Express server: login/signup + /api/data routes
├── package.json
└── public/
    ├── config.js      MAIN FILE: choose pages, layout, theme
    ├── index.html     Page shell: topbar, sidebar, footer
    ├── app.js         Builds the menus and loads pages (normally no need to edit)
    ├── style.css      Your custom CSS
    ├── images/        Placeholder images (replace with your own)
    └── pages/         One file per feature
```

## API reference

| Method | URL | Body | Notes |
|--------|-----|------|-------|
| POST | `/api/signup` | `{ name, email, password }` | Password at least 6 characters. Returns `{ name, email, token }` |
| POST | `/api/login` | `{ email, password }` | Returns `{ name, email, token }` |
| POST | `/api/data/:collection` | any JSON | Anyone can save; tagged with the user if logged in |
| GET | `/api/data/:collection` | – | Login required; your latest 100 records |
| PUT | `/api/data/:collection/:id` | fields to change | Login required; your records only |
| DELETE | `/api/data/:collection/:id` | – | Login required; your records only |

Logged-in requests send `Authorization: Bearer <token>` (`api()` does this for you).
Collection names may contain only letters, numbers and `_`, and `users` can't be accessed.

## Limitations

- Login tokens never expire. Logging out only removes the token from the browser.
- There are no admin accounts. Messages sent from the form while logged out are saved but only
  visible directly in MongoDB (`mongosh` → `use starterapp` → `db.contacts.find()`).
- Image upload only previews files; it doesn't store them on the server.
