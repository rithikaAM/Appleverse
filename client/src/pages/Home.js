import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import FilterPanel from "../components/FilterPanel";
import "../styles/Home.css";

export default function Home() {
  const [apples, setApples] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("table");
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

  useEffect(() => {
    axios
      .get("http://localhost:5000/apples")
      .then((res) => setApples(res.data))
      .catch((err) => console.error("Error:", err));
  }, []);

  const getUniqueValues = (arr, field) => {
    const values = new Set();
    arr.forEach((item) => {
      const val = (item[field] || "").trim();
      if (val) values.add(val);
    });
    return [...values].sort();
  };

  const columns = useMemo(() => [
    { key: "acno", label: "ACNO" },
    { key: "accession", label: "Accession" },
    { key: "cultivar_name", label: "Cultivar Name" },
    { key: "e origin country", label: "E Origin Country" },
    { key: "e origin province", label: "E Origin Province" },
    { key: "e origin city", label: "E Origin City" },
    { key: "e pedigree", label: "E Pedigree" },
    { key: "e genus", label: "E Genus" },
    { key: "e species", label: "E Species" },
  ], []);

  const filteredApples = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    return apples.filter((apple) => {
      const matchesSearch = columns.some((col) =>
        (apple[col.key] || "").toLowerCase().includes(lowerSearch)
      );
      if (!matchesSearch) return false;

      if (filters.acno && apple.acno !== filters.acno) return false;
      if (filters.accession && apple.accession !== filters.accession) return false;
      if (filters.originCountry && (apple["e origin country"] || "").trim() !== filters.originCountry) return false;
      if (filters.originProvince && (apple["e origin province"] || "").trim() !== filters.originProvince) return false;
      if (filters.originCity && (apple["e origin city"] || "").trim() !== filters.originCity) return false;
      if (filters.ePedigree && (apple["e pedigree"] || "").trim() !== filters.ePedigree) return false;
      if (filters.eGenus && (apple["e genus"] || "").trim() !== filters.eGenus) return false;
      if (filters.eSpecies && (apple["e species"] || "").trim() !== filters.eSpecies) return false;

      return true;
    });
  }, [apples, columns, searchTerm, filters]);

  const filterOptions = {
    acnoOptions: getUniqueValues(filteredApples, "acno"),
    accessionOptions: getUniqueValues(filteredApples, "accession"),
    originCountryOptions: getUniqueValues(filteredApples, "e origin country"),
    originProvinceOptions: getUniqueValues(filteredApples, "e origin province"),
    originCityOptions: getUniqueValues(filteredApples, "e origin city"),
    ePedigreeOptions: getUniqueValues(filteredApples, "e pedigree"),
    eGenusOptions: getUniqueValues(filteredApples, "e genus"),
    eSpeciesOptions: getUniqueValues(filteredApples, "e species"),
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

  useEffect(() => {
    const trimmed = searchTerm.trim();
    if (trimmed.length < 3) {
      setRecommendations(null);
      return;
    }
    const timeout = setTimeout(() => {
      axios
        .get("http://localhost:5001/recommend", { params: { query: trimmed } })
        .then((res) => setRecommendations(res.data))
        .catch(() => setRecommendations(null));
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const handleRowClick = (id) => navigate(`/apple/${id}`);
  const handleToggle = () => setViewMode(viewMode === "table" ? "picture" : "table");

  const mlMainId = recommendations?.["Main Result"]?._id || null;
  const mlSimilarIds = recommendations?.["Similar Results"]?.map((item) => item._id) || [];

  const remainingResults = filteredApples.filter((apple) => {
    if (mlMainId && apple._id === mlMainId) return false;
    if (mlSimilarIds.includes(apple._id)) return false;
    return true;
  });

  const renderPictureView = () => {
    const renderCard = (apple, extraClass = "") => (
      <div
        key={apple._id}
        className={`apple-card ${extraClass}`}
        onClick={() => navigate(`/apple/${apple._id}`)}
      >
        <img
          src={apple.images?.length ? `http://localhost:5000/images/${apple.images[0]}` : "http://localhost:5000/images/default-apple.jpg"}
          alt={apple.cultivar_name}
        />
        <h3>{apple.cultivar_name || "Unknown"}</h3>
        <p>Accession: {apple.accession || "None"}</p>
      </div>
    );

    return (
      <div className="picture-layout">
        <div className="main-result-section">
          <h3>Result</h3>
          <div className="results-grid">
            {recommendations?.["Main Result"]
              ? renderCard(recommendations["Main Result"], "ml-main-card")
              : filteredApples.map((apple) => renderCard(apple))}
          </div>
        </div>

        <div className="similar-section">
          <h3>You might also like</h3>
          <div className="similar-grid">
            {recommendations?.["Similar Results"]?.length
              ? recommendations["Similar Results"].map((item) => renderCard(item, "ml-similar-card"))
              : <p style={{ textAlign: "center", width: "100%" }}>No similar recommendations</p>}
          </div>
        </div>

        <div className="other-section">
          <h3>Other Results</h3>
          <div className="other-grid">
            {remainingResults.map((apple) => renderCard(apple))}
          </div>
        </div>
      </div>
    );
  };

  const renderTableView = () => (
    <div style={{ width: "75%", margin: "0 auto" }}>
      <table className="summary-table">
        <thead>
          <tr>{columns.map((col) => <th key={col.key}>{col.label}</th>)}</tr>
        </thead>
        <tbody>
          {recommendations?.["Main Result"] && (
            <>
              <tr className="ml-header">
                <td colSpan={columns.length} style={{ textAlign: "center" }}>Result</td>
              </tr>
              <tr className="ml-main-row" onClick={() => handleRowClick(recommendations["Main Result"]._id)}>
                {columns.map((col) => <td key={col.key}>{recommendations["Main Result"][col.key] || "None"}</td>)}
              </tr>
              {recommendations["Similar Results"]?.length > 0 && (
                <>
                  <tr className="ml-header">
                    <td colSpan={columns.length} style={{ textAlign: "center" }}>You might also like</td>
                  </tr>
                  {recommendations["Similar Results"].map((item) => (
                    <tr key={item._id} className="ml-similar-row" onClick={() => handleRowClick(item._id)}>
                      {columns.map((col) => <td key={col.key}>{item[col.key] || "None"}</td>)}
                    </tr>
                  ))}
                </>
              )}
              <tr className="other-header">
                <td colSpan={columns.length} style={{ textAlign: "center" }}>Other Results</td>
              </tr>
            </>
          )}
          {remainingResults.map((apple) => (
            <tr key={apple._id} onClick={() => handleRowClick(apple._id)}>
              {columns.map((col) => <td key={col.key}>{apple[col.key] || "None"}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="home-container">
      <div className="hero">
        <h1>Apple Encyclopedia</h1>
        <p>Straight from the Orchard - Your Guide to Apple Varieties</p>
      </div>

      <FilterPanel
        filters={filters}
        setFilters={setFilters}
        options={filterOptions}
        handleReset={handleReset}
      />

      <div className="search-container">
        <label className="switch">
          <input
            type="checkbox"
            checked={viewMode === "picture"}
            onChange={handleToggle}
          />
          <span className="slider round" />
        </label>
        <span style={{ fontSize: "16px", marginRight: "10px" }}>
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
