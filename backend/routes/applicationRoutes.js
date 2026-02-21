// routes/applicationRoutes.js
const express = require("express");

const router = express.Router();
const Application = require("../models/Application");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

// Dashboard stats for Admin
router.get("/dashboard", auth, role(["admin", "tpo"]), async (req, res) => {
  try {
    const totalApplications = await Application.countDocuments();
    const totalSelected = await Application.countDocuments({ status: "selected" });
    const applications = await Application.find().populate("drive");

    let highestPackage = 0;
    applications.forEach((app) => {
      const pkg = parseFloat(app.drive?.package || 0);
      if (pkg > highestPackage) highestPackage = pkg;
    });

    res.json({ totalApplications, totalSelected, highestPackage });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Stats (for Admin & TPO)
router.get("/stats", auth, role(["admin", "tpo"]), async (req, res) => {
  try {
    const [totalApplications, statusGroups, applicationsWithDrive] =
      await Promise.all([
        Application.countDocuments(),
        Application.aggregate([
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
        Application.find().populate("drive"),
      ]);

    const byStatus = statusGroups.reduce((acc, row) => {
      acc[row._id] = row.count;
      return acc;
    }, {});

    let highestPackage = 0;
    applicationsWithDrive.forEach((app) => {
      const pkg = parseFloat(app.drive?.package || 0);
      if (pkg > highestPackage) highestPackage = pkg;
    });

    res.json({
      totalApplications,
      byStatus,
      totalSelected: byStatus.selected || 0,
      totalShortlisted: byStatus.shortlisted || 0,
      totalRejected: byStatus.rejected || 0,
      totalApplied: byStatus.applied || 0,
      highestPackage,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// List all applications (for Admin & TPO)
router.get("/", auth, role(["admin", "tpo"]), async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("student")
      .populate("drive")
      .sort({ createdAt: -1 });

    const shaped = applications.map((app) => ({
      _id: app._id,
      studentName: app.fullName || app.student?.name || "Unknown",
      email: app.email || app.student?.email || "",
      driveName: app.drive?.company || "Unknown",
      role: app.drive?.role || "",
      status: app.status,
      cgpa: app.cgpa || "",
      yearOfPassing: app.yearOfPassing || "",
      skills: app.skills || "",
      resumeUrl: app.resumeUrl || "",
      appliedAt: app.appliedAt,
    }));

    res.json(shaped);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// List logged-in student's applications (for Student)
router.get("/my", auth, role(["student"]), async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user.id })
      .populate("drive")
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update application status (for Admin & TPO)
router.put("/:id", auth, role(["admin", "tpo"]), async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["applied", "shortlisted", "selected", "rejected"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const app = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate("student")
      .populate("drive");

    if (!app) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json(app);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
