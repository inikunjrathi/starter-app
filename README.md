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
| `DB_NAME`   | `database` in config.js     | Database name (overrides config.js) |
| `SITE`      | none                        | Folder whose files override `public/`, e.g. `examples/bookstore` |
| `SECRET`    | random on each start        | Key used to sign login tokens. Set it, or everyone gets logged out when the server restarts |

Example:

```bash
SECRET=some-long-random-text PORT=8080 npm start
```

On Windows (PowerShell): `$env:SECRET="some-long-random-text"; npm start`

## Exam-style questions (quick recipe)

Most questions look like: *"Website with login, a navbar with pages X, Y, Z, an image carousel,
and a form with fields A, B, C stored in MongoDB."* `examples/` has 9 complete answers. Run any of them:

```bash
SITE=examples/hospital npm start       # Windows PowerShell: $env:SITE="examples/hospital"; npm start
```

| Example | Navbar | Form → collection | Extras | Database |
|---------|--------|-------------------|--------|----------|
| `bookstore` (Set A) | Home, Books, Categories, Contact Us | Book Name, Author, Category, Price → `books` | books per category | `bookstore` |
| `hospital` | Home, Patients, Doctors, Contact Us | patient name, age, gender, blood group, disease, doctor, admission date, phone → `patients` | doctor cards | `hospital` |
| `library` | Home, Book Catalog, Issue Book, Contact Us | student, roll no, book, issue/return date, status → `issues` | copies available per book; return date must be after issue date | `library` |
| `college` | Home, Courses, Admission, Students, Contact Us | name, email, phone, DOB, gender, course, 12th %, address → `students` | course cards; age check; anyone can apply, list needs login | `college` |
| `employees` | Home, Employees, Departments, Contact Us | name, email, department, designation, salary, joining date → `employees` | stats on home; staff and salary per department; sidebar layout | `company` |
| `restaurant` | Home, Menu, My Orders, Book a Table, Contact Us | reservation → `reservations`; cart checkout → `orders` | menu by category with add to cart | `restaurant` |
| `events` | Home, Events, Register, Participants, Contact Us | name, email, phone, college, year, event → `registrations` | registrations per event; filter participants by event; dark theme | `techfest` |
| `foodorder` (Set F) | Home, Menu ▾ (All Items, Starters, Main Course, Desserts, Beverages), My Orders, Offers, Contact Us | Food Item Name, Category, Type (Veg/Non-Veg), Price, Availability, Popular → `fooditems` | Veg, Popular, Not Available and Offer badges; cart with coupon codes → `orders`; "Add sample items" button | `foodorder` |
| `hotel` | Home, Rooms, Book a Room, Contact Us | guest, email, phone, room type, check-in/out, guests → `bookings` | live price estimate; date and guest-count checks | `hotel` |

To show the stored data, open MongoDB Compass → connect to `mongodb://127.0.0.1:27017` → open the
database from the table → open the collection. Each database has its own `users`, so sign up once per example.

### Answering a new question

1. **Copy the closest example:** `cp -r examples/hospital examples/myanswer` (or copy the folder in your file manager).
2. **Edit `examples/myanswer/config.js`:**
   - `title`, and `pages`: one file name per navbar item, in order
   - `labels` for menu text with spaces or capitals, e.g. `{ contact: 'Contact Us', issue: 'Issue Book' }`
   - `database` (the name to show in Compass) and `shared` (collections everyone can see)
   - `forms`: the fields asked for in the question, one list per collection
   - `requireLogin: true` if the question asks for a login facility
   - For a dropdown that opens one page with different filters, add parameters to the entries:
     `{ Menu: ['menu', 'menu?cat=Starters', 'menu?cat=Desserts'] }`. Each shows as "Starters", "Desserts"
     (the last parameter value), and `pages/menu.html` reads the filter with `pageParams().cat`.
     See `examples/foodorder`.
3. **Make one file per navbar item** in `examples/myanswer/pages/` and delete the ones you don't need.
   `contact`, `login` and `signup` already exist in `public/pages/`, so just list them in `pages`.
4. **Run it:** `SITE=examples/myanswer npm start`

A page with a form and a table of saved records is just:

```html
<form id="patientForm"></form>
<div id="patientTable"></div>
<script>
crudForm({ collection: 'patients', form: '#patientForm', table: '#patientTable', submitText: 'Add Patient' });
</script>
```

with the fields in `config.js`:

```js
forms: {
  patients: [
    'Patient Name',                                            // text box, saved as patientName
    { label: 'Age', type: 'number', min: 0, max: 120 },
    { label: 'Gender', options: ['Male', 'Female', 'Other'] }, // dropdown
    { label: 'Admission Date', type: 'date' },
    { label: 'Phone', type: 'tel', pattern: '[0-9]{10}' },
    { label: 'Address', type: 'textarea', required: false },
  ],
},
```

### Helper reference

