import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Admin.css";

const AdminLogin = () => {
  // State for email, password, and error message
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // POST to the admin login route
      const response = await axios.post("http://localhost:5000/admin/login", {
        email,
        password,
      });
      // Store JWT token and admin email in localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("adminEmail", email);
      // Optionally store admin name if available; otherwise use email or a default value
      if (response.data.adminName) {
        localStorage.setItem("adminName", response.data.adminName);
      } else {
        localStorage.setItem("adminName", "Admin");
      }
      setError(""); // Clear any previous error
      // Redirect to AdminHome page upon successful login
      navigate("/admin-home");
    } catch (err) {
      setError("Invalid credentials or not an admin");
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-card">
        <h2>Admin Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>

        {error && <p className="error">{error}</p>}

        <div className="signup-link">
          New here? <Link to="/signup">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
