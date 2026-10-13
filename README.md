# Starter App

Simple websites with HTML, Bootstrap, Node.js (Express) and MongoDB (Mongoose), written the same way as
the Pizza Store example: one `index.js`, a `models/` folder, and plain HTML pages with forms.

```
template/        a basic website with every common feature (start here)
examples/        complete answers to exam-style questions
  pizza/         the Pizza Store example from the PDF, exactly as given
  bookstore/     Set A: Online Bookstore
  foodorder/     Set F: Online Food Ordering
  hospital/  library/  college/  employees/  events/  hotel/
```

## Setup (do this while you have internet)

```bash
node -v
npm -v
cd starter-app
npm install          # installs express, mongoose, bcryptjs, bootstrap
```

Install MongoDB and MongoDB Compass (see [MONGODB.md](MONGODB.md)), start MongoDB, and connect Compass to
`mongodb://127.0.0.1:27017`. After this everything works offline.

## Run an app

```bash
cd examples/bookstore
node index.js
```

You should see:

```
http://localhost:3000
MongoDB connected
```

Open http://localhost:3000, sign up, log in and fill the form. Then in Compass, refresh and open the
database (e.g. `bookstore`) and collection (e.g. `books`) to see the saved data.

Stop the server with `Ctrl + C` before running another app (they all use port 3000).

## How every app is built

Each app has the same files:

```
index.js            server: connects to MongoDB, handles the forms
models/User.js      login accounts (name, email, hashed password)
models/Book.js      the data the question asks for
public/login.html   first page
public/signup.html
public/home.html    navbar + carousel + form
public/books.html   table of saved records
public/...          one .html file per navbar item
```

**The flow:**

1. **The form** in `home.html` sends the data to the server:
   ```html
   <form action="/add" method="post">
     <input class="form-control mb-3" name="name" type="text" required>
     ...
     <button type="submit" class="btn btn-primary">Add Book</button>
   </form>
   ```
2. **`index.js`** reads the form fields by their `name` and saves them with the model:
   ```js
   app.post("/add", async (req, res) => {
     const { name, author, category, price } = req.body;
     await new Book({ name, author, category, price }).save();
     res.send("Book details saved successfully!");
   });
   ```
3. **`models/Book.js`** says which fields are stored and their types:
   ```js
   const bookSchema = new mongoose.Schema({
     name: String,
     author: String,
     category: String,
     price: Number
   });
   module.exports = mongoose.model("Book", bookSchema);   // collection "books" in Compass
   ```
4. **The list page** (`books.html`) gets all records from `app.get("/api/books")` and adds them to a table:
   ```js
   fetch("/api/books")
     .then(res => res.json())
     .then(items => {
       items.forEach(item => {
         const row = list.insertRow();
         row.insertCell().textContent = item.name;
       });
     });
   ```

**Login:** `/signup` saves the user with the password hashed by `bcrypt.hash`. `/login` finds the user by
email, checks the password with `bcrypt.compare`, and if it's correct goes to `home.html`.

**Bootstrap** is served from `node_modules` by this line in `index.js`, so the pages need no internet:

```js
app.use("/bootstrap", express.static(path.join(require.resolve("bootstrap"), "../..")));
```

Pages load it with `<link rel="stylesheet" href="/bootstrap/css/bootstrap.min.css">` and
`<script src="/bootstrap/js/bootstrap.bundle.min.js"></script>`.

## Customizing and reusing components

Every app is built from the same small set of pieces. Customizing means changing names in a few places,
and reusing means copying a block from one file into another.

### 1. How the four parts connect

```
public/home.html           index.js                      models/Book.js           MongoDB (Compass)
<form action="/add"  ───►  app.post("/add", ...)   ───►  new Book({...}).save()  ───►  bookstore → books
  name="author"            const { author } = req.body     author: String               author: "Herbert"

public/books.html  ◄───    app.get("/api/books")   ◄───  Book.find()
  fetch("/api/books")       res.json(...)
```

**The one rule that matters:** a field's name must be identical in all four places:

