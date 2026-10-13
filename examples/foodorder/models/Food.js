const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
  name: String,
  category: String,
  type: String,
  price: Number,
  availability: String,
  popular: String
});

module.exports = mongoose.model("Food", foodSchema);
