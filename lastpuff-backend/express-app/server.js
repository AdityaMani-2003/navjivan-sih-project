import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/connectDB.js";

// ─── Route Imports ──────────────────────────────────────────
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import postRoutes from "./routes/post.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import sosRoutes from "./routes/sos.routes.js";
import uploadTestRoutes from "./routes/uploadTest.routes.js";
import aiRoutes from "./routes/aiRoutes.js";
import geofencingRoutes from "./routes/geofencingRoutes.js";
import nutritionRoutes from "./routes/nutritionRoutes.js";
import stepsRoutes from "./routes/stepsRoutes.js";
import goalsRoutes from "./routes/goalsRoutes.js";
import rewardsRoutes from "./routes/rewardsRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

// ─── Cron Jobs ──────────────────────────────────────────────
import { registerCronJobs } from "./services/cronJobs.js";

const app = express();

// ─── Security & Performance Middleware ──────────────────────
app.use(helmet({ contentSecurityPolicy: false })); // CSP disabled for mobile API
app.use(compression());
app.use(cors());
app.use(express.json({ limit: "10mb" })); // Increased for base64 image uploads
app.use(express.urlencoded({ extended: true }));

// ─── Request Logging ────────────────────────────────────────
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// ─── Rate Limiting ──────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});

const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // 30 AI requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "AI rate limit exceeded. Upgrade to Premium for more." },
});

app.use("/api/", generalLimiter);
app.use("/api/ai/", aiLimiter);

// ─── Database Connection ────────────────────────────────────
connectDB();

// ─── Primary API Endpoints ──────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/sos", sosRoutes);
app.use("/api/upload-test", uploadTestRoutes);

// ─── New SaaS API Endpoints ─────────────────────────────────
app.use("/api/ai", aiRoutes);
app.use("/api/geofencing", geofencingRoutes);
app.use("/api/nutrition", nutritionRoutes);
app.use("/api/steps", stepsRoutes);
app.use("/api/goals", goalsRoutes);
app.use("/api/rewards", rewardsRoutes);
app.use("/api/notifications", notificationRoutes);

// ─── Fallback Aliases (backward compatibility) ──────────────
app.use("/auth", authRoutes);
app.use("/dashboard", dashboardRoutes);

// ─── Health Check ───────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    app: "LastPuff API",
    version: "2.0.0",
    endpoints: [
      "/api/auth", "/api/dashboard", "/api/posts", "/api/comments",
      "/api/sos", "/api/ai", "/api/geofencing", "/api/nutrition",
      "/api/steps", "/api/goals", "/api/rewards", "/api/notifications",
    ],
  });
});

// ─── Global Error Handler ───────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message,
  });
});

// ─── Start Server ───────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 LastPuff API v2.0 running on port ${PORT}`);
  console.log(`📡 Endpoints: /api/auth, /api/dashboard, /api/ai, /api/geofencing, /api/nutrition, /api/steps, /api/goals, /api/rewards, /api/notifications`);

  // Register cron jobs
  registerCronJobs();
});
