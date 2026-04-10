const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const sendEmail = require("../utils/sendEmail");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const auth = require("../middleware/auth");
const role = require("../middleware/role");
const Application = require("../models/Application");
const Drive = require("../models/Drive");
const User = require("../models/User");
const Notification = require("../models/Notification");
const {
  analyzeResumeText,
  extractResumeTextFromBuffer,
  analyzeWithGemini,
  askGemini,
} = require("../utils/resumeAnalyzer");

const router = express.Router();

router.post("/resume/ask", auth, role(["student"]), async (req, res) => {
  try {
    const { question, resumeText, jobDescription } = req.body;
    if (!question) return res.status(400).json({ message: "Question is required" });

    const result = await askGemini({ question, resumeText, jobDescription });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to get AI response" });
  }
});

// Using Cloudinary for storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "tpo_resumes",
    resource_type: "auto",
    public_id: (req, file) => `${Date.now()}-${req.user.id}`,
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const analyzeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = (path.extname(file.originalname || "") || "").toLowerCase();
    if (ext === ".pdf" || ext === ".docx") return cb(null, true);
    cb(new Error("Only PDF or DOCX files are allowed"));
  },
});

router.get("/profile", auth, role(["student"]), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

router.put("/profile", auth, role(["student"]), async (req, res) => {
  try {
    const {
      phone,
      branch,
      cgpa,
      tenthPercentage,
      twelfthPercentage,
      yearOfPassing,
      skills,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.phone = phone || user.phone;
    user.branch = branch || user.branch;
    user.cgpa = cgpa || user.cgpa;
    user.tenthPercentage = tenthPercentage || user.tenthPercentage;
    user.twelfthPercentage = twelfthPercentage || user.twelfthPercentage;
    user.yearOfPassing = yearOfPassing || user.yearOfPassing;
    user.skills = skills || user.skills;
    user.githubUrl = githubUrl || user.githubUrl;
    user.linkedinUrl = linkedinUrl || user.linkedinUrl;
    user.portfolioUrl = portfolioUrl || user.portfolioUrl;

    await user.save();
    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/profile/resume", auth, role(["student"]), upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(req.user.id);
    user.resumeUrl = req.file.path;
    user.resumePublicId = req.file.filename;
    await user.save();

    res.json({ message: "Resume updated successfully", resumeUrl: user.resumeUrl });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/ping", (_req, res) => {
  res.json({ ok: true, route: "studentRoutes" });
});

router.post(
  "/resume/analyze",
  auth,
  role(["student"]),
  (req, res, next) => {
    analyzeUpload.single("resume")(req, res, (err) => {
      if (err) {
        console.error("Multer Analyze Error:", err);
        return res.status(400).json({ message: "File upload failed: " + err.message });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file?.buffer) {
        return res.status(400).json({ message: "Resume file is required" });
      }

      const jobDescription = req.body?.jobDescription || "";
      const { text, meta } = await extractResumeTextFromBuffer(
        req.file.buffer,
        req.file.originalname
      );

      if (!text || text.length < 30) {
        return res.status(400).json({
          message:
            "Could not extract enough text from this file. Try exporting as a text-based PDF or a DOCX.",
        });
      }

      const basicAnalysis = analyzeResumeText({ resumeText: text, jobDescription });
      const { geminiAnalysis, error: geminiError } = await analyzeWithGemini({
        resumeText: text,
        jobDescription,
      });

      res.json({
        ...basicAnalysis,
        geminiAnalysis,
        geminiError,
        resumeText: text,
        file: {
          name: req.file.originalname,
          size: req.file.size,
          pages: meta?.pages,
        },
      });
    } catch (err) {
      console.error("Resume Analysis Error (Student Route):", err);
      const msg = err?.message || "Failed to analyze resume";
      res.status(err.statusCode === 400 ? 400 : 500).json({ message: msg });
    }
  }
);

router.get("/notifications", auth, role(["student"]), async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { recipient: req.user.id },
        { recipient: { $exists: false } },
        { recipient: null }
      ]
    }).sort({ createdAt: -1 }).limit(10);

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/ping", (_req, res) => {
  res.json({ ok: true, route: "studentRoutes" });
});

