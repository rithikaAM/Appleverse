import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css"; // Import CSS for styling

const Navbar = () => {
  // State to track dark mode
  const [darkMode, setDarkMode] = useState(false);

  // Whenever darkMode changes, add/remove the "dark" class on <body>
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <nav className="navbar">
      <div className="logo">🍏 Appleverse</div>

      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/products">Products</Link></li>
        <li><Link to="/contact">Contact</Link></li>
        <li><Link to="/admin-login">Admin</Link></li>
      </ul>

      {/* Dark Mode Toggle Switch */}
      <div className="dark-mode-toggle">
        <label className="switch">
          <input
            type="checkbox"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
          />
          <span className="slider round"></span>
        </label>
        <span className="mode-label">
          {darkMode ? "Dark" : "Light"}
        </span>
      </div>
    </nav>
  );
};

export default Navbar;
