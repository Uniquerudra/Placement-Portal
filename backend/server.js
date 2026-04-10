const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
console.log("ENVIRONMENT STATUS: Loaded config from", path.join(__dirname, ".env"));
console.log("AVAILABLE SMTP USER:", process.env.SMTP_USER ? "YES" : "NO");

const connectDB = require("./config/db");
const Notification = require("./models/Notification");
const { askGemini } = require("./utils/resumeAnalyzer");
const authRoutes = require("./routes/authRoutes");
const driveRoutes = require("./routes/driveRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const studentRoutes = require("./routes/studentRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://portal-iaxw.vercel.app',
  'http://localhost:3000',
  'http://localhost:3008',
  'http://localhost:3009',
  'http://localhost:3010'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if origin is allowed or if it's localhost (any port)
    const isLocalhost = /^http:\/\/localhost(:\d+)?$/.test(origin);
    if (allowedOrigins.includes(origin) || isLocalhost) {
      return callback(null, true);
    }

    // For development - allow all
    console.log('CORS - Origin not in allowed list:', origin);
    callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  credentials: true,
}));

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/drives", driveRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/public/notices", async (req, res) => {
  try {
    const notices = await Notification.find({
      $or: [{ recipient: { $exists: false } }, { recipient: null }],
      type: "general"
    }).sort({ createdAt: -1 }).limit(4);
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

app.post("/api/public/chat", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ message: "Question is required" });
    const result = await askGemini({ question, resumeText: "General Portal User", jobDescription: "Career Guidance" });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to get AI response" });
  }
});

app.get("/", (req, res) => res.send("API is running..."));

// Global Error Handler (so you get JSON instead of an HTML error page)
app.use((err, req, res, next) => {
  console.error("Global Error:", err);
  res.status(500).json({ message: err.message || "An unexpected error occurred on the server" });
});

// Start server
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
