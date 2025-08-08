import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/AdminDashboard.css"; // We'll define this next

const AdminDashboard = () => {
  // The three tabs: "main", "pending", "rejected"
  const [tab, setTab] = useState("main");
  const [mainAdmins, setMainAdmins] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [rejectedAdmins, setRejectedAdmins] = useState([]);
  const [error, setError] = useState("");

  // On mount or whenever tab changes, fetch data
  useEffect(() => {
    fetchData();
  }, [tab]);

  const fetchData = async () => {
    setError("");
    try {
      if (tab === "main") {
        // GET active admins from server
        const res = await axios.get("http://localhost:5000/admin/active-admins");
        setMainAdmins(res.data);
      } else if (tab === "pending") {
        // GET pending requests
        const res = await axios.get("http://localhost:5000/admin/pending-requests");
        setPendingRequests(res.data);
      } else if (tab === "rejected") {
        // GET rejected admins
        const res = await axios.get("http://localhost:5000/admin/rejected-requests");
        setRejectedAdmins(res.data);
      }
    } catch (err) {
      console.error(err);
      setError("Error fetching data");
    }
  };

  // Approve => from pending to main
  const handleApprove = async (id) => {
    try {
      await axios.post("http://localhost:5000/admin/approve-request", { requestId: id });
      fetchData();
    } catch (err) {
      console.error(err);
      setError("Error approving request");
    }
  };

  // Reject => from pending or main => rejected
  const handleReject = async (id) => {
    try {
      await axios.post("http://localhost:5000/admin/reject-request", { requestId: id });
      fetchData();
    } catch (err) {
      console.error(err);
      setError("Error rejecting request");
    }
  };

  // Revoke => from main => rejected
  const handleRevoke = async (id) => {
    try {
      await axios.post("http://localhost:5000/admin/revoke-access", { requestId: id });
      fetchData();
    } catch (err) {
      console.error(err);
      setError("Error revoking access");
    }
  };

  // Accept => from rejected => main (reinstate)
  const handleAccept = async (id) => {
    try {
      await axios.post("http://localhost:5000/admin/reinstate-request", { requestId: id });
      fetchData();
    } catch (err) {
      console.error(err);
      setError("Error accepting request");
    }
  };

  // Render table rows for each tab
  const renderMainAdmins = () => {
    return mainAdmins.map((admin) => (
      <tr key={admin._id}>
        <td>{admin.name}</td>
        <td>{admin.email}</td>
        <td>
          <span className="status-badge active">Active</span>
        </td>
        <td>
          {/* Revoke button => moves them to rejected */}
          <button className="btn red" onClick={() => handleReject(admin._id)}>
            Reject
          </button>
          {/* Or if you prefer handleRevoke: 
              <button className="btn red" onClick={() => handleRevoke(admin._id)}>Revoke</button>
          */}
        </td>
      </tr>
    ));
  };

  const renderPendingRequests = () => {
    return pendingRequests.map((req) => (
      <tr key={req._id}>
        <td>{req.name}</td>
        <td>{req.email}</td>
        <td>
          <span className="status-badge pending">Pending</span>
        </td>
        <td>
          <button className="btn green" onClick={() => handleApprove(req._id)}>
            Approve
          </button>
          <button className="btn red" onClick={() => handleReject(req._id)}>
            Reject
          </button>
        </td>
      </tr>
    ));
  };

  const renderRejectedAdmins = () => {
    return rejectedAdmins.map((rej) => (
      <tr key={rej._id}>
        <td>{rej.name}</td>
        <td>{rej.email}</td>
        <td>
          <span className="status-badge inactive">Inactive</span>
        </td>
        <td>
          <button className="btn green" onClick={() => handleAccept(rej._id)}>
            Accept
          </button>
        </td>
      </tr>
    ));
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      {error && <p className="error-msg">{error}</p>}

      {/* Tab Buttons */}
      <div className="tab-row">
        <button
          className={`tab-btn ${tab === "main" ? "active" : ""}`}
          onClick={() => setTab("main")}
        >
          Main Admins
        </button>
        <button
          className={`tab-btn ${tab === "pending" ? "active" : ""}`}
          onClick={() => setTab("pending")}
        >
          Pending Requests
        </button>
        <button
          className={`tab-btn ${tab === "rejected" ? "active" : ""}`}
          onClick={() => setTab("rejected")}
        >
          Rejected Admins
        </button>
      </div>

      {/* Table Display */}
      <div className="tab-content">
        {tab === "main" && (
          <>
            <h3>Main Admins</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>{renderMainAdmins()}</tbody>
            </table>
          </>
        )}

        {tab === "pending" && (
          <>
            <h3>Pending Requests</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>{renderPendingRequests()}</tbody>
            </table>
          </>
        )}

        {tab === "rejected" && (
          <>
            <h3>Rejected Admins</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>{renderRejectedAdmins()}</tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
