import app from "./src/app.js";
import { getCollection } from "./src/config/db.js";
import { initCronJobs } from "./src/cron/newsletterCron.js";

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`🚀 Server fully operational on port ${PORT}`);
  
  // Instantly establish background pool pipeline link
  getCollection();
  
  // Kickstart runtime automated schedules 
  initCronJobs();
});