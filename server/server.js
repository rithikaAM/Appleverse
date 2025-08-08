require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");
const multer = require("multer");

// Import signup handler and admin logic as before
const handleSignupRequest = require("./signupHandler");
const {
  Admin,
  listPendingRequests,
  listActiveAdmins,
  listRejectedRequests,
  approveRequest,
  rejectRequest,
  revokeAccess,
  reinstateRequest,
} = require("./adminHandler");

const app = express();
const PORT = process.env.PORT || 5000;
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};
app.use(express.json());
app.use(cors(corsOptions));

// Log environment variables (for debugging)
console.log("🔍 ENV Loaded:");
console.log("SENDGRID_API_KEY:", process.env.SENDGRID_API_KEY ? "✅ Yes" : "❌ No");
console.log("EMAIL_ADMIN:", process.env.EMAIL_ADMIN ? "✅ Yes" : "❌ No");
console.log("EMAIL_FROM:", process.env.EMAIL_FROM ? "✅ Yes" : "❌ No");

// ---------------------------------------
// Connect to MongoDB (appleverse)
// ---------------------------------------
mongoose
  .connect("mongodb://localhost:27017/appleverse", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB (appleverse)"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ---------------------------------------
// Define Apple schema/model
// ---------------------------------------
const appleSchema = new mongoose.Schema(
  {
    _id: String,
    accession: String,
    cultivar_name: String,
    images: [String],
  },
  { strict: false }
);
const Apple = mongoose.model("Apple", appleSchema, "apples");

// ---------------------------------------
// Define ContactData schema/model
// We'll store exactly one doc with _id="contactPage"
// so we can easily fetch/update the Contact page data
// ---------------------------------------
const contactSchema = new mongoose.Schema(
  {
    _id: { type: String, default: "contactPage" },
    hero: {
      title: String,
      subtitle: String,
    },
    infoBoxes: {
      about: String,
      contact: {
        phone: String,
        email: String,
        hours: String,
      },
      address: String,
    },
    footer: {
      left: {
        title: String,
        description: String,
      },
      center: {
        explore: [String],
      },
      right: {
        contact: {
          phone: String,
          email: String,
          address: String,
        },
      },
    },
  },
  { strict: false }
);
const ContactData = mongoose.model("ContactData", contactSchema, "contactData");

// ---------------------------------------
// Multer configuration for file uploads
// ---------------------------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "images"));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    cb(null, baseName + "-" + Date.now() + ext);
  },
});
const upload = multer({ storage: storage });

// ---------------------------------------
// Create or fetch contact data
// ---------------------------------------

