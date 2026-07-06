import { userPreferences } from "../config/db.js";
import { sendDailyEmail } from "../services/newsService.js";

const fetchJson = async (url) => {
  const response = await fetch(url);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
};

export const getNews = async (req, res) => {
  try {
    const query = String(req.query.q || "india").trim() || "india";
    const apiKey = process.env.NEWS_KEY || process.env.NEWS_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "News API key is not configured." });
    }

    const url = new URL("https://newsapi.org/v2/everything");
    url.searchParams.set("q", query);
    url.searchParams.set("language", "en");
    url.searchParams.set("pageSize", "50");
    url.searchParams.set("apiKey", apiKey);

    const data = await fetchJson(url);
    res.json({
      status: data.status || "ok",
      articles: Array.isArray(data.articles) ? data.articles : [],
    });
  } catch (error) {
    res.status(502).json({ error: error.message || "Unable to fetch news." });
  }
};

export const getWeather = async (req, res) => {
  try {
    const city = String(req.query.city || "Delhi").trim() || "Delhi";
    const apiKey = process.env.WEATHER_API_KEY || process.env.OPENWEATHER_API_KEY || process.env.VITE_WEATHER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Weather API key is not configured." });
    }

    const weatherUrl = new URL("https://api.openweathermap.org/data/2.5/weather");
    weatherUrl.searchParams.set("q", city);
    weatherUrl.searchParams.set("units", "metric");
    weatherUrl.searchParams.set("appid", apiKey);

    const weatherData = await fetchJson(weatherUrl);
    const { lat, lon } = weatherData.coord || {};

    if (lat === undefined || lon === undefined) {
      return res.status(502).json({ error: "Weather location data is unavailable." });
    }

    const aqiUrl = new URL("https://api.openweathermap.org/data/2.5/air_pollution");
    aqiUrl.searchParams.set("lat", lat);
    aqiUrl.searchParams.set("lon", lon);
    aqiUrl.searchParams.set("appid", apiKey);

    const aqiData = await fetchJson(aqiUrl);

    res.json({
      temp: weatherData.main?.temp,
      desc: weatherData.weather?.[0]?.description || "Unavailable",
      aqi: aqiData.list?.[0]?.main?.aqi ?? null,
      time: new Date().toISOString(),
    });
  } catch (error) {
    res.status(502).json({ error: error.message || "Unable to fetch weather." });
  }
};

export const setupNewsEmail = async (req, res) => {
  try {
    const { userEmail, categories, sendTime } = req.body || {};
    if (!userEmail) return res.status(400).json({ error: "Missing email parameter." });

    userPreferences[userEmail] = { 
      categories: Array.isArray(categories) ? categories : [], 
      sendTime: String(sendTime || "08:00").trim() 
    };

    // Non-blocking trigger of the initial verification summary email
    sendDailyEmail(userEmail);

    res.json({ message: "Preferences saved! A news update is dispatching now." });
  } catch (err) {
    res.status(500).json({ error: "Error updating configuration preferences." });
  }
};
