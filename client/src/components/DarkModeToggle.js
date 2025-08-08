// DarkModeToggle.js
import React, { useState, useEffect } from "react";
import "../../styles/DarkModeToggle.css"; // Adjust path as needed

function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState(false);

  // Update body class on darkMode state change
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <button onClick={toggleDarkMode} style={buttonStyle}>
      {darkMode ? "Light Mode" : "Dark Mode"}
    </button>
  );
}

// Notice we rely on CSS variables for color
const buttonStyle = {
  padding: "8px 16px",
  fontSize: "16px",
  cursor: "pointer",
  border: "none",
  borderRadius: "5px",
  backgroundColor: "var(--primary-color)",
  color: "var(--text-color)",
  transition: "background-color 0.3s, color 0.3s",
};

export default DarkModeToggle;