router.post(
  "/apply/:driveId",
  auth,
  role(["student"]),
  upload.single("resume"), // Resume is optional if profile has it
  async (req, res) => {
    try {
      const { driveId } = req.params;
      const drive = await Drive.findById(driveId);
      if (!drive) {
        return res.status(404).json({ message: "Drive not found" });
      }

      // Get Student Profile
      const student = await User.findById(req.user.id);
      if (!student) return res.status(404).json({ message: "User not found" });

      // Digital Verification of Eligibility
      if (drive.minCGPA && student.cgpa < drive.minCGPA) {
        return res.status(400).json({
          message: `Ineligible: Your CGPA (${student.cgpa}) is below the required minimum (${drive.minCGPA})`
        });
      }

      if (drive.allowedBranches && drive.allowedBranches.length > 0) {
        if (!student.branch || !drive.allowedBranches.includes(student.branch)) {
          return res.status(400).json({
            message: `Ineligible: Your branch (${student.branch || 'Not Specified'}) is not allowed for this drive.`
          });
        }
      }

      const existing = await Application.findOne({
        student: req.user.id,
        drive: driveId,
      });
      if (existing) {
        return res.status(400).json({ message: "Already applied to this drive" });
      }

      // Auto-fill from Profile if not provided in body
      const fullName = req.body.fullName || student.name;
      const email = req.body.email || student.email;
      const phone = req.body.phone || student.phone;
      const branch = req.body.branch || student.branch;
      const cgpa = req.body.cgpa || student.cgpa;
      const yearOfPassing = req.body.yearOfPassing || student.yearOfPassing;
      const skills = req.body.skills || (student.skills ? student.skills.join(", ") : "");
      const linkedinUrl = req.body.linkedinUrl || student.linkedinUrl;
      const githubUrl = req.body.githubUrl || student.githubUrl;
      const portfolioUrl = req.body.portfolioUrl || student.portfolioUrl;

      let resumeUrl = student.resumeUrl;
      if (req.file) {
        resumeUrl = req.file.path;
      }

      if (!resumeUrl) {
        return res.status(400).json({ message: "No resume found. Please upload one in your profile or here." });
      }

      const application = await Application.create({
        student: req.user.id,
        drive: driveId,
        fullName,
        email,
        phone,
        branch,
        cgpa,
        yearOfPassing,
        skills,
        linkedinUrl,
        githubUrl,
        portfolioUrl,
        additionalInfo: req.body.additionalInfo || "",
        resumeUrl,
      });

      // Send Application Confirmation Email
      try {
        await sendEmail({
          email: application.email,
          subject: `Application Received: ${drive.company}`,
          message: `Hello ${application.fullName},\n\nWe have received your application for the ${drive.role} position at ${drive.company}.\n\nApplication Details:\n- Drive: ${drive.company}\n- Role: ${drive.role}\n- Status: Applied\n\nYou can track your application status on the portal.\n\nBest regards,\nTPO Team`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4f46e5;">Application Confirmed</h2>
              <p>Hello <strong>${application.fullName}</strong>,</p>
              <p>Your application for <strong>${drive.company}</strong> has been successfully received.</p>
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Company:</strong> ${drive.company}</p>
                <p style="margin: 5px 0 0 0;"><strong>Role:</strong> ${drive.role}</p>
                <p style="margin: 5px 0 0 0;"><strong>Status:</strong> Applied</p>
              </div>
              <p>Our TPO team will review your application and update you on the next steps.</p>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/student" style="display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">View Dashboard</a>
              <p style="margin-top: 20px; font-size: 0.8em; color: #6b7280;">This is an automated confirmation email.</p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("Application confirmation email failed:", emailErr.message);
      }

      res.status(201).json(application);
    } catch (err) {
      console.error("Error creating application:", err);
      res.status(500).json({ message: "Failed to submit application: " + err.message });
    }
  }
);

module.exports = router;

