// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: { type: String, required: false }, // Optional for Google OAuth users
  googleId: { type: String, unique: true, sparse: true }, // For Google OAuth
  picture: String, // Profile picture from Google
  role: {
    type: String,
    enum: ["student", "tpo", "admin"],
    default: "student",
  },
});

module.exports = mongoose.model("User", userSchema);