All helpers can be used in any page script.

**`crudForm({ collection, form, table, fields, submitText, search, validate })`** builds a form,
saves to MongoDB and shows the records in a table with Edit and Delete buttons on your own records.
- `form` / `table`: CSS selectors; give one or both (a form-only page, a list-only page, or both)
- `fields`: leave out to use `CONFIG.forms[collection]`
- `search: true`: adds a search box above the table
- `validate: d => 'message'`: extra checks before saving; return an error message, or nothing if OK.
  Example: `validate: d => d.returnDate < d.issueDate ? 'Return date must be after issue date' : ''`

Fields:
- **Types:** `text` (default), `number`, `email`, `date`, `time`, `tel`, `password`, `textarea`, or a dropdown via `options: [...]`.
- **Extra settings:** `min`, `max`, `pattern`, `placeholder`.
- **Required:** all fields are required unless you add `required: false`.
- **Saved name:** the label in camelCase (`'Book Name'` → `bookName`). Set `name: '...'` to choose your own.

**`carousel('#el', ['images/a.svg', { src: 'images/b.jpg', title: 'Sale', text: '50% off' }])`**
creates an image slider inside `<div id="el"></div>`.

**`cards('#el', [{ title, text, icon, img, footer }])`** shows a grid of cards. `icon` is any
[Bootstrap Icons](https://icons.getbootstrap.com) name such as `'heart-pulse'`. An optional third argument sets the
column classes (default `'col-sm-6 col-lg-4'`).

**`pageParams()`** returns the parameters of the current menu entry, e.g. `{ cat: 'Starters' }` for `#menu?cat=Starters`.

**Badges** are plain Bootstrap: `<span class="badge bg-success">Veg</span>`, `bg-danger`, `bg-warning text-dark`,
`rounded-pill`. See `examples/foodorder/pages/menu.html`.

**`api(url, data, method)`**, **`auth.user()`**, **`go('page')`** and **`esc(text)`**: see
[Save data in MongoDB](#5-save-data-in-mongodb-no-server-changes-needed). `go` opens a page, and `esc` makes
text safe to put inside HTML.

Lists for dropdowns and cards (doctors, rooms, courses...) go at the top of `config.js` as
`const DOCTORS = [...]`. Every page can use them, and `forms` can reference them
(`options: DOCTORS.map(d => d.name)`).

Contact Us details come from `contact: { address, phone, email }` in `config.js`.

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
  requireLogin: false,                        // true = every page needs login
  labels: { contact: 'Contact Us' },          // custom menu text

  database: 'starterapp',                     // MongoDB database name (restart server after changing)
  shared: ['books'],                          // collections every logged-in user can read in full
};
```

- **Remove a feature:** delete its name.
- **Reorder the menu:** reorder the names.
- **Group pages:** put them in `{ 'Group name': [...] }`. Groups become dropdowns in the topbar and headings in the sidebar.
- **Require login:** also add the name to `protected`, or set `requireLogin: true` to lock every page.
- **Menu text:** names come from file names (`my-page` becomes "My page"); override with `labels`.

The first page in the list is the home page.

Custom keys work too: put your own data in `CONFIG` (e.g. `categories: [...]`) and use it in any page as `CONFIG.categories`.

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
| `contact` | Contact Us form plus `CONFIG.contact` details | MongoDB `contacts` |
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

Records are tagged with the logged-in user. Each user can only read, edit and delete their own,
except collections listed in `shared` in `config.js`, which every logged-in user can read (still only
the owner can edit or delete).
`api()` throws an `Error` with the server's message if a request fails.

Login helpers: `auth.user()` returns `{ name, email, token }` or `null`, and `auth.logout()` logs out.
See `notes.html` for a complete hand-written create/read/update/delete example, or use `crudForm` (see the exam recipe above).

## Project structure

```
starter-app/
├── server.js          Express server: login/signup + /api/data routes
├── examples/
│   ├── bookstore/     Set A answer: config.js, pages/, images/ (run with SITE=examples/bookstore)
│   └── ...            hospital, library, college, employees, restaurant, events, foodorder, hotel
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
| GET | `/api/data/:collection` | – | Login required; your latest 100 records (everyone's, for `shared` collections) |
| PUT | `/api/data/:collection/:id` | fields to change | Login required; your records only |
| DELETE | `/api/data/:collection/:id` | – | Login required; your records only |

Records come back without the owner's email; instead each has `mine: true/false`.
Logged-in requests send `Authorization: Bearer <token>` (`api()` does this for you).
Collection names may contain only letters, numbers and `_`, and `users` can't be accessed.

## Limitations

- Login tokens never expire. Logging out only removes the token from the browser.
- There are no admin accounts. Messages sent from the form while logged out are saved but only
  visible directly in MongoDB (`mongosh` → `use starterapp` → `db.contacts.find()`).
- Image upload only previews files; it doesn't store them on the server.
