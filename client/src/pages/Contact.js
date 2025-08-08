// Contact.js
import React, { useState, useEffect } from "react";
import "./Contact.css";

const Contact = () => {
  const [contactData, setContactData] = useState(null);

  // Fetch contact data from server on mount (if DB-driven)
  useEffect(() => {
    fetch("http://localhost:5000/contact-data")
      .then((res) => res.json())
      .then((data) => setContactData(data))
      .catch((err) => console.error("Error fetching contact data:", err));
  }, []);

  if (!contactData) {
    return <p>Loading contact data...</p>;
  }

  const { hero, infoBoxes } = contactData; 
  // Note: We removed references to 'footer' since we don't show it anymore

  return (
    <div className="contact-container">
      {/* Hero Section */}
      <div className="hero">
        <h1>{hero.title}</h1>
        <p>{hero.subtitle}</p>
      </div>

      {/* Info Boxes */}
      <div className="info-boxes">
        <div className="info-box green">
          <h3>About</h3>
          <p>{infoBoxes.about}</p>
        </div>
        <div className="info-box yellow">
          <h3>Contact</h3>
          <p>{infoBoxes.contact.phone}</p>
          <p>{infoBoxes.contact.email}</p>
          <p>{infoBoxes.contact.hours}</p>
        </div>
        <div className="info-box orange">
          <h3>Address</h3>
          <p>{infoBoxes.address}</p>
        </div>
      </div>

      {/* Map Section */}
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
  );
};

export default Contact;