| Where | Example |
|---|---|
| the HTML input | `<input name="author">` |
| `index.js`, both places | `const { ..., author } = req.body;` and `new Book({ ..., author })` |
| the model | `author: String` |
| the list page | `row.insertCell().textContent = item.author;` |

If one doesn't match, that field is silently saved as empty or shown as blank.

### 2. Adding, removing or renaming a form field

Say the question also asks for **Publisher** on the bookstore form:

1. **`models/Book.js`:** add the field.
   ```js
   const bookSchema = new mongoose.Schema({
     name: String,
     author: String,
     publisher: String,     // new
     category: String,
     price: Number
   });
   ```
2. **`public/home.html`:** add an input inside the `<form>`.
   ```html
   <label class="form-label">Publisher</label>
   <input class="form-control mb-3" name="publisher" type="text" required>
   ```
3. **`index.js`:** add the name in both places in `app.post("/add")`.
   ```js
   const { name, author, publisher, category, price } = req.body;

   await new Book({
     name,
     author,
     publisher,
     category,
     price
   }).save();
   ```
4. **`public/books.html`:** add a column heading and a cell, in the same order.
   ```html
   <tr><th>Book Name</th><th>Author Name</th><th>Publisher</th><th>Category</th><th>Price</th></tr>
   ```
   ```js
   row.insertCell().textContent = item.publisher;
   ```

To **remove** a field, delete it in the same four places. To **rename** one, change it in all four.

### 3. Form input types (copy what you need)

All of these go inside `<form action="/add" method="post"> ... </form>`.

```html
<!-- text -->
<label class="form-label">Book Name</label>
<input class="form-control mb-3" name="name" type="text" required>

<!-- number (model type: Number) -->
<label class="form-label">Price</label>
<input class="form-control mb-3" name="price" type="number" min="0" required>

<!-- email -->
<input class="form-control mb-3" name="email" type="email" required>

<!-- phone: exactly 10 digits -->
<input class="form-control mb-3" name="phone" type="tel" pattern="[0-9]{10}" placeholder="10 digits" required>

<!-- date (saved as text like "2026-10-13") -->
<input class="form-control mb-3" name="issueDate" type="date" required>

<!-- time -->
<input class="form-control mb-3" name="time" type="time" required>

<!-- dropdown -->
<label class="form-label">Category</label>
<select class="form-select mb-3" name="category" required>
  <option value="">Select Category</option>
  <option>Fiction</option>
  <option>Science</option>
</select>

<!-- radio buttons: same name, different value -->
<div class="mb-3">
  <input class="form-check-input" type="radio" name="gender" value="Male" id="m" required>
  <label class="form-check-label me-3" for="m">Male</label>
  <input class="form-check-input" type="radio" name="gender" value="Female" id="f">
  <label class="form-check-label" for="f">Female</label>
</div>

<!-- checkbox: saves "Yes" when ticked, nothing when not -->
<div class="form-check mb-3">
  <input class="form-check-input" type="checkbox" name="popular" value="Yes" id="popular">
  <label class="form-check-label" for="popular">Popular dish</label>
</div>

<!-- multi-line text -->
<textarea class="form-control mb-3" name="address" rows="3" required></textarea>

<button type="submit" class="btn btn-primary">Add Book</button>
```

**Useful extras:**
- **`required`** makes the browser refuse to submit while the field is empty. Remove it to make a field optional.
- **`min`, `max`, `pattern`** add number limits and format checks.
- **`placeholder="..."`** shows grey hint text inside the box, which is the Pizza example's style. You can use
  it instead of a `<label>`.

**Choosing the model type:** use `Number` for anything you'll add up or compare as a number (price, age,
salary). Use `String` for everything else, including dates. Dates from `type="date"` arrive as
`"2026-10-13"`, and those strings compare correctly.

### 4. Changing the database, collection, model or route names

