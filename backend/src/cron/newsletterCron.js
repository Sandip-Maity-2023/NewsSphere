import cron from "node-cron";
import { userPreferences } from "../config/db.js";
import { sendDailyEmail } from "../services/newsService.js";

export const initCronJobs = () => {
  cron.schedule("* * * * *", () => {
    const currentSystemTime = new Date().toTimeString().slice(0, 5); // Returns uniform standard time "HH:MM"

    Object.entries(userPreferences).forEach(([email, prefs]) => {
      if (prefs.sendTime === currentSystemTime) {
        console.log(`⏰ Cron Trigger matched for target dispatch: ${email}`);
        sendDailyEmail(email);
      }
    });
  });
};