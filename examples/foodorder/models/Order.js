const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  food: String,
  price: Number,
  quantity: Number,
  customer: String
});

module.exports = mongoose.model("Order", orderSchema);
