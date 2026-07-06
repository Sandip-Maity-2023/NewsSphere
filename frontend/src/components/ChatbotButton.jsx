import React from "react";

const ChatbotButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      style={{
        position: "fixed",
        right: "19px",
        bottom: "120px",
        padding: "15px 20px",
        borderRadius: "30px",
        backgroundColor: "#007bff",
        color: "white",
        border: "none",
        cursor: "pointer",
        fontWeight: "600",
        boxShadow: "0px 4px 12px rgba(0,0,0,0.3)",
        zIndex: 9999,
      }}
    >
      💬 Chat with AI
    </button>
  );
  
};

export default ChatbotButton;