| To change | Edit |
|---|---|
| Database name (what Compass shows) | `index.js`: `mongoose.connect("mongodb://127.0.0.1:27017/bookstore")` |
| Model name | the model file: `mongoose.model("Book", bookSchema)`, plus `require("./models/Book")` and `new Book(...)` / `Book.find()` in `index.js` |
| Collection name | automatic: model `Book` becomes collection `books`. To choose your own: `mongoose.model("Book", bookSchema, "mybooks")` |
| Form route | the form's `action="/add"` and `app.post("/add", ...)`: the two must match |
| List route | `app.get("/api/books", ...)` and `fetch("/api/books")` in the list page: the two must match |
| Message after saving | `res.send("Book details saved successfully! ...")` in `index.js` |

### 5. Horizontal navbar

This block sits at the top of every page (`examples/bookstore/public/home.html`):

```html
<nav class="navbar navbar-expand-lg bg-primary" data-bs-theme="dark">
  <div class="container">
    <a class="navbar-brand" href="/home.html">BookNook</a>
    <button class="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#menu">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="menu">
      <ul class="navbar-nav me-auto">
        <li class="nav-item"><a class="nav-link active" href="/home.html">Home</a></li>
        <li class="nav-item"><a class="nav-link" href="/books.html">Books</a></li>
        <li class="nav-item"><a class="nav-link" href="/categories.html">Categories</a></li>
        <li class="nav-item"><a class="nav-link" href="/contact.html">Contact Us</a></li>
      </ul>
      <a class="btn btn-light btn-sm" href="/">Logout</a>
    </div>
  </div>
</nav>
```

- **Site name:** change the text in `navbar-brand`.
- **Colour:** `bg-primary` gives blue. The others are `bg-dark`, `bg-success` (green), `bg-danger` (red),
  `bg-info`, `bg-secondary` and `bg-warning`. With `bg-warning` or `bg-light`, remove `data-bs-theme="dark"`
  so the text turns dark.
- **Add a page:** add one `<li>` line, and create the matching `.html` file in `public/`.
- **Highlight the current page:** `active` goes on the link of the page you're on, so on `books.html` it
  belongs on the Books link.
- **Important:** the navbar is copied into every page. After changing it, paste the new version into every
  `.html` file except `login.html` and `signup.html`. The `toggler` button gives the ☰ menu on small screens.

**Dropdown in the navbar** (`examples/foodorder/public/home.html`). Replace one `<li>` with:

```html
<li class="nav-item dropdown">
  <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">Menu</a>
  <ul class="dropdown-menu">
    <li><a class="dropdown-item" href="/menu.html">All Items</a></li>
    <li><a class="dropdown-item" href="/menu.html?category=Starters">Starters</a></li>
    <li><a class="dropdown-item" href="/menu.html?category=Desserts">Desserts</a></li>
  </ul>
</li>
```

Dropdowns need the Bootstrap script at the bottom of the page
(`<script src="/bootstrap/js/bootstrap.bundle.min.js"></script>`). Every page here already has it.

**Vertical navbar (sidebar)**. `examples/employees` uses this layout on every page. Copy the whole structure:

```html
<div class="d-flex">
  <nav class="nav nav-pills flex-column bg-dark p-3 vh-100" style="width:220px" data-bs-theme="dark">
    <a class="navbar-brand text-white fs-4 mb-3" href="/home.html">Acme HR</a>
    <a class="nav-link active" href="/home.html">Home</a>
    <a class="nav-link" href="/employees.html">Employees</a>
    <a class="nav-link mt-auto" href="/">Logout</a>
  </nav>
  <div class="flex-grow-1 p-4">
    <!-- page content goes here -->
  </div>
</div>
```

Change the width with `style="width:220px"`.

### 6. Image carousel (slider)

```html
<div id="slider" class="carousel slide mb-4" data-bs-ride="carousel">
  <div class="carousel-inner rounded">
    <div class="carousel-item active">
      <img src="/images/banner1.svg" class="d-block w-100" alt="slide 1">
    </div>
    <div class="carousel-item">
      <img src="/images/banner2.svg" class="d-block w-100" alt="slide 2">
    </div>
  </div>
  <button class="carousel-control-prev" data-bs-target="#slider" data-bs-slide="prev">
    <span class="carousel-control-prev-icon"></span>
  </button>
  <button class="carousel-control-next" data-bs-target="#slider" data-bs-slide="next">
    <span class="carousel-control-next-icon"></span>
  </button>
</div>
```

