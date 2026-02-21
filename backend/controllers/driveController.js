// controllers/driveController.js
const Drive = require("../models/Drive");

// Create new drive
exports.addDrive = async (req, res) => {
  try {
    // Attach logged-in user as creator
    const driveData = {
      ...req.body,
      createdBy: req.user.id, // req.user comes from auth middleware
    };

    const drive = await Drive.create(driveData);
    res.status(201).json(drive);
  } catch (err) {
    console.error("Error creating drive:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// Get all drives (optional)
exports.getDrives = async (req, res) => {
  try {
    const drives = await Drive.find().sort({ createdAt: -1 });
    res.status(200).json(drives);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
