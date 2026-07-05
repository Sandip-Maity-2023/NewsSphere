import React from "react";

// Anchor Button Component
const AnchorButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      style={{
        position: "fixed",
        right: "25px",
        bottom: "230px",
        width: "70px",
        height: "70px",
        borderRadius: "50%",
        backgroundColor: "#ff9800",
        border: "none",
        cursor: "pointer",
        boxShadow: "0px 8px 18px rgba(0,0,0,0.25)",
        zIndex: 9999,
        transition: "0.3s",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = "scale(1.2)";
        e.target.style.boxShadow = "0px 12px 25px rgba(0,0,0,0.35)";
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = "scale(1)";
        e.target.style.boxShadow = "0px 8px 18px rgba(0,0,0,0.25)";
      }}
    >
      🎙️
    </button>
    
  );
};

export default AnchorButton;
