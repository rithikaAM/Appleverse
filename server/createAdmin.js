const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

mongoose.connect("mongodb://localhost:27017/appleverse", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const adminSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String, // hashed password
  role: { type: String, default: "admin" },
  createdAt: { type: Date, default: Date.now },
});

const Admin = mongoose.model("Admin", adminSchema, "admins");

const createAdmin = async () => {
  try {
    const plainPassword = "appleverse"; // Your desired plain text password
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const adminDoc = new Admin({
      name: "Main Admin",
      email: "appleverse.main@gmail.com",
      password: hashedPassword,
      role: "admin",
    });

    await adminDoc.save();
    console.log("Admin inserted successfully");
  } catch (error) {
    console.error("Error inserting admin:", error);
  } finally {
    mongoose.disconnect();
  }
};

createAdmin();
