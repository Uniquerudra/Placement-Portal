const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false // If null, it's a global notification for all students
        },
        title: { type: String, required: true },
        message: { type: String, required: true },
        type: {
            type: String,
            enum: ["new_drive", "deadline", "application_update", "general"],
            default: "general"
        },
        link: String,
        readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // For global notifications
        isRead: { type: Boolean, default: false } // For personal notifications
    },
    { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
