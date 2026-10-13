const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const path = require("path");
const User = require("./models/User");
const Employee = require("./models/Employee");

const app = express();

app.use(express.urlencoded({ extended: false }));      // read form data
app.use(express.static(path.join(__dirname, "public"))); // serve the html pages
// Bootstrap from node_modules, so the site works without internet
app.use("/bootstrap", express.static(path.join(require.resolve("bootstrap"), "../..")));

mongoose.connect("mongodb://127.0.0.1:27017/company")
  .then(() => console.log("MongoDB connected"));

// first page = login
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "login.html"))
);

app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (await User.findOne({ email }))
    return res.send("Email already registered. <a href='/signup.html'>Try again</a>");

  const hashed = await bcrypt.hash(password, 10);   // never store plain passwords
  await new User({ name, email, password: hashed }).save();

  res.send("Sign up successful! <a href='/'>Login now</a>");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && await bcrypt.compare(password, user.password))
    res.redirect("/home.html");
  else
    res.send("Wrong email or password. <a href='/'>Try again</a>");
});

app.post("/add", async (req, res) => {
  const { name, email, department, designation, salary, joiningDate } = req.body;

  await new Employee({
    name,
    email,
    department,
    designation,
    salary,
    joiningDate
  }).save();

  res.send("Employee saved successfully! <a href='/home.html'>Add another</a> | <a href='/employees.html'>View all</a>");
});

// all records as JSON, used by employees.html
app.get("/api/employees", async (req, res) => {
  res.json(await Employee.find());
});

app.listen(3000, () =>
  console.log("http://localhost:3000")
);
