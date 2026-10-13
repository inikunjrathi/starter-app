const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const path = require("path");
const User = require("./models/User");
const Student = require("./models/Student");

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
// Bootstrap from node_modules, so the pages work without internet
app.use("/bootstrap", express.static(path.join(require.resolve("bootstrap"), "../..")));

mongoose.connect("mongodb://127.0.0.1:27017/college")
  .then(() => console.log("MongoDB connected"));

app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "login.html"))
);

app.post("/signup", async (req, res) => {

  const { name, email, password } = req.body;

  if (await User.findOne({ email }))
    return res.send("Email already registered. <a href='/signup.html'>Try again</a>");

  await new User({
    name,
    email,
    password: await bcrypt.hash(password, 10)
  }).save();

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

  const { name, email, phone, dob, gender, course, percentage, address } = req.body;

  await new Student({
    name,
    email,
    phone,
    dob,
    gender,
    course,
    percentage,
    address
  }).save();

  res.send("Application submitted successfully! <a href='/admission.html'>Add another</a> | <a href='/students.html'>View all</a>");
});

app.get("/api/students", async (req, res) => {
  res.json(await Student.find());
});

// "127.0.0.1" = only this computer can open the site (other devices on the network can't)
app.listen(3000, "127.0.0.1", () =>
  console.log("http://localhost:3000")
);
