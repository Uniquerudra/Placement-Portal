// models/Drive.js
const mongoose = require("mongoose");

const driveSchema = new mongoose.Schema(
  {
    company: { type: String, required: true },
    role: { type: String, required: true },
    package: { type: String, required: true },
    location: String,
    deadline: String,
    eligibilityCriteria: String,
    jobDescription: String,
    rounds: String,
    contactEmail: String,
    additionalNotes: String,
    minCGPA: { type: Number, default: 0 },
    allowedBranches: { type: [String], default: [] },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Drive", driveSchema);
