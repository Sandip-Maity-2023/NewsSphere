import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faTwitter,
  faInstagram,
  faLinkedin,
} from "@fortawesome/free-brands-svg-icons";

function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "#f8f9fa",
        padding: "20px 10px",
        textAlign: "center",
        borderTop: "1px solid #ddd",
        marginTop: "40px",
      }}
    >
      <h3 style={{ margin: 0, color: "#333" }}>
        <span style={{ color: "blue" }}>N</span>ews
        <span style={{ color: "blue" }}>S</span>phere
      </h3>

      <p style={{ color: "#555", fontSize: "0.9rem", marginTop: "5px" }}>
        Stay updated with the latest headlines around the world 🌍
      </p>

      {/* Social Links */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          margin: "15px 0",
        }}
      >
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#3b5998" }}
        >
          <FontAwesomeIcon icon={faFacebook} size="lg" />
        </a>
        <a
          href="https://twitter.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#00acee" }}
        >
          <FontAwesomeIcon icon={faTwitter} size="lg" />
        </a>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#C13584" }}
        >
          <FontAwesomeIcon icon={faInstagram} size="lg" />
        </a>
        <a
          href="https://linkedin.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#0e76a8" }}
        >
          <FontAwesomeIcon icon={faLinkedin} size="lg" />
        </a>
      </div>

      <p
        style={{
          fontSize: "0.85rem",
          color: "#777",
          marginTop: "10px",
        }}
      >
        © {new Date().getFullYear()} NewsSphere. All rights reserved.
      </p>
    </footer>
  );
}

export default Footer;
