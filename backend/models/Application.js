// models/Application.js
const mongoose = require("mongoose");

const appSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    drive: { type: mongoose.Schema.Types.ObjectId, ref: "Drive", required: true },
    status: {
      type: String,
      enum: ["applied", "shortlisted", "selected", "rejected"],
      default: "applied",
    },
    fullName: String,
    email: String,
    phone: String,
    branch: String,
    cgpa: String,
    yearOfPassing: String,
    skills: String,
    linkedinUrl: String,
    githubUrl: String,
    portfolioUrl: String,
    additionalInfo: String,
    resumeUrl: String,
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", appSchema);
