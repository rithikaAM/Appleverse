import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import FilterPanel from "../components/FilterPanel";
import "../styles/Products.css";

function Products() {
  const [apples, setApples] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("table"); // "table" or "picture"
  const navigate = useNavigate();

  // Single state object for all advanced filters
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

  // ML recommendation state
  const [recommendations, setRecommendations] = useState(null);

  // Fetch apples on mount
  useEffect(() => {
    axios
      .get("http://localhost:5000/apples")
      .then((response) => {
        setApples(response.data);
      })
      .catch((error) => console.error("Error fetching apples:", error));
  }, []);

  // Helper: Get unique, sorted values for a given field
  const getUniqueValues = (arr, field) => {
    const setVals = new Set();
    arr.forEach((item) => {
      const val = (item[field] || "").trim();
      if (val) setVals.add(val);
    });
    return Array.from(setVals).sort();
  };

  // Filtering logic: Basic text search + advanced exact-match filters
  const filteredApples = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    return apples.filter((apple) => {
      // Basic text search across all fields
      const searchMatch = Object.keys(apple).some((key) =>
        (apple[key] + "").toLowerCase().includes(lowerSearch)
      );
      if (!searchMatch) return false;

      // Advanced dropdown filters (exact match)
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
      if (
        filters.eGenus &&
        (apple["e genus"] || "").trim() !== filters.eGenus
      )
        return false;
      if (
        filters.eSpecies &&
        (apple["e species"] || "").trim() !== filters.eSpecies
      )
        return false;

      return true;
    });
  }, [apples, searchTerm, filters]);

  // Cascading dropdown options (using same logic as Home.js)
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

  // Fetch ML recommendations with debouncing (if searchTerm has at least 3 characters)
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

  // Exclude ML recommendation results from normal search to avoid duplicates
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

  // Toggle view between table and picture
  const handleToggle = () => {
    setViewMode((prev) => (prev === "table" ? "picture" : "table"));
  };

  // Define columns for table view
  const columns = [
    { key: "acno", label: "ACNO" },
    { key: "accession", label: "Accession" },
    { key: "cultivar_name", label: "Cultivar Name" },
    { key: "e origin country", label: "E Origin Country" },
    { key: "e origin province", label: "E Origin Province" },
    { key: "e origin city", label: "E Origin City" },
    { key: "e pedigree", label: "E Pedigree" },
    { key: "e genus", label: "E Genus" },
    { key: "e species", label: "E Species" },
  ];

  // Table view layout including ML recommendations
  const renderTableLayout = () => (
    <div className="summary-table-container" style={{ width: "75%", margin: "0 auto" }}>
      <table className="summary-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {recommendations && recommendations["Main Result"] && (
            <>
              <tr className="ml-header">
                <td colSpan={columns.length} style={{ textAlign: "center", fontWeight: "bold" }}>
                  Result
                </td>
              </tr>
              <tr
                className="ml-main-row"
                onClick={() => navigate(`/apple/${recommendations["Main Result"]._id}`)}
              >
                {columns.map((col) => (
                  <td key={col.key}>
                    {recommendations["Main Result"][col.key] || "None"}
                  </td>
                ))}
              </tr>
              {recommendations["Similar Results"]?.length > 0 && (
                <>
                  <tr className="ml-header">
                    <td colSpan={columns.length} style={{ textAlign: "center", fontWeight: "bold" }}>
                      You might also like
                    </td>
                  </tr>
                  {recommendations["Similar Results"].map((item) => (
                    <tr
                      key={item._id}
                      className="ml-similar-row"
                      onClick={() => navigate(`/apple/${item._id}`)}
                    >
                      {columns.map((col) => (
                        <td key={col.key}>
                          {item[col.key] || "None"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              )}
              <tr className="other-header">
                <td colSpan={columns.length} style={{ textAlign: "center", fontWeight: "bold" }}>
                  Other Results
                </td>
              </tr>
            </>
          )}
          {remainingResults.map((apple) => (
            <tr key={apple._id} onClick={() => navigate(`/apple/${apple._id}`)}>
              {columns.map((col) => (
                <td key={col.key}>{apple[col.key] || "None"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Picture view layout including ML recommendations
  const renderPictureLayout = () => {
    const renderCard = (apple, extraClass = "") => (
      <div
        key={apple._id}
        className={`apple-card ${extraClass}`}
        onClick={() => navigate(`/apple/${apple._id}`)}
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
        <h3>{apple.cultivar_name || "Unknown"}</h3>
        <p>Accession: {apple.accession || "None"}</p>
      </div>
    );

    return (
      <div className="picture-layout">
        {recommendations && recommendations["Main Result"] ? (
          <div className="main-result-section">
            <h3>Result</h3>
            <div className="results-grid">
              {renderCard(recommendations["Main Result"], "ml-main-card")}
            </div>
          </div>
        ) : (
          <div className="main-result-section">
            <h3>Result</h3>
            <div className="results-grid">
              {filteredApples.map((apple) => renderCard(apple))}
            </div>
          </div>
        )}
        {recommendations?.["Similar Results"]?.length > 0 ? (
          <div className="similar-section">
            <h3>You might also like</h3>
            <div className="similar-grid">
              {recommendations["Similar Results"].map((item) =>
                renderCard(item, "ml-similar-card")
              )}
            </div>
          </div>
        ) : (
          <div className="similar-section">
            <h3>You might also like</h3>
            <p style={{ textAlign: "center", marginTop: "20px" }}>
              No similar recommendations
            </p>
          </div>
        )}
        <div className="other-section">
          <h3>Other Results</h3>
          <div className="other-grid">
            {remainingResults.map((apple) => renderCard(apple))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="products-container">
      <FilterPanel
        filters={filters}
        setFilters={setFilters}
        options={filterOptions}
        handleReset={handleReset}
      />
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
        {viewMode === "table" ? renderTableLayout() : renderPictureLayout()}
      </div>
    </div>
  );
}

export default Products;
