import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer"; // 1. Import multer using ES Modules syntax
import { getCollection, userPreferences } from "./config/db.js";
import * as postCtrl from "./controllers/postController.js";
import * as newsCtrl from "./controllers/newsController.js";

dotenv.config();

const app = express();
app.set("trust proxy", 1);

// 2. Configure multer memory allocations (5MB payload boundary)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  }),
);

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

// --- API Router Mapping Endpoints ---
app.get("/api/posts", postCtrl.getPosts);

// 3. Inject the upload middleware into your POST route handler.
// 'media' matches your React frontend configuration: formData.append("media", file)
app.post("/api/posts", upload.single("media"), postCtrl.createPost);

app.post("/api/posts/:id/like", postCtrl.likePost);
app.post("/api/posts/:id/comments", postCtrl.commentPost);
app.delete("/api/posts/:id", postCtrl.deletePost);

app.get("/", (_req, res) => {
  res.send("Welcome to the NewsSphere API!");
});
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