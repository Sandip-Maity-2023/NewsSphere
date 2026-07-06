import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getCollection, userPreferences } from "./config/db.js";
import * as postCtrl from "./controllers/postController.js";
import * as newsCtrl from "./controllers/newsController.js";
import multer from "multer";

dotenv.config();

const app = express();
app.set("trust proxy", 1);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const allowedOrigins = new Set(
  [
    process.env.FRONTEND_URL,
    "https://frontend-five-murex-54.vercel.app",
    "https://frontend-iruo5rfmm-sandip-maity-2023s-projects.vercel.app",
    "http://localhost:5173",
  ].filter(Boolean),
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

// --- API Router Mapping Endpoints ---
app.get("/api/posts", postCtrl.getPosts);
app.post("/api/posts", upload.single("media"), postCtrl.createPost);
app.post("/api/posts/:id/like", postCtrl.likePost);
app.post("/api/posts/:id/comments", postCtrl.commentPost);
app.delete("/api/posts/:id", postCtrl.deletePost);
app.get("/", (_req, res) => {
  res.send("Welcome to the NewsSphere API!");
});
app.get("/api/news", newsCtrl.getNews);
app.get("/api/weather", newsCtrl.getWeather);
app.post("/setup-news-email", newsCtrl.setupNewsEmail);

app.get("/health", async (_req, res) => {
  const collection = await getCollection();
  res.json({
    status: "ok",
    mongoConnected: !!collection,
    trackedUsersCount: Object.keys(userPreferences).length,
  });
});

export default app;
