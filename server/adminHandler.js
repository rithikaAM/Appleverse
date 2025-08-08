// adminHandler.js
const mongoose = require("mongoose");
require("dotenv").config();

/* 
   1) Connect to appleverse_users for pendingrequests & rejectedrequests
*/
const userDB = mongoose.createConnection("mongodb://localhost:27017/appleverse_users", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Pending requests schema
const pendingSchema = new mongoose.Schema({
  name: String,
  dob: String,
  email: String,
  password: String, // hashed
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
});
const PendingRequest = userDB.model("PendingRequest", pendingSchema, "pendingrequests");

// Rejected requests schema
const rejectedSchema = new mongoose.Schema({
  name: String,
  dob: String,
  email: String,
  password: String,
  createdAt: { type: Date, default: Date.now },
});
const RejectedRequest = userDB.model("RejectedRequest", rejectedSchema, "rejectedrequests");

/* 
   2) Connect to appleverse for the "admins" collection
   (where you store your main admin and all approved admins).
*/
const mainDB = mongoose.createConnection("mongodb://localhost:27017/appleverse", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Admin schema
const adminSchema = new mongoose.Schema({
  name: String,
  dob: String,
  email: String,
  password: String, // hashed
  role: { type: String, default: "admin" },
  createdAt: { type: Date, default: Date.now },
});
const Admin = mainDB.model("Admin", adminSchema, "admins");

/* ----------------------------------------------------
   LISTING FUNCTIONS
----------------------------------------------------- */

const listPendingRequests = async (req, res) => {
  try {
    const pending = await PendingRequest.find();
    res.json(pending);
  } catch (error) {
    console.error("Error listing pending requests:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

const listActiveAdmins = async (req, res) => {
  try {
    const admins = await Admin.find();
    res.json(admins);
  } catch (error) {
    console.error("Error listing active admins:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

const listRejectedRequests = async (req, res) => {
  try {
    const rejected = await RejectedRequest.find();
    res.json(rejected);
  } catch (error) {
    console.error("Error listing rejected requests:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

/* ----------------------------------------------------
   ACTION FUNCTIONS
----------------------------------------------------- */

// Approve: move doc from pendingrequests => admins
const approveRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const pendingDoc = await PendingRequest.findById(requestId);
    if (!pendingDoc) {
      return res.status(404).json({ error: "Request not found" });
    }
    // Insert into admins (appleverse)
    await Admin.create({
      name: pendingDoc.name,
      dob: pendingDoc.dob,
      email: pendingDoc.email,
      password: pendingDoc.password, // hashed
      role: "admin",
    });
    // Remove from pending
    await PendingRequest.findByIdAndDelete(requestId);
    res.json({ message: "Request approved. User added to appleverse -> admins." });
  } catch (error) {
    console.error("Error approving request:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

// Reject: if found in pending => move to rejectedrequests
// or if found in admins => move to rejectedrequests (revoking an active admin)
const rejectRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    let doc = await PendingRequest.findById(requestId);
    if (doc) {
      // Move doc to RejectedRequest
      await RejectedRequest.create({
        name: doc.name,
        dob: doc.dob,
        email: doc.email,
        password: doc.password,
      });
      // Remove from pending
      await PendingRequest.findByIdAndDelete(requestId);
      return res.json({ message: "Request rejected, moved to 'rejectedrequests'." });
    }
    // If not in pending, check admins (appleverse)
    doc = await Admin.findById(requestId);
    if (doc) {
      // Move from active admin => rejected
      await RejectedRequest.create({
        name: doc.name,
        dob: doc.dob,
        email: doc.email,
        password: doc.password,
      });
      await Admin.findByIdAndDelete(requestId);
      return res.json({ message: "Admin revoked, moved to 'rejectedrequests'." });
    }
    res.status(404).json({ error: "Not found in pending or active admins." });
  } catch (error) {
    console.error("Error rejecting request:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

// Revoke Access: from appleverse -> admins => rejectedrequests
const revokeAccess = async (req, res) => {
  try {
    const { requestId } = req.body;
    const adminDoc = await Admin.findById(requestId);
    if (!adminDoc) {
      return res.status(404).json({ error: "Admin not found" });
    }
    await RejectedRequest.create({
      name: adminDoc.name,
      dob: adminDoc.dob,
      email: adminDoc.email,
      password: adminDoc.password,
    });
    await Admin.findByIdAndDelete(requestId);
    res.json({ message: "Admin revoked, moved to 'rejectedrequests'." });
  } catch (error) {
    console.error("Error revoking access:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

// Reinstate: from rejectedrequests => appleverse -> admins
const reinstateRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const rejectedDoc = await RejectedRequest.findById(requestId);
    if (!rejectedDoc) {
      return res.status(404).json({ error: "Rejected request not found" });
    }
    await Admin.create({
      name: rejectedDoc.name,
      dob: rejectedDoc.dob,
      email: rejectedDoc.email,
      password: rejectedDoc.password,
      role: "admin",
    });
    await RejectedRequest.findByIdAndDelete(requestId);
    res.json({ message: "Rejected admin reinstated to 'admins'." });
  } catch (error) {
    console.error("Error reinstating request:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

module.exports = {
  // Models (optional if you want to do admin login in server.js)
  Admin,

  // Listing
  listPendingRequests,
  listActiveAdmins,
  listRejectedRequests,

  // Actions
  approveRequest,
  rejectRequest,
  revokeAccess,
  reinstateRequest,
};
