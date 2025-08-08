// ContactContext.js
import React, { createContext, useState } from "react";

const ContactContext = createContext();

export const ContactProvider = ({ children }) => {
  const [contactContent, setContactContent] = useState({
    hero: {
      title: "Contact",
      subtitle: "Straight from the Orchard - Your Guide to Apple Varieties",
    },
    infoBoxes: {
      about:
        "Lorem Ipsum is simply free text used by copywriting refining. Neque porro est qui.",
      contact: {
        phone: "📞 +1 (240) 333-0079",
        email: "📧 support@appleverse.com",
        hours: "🕒 Mon - Fri: 7:00 AM - 6:00 PM",
      },
      address: "📍 University of Windsor, Sunset Avenue",
    },
    footer: {
      left: {
        title: "Appleverse",
        description:
          "There are many variations of apples. Welcome to the world of apples!",
      },
      center: {
        explore: ["🏠 Home", "📖 About", "📞 Contact", "🔑 Admin Login"],
      },
      right: {
        contact: {
          phone: "📞 666 888 0000",
          email: "📧 reach@applecompany.com",
          address: "📍 Brooklyn, Golden Street, New York, USA",
        },
      },
    },
  });

  return (
    <ContactContext.Provider value={{ contactContent, setContactContent }}>
      {children}
    </ContactContext.Provider>
  );
};

export default ContactContext;
