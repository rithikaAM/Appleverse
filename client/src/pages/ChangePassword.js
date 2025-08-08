// src/pages/ChangePassword.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/ChangePassword.css";

// Default export (no curly braces when importing)
export default function ChangePassword() {
  const navigate = useNavigate();

  // Admin details from localStorage (or wherever you store them)
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    // Example: retrieve from localStorage
    const name = localStorage.getItem("adminName");
    const email = localStorage.getItem("adminEmail");
    setAdminName(name || "Admin Name");
    setAdminEmail(email || "admin@example.com");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      // Make request to your server
      const response = await axios.post("http://localhost:5000/admin/change-password", {
        email: adminEmail,
        newPassword,
      });
      setSuccessMsg(response.data.message || "Password changed successfully!");

      // Optionally, log out or redirect
      // localStorage.removeItem("token");
      // navigate("/admin-login");
    } catch (err) {
      console.error("Change password error:", err);
      setError("Error changing password.");
    }
  };

  return (
    <div className="change-password-container">
      <h2>Change Password</h2>
      <form onSubmit={handleSubmit} className="change-password-form">
        <div className="form-group">
          <label>Name:</label>
          <input type="text" value={adminName} disabled />
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input type="email" value={adminEmail} disabled />
        </div>

        <div className="form-group">
          <label>New Password:</label>
          <input
            type={showPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Confirm Password:</label>
          <input
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-group toggle-view">
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            <span className="slider round"></span>
          </label>
          <span>Show Password</span>
        </div>

        {error && <p className="error">{error}</p>}
        {successMsg && <p className="success">{successMsg}</p>}

        <button type="submit">Change Password</button>
      </form>
    </div>
  );
}
