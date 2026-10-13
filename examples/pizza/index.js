const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const Pizza = require("./models/Pizza");

const app = express();

app.use(express.urlencoded({ extended: true }));

mongoose.connect("mongodb://127.0.0.1:27017/pizzajob")
  .then(() => console.log("MongoDB connected"));

app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "index.html"))
);

app.post("/add", async (req, res) => {

  const { name, category, size, cost } = req.body;

  await new Pizza({
    name,
    category,
    size,
    cost
  }).save();

  res.send("Pizza details saved successfully!");
});

app.listen(3000, () =>
  console.log("http://localhost:3000")
);
