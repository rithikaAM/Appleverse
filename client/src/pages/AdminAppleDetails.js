// AdminAppleDetails.js
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "../styles/AdminAppleDetails.css";

function AdminAppleDetails() {
  const { id } = useParams();
  const [apple, setApple] = useState(null);
  // State to decide if we include images in the PDF
  const [includeImages, setIncludeImages] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5000/apples/${id}`)
      .then((res) => res.json())
      .then((data) => setApple(data))
      .catch((err) => console.error("Error fetching apple details:", err));
  }, [id]);

  // Convert an image URL to a standard 8-bit JPEG data URL for PDF embedding
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

      // 3) Build table data (only from entries that are non-empty and not "None")
      const tableColumn = ["Heading", "Detail"];
      const tableRows = [];
      Object.entries(apple)
        .filter(([_, value]) => {
          const displayValue = Array.isArray(value) ? value.join(", ") : value;
          return displayValue && displayValue !== "None";
        })
        .forEach(([key, value]) => {
          const displayValue = Array.isArray(value) ? value.join(", ") : value;
          tableRows.push([key.replace(/_/g, " "), displayValue]);
        });

      // 4) Render autoTable on the left with a margin for images on the right
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        margin: { left: 14, right: 80 },
        theme: "striped",
      });

      // 5) Embed images on the right if toggled on
      if (includeImages) {
        let imageX = pageWidth - 60; // near the right edge
        let imageY = 40; // match table's startY
        const imageW = 50;
        const imageH = 50;

        // Helper function to place images on the right
        async function addImageOnRight(imgUrl) {
          const jpegDataUrl = await convertToJpegDataUrl(imgUrl);

          // If we're near the bottom, add a new page
          if (imageY + imageH > pageHeight - 20) {
            doc.addPage();
            // Optionally redraw the header on the new page
            doc.setFontSize(20);
            doc.setFont("helvetica", "bold");
            doc.text("Appleverse", pageWidth / 2, 15, { align: "center" });

            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            doc.text("Apple Variety Details", 14, 30);

            imageY = 40;
          }

          doc.addImage(jpegDataUrl, "JPEG", imageX, imageY, imageW, imageH);
          imageY += imageH + 10;
        }

        if (apple.images && apple.images.length > 0) {
          for (const imageFile of apple.images) {
            try {
              const imageUrl = `http://localhost:5000/images/${imageFile}`;
              await addImageOnRight(imageUrl);
            } catch (error) {
              console.error("Error embedding image in PDF:", error);
            }
          }
        } else {
          // If no images are present, embed a default image
          try {
            const defaultImageUrl = "http://localhost:5000/images/default-apple.jpg";
            await addImageOnRight(defaultImageUrl);
          } catch (error) {
            console.error("Error embedding default image in PDF:", error);
          }
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

  return (
    <div className="admin-details-container">
      <h2>{apple.cultivar_name || "Unknown"} - Apple Details</h2>

      {/* Display images */}
      {apple.images && apple.images.length > 0 ? (
        <div className="admin-details-images">
          {apple.images.map((imgFile, index) => (
            <img
              key={index}
              src={`http://localhost:5000/images/${imgFile}`}
              alt={apple.cultivar_name}
              className="admin-details-image"
            />
          ))}
        </div>
      ) : (
        <div className="admin-details-images">
          <img
            src="http://localhost:5000/images/default-apple.jpg"
            alt="Default Apple"
            className="admin-details-image"
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
          {Object.entries(apple)
            .filter(([_, value]) => {
              const displayValue = Array.isArray(value) ? value.join(", ") : value;
              return displayValue && displayValue !== "None";
            })
            .map(([key, value]) => {
              const displayValue = Array.isArray(value) ? value.join(", ") : value;
              return (
                <tr key={key}>
                  <td className="heading-col">{key.replace(/_/g, " ")}</td>
                  <td className="detail-col">{displayValue}</td>
                </tr>
              );
            })}
        </tbody>
      </table>

      {/* Left-aligned toggle + button container */}
      <div className="admin-details-bottom">
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

export default AdminAppleDetails;
