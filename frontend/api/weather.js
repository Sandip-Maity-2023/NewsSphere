const fetchJson = async (url) => {
  const response = await fetch(url);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
};

export default async function handler(req, res) {
  try {
    const city = String(req.query.city || "Delhi").trim() || "Delhi";
    const apiKey = process.env.WEATHER_API_KEY || process.env.OPENWEATHER_API_KEY || process.env.VITE_WEATHER_API_KEY;

    if (!apiKey) {
      res.status(500).json({ error: "Weather API key is not configured." });
      return;
    }

    const weatherUrl = new URL("https://api.openweathermap.org/data/2.5/weather");
    weatherUrl.searchParams.set("q", city);
    weatherUrl.searchParams.set("units", "metric");
    weatherUrl.searchParams.set("appid", apiKey);

    const weatherData = await fetchJson(weatherUrl);
    const { lat, lon } = weatherData.coord || {};

    if (lat === undefined || lon === undefined) {
      res.status(502).json({ error: "Weather location data is unavailable." });
      return;
    }

    const aqiUrl = new URL("https://api.openweathermap.org/data/2.5/air_pollution");
    aqiUrl.searchParams.set("lat", lat);
    aqiUrl.searchParams.set("lon", lon);
    aqiUrl.searchParams.set("appid", apiKey);

    const aqiData = await fetchJson(aqiUrl);

    res.status(200).json({
      temp: weatherData.main?.temp,
      desc: weatherData.weather?.[0]?.description || "Unavailable",
      aqi: aqiData.list?.[0]?.main?.aqi ?? null,
      time: new Date().toISOString(),
    });
  } catch (error) {
    res.status(502).json({ error: error.message || "Unable to fetch weather." });
  }
}
