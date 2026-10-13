const mongoose = require("mongoose");

const pizzaSchema = new mongoose.Schema({
  name: String,
  category: String,
  size: String,
  cost: Number
});

// 3rd argument = collection name shown in Compass
module.exports = mongoose.model("Pizza", pizzaSchema, "login");
