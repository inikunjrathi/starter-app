const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  college: String,
  year: String,
  event: String
});

module.exports = mongoose.model("Registration", registrationSchema);
