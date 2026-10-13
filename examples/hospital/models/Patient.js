const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  name: String,
  age: Number,
  gender: String,
  bloodGroup: String,
  disease: String,
  doctor: String,
  admissionDate: String,
  phone: String
});

module.exports = mongoose.model("Patient", patientSchema);
