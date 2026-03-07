// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: { type: String, required: false },
  googleId: { type: String, unique: true, sparse: true },
  picture: String,
  role: {
    type: String,
    enum: ["student", "tpo", "admin"],
    default: "student",
  },
  // Profile Fields
  phone: String,
  branch: String,
  cgpa: Number,
  tenthPercentage: Number,
  twelfthPercentage: Number,
  yearOfPassing: String,
  resumeUrl: String,
  resumePublicId: String,
  skills: [String],
  githubUrl: String,
  linkedinUrl: String,
  portfolioUrl: String,

  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
