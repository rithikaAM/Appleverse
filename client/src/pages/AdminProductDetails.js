import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "../styles/AdminProductDetails.css";

function AdminProductDetails() {
  const { id } = useParams(); // e.g., "mal0101"
  const navigate = useNavigate();

  // We'll store the apple doc as an object in state.
  // E.g. { accession: "mal0101", cultivar_name: "King", ... }
  const [appleData, setAppleData] = useState(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    // Fetch the apple by ID
    axios
      .get(`http://localhost:5000/apples/${id}`)
      .then((res) => setAppleData(res.data))
      .catch((err) => setError("Error fetching apple details"));
  }, [id]);

  // 1. Convert the appleData to a PDF
  const handleDownloadPDF = async () => {
    if (!appleData) return;
    try {
      const doc = new jsPDF();
      doc.text("Apple Variety Details", 14, 10);

      const tableColumn = ["Field", "Value"];
      const tableRows = [];

      // Convert appleData object into rows for autoTable
      Object.entries(appleData).forEach(([key, value]) => {
        let displayVal = value || "None";
        if (Array.isArray(value)) {
          displayVal = value.join(", ");
        } else if (typeof value === "object" && value !== null) {
          displayVal = JSON.stringify(value);
        }
        tableRows.push([key, displayVal]);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
      });

      doc.save(`${appleData.cultivar_name || "Apple"}_Details.pdf`);
    } catch (err) {
      console.error("PDF Error:", err);
    }
  };

  // 2. Add a new field to the doc
  const handleAddField = () => {
    const newKey = prompt("Enter the new field name (key):");
    if (!newKey) return;
    if (appleData.hasOwnProperty(newKey)) {
      alert("That field already exists!");
      return;
    }
    // Insert an empty string for the new field
    setAppleData({ ...appleData, [newKey]: "" });
  };

  // 3. Remove an existing field
  const handleRemoveField = (key) => {
    if (!window.confirm(`Remove field "${key}"?`)) return;
    const newDoc = { ...appleData };
    delete newDoc[key];
    setAppleData(newDoc);
  };

  // 4. Handle changes to any field's value
  const handleFieldChange = (key, newValue) => {
    setAppleData({ ...appleData, [key]: newValue });
  };

  // 5. Save changes to the server (PUT /apples/:id)
  const handleSaveChanges = async () => {
    setError("");
    setSuccessMsg("");
    try {
      await axios.put(`http://localhost:5000/apples/${id}`, appleData);
      setSuccessMsg("Changes saved successfully!");
    } catch (err) {
      console.error(err);
      setError("Error saving changes");
    }
  };

  // 6. Delete the entire apple doc
  const handleDeleteApple = async () => {
    if (!window.confirm("Are you sure you want to delete this entire apple record?")) {
      return;
    }
    try {
      await axios.delete(`http://localhost:5000/apples/${id}`);
      alert("Apple record deleted!");
      navigate("/admin-home"); // or admin-products
    } catch (err) {
      console.error(err);
      setError("Error deleting apple");
    }
  };

  if (!appleData) {
    return (
      <div className="admin-product-details">
        {error ? <p className="error">{error}</p> : <p>Loading apple details...</p>}
      </div>
    );
  }

  return (
    <div className="admin-product-details">
      <h2>Admin Product Details</h2>
      {error && <p className="error">{error}</p>}
      {successMsg && <p className="success">{successMsg}</p>}

      {/* Table of fields (key-value) with edit controls */}
      <table className="details-table">
        <thead>
          <tr>
            <th>Field</th>
            <th>Value</th>
            <th>Remove</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(appleData).map(([key, value]) => (
            <tr key={key}>
              <td className="field-cell">{key}</td>
              <td>
                <input
                  type="text"
                  value={value || ""}
                  onChange={(e) => handleFieldChange(key, e.target.value)}
                  style={{ width: "100%" }}
                />
              </td>
              <td>
                {/* Prevent removing _id or other critical fields if you want */}
                {key === "_id" ? null : (
                  <button className="remove-field-btn" onClick={() => handleRemoveField(key)}>
                    Remove
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="actions">
        <button onClick={handleAddField}>Add Field</button>
        <button onClick={handleSaveChanges}>Save Changes</button>
        <button onClick={handleDownloadPDF}>Download PDF</button>
        <button onClick={handleDeleteApple} className="delete-apple-btn">
          Delete Apple
        </button>
      </div>
    </div>
  );
}

export default AdminProductDetails;
