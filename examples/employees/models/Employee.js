const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  name: String,
  email: String,
  department: String,
  designation: String,
  salary: Number,
  joiningDate: String
});

module.exports = mongoose.model("Employee", employeeSchema);
