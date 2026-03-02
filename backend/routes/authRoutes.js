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
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #4f46e5; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">TPO Placement Portal</h1>
            </div>
            <div style="padding: 30px; color: #1e293b; line-height: 1.6;">
              <h2 style="color: #4f46e5; margin-top: 0;">Welcome to the Portal!</h2>
              <p>Hello <b>${user.name}</b>,</p>
              <p>Your account has been successfully created. You can now access all placement features, apply for drives, and manage your student profile.</p>
              
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #edf2f7;">
                <p style="margin: 0; color: #64748b; font-size: 14px;"><b>Account Details:</b></p>
                <p style="margin: 10px 0 5px 0;"><b>Role:</b> ${user.role.toUpperCase()}</p>
                <p style="margin: 0;"><b>Email:</b> ${user.email}</p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" style="display: inline-block; padding: 14px 28px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Login to Dashboard</a>
              </div>
              
              <p style="font-size: 0.85em; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 20px;">
                If you did not request this account, please ignore this email or contact the TPO administrator.
              </p>
            </div>
            <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="font-size: 12px; color: #94a3b8; margin: 0;">&copy; ${new Date().getFullYear()} TPO Placement Portal. All rights reserved.</p>
            </div>
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


// Forgot Password route (GET - for accidental access)
router.get("/forgot-password", (req, res) => {
  const envUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  res.redirect(`${envUrl}/forgot-password`);
});

// Forgot Password route (POST)
router.post("/forgot-password", async (req, res) => {
  try {
    const { email: rawEmail } = req.body;
    if (!rawEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    const email = rawEmail.toLowerCase().trim();
    console.log(`[AUTH] Forgot password request for: ${email}`);

    // Case-insensitive lookup
    const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, "i") } });

    if (!user) {
      console.log(`[AUTH] No user found for: ${email}`);
      return res.status(404).json({ message: "No account found with this email" });
    }

    // Check if user is a Google-only account
    if (!user.password && user.googleId) {
      console.log(`[AUTH] Google account detected for: ${email}`);
      return res.status(400).json({
        message: "This account uses Google Sign-In. Please log in using the 'Continue with Google' button."
      });
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

    // Determine Frontend URL
    const origin = req.headers.origin; // e.g. http://localhost:3008 or https://portal-iaxw.vercel.app
    const envUrl = process.env.FRONTEND_URL;

    // Fallback logic: prefer origin (browser current site), then envUrl, then default localhost:3000
    let frontendUrl = origin || envUrl || "http://localhost:3000";

    // Strip trailing slash if any
    frontendUrl = frontendUrl.replace(/\/$/, "");

    // Safety check: if frontendUrl somehow contains '/api', it's likely the backend URL, so we fallback
    if (frontendUrl.includes("/api") || frontendUrl.includes("render.com")) {
      console.log(`[AUTH] Warning: origin/FRONTEND_URL seems to be backend (${frontendUrl}), falling back.`);
      frontendUrl = envUrl ? envUrl.replace(/\/$/, "") : "http://localhost:3000";
    }

    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    console.log(`[AUTH] Client Origin: ${origin || 'None'}`);
    console.log(`[AUTH] Using Frontend: ${frontendUrl}`);
    console.log(`[AUTH] Reset Link: ${resetUrl}`);


    console.log(`[AUTH] Sending reset email to: ${user.email} (Reset Link generated)`);

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click the link below to reset your password:\n\n ${resetUrl}`;

    try {
      const result = await sendEmail({
        email: user.email,
        subject: "Action Required: Reset your TPO Portal password",
        message,

        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #4f46e5; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">TPO Placement Portal</h1>
            </div>
            <div style="padding: 30px; color: #1e293b; line-height: 1.6;">
              <h2 style="color: #4f46e5; margin-top: 0;">Password Reset Request</h2>
              <p>Hello,</p>
              <p>We received a request to reset the password for your account. If you made this request, please click the button below to set a new password:</p>
              <div style="text-align: center; margin: 35px 0;">
                <a href="${resetUrl}" style="display: inline-block; padding: 14px 28px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Reset My Password</a>
              </div>
              <p style="font-size: 0.9em; color: #64748b;">This secure link is valid for <b>10 minutes</b> only. If you don't use it within this timeframe, you will need to request another reset.</p>
              <p style="font-size: 0.9em; color: #64748b; margin-top: 20px; border-top: 1px solid #f1f5f9; padding-top: 20px;">
                <b>Security Notice:</b> If you did not request this password reset, no further action is required. Your account is still secure.
              </p>
            </div>
            <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="font-size: 12px; color: #94a3b8; margin: 0;">&copy; ${new Date().getFullYear()} TPO Placement Portal. All rights reserved.</p>
            </div>
          </div>
        `,

      });

      console.log(`[AUTH] Reset email delivered via ${result.service || 'unknown service'}`);
      res.status(200).json({
        message: "Reset link sent to your email!",
        service: result.service, // Tells user if SMTP or SendGrid was used
        sentTo: user.email
      });
    } catch (err) {
      console.error("[AUTH] FORGOT PASSWORD EMAIL ERROR:", err.message);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({
        message: "Failed to send reset email. Contact administrator.",
        error: err.message
      });
    }
  } catch (err) {
    console.error("[AUTH] FORGOT PASSWORD SERVER ERROR:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});


// Reset Password route (GET - for accidental link access)
router.get("/reset-password/:token", (req, res) => {
  const envUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  res.redirect(`${envUrl}/reset-password/${req.params.token}`);
});

// Reset Password route (POST)
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

// Test email route
router.get("/test-email", async (req, res) => {
  try {
    const result = await sendEmail({
      email: process.env.SMTP_USER || "test@example.com",
      subject: "PROJECT LIVE - Test Email Success!",
      message: `If you are reading this, your email system is now working! Service used: ${process.env.SENDGRID_API_KEY ? 'SendGrid (Candidate)' : 'SMTP'}. Recipient: ${process.env.SMTP_USER}`,
      html: `<h1>SUCCESS!</h1><p>Your TPO Portal email connection is now active.</p><p><b>Method:</b> ${process.env.SENDGRID_API_KEY ? 'SendGrid' : 'SMTP'}</p>`
    });
    res.json({
      message: "Test Email Sent Successfully!",
      service: result.service,
      to: process.env.SMTP_USER,
      details: "Check your inbox and spam folder."
    });
  } catch (err) {
    console.error("[AUTH] Test email failed:", err);
    res.status(500).json({
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      hint: "Check your SMTP_USER and SMTP_PASS in environment variables."
    });
  }
});


module.exports = router;