// GET /contact-data: Return the current contact info
// If none found, create a default doc
app.get("/contact-data", async (req, res) => {
  try {
    let contactDoc = await ContactData.findOne({ _id: "contactPage" });
    if (!contactDoc) {
      // Create a default doc if it doesn't exist
      contactDoc = await ContactData.create({
        _id: "contactPage",
        hero: {
          title: "Contact",
          subtitle: "Straight from the Orchard - Your Guide to Apple Varieties",
        },
        infoBoxes: {
          about:
            "Lorem Ipsum is simply free text used by copywriting refining. Neque porro est qui.",
          contact: {
            phone: "📞 +1 (240) 333-0079",
            email: "📧 support@appleverse.com",
            hours: "🕒 Mon - Fri: 7:00 AM - 6:00 PM",
          },
          address: "📍 University of Windsor, Sunset Avenue",
        },
        footer: {
          left: {
            title: "Appleverse",
            description:
              "There are many variations of apples. Welcome to the world of apples!",
          },
          center: {
            explore: ["🏠 Home", "📖 About", "📞 Contact", "🔑 Admin Login"],
          },
          right: {
            contact: {
              phone: "📞 666 888 0000",
              email: "📧 reach@applecompany.com",
              address: "📍 Brooklyn, Golden Street, New York, USA",
            },
          },
        },
      });
    }
    res.json(contactDoc);
  } catch (err) {
    console.error("GET /contact-data error:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

// PUT /contact-data: Update the contact info
// We use findOneAndUpdate to update or create if it doesn't exist
app.put("/contact-data", async (req, res) => {
  try {
    const updatedDoc = await ContactData.findOneAndUpdate(
      { _id: "contactPage" },
      req.body,
      { new: true, upsert: true }
    );
    res.json(updatedDoc);
  } catch (err) {
    console.error("PUT /contact-data error:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

// ---------------------------------------
// POST endpoint to create a new apple
// ---------------------------------------
app.post("/apples", upload.array("images"), async (req, res) => {
  try {
    const {
      acno,
      accession,
      cultivar_name,
      "e origin country": eOriginCountry,
      "e origin province": eOriginProvince,
      "e origin city": eOriginCity,
      "e genus": eGenus,
      "e species": eSpecies,
    } = req.body;

    let extraFields = {};
    if (req.body.extraFields) {
      try {
        extraFields = JSON.parse(req.body.extraFields);
      } catch (err) {
        console.error("Error parsing extraFields:", err);
      }
    }

    const appleData = {
      acno,
      accession,
      cultivar_name,
      "e origin country": eOriginCountry,
      "e origin province": eOriginProvince,
      "e origin city": eOriginCity,
      "e genus": eGenus,
      "e species": eSpecies,
      ...extraFields,
      images: req.files.map((file) => file.filename),
    };

    if (accession) {
      appleData._id = accession.toLowerCase();
    }

    const newApple = await Apple.create(appleData);
    res.json(newApple);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating apple" });
  }
});

// ---------------------------------------
// Signup & Admin login routes
// ---------------------------------------
app.post("/signup-request", handleSignupRequest);

app.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const adminDoc = await Admin.findOne({ email });
    if (!adminDoc) {
      return res
        .status(401)
        .json({ error: "Invalid credentials or not an admin" });
    }
    const match = await bcrypt.compare(password, adminDoc.password);
    if (!match) {
      return res
        .status(401)
        .json({ error: "Invalid credentials or not an admin" });
    }
    // For demonstration, return a placeholder token
    const token = "some-jwt-token";
    return res.json({ token, message: "Login successful" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

// change password
app.post("/admin/change-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res
        .status(400)
        .json({ error: "Email and new password are required" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedAdmin = await Admin.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );
    if (!updatedAdmin) {
      return res.status(404).json({ error: "Admin not found" });
    }
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------------------------------------
// Admin Dashboard routes
// ---------------------------------------
app.get("/admin/pending-requests", listPendingRequests);
app.get("/admin/active-admins", listActiveAdmins);
app.get("/admin/rejected-requests", listRejectedRequests);
app.post("/admin/approve-request", approveRequest);
app.post("/admin/reject-request", rejectRequest);
app.post("/admin/revoke-access", revokeAccess);
app.post("/admin/reinstate-request", reinstateRequest);

// Serve images from the "images" folder
app.use("/images", express.static(path.join(__dirname, "images")));

// ---------------------------------------
// Apple GET, PUT, DELETE routes
// ---------------------------------------
app.get("/apples", async (req, res) => {
  try {
    const searchTerm = req.query.search;
    let filter = {};
    if (searchTerm) {
      filter = { cultivar_name: new RegExp(searchTerm, "i") };
    }
    const apples = await Apple.find(filter);
    res.json(apples);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

app.get("/apples/:id", async (req, res) => {
  try {
    const apple = await Apple.findOne({ _id: req.params.id });
    if (!apple) {
      return res.status(404).json({ error: "Apple not found" });
    }
    res.json(apple);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

app.put("/apples/:id", async (req, res) => {
  try {
    req.body._id = req.params.id;
    await Apple.replaceOne({ _id: req.params.id }, req.body);
    const updatedApple = await Apple.findOne({ _id: req.params.id });
    if (!updatedApple) {
      return res.status(404).json({ error: "Apple not found" });
    }
    res.json(updatedApple);
  } catch (err) {
    console.error("PUT /apples/:id error:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

app.delete("/apples/:id", async (req, res) => {
  try {
    const deletedApple = await Apple.findByIdAndDelete(req.params.id);
    if (!deletedApple) {
      return res.status(404).json({ error: "Apple not found" });
    }
    res.json({ message: "Apple deleted successfully" });
  } catch (err) {
    console.error("DELETE /apples/:id error:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to Appleverse API");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