- **Your own pictures:** put them in `public/images/` (for example `cover1.jpg`) and write
  `src="/images/cover1.jpg"`. `.jpg`, `.png` and `.svg` all work.
- **More slides:** copy a `<div class="carousel-item">` block. Exactly one slide must have `active`.
- **Caption on a slide:** add this inside its `carousel-item`, after the `<img>`:
  ```html
  <div class="carousel-caption">
    <h5>New Arrivals</h5>
    <p>Fresh books every week</p>
  </div>
  ```
- **Speed:** add `data-bs-interval="2000"` (milliseconds) to a `carousel-item`.
- **Two carousels on one page:** give the second a different `id` (for example `slider2`) and change both
  `data-bs-target="#slider2"` buttons to match.

### 7. List page (table of saved records)

From `examples/bookstore/public/books.html`:

```html
<table class="table table-striped table-bordered">
  <thead class="table-dark"><tr><th>Book Name</th><th>Author Name</th><th>Category</th><th>Price</th></tr></thead>
  <tbody id="list"></tbody>
</table>
```
```js
fetch("/api/books")
  .then(res => res.json())
  .then(items => {
    const list = document.getElementById("list");
    items.forEach(item => {
      const row = list.insertRow();
      row.insertCell().textContent = item.name;
      row.insertCell().textContent = item.author;
      row.insertCell().textContent = item.category;
      row.insertCell().textContent = item.price;
    });
  });
```

- **For another model:** change the `<th>` headings, the URL in `fetch(...)`, and one `item.field` line per
  column.
- **Show only some records**, as with the bookstore's Categories links (`books.html?category=Fiction`):
  ```js
  const category = new URLSearchParams(location.search).get("category");
  ...
  items.forEach(item => {
    if (category && item.category !== category) return;   // skip other categories
    ...
  ```
- **A calculated column**, as in `foodorder/public/orders.html`:
  `row.insertCell().textContent = o.price * o.quantity;`
- **`textContent`** shows text exactly as typed, so a record containing HTML can't break the page. Keep it
  that way.

### 8. Cards and badges

**Cards** (`examples/hospital/public/doctors.html`):
```html
<div class="row g-3">
  <div class="col-md-4">
    <div class="card h-100">
      <div class="card-body">
        <h5 class="card-title">Dr. Asha Rao</h5>
        <p class="card-text">Cardiology</p>
      </div>
      <div class="card-footer">Mon-Fri, 10 AM - 2 PM</div>
    </div>
  </div>
  <!-- copy the col-md-4 block for each card -->
</div>
```
`col-md-4` gives 3 cards per row, `col-md-3` gives 4, and `col-md-6` gives 2. Add a picture with
`<img src="/images/x.jpg" class="card-img-top">` above `card-body`.

**Badges** (`examples/foodorder/public/menu.html`, `offers.html`):
```html
<span class="badge bg-success">Veg</span>
<span class="badge bg-danger">Non-Veg</span>
<span class="badge bg-warning text-dark">Popular</span>
<span class="badge bg-secondary">Not Available</span>
<span class="badge rounded-pill bg-primary">3</span>      <!-- round, e.g. a cart count -->
```

### 9. Login and signup

You can reuse these unchanged. Copy `public/login.html`, `public/signup.html`, `models/User.js`, and the
`app.get("/")`, `app.post("/signup")` and `app.post("/login")` blocks from any example's `index.js`.

- **Page after login:** `res.redirect("/home.html")` in `/login`.
- **App name on the login card:** the `<h2>` in `login.html` and `signup.html`.
- **No login at all,** like the pizza example: drop those files and routes, and make `app.get("/")` send
  `home.html`.

### 10. A second form and model in the same app

`examples/foodorder` saves both food items and orders. To add, say, a Feedback form to any app:

1. **`models/Feedback.js`:** copy `Book.js` and change it.
   ```js
   const feedbackSchema = new mongoose.Schema({ name: String, rating: Number, comment: String });
   module.exports = mongoose.model("Feedback", feedbackSchema);
   ```
