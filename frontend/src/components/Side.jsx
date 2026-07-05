

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faHome,
  faClock,
  faDownload,
  faThumbsUp,
  faVideo,
  faList,
} from "@fortawesome/free-solid-svg-icons";
import Profile from "./Profile";


const Sidebar = ({ onToggle }) => {
  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    const newState = !open;
    setOpen(newState);
    if (onToggle) onToggle(newState);
  };

  const menuItems = [
    { label: "Home", icon: faHome, link: "https://drive.google.com/drive/folders/17wygf1b3YJI3w4NnX88N_pgNHqYPrW88?usp=drive_link" },
    { label: "Shorts", icon: faVideo, link: "https://drive.google.com/drive/folders/17wygf1b3YJI3w4NnX88N_pgNHqYPrW88?usp=drive_link" },
    { label: "History", icon: faList, link: "https://drive.google.com/drive/folders/17wygf1b3YJI3w4NnX88N_pgNHqYPrW88?usp=drive_link" },
    { label: "Downloads", icon: faClock, link: "https://drive.google.com/drive/folders/17wygf1b3YJI3w4NnX88N_pgNHqYPrW88?usp=drive_link" },
    { label: "Saved", icon: faDownload, link: "https://drive.google.com/drive/folders/17wygf1b3YJI3w4NnX88N_pgNHqYPrW88?usp=drive_link" },
    { label: "Liked", icon: faThumbsUp, link: "https://drive.google.com/drive/folders/17wygf1b3YJI3w4NnX88N_pgNHqYPrW88?usp=drive_link" },
    
  ];

  return (
    <>
      {/* 🔹 Fixed Top Navbar (Always Visible) */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "60px",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          background: "#fff",
          borderBottom: "1px solid #ddd",
          borderRadius: "0 0 12px 12px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          zIndex: 1200,
          justifyContent: "flex-start",
          gap: "10px",
        }}
      >
        {/* Hamburger Icon */}
        <FontAwesomeIcon
          icon={faBars}
          size="lg"
          style={{
            cursor: "pointer",
            color: open ? "blue" : "black",
            transition: "color 0.3s",
          }}
          onClick={handleToggle}
        />
        <h2 style={{ margin: 0, fontWeight: 600 }}>
          <span style={{ color: "blue" }}>N</span>ews
          <span style={{ color: "blue" }}>S</span>phere
        </h2>
      </nav>

      {/* 🔹 Sidebar Drawer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: open ? 0 : "-220px",
          width: "200px",
          height: "100vh",
          backgroundColor: "#fff",
          boxShadow: open ? "2px 0 10px rgba(0,0,0,0.3)" : "none",
          transition: "left 0.3s ease-in-out",
          zIndex: 1100,
          padding: "80px 15px 20px 15px", // padding top so menu isn't under navbar
          borderRight: "1px solid #eee",
        }}
      >
        <h3 style={{ marginBottom: "15px", color: "#333" }}>Menu</h3>
      
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {menuItems.map((item) => (
            <li
              key={item.label}
              style={{
                margin: "10px 0",
                borderRadius: "8px",
                padding: "8px 10px",
                transition: "background 0.3s",
              }}
            >
              <a
                href={item.link}
                style={{
                  textDecoration: "none",
                  color: "#333",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <FontAwesomeIcon icon={item.icon} />
                <span>{item.label}</span>
              </a>
            </li>
            
          ))}
          <Profile/>
        </ul>
      </div>

      {/* 🔹 Overlay when sidebar is open */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.3)",
            zIndex: 1000,
          }}
        ></div>
      )}

    </>
  );
};

export default Sidebar;
