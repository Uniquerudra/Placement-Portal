// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// Register route (Student / TPO)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const allowedRoles = ["student", "tpo"];
    const finalRole = allowedRoles.includes(role) ? role : "student";

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: finalRole,
    });

    // Send Welcome Email
    try {
      await sendEmail({
        email: user.email,
        subject: "Welcome to TPO Portal!",
        message: `Hello ${user.name},\n\nYour account has been successfully created on the TPO Portal. You can now log in and apply for placement drives.\n\nBest regards,\nTPO Team`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4f46e5;">Welcome to TPO Portal!</h2>
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>Your account has been successfully created on the TPO Portal. You can now log in and explore the latest placement opportunities.</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Role:</strong> ${user.role.toUpperCase()}</p>
              <p style="margin: 5px 0 0 0;"><strong>Email:</strong> ${user.email}</p>
            </div>
            <a href="${process.env.FRONTEND_URL}/login" style="display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">Login to Portal</a>
            <p style="margin-top: 20px; font-size: 0.8em; color: #6b7280;">If you did not create this account, please contact the TPO administrator.</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("Welcome email failed:", emailErr.message);
      // Don't fail the registration if email fails
    }

    res.status(201).json({
      message: "Account created successfully",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "All fields required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // If user registered with Google Auth, they won't have a password
    if (!user.password) {
      return res.status(400).json({ message: "This account uses Google Sign-In. Please click 'Continue with Google'." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      role: user.role,
      user: {
        name: user.name,
        picture: user.picture || ""
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Google OAuth login route
router.post("/google", async (req, res) => {
  try {
    const { googleId, email, name, picture } = req.body;

    if (!googleId || !email || !name) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if user exists with this email
    let user = await User.findOne({ email });

    if (user) {
      // User exists - update Google ID if not set
      if (!user.googleId) {
        user.googleId = googleId;
        if (picture) user.picture = picture;
        await user.save();
      }
    } else {
      // Create new user with Google OAuth
      // Default role is student for Google OAuth users
      user = await User.create({
        name,
        email,
        googleId,
        picture: picture || "",
        role: "student", // Google OAuth users default to student role
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      role: user.role,
      user: {
        name: user.name,
        picture: user.picture || ""
      }
    });
  } catch (err) {
    console.error("Google OAuth error:", err);
    if (err.code === 11000) {
      // Duplicate key error
      return res.status(400).json({ message: "Email or Google ID already registered" });
    }
    res.status(500).json({ message: "Server Error" });
  }
});


// Forgot Password route
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "No user found with this email" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Set reset token and expiry on user
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins

    await user.save();

    // Create reset URL - Permanent fix for Production/Local sync
    const origin = req.headers.origin;
    const envUrl = process.env.FRONTEND_URL;

    // Choose the best URL: Origin from browser, then .env, then local fallback
    const frontendUrl = origin || envUrl || "http://localhost:3008";
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    console.log("DEBUG: Request Origin:", origin);
    console.log("DEBUG: Env FRONTEND_URL:", envUrl);
    console.log("DEBUG: Final Reset URL:", resetUrl);

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click the link below to reset your password:\n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset Token",
        message,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Request</h2>
            <p>You requested a password reset for your TPO Portal account.</p>
            <p>Please click the button below to reset your password. This link is valid for 10 minutes.</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">Reset Password</a>
            <p style="margin-top: 20px;">If you did not request this, please ignore this email.</p>
          </div>
        `,
      });

      res.status(200).json({ message: "Email sent" });
    } catch (err) {
      console.error("FORGOT PASSWORD EMAIL ERROR:", err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({
        message: "Email could not be sent",
        error: err.message
      });
    }
  } catch (err) {
    console.error("FORGOT PASSWORD SERVER ERROR:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// Reset Password route
router.post("/reset-password/:token", async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Set new password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
