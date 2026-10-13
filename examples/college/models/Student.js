const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  dob: String,
  gender: String,
  course: String,
  percentage: Number,
  address: String
});

module.exports = mongoose.model("Student", studentSchema);
