// WeatherWidget.jsx
import { useCallback, useEffect, useState } from "react";

const rawApiBase = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const normalizeBase = (raw) => {
  const trimmed = String(raw || "").trim();
  if (!trimmed) return "http://localhost:8000";
  if (trimmed.startsWith(":")) return `http://localhost${trimmed}`;
  if (/^https?:\/\//i.test(trimmed)) return trimmed.replace(/\/$/, "");
  return `http://${trimmed.replace(/\/$/, "")}`;
};

const API_BASE = import.meta.env.PROD ? "" : normalizeBase(rawApiBase);

const WeatherWidget = ({ city = "Delhi" }) => {
  const [expanded, setExpanded] = useState(false);
  const [weather, setWeather] = useState(null);

  const fetchWeather = useCallback(async () => {
    try {
      const weatherRes = await fetch(
        `${API_BASE}/api/weather?city=${encodeURIComponent(city)}`
      );
      const weatherData = await weatherRes.json();

      if (!weatherRes.ok) {
        throw new Error(weatherData.error || "Weather fetch failed");
      }

      setWeather({
        temp: weatherData.temp,
        desc: weatherData.desc,
        aqi: weatherData.aqi,
        time: weatherData.time,
      });
    } catch (err) {
      console.log("Weather fetch failed:", err);
    }
  }, [city]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  if (!weather)
  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        width: 120,
        padding: 15,
        background: "#ffffffee",
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        zIndex: 9999
      }}
    >
      <p style={{ fontSize: "14px" }}>Loading...</p>
    </div>
  );


  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        width: expanded ? 250 : 120,
        padding: 15,
        background: "#ffffffee",
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        transition: "0.3s",
        zIndex: 9999,
      }}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          background: "#007bff",
          color: "white",
          border: "none",
          padding: "6px 10px",
          borderRadius: 8,
          cursor: "pointer",
          marginBottom: 10,
          width: "100%",
        }}
      >
        {expanded ? "Hide" : "Weather"}
      </button>

      {expanded && (
        <div>
          <h4 style={{ margin: "6px 0" }}>🌤 {city} Weather</h4>

          <p><b>Temperature:</b> {weather.temp}°C</p>
          <p><b>Condition:</b> {weather.desc}</p>
          <p><b>AQI:</b> {weather.aqi}</p>

          <p style={{ fontSize: "12px", marginTop: 10 }}>
            <b>Time:</b> {new Date(weather.time).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default WeatherWidget;
