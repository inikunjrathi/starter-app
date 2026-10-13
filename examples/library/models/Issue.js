const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema({
  studentName: String,
  rollNo: String,
  bookTitle: String,
  issueDate: String,
  returnDate: String,
  status: String
});

module.exports = mongoose.model("Issue", issueSchema);
