import { userPreferences } from "../config/db.js";
import { sendDailyEmail } from "../services/newsService.js";

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