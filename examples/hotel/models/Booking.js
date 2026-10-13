const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  guestName: String,
  email: String,
  phone: String,
  roomType: String,
  checkIn: String,
  checkOut: String,
  guests: Number
});

module.exports = mongoose.model("Booking", bookingSchema);
