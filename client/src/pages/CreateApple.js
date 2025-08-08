// CreateApple.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/CreateApple.css";

const CreateApple = () => {
  const navigate = useNavigate();

  // Use EXACT keys (including spaces) to match what the server will store
  const [formData, setFormData] = useState({
    acno: "",
    accession: "",
    cultivar_name: "",
    "e origin country": "",
    "e origin province": "",
    "e origin city": "",
    "e genus": "",
    "e species": "",
  });

  // For image files
  const [images, setImages] = useState([]);

  // Handle standard input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file input change
  const handleImageChange = (e) => {
    setImages(e.target.files);
  };

  // On submit, send a FormData object with all the fields exactly as needed
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();

      // Append standard fields using their exact keys
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });

      // Append image files, if provided
      if (images) {
        for (let i = 0; i < images.length; i++) {
          data.append("images", images[i]);
        }
      }

      // Send the POST request to your server endpoint
      await axios.post("http://localhost:5000/apples", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Apple created successfully!");
      navigate("/admin-home");
    } catch (error) {
      console.error("Error creating apple:", error);
      alert("Error creating apple.");
    }
  };

  return (
    <div className="create-apple-container">
      <h2>Create New Apple Variety</h2>
      <form onSubmit={handleSubmit} className="create-apple-form">
        <div>
          <label>ACNO:</label>
          <input
            type="text"
            name="acno"
            value={formData.acno}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label>Accession:</label>
          <input
            type="text"
            name="accession"
            value={formData.accession}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label>Cultivar Name:</label>
          <input
            type="text"
            name="cultivar_name"
            value={formData.cultivar_name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label>E Origin Country:</label>
          <input
            type="text"
            name="e origin country"
            value={formData["e origin country"]}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>E Origin Province:</label>
          <input
            type="text"
            name="e origin province"
            value={formData["e origin province"]}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>E Origin City:</label>
          <input
            type="text"
            name="e origin city"
            value={formData["e origin city"]}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>E Genus:</label>
          <input
            type="text"
            name="e genus"
            value={formData["e genus"]}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>E Species:</label>
          <input
            type="text"
            name="e species"
            value={formData["e species"]}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label>Upload Images:</label>
          <input type="file" multiple onChange={handleImageChange} />
        </div>
        <div>
          <button type="submit">Create Apple</button>
        </div>
      </form>
    </div>
  );
};

export default CreateApple;
