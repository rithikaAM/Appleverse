// AdminContact.js
import React, { useState, useEffect } from "react";
import "../styles/AdminContact.css";

const AdminContact = () => {
  const [contactData, setContactData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/contact-data")
      .then((res) => res.json())
      .then((data) => setContactData(data))
      .catch((err) => console.error("Error fetching contact data:", err));
  }, []);

  // Save changes to server
  const handleSave = async () => {
    try {
      const response = await fetch("http://localhost:5000/contact-data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactData),
      });
      const updatedDoc = await response.json();
      setContactData(updatedDoc);
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving contact data:", err);
    }
  };

  if (!contactData) {
    return <p>Loading contact data...</p>;
  }

  const { hero, infoBoxes } = contactData; 
  // Removed references to 'footer' since we no longer show a footer

  return (
    <div className="admin-contact-container">
      <div className="admin-contact-content">
        {/* Edit / Save Toggle */}
        <div className="edit-buttons" style={{ textAlign: "right", margin: "10px" }}>
          {isEditing ? (
            <button onClick={handleSave}>Save Changes</button>
          ) : (
            <button onClick={() => setIsEditing(true)}>Edit Page</button>
          )}
        </div>

        {/* Hero Section */}
        <div className="hero">
          {isEditing ? (
            <>
              <input
                type="text"
                value={hero.title}
                onChange={(e) =>
                  setContactData({
                    ...contactData,
                    hero: { ...hero, title: e.target.value },
                  })
                }
              />
              <textarea
                value={hero.subtitle}
                onChange={(e) =>
                  setContactData({
                    ...contactData,
                    hero: { ...hero, subtitle: e.target.value },
                  })
                }
              />
            </>
          ) : (
            <>
              <h1>{hero.title}</h1>
              <p>{hero.subtitle}</p>
            </>
          )}
        </div>

        {/* Info Boxes */}
        <div className="info-boxes">
          <div className="info-box green">
            <h3>About</h3>
            {isEditing ? (
              <textarea
                value={infoBoxes.about}
                onChange={(e) =>
                  setContactData({
                    ...contactData,
                    infoBoxes: { ...infoBoxes, about: e.target.value },
                  })
                }
              />
            ) : (
              <p>{infoBoxes.about}</p>
            )}
          </div>
          <div className="info-box yellow">
            <h3>Contact</h3>
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={infoBoxes.contact.phone}
                  onChange={(e) =>
                    setContactData({
                      ...contactData,
                      infoBoxes: {
                        ...infoBoxes,
                        contact: {
                          ...infoBoxes.contact,
                          phone: e.target.value,
                        },
                      },
                    })
                  }
                />
                <input
                  type="email"
                  value={infoBoxes.contact.email}
                  onChange={(e) =>
                    setContactData({
                      ...contactData,
                      infoBoxes: {
                        ...infoBoxes,
                        contact: {
                          ...infoBoxes.contact,
                          email: e.target.value,
                        },
                      },
                    })
                  }
                />
                <input
                  type="text"
                  value={infoBoxes.contact.hours}
                  onChange={(e) =>
                    setContactData({
                      ...contactData,
                      infoBoxes: {
                        ...infoBoxes,
                        contact: {
                          ...infoBoxes.contact,
                          hours: e.target.value,
                        },
                      },
                    })
                  }
                />
              </>
            ) : (
              <>
                <p>{infoBoxes.contact.phone}</p>
                <p>{infoBoxes.contact.email}</p>
                <p>{infoBoxes.contact.hours}</p>
              </>
            )}
          </div>
          <div className="info-box orange">
            <h3>Address</h3>
            {isEditing ? (
              <input
                type="text"
                value={infoBoxes.address}
                onChange={(e) =>
                  setContactData({
                    ...contactData,
                    infoBoxes: { ...infoBoxes, address: e.target.value },
                  })
                }
              />
            ) : (
              <p>{infoBoxes.address}</p>
            )}
          </div>
        </div>

        {/* Single Map Section */}
        <div className="contact-content">
          <div className="contact-map">
            <iframe
              title="map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2923.5014293775765!2d-83.03595312342308!3d42.316290143702245!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882b34da2f466b33%3A0x38e80f113c68a17c!2s300%20Ouellette%20Ave%2C%20Windsor%2C%20ON%20N9A%201A5%2C%20Canada!5e0!3m2!1sen!2sus!4v1690605071963!5m2!1sen!2sus"
              width="100%"
              height="300"
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminContact;
