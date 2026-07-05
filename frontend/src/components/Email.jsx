import { useState } from "react";
import emailjs from "@emailjs/browser";
import axios from "axios";

const NewsletterSender = () => {
  const [email, setEmail] = useState("");
  const [categories, setCategories] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);

  const categoryList = ["technology", "science", "sports", "business", "health", "entertainment"];

  const toggleCategory = (cat) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const fetchNews = async () => {
    if (categories.length === 0) {
      alert("Select at least 1 category!");
      return;
    }

    setLoading(true);

    try {
      const promises = categories.map((cat) =>
        axios.get(`https://newsapi.org/v2/top-headlines?category=${cat}&apiKey=${import.meta.env.VITE_NEWS_API_KEY}&pageSize=5&country=us`)
      );

      const results = await Promise.all(promises);

      const merged = results.flatMap((res) =>
        res.data.articles.map((a) => ({
          title: a.title,
          summary: a.description || "No summary available",
          url: a.url,
        }))
      );

      setNews(merged.slice(0, 5));
    } catch (err) {
      console.error(err);
      alert("Failed to fetch news!");
    }

    setLoading(false);
  };



 const buildNewsHTML = (articles) => {
  return articles
    .map(
      (a) => `
Title: ${a.title}
Summary: ${a.summary || "No description available."}
Read more: ${a.url}

-----------------------------
`
    )
    .join("");
};





  const sendEmail = async () => {
  if (!email) return alert("Enter email first!");
  if (news.length === 0) return alert("Fetch news first!");

  try {
    // convert news array → HTML markup
    const htmlContent = buildNewsHTML(news);

    await emailjs.send(
      "service_gzoaqjp",
      "template_hrfybf4",
      {
        user_email: email,
        news_html: htmlContent,   // 👈 sending as HTML
      },
      "e5629VytwxZ8ecaKM"
    );
    console.log("HTML being sent:", htmlContent);


    alert("Newsletter sent successfully!");
  } catch (err) {
    console.error(err);
    alert("Email sending failed!");
  }
};


  return (
    <div style={{ padding: 20 }}>
      <h2>Send Daily Newsletter</h2>

      <input
        type="email"
        placeholder="Enter recipient email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: 8, width: "250px", marginBottom: 10 }}
      />

      <h4>Select Categories</h4>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {categoryList.map((cat) => (
          <button
            key={cat}
            onClick={() => toggleCategory(cat)}
            style={{
              padding: "6px 12px",
              background: categories.includes(cat) ? "#4A90E2" : "#ddd",
              color: categories.includes(cat) ? "white" : "black",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <br />

      <button onClick={fetchNews} disabled={loading} style={{ padding: 10 }}>
        {loading ? "Fetching..." : "Fetch News"}
      </button>

      <button onClick={sendEmail} style={{ padding: 10, marginLeft: 10 }}>
        Send Newsletter
      </button>
    </div>
  );
};

export default NewsletterSender;
