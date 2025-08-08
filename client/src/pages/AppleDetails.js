// AppleDetails.js
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "../styles/AppleDetails.css";

function AppleDetails() {
  const { id } = useParams();
  const [apple, setApple] = useState(null);
  const [includeImages, setIncludeImages] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5000/apples/${id}`)
      .then((res) => res.json())
      .then((data) => setApple(data))
      .catch((err) => console.error("Error fetching apple details:", err));
  }, [id]);

  // Utility: Convert an image URL to a JPEG data URL for PDF embedding
  const convertToJpegDataUrl = async (imageUrl) => {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(blob);
    });
  };

  const downloadPDF = async () => {
    if (!apple) return;
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // 1) Make "Appleverse" bigger, bold, and centered
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Appleverse", pageWidth / 2, 15, { align: "center" });

      // 2) Switch back to normal font, smaller size for the heading
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Apple Variety Details", 14, 30);

      // 3) Prepare table data for the details
      const tableColumn = ["Heading", "Detail"];
      const tableRows = [];
      Object.entries(apple)
        .filter(([_, value]) => {
          const displayVal = Array.isArray(value) ? value.join(", ") : value;
          return displayVal && displayVal !== "None";
        })
        .forEach(([key, value]) => {
          let displayVal = Array.isArray(value) ? value.join(", ") : value;
          tableRows.push([key.replace(/_/g, " "), displayVal]);
        });

      // 4) Render autoTable on the left side (with a right margin for images)
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        margin: { left: 14, right: 80 },
        theme: "striped",
      });

      // 5) Embed images on the right side if toggled on
      if (includeImages) {
        let imageX = pageWidth - 60; // near the right edge
        let imageY = 40; // start at the same Y as the table
        const imageW = 50;
        const imageH = 50;

        // Function to place images on the right side
        async function addImageOnRight(imageUrl) {
          const jpegDataUrl = await convertToJpegDataUrl(imageUrl);

          // If we’re near the bottom, add a new page
          if (imageY + imageH > pageHeight - 20) {
            doc.addPage();

            // Redraw the headers on the new page
            doc.setFontSize(20);
            doc.setFont("helvetica", "bold");
            doc.text("Appleverse", pageWidth / 2, 15, { align: "center" });

            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            doc.text("Apple Variety Details", 14, 30);

            imageY = 40; // reset for the new page
          }

          doc.addImage(jpegDataUrl, "JPEG", imageX, imageY, imageW, imageH);
          imageY += imageH + 10;
        }

        if (apple.images && apple.images.length > 0) {
          for (const imageFile of apple.images) {
            const imageUrl = `http://localhost:5000/images/${imageFile}`;
            await addImageOnRight(imageUrl);
          }
        } else {
          // Fallback if no images
          const defaultImageUrl = "http://localhost:5000/images/default-apple.jpg";
          await addImageOnRight(defaultImageUrl);
        }
      }

      // 6) Save the PDF
      const pdfFileName = apple.cultivar_name
        ? `${apple.cultivar_name}_Details.pdf`
        : "Apple_Details.pdf";
      doc.save(pdfFileName);
    } catch (err) {
      console.error("PDF Error:", err);
    }
  };

  if (!apple) {
    return <p>Loading apple details...</p>;
  }

  // Filter out "None" or empty fields from the table for on-page display
  const filteredEntries = Object.entries(apple).filter(([_, value]) => {
    const displayVal = Array.isArray(value) ? value.join(", ") : value;
    return displayVal && displayVal !== "None";
  });

  return (
    <div className="details-container">
      <h2>{apple.cultivar_name || "Unknown"} - Apple Details</h2>

      {/* Display images on the page */}
      {apple.images && apple.images.length > 0 ? (
        <div className="details-images">
          {apple.images.map((imgFile, index) => (
            <img
              key={index}
              src={`http://localhost:5000/images/${imgFile}`}
              alt={apple.cultivar_name}
              className="details-image"
            />
          ))}
        </div>
      ) : (
        <div className="details-images">
          <img
            src="http://localhost:5000/images/default-apple.jpg"
            alt="Default Apple"
            className="details-image"
          />
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th>Heading</th>
            <th>Detail</th>
          </tr>
        </thead>
        <tbody>
          {filteredEntries.map(([key, value]) => {
            const displayVal = Array.isArray(value) ? value.join(", ") : value;
            return (
              <tr key={key}>
                <td className="heading-col">{key.replace(/_/g, " ")}</td>
                <td className="detail-col">{displayVal}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Toggle for including images and PDF download button */}
      <div
        style={{
          marginTop: "20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "10px",
        }}
      >
        <div className="toggle-container">
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={includeImages}
              onChange={() => setIncludeImages(!includeImages)}
            />
            <span className="slider round"></span>
          </label>
          <span className="toggle-label">Include Images in PDF</span>
        </div>

        <button onClick={downloadPDF} className="download-btn">
          Download PDF
        </button>
      </div>
    </div>
  );
}

export default AppleDetails;
