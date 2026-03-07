const Drive = require("../models/Drive");
const User = require("../models/User");
const Notification = require("../models/Notification");
const sendEmail = require("../utils/sendEmail");

// Create new drive
exports.addDrive = async (req, res) => {
  try {
    // Attach logged-in user as creator
    const driveData = {
      ...req.body,
      createdBy: req.user.id, // req.user comes from auth middleware
    };

    const drive = await Drive.create(driveData);

    // ✅ Create In-App Notification
    try {
      await Notification.create({
        title: "New Placement Drive",
        message: `${drive.company} has posted a new opportunity for the role of ${drive.role}.`,
        type: "new_drive",
        link: "/student"
      });
    } catch (notifErr) {
      console.error("Failed to create in-app notification:", notifErr);
    }

    // ✅ Broadcast Notification to all students
    try {
      const students = await User.find({ role: "student" }).select("email name");

      // We'll send these in the background to not block the response
      const broadcastEmails = students.map(student => {
        return sendEmail({
          email: student.email,
          subject: `New Placement Drive: ${drive.company}`,
          message: `Hello ${student.name},\n\nA new placement drive has been posted for ${drive.company}.\nRole: ${drive.role}\nPackage: ${drive.package} LPA\nDeadline: ${drive.deadline}\n\nPlease log in to the TPO Portal to apply.\n\nBest regards,\nTPO Team`,
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
              <div style="background-color: #4f46e5; padding: 25px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">New Placement Opportunity!</h1>
              </div>
              <div style="padding: 30px; color: #1e293b; line-height: 1.6;">
                <h2 style="color: #4f46e5; margin-top: 0;">${drive.company} is hiring!</h2>
                <p>Hello <b>${student.name}</b>,</p>
                <p>A new placement drive has just been posted on the portal. Here are the key details:</p>
                
                <div style="background-color: #f8fafc; padding: 20px; border-radius: 10px; margin: 25px 0; border: 1px solid #edf2f7; display: grid; gap: 10px;">
                  <p style="margin: 0;"><b>🏢 Company:</b> ${drive.company}</p>
                  <p style="margin: 5px 0 0 0;"><b>💼 Role:</b> ${drive.role}</p>
                  <p style="margin: 5px 0 0 0;"><b>💰 Package:</b> ${drive.package} LPA</p>
                  <p style="margin: 5px 0 0 0;"><b>⏳ Deadline:</b> ${new Date(drive.deadline).toLocaleDateString()}</p>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/student" style="display: inline-block; padding: 14px 30px; background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);">Apply Now</a>
                </div>
                
                <p style="font-size: 0.85em; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 20px;">
                  Please check the eligibility criteria on the dashboard before applying. Best of luck with your application!
                </p>
              </div>
              <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="font-size: 12px; color: #94a3b8; margin: 0;">&copy; ${new Date().getFullYear()} TPO Placement Portal. All rights reserved.</p>
              </div>
            </div>
          `
        }).catch(err => console.error(`Failed to send broadcast to ${student.email}:`, err.message));
      });

      // Run broadcast in background
      Promise.all(broadcastEmails);

    } catch (broadcastErr) {
      console.error("Broadcast notification error:", broadcastErr);
    }

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
