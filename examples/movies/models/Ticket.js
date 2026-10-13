const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  customer: String,
  movie: String,
  showTime: String,
  date: String,
  tickets: Number
});

module.exports = mongoose.model("Ticket", ticketSchema);
