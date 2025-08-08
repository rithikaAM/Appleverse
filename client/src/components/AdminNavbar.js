import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/AdminNavbar.css";

const AdminNavbar = () => {
  const navigate = useNavigate();
  const [adminEmail, setAdminEmail] = useState("");
  const [adminName, setAdminName] = useState("Admin");
  const [darkMode, setDarkMode] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Load admin details from localStorage
  useEffect(() => {
    const storedEmail = localStorage.getItem("adminEmail");
    const storedName = localStorage.getItem("adminName");
    if (storedEmail) setAdminEmail(storedEmail);
    if (storedName) setAdminName(storedName);
  }, []);

  // Toggle dark mode on the body element
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("adminName");
    navigate("/admin-login");
  };

  // Create an avatar letter from admin's name
  const initial = adminName ? adminName.charAt(0).toUpperCase() : "A";

  return (
    <nav className="admin-navbar">
      <div className="admin-navbar-logo">
        <Link to="/admin-home">🍏 Appleverse</Link>
      </div>
      <ul className="admin-navbar-links">
        <li>
          <Link to="/admin-home">Home</Link>
        </li>
        <li>
          <Link to="/admin-products">Products</Link>
        </li>
        <li>
          <Link to="/admin/contact">Contacts</Link>
        </li>
        <li>
          <Link to="/admin-dashboard">Admin Requests</Link>
        </li>
        <li>
          <Link to="/admin/create-apple">Create Apple</Link>
        </li>
      </ul>
      <div className="admin-navbar-actions">
        {/* Dark Mode Toggle */}
        <div className="dark-mode-toggle">
          <label className="switch">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
            />
            <span className="slider round"></span>
          </label>
          <span className="mode-label">{darkMode ? "Dark" : "Light"}</span>
        </div>
        {/* Profile Avatar */}
        <div
          className="profile-avatar"
          onClick={() => setShowProfileMenu(!showProfileMenu)}
        >
          {initial}
        </div>
        {showProfileMenu && (
          <div className="profile-menu">
            <p className="profile-name">{adminName}</p>
            <p className="profile-email">{adminEmail || "Not logged in"}</p>
            <Link to="/admin/change-password">Change Password</Link>
            <button onClick={handleSignOut}>Sign Out</button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AdminNavbar;
