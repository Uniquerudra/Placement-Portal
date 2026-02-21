// seedUsers.js
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  console.error("MONGO_URI not set in environment");
  process.exit(1);
}

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("MongoDB Connected");
    seedUsers();
  })
  .catch(console.log);

async function addUser(name, email, password, role) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashedPassword, role });
  await user.save();
  console.log(`${name} added`);
}

async function seedUsers() {
  await User.deleteMany({});
  await addUser("Admin User", "admin@tpo.com", "123", "admin");
  await addUser("TPO Officer", "tpo@tpo.com", "1234", "tpo");
  await addUser("Student One", "student1@tpo.com", "12345", "student");
  await addUser("Student Two", "student2@tpo.com", "123456", "student");
  console.log("All users seeded!");
  process.exit();
}
