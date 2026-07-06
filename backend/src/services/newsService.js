import axios from "axios";
import { userPreferences } from "../config/db.js";
import { transporter } from "../config/mailer.js";
import { groqSummary } from "./groq.js";

const buildNewsletterHTML = (articles) => `
  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
    <h2 style="color: #1a73e8; border-bottom: 2px solid #eeF2F6; padding-bottom: 10px;">📰 Your Daily News Summary</h2>
    ${articles.map(article => `
      <div style="margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid #eee;">
        <h3 style="margin-bottom: 8px; color: #111;">${article.title}</h3>
        <p style="line-height: 1.5; color: #555;"><strong>AI Summary:</strong> ${article.summary}</p>
        <a href="${article.url}" target="_blank" style="color: #1a73e8; text-decoration: none; font-weight: bold;">Read Full Article →</a>
      </div>
    `).join("")}
    <p style="font-size: 12px; color: #888; text-align: center; margin-top: 30px;">Sent via NewsSphere</p>
  </div>
`;

export const sendDailyEmail = async (email) => {
  try {
    const prefs = userPreferences[email];
    if (!prefs || !Array.isArray(prefs.categories) || !prefs.categories.length) return;

    const API_KEY = process.env.NEWS_KEY;
    
    // Concurrently fetch raw articles from across all requested categories
    const fetchPromises = prefs.categories.map(async (category) => {
      try {
        const res = await axios.get(
          `https://newsapi.org/v2/everything?q=${encodeURIComponent(category)}&pageSize=3&apiKey=${API_KEY}`,
          { timeout: 5000 }
        );
        return res.data?.articles || [];
      } catch (err) {
        console.error(`Error fetching news category [${category}]:`, err.message);
        return [];
      }
    });

    const categoriesResults = await Promise.all(fetchPromises);
    const rawArticles = categoriesResults.flat();

    if (!rawArticles.length) {
      console.log(`⚠️ No news found for user ${email}, skipping email.`);
      return;
    }

    // Parallel block request batching optimization for AI text summaries
    const finalArticles = await Promise.all(
      rawArticles.map(async (article) => {
        const text = `${article.title || ""}\n${article.description || ""}`;
        const summary = text.trim() ? await groqSummary(text) : "No description available.";
        return {
          title: article.title || "Untitled Article",
          url: article.url || "#",
          summary,
        };
      })
    );

    const html = buildNewsletterHTML(finalArticles);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "🎯 Your Personalized Daily News Summary",
      html,
    });

    console.log("🚀 EMAIL SENT SUCCESS ->", email);
  } catch (globalEmailError) {
    console.error(`💥 Failed email sequence run for ${email}:`, globalEmailError.message);
  }
};