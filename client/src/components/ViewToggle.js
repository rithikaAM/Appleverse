// ViewToggle.js
import React from "react";

function ViewToggle({ viewMode, setViewMode }) {
  // If we’re in "picture" mode, the button says "To list view", etc.
  const toggleLabel = viewMode === "picture" ? "To list view" : "To picture view";

  const handleToggle = () => {
    // Toggle between "picture" and "details"
    setViewMode(viewMode === "picture" ? "details" : "picture");
  };

  return (
    <button onClick={handleToggle} style={{ marginBottom: "10px" }}>
      {toggleLabel}
    </button>
  );
}

export default ViewToggle;
