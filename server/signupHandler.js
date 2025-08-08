// signupHandler.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const sgMail = require("@sendgrid/mail");
require("dotenv").config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Connect to a separate DB for user signups (appleverse_users)
const signupDB = mongoose.createConnection("mongodb://localhost:27017/appleverse_users", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define the schema for pending requests
const pendingSchema = new mongoose.Schema({
  name: String,
  dob: String,
  email: String,
  password: String, // hashed
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
});
const PendingRequest = signupDB.model("PendingRequest", pendingSchema);

// Handle signup request
const handleSignupRequest = async (req, res) => {
  try {
    const { name, dob, email, password } = req.body;
    // Validate fields, e.g., confirm password, check email format, etc.

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert a doc into 'pendingrequests'
    const newRequest = new PendingRequest({
      name,
      dob,
      email,
      password: hashedPassword,
      status: "pending",
    });
    await newRequest.save();

    // Send email to main admin
    const adminEmail = process.env.EMAIL_ADMIN; // e.g. "admin@example.com"
    if (!adminEmail) {
      return res.status(500).json({ error: "Admin email not configured." });
    }

    const msg = {
      to: adminEmail,
      from: process.env.EMAIL_FROM,
      subject: "New Admin Signup Request",
      text: `A new user has requested admin access:
Name: ${name}
DOB: ${dob}
Email: ${email}

Please review and approve in your admin dashboard.`,
    };
    await sgMail.send(msg);

    // Respond to the client
    res.json({
      message: "Signup request sent for approval. You will be notified via email.",
    });
  } catch (error) {
    console.error("Error in handleSignupRequest:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = handleSignupRequest;
