// WeatherWidget.jsx
import { useState, useEffect } from "react";

const WeatherWidget = ({ city = "Delhi" }) => {
  const [expanded, setExpanded] = useState(false);
  const [weather, setWeather] = useState(null);

  const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

  const fetchWeather = async () => {
    try {
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${WEATHER_API_KEY}`
      );
      const weatherData = await weatherRes.json();

      const { lat, lon } = weatherData.coord;

      const aqiRes = await fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}`
      );
      const aqiData = await aqiRes.json();

      const timeRes = await fetch(
        "https://worldtimeapi.org/api/timezone/Asia/Kolkata"
      );
      const timeData = await timeRes.json();

      setWeather({
        temp: weatherData.main.temp,
        desc: weatherData.weather[0].description,
        aqi: aqiData.list[0].main.aqi,
        time: timeData.datetime,
      });
    } catch (err) {
      console.log("Weather fetch failed:", err);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

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
