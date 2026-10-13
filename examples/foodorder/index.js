const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const path = require("path");
const User = require("./models/User");
const Food = require("./models/Food");
const Order = require("./models/Order");

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
// Bootstrap from node_modules, so the pages work without internet
app.use("/bootstrap", express.static(path.join(require.resolve("bootstrap"), "../..")));

mongoose.connect("mongodb://127.0.0.1:27017/foodorder")
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

  const { name, category, type, price, availability, popular } = req.body;

  await new Food({
    name,
    category,
    type,
    price,
    availability,
    popular
  }).save();

  res.send("Food item saved successfully! <a href='/home.html'>Add another</a> | <a href='/menu.html'>View all</a>");
});

app.get("/api/foods", async (req, res) => {
  res.json(await Food.find());
});

app.post("/order", async (req, res) => {

  const { food, price, quantity, customer } = req.body;

  await new Order({
    food,
    price,
    quantity,
    customer
  }).save();

  res.send("Order placed successfully! <a href='/menu.html'>Order more</a> | <a href='/orders.html'>My Orders</a>");
});

app.get("/api/orders", async (req, res) => {
  res.json(await Order.find());
});

app.listen(3000, () =>
  console.log("http://localhost:3000")
);