2. **`index.js`:** add near the top `const Feedback = require("./models/Feedback");`, then a new route with
   a different URL from `/add`.
   ```js
   app.post("/feedback", async (req, res) => {

     const { name, rating, comment } = req.body;

     await new Feedback({
       name,
       rating,
       comment
     }).save();

     res.send("Thank you for your feedback!");
   });
   ```
3. **The page:** `<form action="/feedback" method="post">` with inputs named `name`, `rating` and `comment`.

### 11. Checking input on the server

From `examples/hotel/index.js`. Put the check after reading `req.body` and before `.save()`:

```js
const { guestName, email, phone, roomType, checkIn, checkOut, guests } = req.body;

if (checkOut <= checkIn)
  return res.send("Check-out must be after check-in. <a href='/booking.html'>Go back</a>");
```

The same pattern works for other checks, for example
`if (Number(age) < 18) return res.send("Must be 18 or older");`.

### 12. Gallery, cart and calculator

These live in `template/public/` and work on their own, with no server code. Copy the whole `.html` file into
your `public/` folder, add a navbar link to it, and adjust:

- **`gallery.html`:** one `<img ... onclick="showImage(this.src)">` per picture. Change the `src` values to
  your images.
- **`shop.html`:** for each product card, change the name, price and picture, and the button's
  `onclick="addToCart('Watch', 3499)"` call. The cart is saved in the browser.
- **`calculator.html`:** one button per key, each calling `press('7')`. Add keys by copying a button.

### 13. Worked example: answering a new question

> *"Movie Ticket Booking: navbar with Home, Movies, My Bookings, Contact Us. Carousel of movie posters.
> Form: Customer Name, Movie (dropdown), Show Time, Number of Tickets, Date. Store in MongoDB."*

1. **Copy the closest example:** `cp -r examples/hotel examples/movies` (or copy the folder in your file
   manager). Hotel already has a booking form, a list page and cards.
2. **`index.js`:** change the database to `.../movietickets`. Change `require("./models/Booking")` to
   `Ticket`, along with `new Booking` and `Booking.find()`. Set the field names in `app.post("/add")` to
   `customer, movie, showTime, tickets, date`, rename `/api/bookings` to `/api/tickets`, and delete the
   check-out check.
3. **Models:** rename `models/Booking.js` to `Ticket.js`, with fields
   `customer: String, movie: String, showTime: String, tickets: Number, date: String` and
   `mongoose.model("Ticket", ticketSchema)`.
4. **`public/` pages:**
   - `home.html`: put poster images in `public/images/` and change the carousel `src` values.
   - `rooms.html`: rename to `movies.html` and turn the cards into one card per movie.
   - `booking.html`: change the form fields: a text input, a movie `<select>`, a show-time `<select>` or
     `type="time"`, a `type="number"` with `min="1"` for tickets, and a `type="date"`.
   - `bookings.html`: rename to `mybookings.html`, then change the headings, `fetch("/api/tickets")` and the
     `item.` lines.
5. **Navbar:** change the links to Home, Movies, Book Tickets and My Bookings, and paste the new navbar into
   every page.
6. **Run it:** `node index.js`, sign up, book a ticket, and check `movietickets → tickets` in Compass.

### 14. Common mistakes

| Symptom | Cause |
|---|---|
| A field is missing in Compass | Its name differs between the `<input name>`, `req.body`, `new Model({...})` and the schema |
| A column is blank on the list page | The `item.field` name doesn't match the schema |
| `Cannot POST /add` | The form's `action` doesn't match any `app.post(...)` |
| `Cannot GET /something.html` | The file isn't in `public/`, or the name is misspelled (names are case-sensitive) |
| Page has no styling, dropdown and carousel don't move | Missing the Bootstrap `<link>` in `<head>` or `<script>` before `</body>` |
| Price saved as text | The schema says `String`; use `Number` |
| A new model isn't found | Missing `const X = require("./models/X")` at the top of `index.js` |
| Changes don't show | Stop the server with Ctrl + C and run `node index.js` again after changing `index.js` or `models/`. HTML changes only need a browser refresh. |

