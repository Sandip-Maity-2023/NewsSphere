import React from "react";

// Simple NLP Bias Analyzer (Static Logic)
const analyzeBias = (title = "", description = "") => {
  const text = (title + " " + description).toLowerCase();

  const positiveWords = ["growth", "success", "win", "improved","victory","benefit","progress","achievement","opportunity","innovation","advancement","breakthrough","stability","peace","health","education"];
  const negativeWords = ["crime", "terror", "attack", "crisis", "fail","loss", "decline","scandal","corruption","disaster","fraud","poverty","unemployment","pollution","war","inflation","recession"];
  const politicalWords = ["election", "government", "policy", "minister", "senate","congress","parliament","diplomacy","legislation","campaign","vote","democracy","autocracy","bureaucracy","federal","state","municipal"];

  let score = 0;

  positiveWords.forEach((w) => text.includes(w) && (score += 1));
  negativeWords.forEach((w) => text.includes(w) && (score -= 1));

  const isPolitical = politicalWords.some((w) => text.includes(w));

  return {
    sentiment: score > 0 ? "Positive" : score < 0 ? "Negative" : "Neutral",
    category: isPolitical ? "Political" : "General",
  };
};

const Card = ({ data = [] }) => {

  const readMore = (url) => {
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  if (!data.length) {
    return (
      <div style={{ textAlign: "center", marginTop: "2rem", color: "#555" }}>
        <h3>No articles found 📰</h3>
      </div>
    );
  }

  return (
    <div
      className="cardContainer"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "20px",
        padding: "20px",
      }}
    >
      {data.map((item, index) => {
        if (!item.urlToImage) return null;

        const bias = analyzeBias(item.title, item.description);

        return (
          <div
            key={index}
            className="card"
            style={{
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              background: "#fff",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              display: "flex",
              flexDirection: "column",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow =
                "0 6px 16px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow =
                "0 4px 10px rgba(0,0,0,0.1)";
            }}
          >
            {/* IMAGE */}
            <img
              src={item.urlToImage}
              alt={item.title || "News image"}
              style={{
                width: "100%",
                height: "180px",
                objectFit: "cover",
                borderBottom: "1px solid #eee",
              }}
              onError={(e) =>
                (e.target.src =
                  "https://via.placeholder.com/400x200?text=No+Image")
              }
            />

            {/* BODY */}
            <div style={{ padding: "15px", flex: 1 }}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="title"
                style={{
                  fontSize: "1rem",
                  fontWeight: "600",
                  color: "#1a1a1a",
                  textDecoration: "none",
                  lineHeight: "1.3",
                  display: "block",
                  marginBottom: "10px",
                }}
              >
                {item.title}
              </a>

              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#555",
                  marginBottom: "15px",
                  lineHeight: "1.5",
                }}
              >
                {item.description
                  ? item.description.slice(0, 150) + "..."
                  : "No description available."}
              </p>


              {/* ⭐ NEW — NLP / BIAS SECTION */}
              <div
                style={{
                  background: "#f5f7ff",
                  padding: "10px",
                  borderRadius: "8px",
                  marginBottom: "15px",
                }}
              >
                <strong style={{ fontSize: "0.9rem" }}>🧠 NLP Analysis</strong>
                <p style={{ margin: "5px 0", fontSize: "0.95rem" }}>
                  <strong>Sentiment:</strong>{" "}
                  <span
                    style={{
                      color:
                        bias.sentiment === "Positive"
                          ? "green"
                          : bias.sentiment === "Negative"
                          ? "red"
                          : "gray",
                      fontWeight: "600",
                    }}
                  >
                    {bias.sentiment}
                  </span>
                </p>
                
                <p style={{ margin: "5px 0", fontSize: "0.85rem" }}>
                  <strong>Category:</strong> {bias.category}
                </p>
              </div>

              {/* Button */}
              <button
                onClick={() => readMore(item.url)}
                style={{
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "background 0.3s",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#0056b3")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "#007bff")
                }
              >
                Explore More
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Card;
