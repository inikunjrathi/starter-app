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

## Answering a new question

Copy the example closest to the question, for example `cp -r examples/hospital examples/myanswer`
(or copy the folder in your file manager). Then:

1. **Database name**: in `index.js`, change `mongodb://127.0.0.1:27017/hospital` to your name.
2. **Model**: rename `models/Patient.js` to e.g. `models/Product.js`, and in it change the model name
   and list your fields with `String` or `Number`.
3. **`index.js`**: change `require("./models/Patient")` and `Patient` to your model. In `app.post("/add")`,
   list your field names in both places. In `app.get("/api/patients")`, change the URL and model.
4. **Form** (`home.html`): one input per field. The input's `name` must match the field name in the model.
   Use `type="number"`, `type="date"`, `type="email"`, `<select>` or `<textarea>` as needed.
5. **List page**: change the `<th>` headings, the `fetch("/api/...")` URL and the `item.field` lines.
6. **Navbar**: it's the same block at the top of every `.html` file. Change the links in every file.
   Add or delete `.html` files for the navbar items the question lists.
7. Run `node index.js` and test.

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
