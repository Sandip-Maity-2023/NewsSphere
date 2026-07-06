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
    const query = String(req.query.q || "india").trim() || "india";
    const apiKey = process.env.NEWS_KEY || process.env.NEWS_API_KEY || process.env.VITE_NEWS_API_KEY;

    if (!apiKey) {
      res.status(500).json({ error: "News API key is not configured." });
      return;
    }

    const url = new URL("https://newsapi.org/v2/everything");
    url.searchParams.set("q", query);
    url.searchParams.set("language", "en");
    url.searchParams.set("pageSize", "50");
    url.searchParams.set("apiKey", apiKey);

    const data = await fetchJson(url);
    res.status(200).json({
      status: data.status || "ok",
      articles: Array.isArray(data.articles) ? data.articles : [],
    });
  } catch (error) {
    res.status(502).json({ error: error.message || "Unable to fetch news." });
  }
}
