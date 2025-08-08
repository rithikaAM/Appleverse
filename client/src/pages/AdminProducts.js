import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import FilterPanel from "../components/FilterPanel"; // Adjust path if needed
import "../styles/AdminProducts.css";

export default function AdminProducts() {
  const [apples, setApples] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("table"); // "table" or "picture"
  const [filters, setFilters] = useState({
    acno: "",
    accession: "",
    originCountry: "",
    originProvince: "",
    originCity: "",
    ePedigree: "",
    eGenus: "",
    eSpecies: "",
  });
  const [recommendations, setRecommendations] = useState(null);

  const navigate = useNavigate();

  // 1. Fetch apple data on mount
  useEffect(() => {
    axios
      .get("http://localhost:5000/apples")
      .then((response) => setApples(response.data))
      .catch((error) => console.error("Error fetching apples:", error));
  }, []);

  // 2. Helper: Get unique, sorted values for a given field
  const getUniqueValues = (arr, field) => {
    const setVals = new Set();
    arr.forEach((item) => {
      const val = (item[field] || "").trim();
      if (val) setVals.add(val);
    });
    return Array.from(setVals).sort();
  };

  // 3. Define columns for table view
  const columns = useMemo(
    () => [
      { key: "acno", label: "ACNO" },
      { key: "accession", label: "Accession" },
      { key: "cultivar_name", label: "Cultivar Name" },
      { key: "e origin country", label: "E Origin Country" },
      { key: "e origin province", label: "E Origin Province" },
      { key: "e origin city", label: "E Origin City" },
      { key: "e pedigree", label: "E Pedigree" },
      { key: "e genus", label: "E Genus" },
      { key: "e species", label: "E Species" },
    ],
    []
  );

  // 4. Filter apples by search term and dropdown filters
  const filteredApples = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    return apples.filter((apple) => {
      const searchMatch = columns.some((col) =>
        (apple[col.key] || "").toLowerCase().includes(lowerSearch)
      );
      if (!searchMatch) return false;
      if (filters.acno && apple.acno !== filters.acno) return false;
      if (filters.accession && apple.accession !== filters.accession) return false;
      if (
        filters.originCountry &&
        (apple["e origin country"] || "").trim() !== filters.originCountry
      )
        return false;
      if (
        filters.originProvince &&
        (apple["e origin province"] || "").trim() !== filters.originProvince
      )
        return false;
      if (
        filters.originCity &&
        (apple["e origin city"] || "").trim() !== filters.originCity
      )
        return false;
      if (
        filters.ePedigree &&
        (apple["e pedigree"] || "").trim() !== filters.ePedigree
      )
        return false;
      if (filters.eGenus && (apple["e genus"] || "").trim() !== filters.eGenus)
        return false;
      if (
        filters.eSpecies &&
        (apple["e species"] || "").trim() !== filters.eSpecies
      )
        return false;
      return true;
    });
  }, [apples, columns, searchTerm, filters]);

  // 5. Cascading dropdown filter options (from filtered apples)
  const acnoOptions = useMemo(() => getUniqueValues(filteredApples, "acno"), [filteredApples]);
  const accessionOptions = useMemo(() => getUniqueValues(filteredApples, "accession"), [filteredApples]);
  const originCountryOptions = useMemo(() => getUniqueValues(filteredApples, "e origin country"), [filteredApples]);
  const originProvinceOptions = useMemo(() => getUniqueValues(filteredApples, "e origin province"), [filteredApples]);
  const originCityOptions = useMemo(() => getUniqueValues(filteredApples, "e origin city"), [filteredApples]);
  const ePedigreeOptions = useMemo(() => getUniqueValues(filteredApples, "e pedigree"), [filteredApples]);
  const eGenusOptions = useMemo(() => getUniqueValues(filteredApples, "e genus"), [filteredApples]);
  const eSpeciesOptions = useMemo(() => getUniqueValues(filteredApples, "e species"), [filteredApples]);

  const filterOptions = {
    acnoOptions,
    accessionOptions,
    originCountryOptions,
    originProvinceOptions,
    originCityOptions,
    ePedigreeOptions,
    eGenusOptions,
    eSpeciesOptions,
  };

  const handleReset = () => {
    setFilters({
      acno: "",
      accession: "",
      originCountry: "",
      originProvince: "",
      originCity: "",
      ePedigree: "",
      eGenus: "",
      eSpecies: "",
    });
  };

  // 6. Fetch ML recommendations with debouncing (if search term is at least 3 characters)
  useEffect(() => {
    const trimmed = searchTerm.trim();
    if (trimmed.length < 3) {
      setRecommendations(null);
      return;
    }
    const debounceTimer = setTimeout(() => {
      axios
        .get("http://localhost:5001/recommend", { params: { query: trimmed } })
        .then((res) => setRecommendations(res.data))
        .catch((err) => {
          console.error("Error fetching recommendations:", err);
          setRecommendations(null);
        });
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // 7. Toggle view mode (table vs. picture)
  const handleToggle = () => {
    setViewMode((prev) => (prev === "table" ? "picture" : "table"));
  };

  // 8. Navigation functions
  const handleAppleClick = (id) => {
    navigate(`/admin/apple/${id}`);
  };

  const handleEdit = (id, event) => {
    event.stopPropagation();
    navigate(`/admin/edit-apple/${id}`);
  };

  // 9. Exclude ML recommendation results from normal search results
  const mlMainId =
    recommendations && recommendations["Main Result"]
      ? recommendations["Main Result"]._id
      : null;
  const mlSimilarIds =
    recommendations && recommendations["Similar Results"]
      ? recommendations["Similar Results"].map((item) => item._id)
      : [];
  const remainingResults = filteredApples.filter((apple) => {
    if (mlMainId && apple._id === mlMainId) return false;
    if (mlSimilarIds.includes(apple._id)) return false;
    return true;
  });

  // 10. Render table view with edit buttons
  const renderTableView = () => (
    <div style={{ width: "75%", margin: "0 auto" }}>
      <table className="summary-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {recommendations && recommendations["Main Result"] && (
            <>
              <tr className="ml-header">
                <td colSpan={columns.length + 1} style={{ textAlign: "center", fontWeight: "bold" }}>
                  Result
                </td>
              </tr>
              <tr
                className="ml-main-row"
                onClick={() => handleAppleClick(recommendations["Main Result"]._id)}
              >
                {columns.map((col) => (
                  <td key={col.key}>
                    {recommendations["Main Result"][col.key] || "None"}
                  </td>
                ))}
                <td>
                  <button className="edit-button" onClick={(e) => handleEdit(recommendations["Main Result"]._id, e)}>
                    Edit
                  </button>
                </td>
              </tr>
              {recommendations["Similar Results"]?.length > 0 && (
                <tr className="ml-header">
                  <td colSpan={columns.length + 1} style={{ textAlign: "center", fontWeight: "bold" }}>
                    You might also like
                  </td>
                </tr>
              )}
              {recommendations["Similar Results"].map((item) => (
                <tr
                  key={item._id}
                  className="ml-similar-row"
                  onClick={() => handleAppleClick(item._id)}
                >
                  {columns.map((col) => (
                    <td key={col.key}>{item[col.key] || "None"}</td>
                  ))}
                  <td>
                    <button className="edit-button" onClick={(e) => handleEdit(item._id, e)}>Edit</button>
                  </td>
                </tr>
              ))}
              <tr className="other-header">
                <td colSpan={columns.length + 1} style={{ textAlign: "center", fontWeight: "bold" }}>
                  Other Results
                </td>
              </tr>
            </>
          )}
          {remainingResults.map((apple) => (
            <tr key={apple._id} onClick={() => handleAppleClick(apple._id)}>
              {columns.map((col) => (
                <td key={col.key}>{apple[col.key] || "None"}</td>
              ))}
              <td>
                <button className="edit-button" onClick={(e) => handleEdit(apple._id, e)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // 11. Render picture view with edit buttons and improved text overlay for better visibility
  const renderPictureView = () => {
    const renderCard = (apple, extraClass = "") => (
      <div
        key={apple._id}
        className={`apple-card ${extraClass}`}
        onClick={() => handleAppleClick(apple._id)}
        style={{ position: "relative", overflow: "hidden" }}
      >
        {apple.images && apple.images.length > 0 ? (
          <img
            src={`http://localhost:5000/images/${apple.images[0]}`}
            alt={apple.cultivar_name}
          />
        ) : (
          <img
            src="http://localhost:5000/images/default-apple.jpg"
            alt="Default Apple"
            className="default-image"
          />
        )}
        {/* Text overlay for improved visibility */}
        <div className="card-overlay">
          <h3>{apple.cultivar_name || "Unknown"}</h3>
          <p>Accession: {apple.accession || "None"}</p>
          <button className="edit-button" onClick={(e) => handleEdit(apple._id, e)}>
            Edit
          </button>
        </div>
      </div>
    );

    return (
      <div className="picture-layout">
        {recommendations && recommendations["Main Result"] ? (
          <div className="main-result-section">
            <h3 className="section-heading">Result</h3>
            <div className="results-grid">
              {renderCard(recommendations["Main Result"], "ml-main-card")}
            </div>
          </div>
        ) : (
          <div className="main-result-section">
            <h3 className="section-heading">Result</h3>
            <div className="results-grid">
              {filteredApples.map((apple) => renderCard(apple))}
            </div>
          </div>
        )}
        {recommendations && recommendations["Similar Results"]?.length > 0 ? (
          <div className="similar-section">
            <h3 className="section-heading">You might also like</h3>
            <div className="similar-grid">
              {recommendations["Similar Results"].map((item) =>
                renderCard(item, "ml-similar-card")
              )}
            </div>
          </div>
        ) : (
          <div className="similar-section">
            <h3 className="section-heading">You might also like</h3>
            <p style={{ textAlign: "center", marginTop: "20px" }}>
              No similar recommendations
            </p>
          </div>
        )}
        <div className="other-section">
          <h3 className="section-heading">Other Results</h3>
          <div className="other-grid">
            {remainingResults.map((apple) => renderCard(apple))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="home-container">
      <FilterPanel filters={filters} setFilters={setFilters} options={filterOptions} handleReset={handleReset} />
      <div className="search-container" style={{ marginTop: "20px" }}>
        <label className="switch" style={{ marginRight: "10px" }}>
          <input
            type="checkbox"
            checked={viewMode === "picture"}
            onChange={handleToggle}
          />
          <span className="slider round"></span>
        </label>
        <span style={{ marginRight: "30px", fontSize: "16px" }}>
          {viewMode === "picture" ? "Picture View" : "Table View"}
        </span>
        <input
          type="text"
          placeholder="Search apples..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="content">
        {viewMode === "table" ? renderTableView() : renderPictureView()}
      </div>
    </div>
  );
}
