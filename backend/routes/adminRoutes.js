const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const Notification = require("../models/Notification");

router.post("/notice", auth, role(["admin"]), async (req, res) => {
  try {
    const { title, message } = req.body;
    if (!title || !message) return res.status(400).json({ message: "Title and message are required" });

    const notice = await Notification.create({
      title,
      message,
      type: "general", // explicit general type for notices
    });
    res.status(201).json(notice);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
