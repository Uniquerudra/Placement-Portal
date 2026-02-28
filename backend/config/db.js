// backend/config/db.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Timeout options add kiye hain
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // 10 seconds wait karega connect hone ke liye
    });
    console.log("MongoDB Connected Successfully!");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    // process.exit(1); // Isko comment kar dete hain taaki server crash na ho
  }
};

module.exports = connectDB;
