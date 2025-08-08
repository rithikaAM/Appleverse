import React from "react";
import "../styles/FilterPanel.css";

export default function FilterPanel({ filters, setFilters, options, handleReset }) {
  // Generic change handler for dropdowns
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="filter-panel">
      <h3>Filters</h3>

      {/* ACNO */}
      <div className="filter-row">
        <label>ACNO:</label>
        <select name="acno" value={filters.acno} onChange={handleChange}>
          <option value="">All</option>
          {options.acnoOptions.map((val) => (
            <option key={val} value={val}>
              {val}
            </option>
          ))}
        </select>
      </div>

      {/* Accession */}
      <div className="filter-row">
        <label>Accession:</label>
        <select name="accession" value={filters.accession} onChange={handleChange}>
          <option value="">All</option>
          {options.accessionOptions.map((val) => (
            <option key={val} value={val}>
              {val}
            </option>
          ))}
        </select>
      </div>

      {/* Origin Country */}
      <div className="filter-row">
        <label>Origin Country:</label>
        <select
          name="originCountry"
          value={filters.originCountry}
          onChange={handleChange}
        >
          <option value="">All</option>
          {options.originCountryOptions.map((val) => (
            <option key={val} value={val}>
              {val}
            </option>
          ))}
        </select>
      </div>

      {/* Origin Province */}
      <div className="filter-row">
        <label>Origin Province:</label>
        <select
          name="originProvince"
          value={filters.originProvince}
          onChange={handleChange}
        >
          <option value="">All</option>
          {options.originProvinceOptions.map((val) => (
            <option key={val} value={val}>
              {val}
            </option>
          ))}
        </select>
      </div>

      {/* Origin City */}
      <div className="filter-row">
        <label>Origin City:</label>
        <select
          name="originCity"
          value={filters.originCity}
          onChange={handleChange}
        >
          <option value="">All</option>
          {options.originCityOptions.map((val) => (
            <option key={val} value={val}>
              {val}
            </option>
          ))}
        </select>
      </div>

      {/* E Pedigree */}
      <div className="filter-row">
        <label>E Pedigree:</label>
        <select
          name="ePedigree"
          value={filters.ePedigree}
          onChange={handleChange}
        >
          <option value="">All</option>
          {options.ePedigreeOptions.map((val) => (
            <option key={val} value={val}>
              {val}
            </option>
          ))}
        </select>
      </div>

      {/* E Genus */}
      <div className="filter-row">
        <label>E Genus:</label>
        <select name="eGenus" value={filters.eGenus} onChange={handleChange}>
          <option value="">All</option>
          {options.eGenusOptions.map((val) => (
            <option key={val} value={val}>
              {val}
            </option>
          ))}
        </select>
      </div>

      {/* E Species */}
      <div className="filter-row">
        <label>E Species:</label>
        <select name="eSpecies" value={filters.eSpecies} onChange={handleChange}>
          <option value="">All</option>
          {options.eSpeciesOptions.map((val) => (
            <option key={val} value={val}>
              {val}
            </option>
          ))}
        </select>
      </div>

      {/* RESET BUTTON */}
      <button className="reset-button" onClick={handleReset}>
        Reset All
      </button>
    </div>
  );
}
