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
const {
  analyzeResumeText,
  extractResumeTextFromBuffer,
} = require("../utils/resumeAnalyzer");

const router = express.Router();

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

      const analysis = analyzeResumeText({ resumeText: text, jobDescription });

      res.json({
        ...analysis,
        file: {
          name: req.file.originalname,
          size: req.file.size,
          pages: meta?.pages,
        },
      });
    } catch (err) {
      const msg = err?.message || "Failed to analyze resume";
      res.status(400).json({ message: msg });
    }
  }
);

router.post(
  "/apply/:driveId",
  auth,
  role(["student"]),
  (req, res, next) => {
    upload.single("resume")(req, res, (err) => {
      if (err) {
        console.error("Multer/Cloudinary Error during student apply:", err);
        return res.status(err.http_code || 400).json({
          message: "Resume upload failed. Please try again or check file size/type.",
          error: err.message
        });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      const {
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
        additionalInfo,
      } = req.body;
      const { driveId } = req.params;
      const drive = await Drive.findById(driveId);
      if (!drive) {
        return res.status(404).json({ message: "Drive not found" });
      }

      const existing = await Application.findOne({
        student: req.user.id,
        drive: driveId,
      });
      if (existing) {
        return res.status(400).json({ message: "Already applied to this drive" });
      }

      let resumeUrl = "";
      if (req.file) {
        resumeUrl = req.file.path;
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
        additionalInfo,
        resumeUrl,
      });

      // Send Application Confirmation Email
      try {
        await sendEmail({
          email: application.email,
          subject: `Application Received: ${drive.companyName}`,
          message: `Hello ${application.fullName},\n\nWe have received your application for the ${drive.role} position at ${drive.companyName}.\n\nApplication Details:\n- Drive: ${drive.companyName}\n- Role: ${drive.role}\n- Status: Applied\n\nYou can track your application status on the portal.\n\nBest regards,\nTPO Team`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4f46e5;">Application Confirmed</h2>
              <p>Hello <strong>${application.fullName}</strong>,</p>
              <p>Your application for <strong>${drive.companyName}</strong> has been successfully received.</p>
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Company:</strong> ${drive.companyName}</p>
                <p style="margin: 5px 0 0 0;"><strong>Role:</strong> ${drive.role}</p>
                <p style="margin: 5px 0 0 0;"><strong>Status:</strong> Applied</p>
              </div>
              <p>Our TPO team will review your application and update you on the next steps.</p>
              <a href="${process.env.FRONTEND_URL}/student" style="display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">View Dashboard</a>
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

