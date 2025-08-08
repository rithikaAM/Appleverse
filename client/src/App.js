// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

// Import your pages
import Home from "./pages/Home";
import Products from "./pages/Products";
import Contact from "./pages/Contact";
import Signup from "./pages/Signup";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminHome from "./pages/AdminHome";
import AdminProducts from "./pages/AdminProducts";
import AppleDetails from "./pages/AppleDetails";
import AdminAppleDetails from "./pages/AdminAppleDetails";
import AdminProductDetails from "./pages/AdminProductDetails";
import CreateApple from "./pages/CreateApple";
import ChangePassword from "./pages/ChangePassword";
import AdminContact from "./pages/AdminContact";

// Import your Navbars
import Navbar from "./components/Navbar";
import AdminNavbar from "./components/AdminNavbar";

// Import the ContactProvider from your context file
import { ContactProvider } from "./context/ContactUpdates";

function AppContent() {
  const location = useLocation();

  // Routes that should display the AdminNavbar
  const adminRoutes = [
    "/admin/contact",
    "/admin-dashboard",
    "/admin-home",
    "/admin-products",
    "/admin/edit-apple",
    "/admin/create-apple",
    "/admin/apple",
    "/admin/change-password",
  ];

  // If the current path starts with one of these, show the AdminNavbar
  const isAdminRoute = adminRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  return (
    <>
      {isAdminRoute ? <AdminNavbar /> : <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-home" element={<AdminHome />} />
        <Route path="/admin-products" element={<AdminProducts />} />
        
        {/* Public Apple details */}
        <Route path="/apple/:id" element={<AppleDetails />} />
        
        {/* Admin apple details page */}
        <Route path="/admin/apple/:id" element={<AdminAppleDetails />} />
        
        {/* Admin edit page */}
        <Route path="/admin/edit-apple/:id" element={<AdminProductDetails />} />
        
        {/* Create new apple page */}
        <Route path="/admin/create-apple" element={<CreateApple />} />
        
        {/* Change password page */}
        <Route path="/admin/change-password" element={<ChangePassword />} />
        
        {/* Admin contact page (editable) */}
        <Route path="/admin/contact" element={<AdminContact />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <ContactProvider>
      <Router>
        <AppContent />
      </Router>
    </ContactProvider>
  );
}
