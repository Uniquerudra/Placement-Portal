const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const router = express.Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const { addDrive, getDrives } = require("../controllers/driveController");
const Application = require("../models/Application");
const Drive = require("../models/Drive");
const {
  analyzeResumeText,
  extractResumeTextFromBuffer,
} = require("../utils/resumeAnalyzer");

router.post("/", auth, role(["admin", "tpo"]), addDrive);
router.get("/", auth, getDrives);

const uploadsDir = path.join(__dirname, "..", "uploads", "resumes");
fs.mkdirSync(uploadsDir, { recursive: true });

const analyzeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = (path.extname(file.originalname || "") || "").toLowerCase();
    if (ext === ".pdf" || ext === ".docx") return cb(null, true);
    cb(new Error("Only PDF or DOCX files are allowed"));
  },
});

router.post(
  "/resume/analyze",
  auth,
  role(["student"]),
  analyzeUpload.single("resume"),
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
            "Could not extract enough text from this file. Try a text-based PDF or DOCX.",
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
      res.status(err.statusCode === 400 ? 400 : 500).json({ message: msg });
    }
  }
);

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

router.post(
  "/apply/:driveId",
  auth,
  role(["student"]),
  upload.single("resume"),
  async (req, res) => {
    try {
      const { driveId } = req.params;
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

      res.status(201).json(application);
    } catch (err) {
      console.error("Error creating application:", err);
      res.status(500).json({ message: "Failed to submit application" });
    }
  }
);

module.exports = router;