## Ready-made pieces

Copy these blocks from the example files:

| Feature                                | Copy from                                                                               |
| -------------------------------------- | --------------------------------------------------------------------------------------- |
| Horizontal navbar                      | top of any page, e.g. `examples/bookstore/public/home.html`                            |
| Navbar with a **dropdown**        | `examples/foodorder/public/home.html` (Menu → Starters, Main Course...)              |
| **Vertical navbar** (sidebar)    | `examples/employees/public/*.html`, `template/public/sidebar.html`                  |
| Image **carousel** / slider       | `<div id="slider" ...>` in any `home.html`                                          |
| **Badges**                       | `examples/foodorder/public/menu.html` (Veg, Non-Veg, Popular), `offers.html`        |
| Cards                                  | `examples/hospital/public/doctors.html`, `examples/hotel/public/rooms.html`         |
| Login / Sign up                        | `public/login.html`, `public/signup.html` + `/login`, `/signup` in `index.js` |
| Form saved to MongoDB                  | `home.html` + `app.post("/add")` + `models/`                                      |
| Table of saved records                 | `books.html` + `app.get("/api/books")`                                              |
| Filter by category (`?category=...`) | `examples/bookstore/public/books.html`, `categories.html`                           |
| A second form and model                | `examples/foodorder`: `/order` route, `models/Order.js`, `orders.html`          |
| Server-side check (dates)              | `examples/hotel/index.js`, `examples/library/index.js`                              |
| Count records per group                | `examples/employees/public/departments.html`                                          |
| **Image gallery** with popup     | `template/public/gallery.html`                                                        |
| **Add to cart**                  | `template/public/shop.html`                                                           |
| **Calculator**                   | `template/public/calculator.html`                                                     |

## Examples

| Folder                         | Database      | Navbar                                                      | Form fields → collection                                                             |
| ------------------------------ | ------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `template`                   | `mywebsite` | Home, Gallery, Shop, Calculator, Sidebar, Contact, Messages | name, email, message → `messages`                                                   |
| `examples/pizza`             | `pizzajob`  | none (exactly the PDF)                                      | name, category, size, cost → `login`                                                |
| `examples/bookstore` (Set A) | `bookstore` | Home, Books, Categories, Contact Us                         | name, author, category, price → `books`                                             |
| `examples/foodorder` (Set F) | `foodorder` | Home, Menu ▾ (categories), My Orders, Offers, Contact Us   | name, category, type, price, availability, popular → `foods`; orders → `orders`  |
| `examples/hospital`          | `hospital`  | Home, Patients, Doctors, Contact Us                         | name, age, gender, blood group, disease, doctor, admission date, phone → `patients` |
| `examples/library`           | `library`   | Home, Issued Books, Book Catalog, Contact Us                | student, roll no, book, issue/return date, status → `issues`                        |
| `examples/college`           | `college`   | Home, Courses, Admission, Students, Contact Us              | name, email, phone, DOB, gender, course, %, address → `students`                    |
| `examples/employees`         | `company`   | sidebar: Home, Employees, Departments, Contact Us           | name, email, department, designation, salary, joining date → `employees`            |
| `examples/events`            | `techfest`  | Home, Events, Register, Participants, Contact Us            | name, email, phone, college, year, event → `registrations`                          |
| `examples/hotel`             | `hotel`     | Home, Rooms, Book a Room, Bookings, Contact Us              | guest, email, phone, room type, check-in/out, guests → `bookings`                   |

Mongoose names the collection after the model: model `Book` → collection `books`. To choose the name
yourself, add it as a third argument like the Pizza example: `mongoose.model("Pizza", pizzaSchema, "login")`.

## Notes

- Login checks the password but doesn't remember who is logged in (no sessions), the same level as
  the class example. Pages can still be opened directly by URL.
- Every list page shows all records from everyone.
- If MongoDB isn't running, `node index.js` still starts, but the first form submit waits 10 seconds and the
  server stops with `buffering timed out`. Start MongoDB and run it again.
- `Error: listen EADDRINUSE :::3000` means another app is still running. Stop it with `Ctrl + C`.
