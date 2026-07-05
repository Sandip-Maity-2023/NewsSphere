import { useEffect, useState } from "react";
import Card from "./Card";
import Sidebar from "./Side";
import ChatbotButton from "./ChatbotButton";
import ChatbotWindow from "./ChatWindow";
import WeatherWidget from "./Weather";

const categories = [
  "sports",
  "politics",
  "entertainment",
  "health",
  "fitness",
  "technology",
];

const Newsapp = () => {
  const [search, setSearch] = useState("india");
  const [newsData, setNewsData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);

  const apiKey = import.meta.env.VITE_NEWS_API_KEY;

  const updateCategoryPreference = (category) => {
    const data = JSON.parse(localStorage.getItem("userPrefs")) || {
      categoriesViewed: {},
    };

    data.categoriesViewed[category] =
      (data.categoriesViewed[category] || 0) + 1;

    localStorage.setItem("userPrefs", JSON.stringify(data));
  };

  const getRecommendedArticles = (articles) => {
    const prefs = JSON.parse(localStorage.getItem("userPrefs"));

    if (!prefs || !prefs.categoriesViewed) return [];

    const topCategory = Object.entries(prefs.categoriesViewed).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0];

    if (!topCategory) return [];

    return articles.filter((article) =>
      `${article.title} ${article.description || ""}`
        .toLowerCase()
        .includes(topCategory.toLowerCase())
    );
  };

  const getData = async (query = search) => {
    if (!apiKey) {
      setError("Missing VITE_NEWS_API_KEY.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(
          query
        )}&language=en&pageSize=50&apiKey=${apiKey}`
      );
      const jsonData = await response.json();

      if (jsonData.status === "ok") {
        setNewsData(jsonData.articles || []);
        setError(null);
      } else {
        throw new Error(jsonData.message || "Failed to fetch news");
      }
    } catch (fetchError) {
      setError(fetchError.message);
      setNewsData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData("india");
  }, []);

  const handleCategoryClick = (category) => {
    setSearch(category);
    updateCategoryPreference(category);
    getData(category);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(31, 111, 235, 0.15), transparent 35%), linear-gradient(180deg, #f7faff 0%, #eef3fb 100%)",
        transition: "margin-left 0.3s ease",
        marginLeft: sidebarOpen ? "150px" : "0",
        padding: "80px 20px 32px",
      }}
    >
      <Sidebar onToggle={(open) => setSidebarOpen(open)} />

      <section
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(14px)",
          padding: "18px 20px",
          borderRadius: "18px",
          boxShadow: "0 12px 32px rgba(15, 23, 42, 0.08)",
          border: "1px solid rgba(148, 163, 184, 0.18)",
        }}
      >
        <div >
          <p style={{ margin: 0, color: "#64748b", fontWeight: 600 }}>
            Third-party news feed
          </p>
          <h2 style={{ margin: "4px 10px 0 5px", fontWeight: 800, color: "#0f172a" }}>
            Top Headlines
          </h2>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Search news..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{
              padding: "12px 14px",
              borderRadius: "12px",
              border: "1px solid #cbd5e1",
              outline: "none",
              minWidth: "240px",
              background: "#fff",
            }}
          />
          <button
            onClick={() => {
              updateCategoryPreference(search);
              getData(search);
            }}
            style={{
              padding: "12px 18px",
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: 700,
              boxShadow: "0 10px 22px rgba(37, 99, 235, 0.24)",
            }}
          >
            Search
          </button>
        </div>
      </section>

      <div
        style={{
          marginTop: "18px",
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          justifyContent: "center",
        }}
      >
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            style={{
              backgroundColor: search === category ? "#0f172a" : "#ffffff",
              color: search === category ? "#fff" : "#334155",
              border: "1px solid rgba(148, 163, 184, 0.28)",
              padding: "10px 16px",
              borderRadius: "999px",
              cursor: "pointer",
              fontWeight: 700,
              boxShadow: "0 8px 20px rgba(15, 23, 42, 0.06)",
            }}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ marginTop: "22px" }}>
        <WeatherWidget city="Delhi" />
      </div>

      <div style={{ marginTop: "28px" }}>
        {loading && (
          <p style={{ textAlign: "center", color: "#475569" }}>
            Loading news...
          </p>
        )}
        {error && (
          <p style={{ color: "#dc2626", textAlign: "center" }}>⚠️ {error}</p>
        )}
        {!loading && !error && newsData.length === 0 && (
          <p style={{ textAlign: "center", color: "#64748b" }}>
            No news found for "{search}".
          </p>
        )}

        {!loading && getRecommendedArticles(newsData).length > 0 && (
          <div style={{ marginBottom: "26px" }}>
            <h3 style={{ marginBottom: "12px", color: "#0f172a", fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif" }}>
              Recommendations
            </h3>
            <Card data={getRecommendedArticles(newsData)} />
          </div>
        )}

        {!loading && newsData.length > 0 && <Card data={newsData} />}

        {showChatbot && (
          <ChatbotWindow
            onClose={() => setShowChatbot(false)}
            newsData={newsData}
          />
        )}
        <ChatbotButton onClick={() => setShowChatbot(true)} />
      </div>
    </div>
  );
};

export default Newsapp;
