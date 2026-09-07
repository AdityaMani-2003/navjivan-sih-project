import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import { connectDB } from "./config/connectDB.js";
import { globalErrorHandler } from "./middleware/errorHandler.js";

// ─── Route Imports (v1 Clean Architecture) ──────────────────────────────────
import authV1Routes from "./routes/auth.routes.js";
import profileV1Routes from "./routes/profile.routes.js";
import questionnaireV1Routes from "./routes/questionnaire.routes.js";
import recommendationV1Routes from "./routes/recommendation.routes.js";
import planV1Routes from "./routes/plan.routes.js";
import taskV1Routes from "./routes/task.routes.js";
import progressV1Routes from "./routes/progress.routes.js";
import chatV1Routes from "./routes/chat.routes.js";
import communityV1Routes from "./routes/community.routes.js";
import gamificationV1Routes from "./routes/gamification.routes.js";
import geofencingV1Routes from "./routes/geofencing.routes.js";
import nutritionV1Routes from "./routes/nutrition.routes.js";
import stepsV1Routes from "./routes/steps.routes.js";
import goalsV1Routes from "./routes/goals.routes.js";
import rewardsV1Routes from "./routes/rewards.routes.js";
import fitSquadV1Routes from "./routes/fitSquad.routes.js";
import aiV1Routes from "./routes/ai.routes.js";

// ─── Legacy Route Imports (Backward Compatibility) ──────────────────────────
import authLegacyRoutes from "./routes/authRoutes.js";
import dashboardLegacyRoutes from "./routes/dashboardRoutes.js";
import sosRoutes from "./routes/sos.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

// ─── Cron Jobs ──────────────────────────────────────────────────────────────
import { registerCronJobs } from "./services/cronJobs.js";

const app = express();

// ─── Security & Performance Middleware ──────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// ─── Rate Limiting ──────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "AI rate limit exceeded. Try again shortly." },
});

app.use("/api/", limiter);
app.use("/api/v1/chat", aiLimiter);
app.use("/api/v1/ai", aiLimiter);

// ─── Database Connection ────────────────────────────────────────────────────
connectDB();

// ─── V1 REST API Endpoints ──────────────────────────────────────────────────
app.use("/api/v1/auth", authV1Routes);
app.use("/api/v1/profile", profileV1Routes);
app.use("/api/v1/questionnaire", questionnaireV1Routes);
app.use("/api/v1/recommendation", recommendationV1Routes);
app.use("/api/v1/plans", planV1Routes);
app.use("/api/v1/plan", planV1Routes);
app.use("/api/v1/tasks", taskV1Routes);
app.use("/api/v1/progress", progressV1Routes);
app.use("/api/v1/chat", chatV1Routes);
app.use("/api/v1/community", communityV1Routes);
app.use("/api/v1/gamification", gamificationV1Routes);
app.use("/api/v1/geofencing", geofencingV1Routes);
app.use("/api/v1/nutrition", nutritionV1Routes);
app.use("/api/v1/steps", stepsV1Routes);
app.use("/api/v1/goals", goalsV1Routes);
app.use("/api/v1/rewards", rewardsV1Routes);
app.use("/api/v1/fitsquad", fitSquadV1Routes);
app.use("/api/v1/ai", aiV1Routes);

// ─── Legacy Endpoints (Backward Compatibility) ──────────────────────────────
app.use("/api/auth", authLegacyRoutes);
app.use("/api/dashboard", dashboardLegacyRoutes);
app.use("/api/posts", communityV1Routes);
app.use("/api/comments", commentRoutes);
app.use("/api/sos", sosRoutes);
app.use("/api/ai", aiV1Routes);
app.use("/api/geofencing", geofencingV1Routes);
app.use("/api/nutrition", nutritionV1Routes);
app.use("/api/steps", stepsV1Routes);
app.use("/api/goals", goalsV1Routes);
app.use("/api/rewards", rewardsV1Routes);
app.use("/api/notifications", notificationRoutes);
app.use("/auth", authLegacyRoutes);
app.use("/dashboard", dashboardLegacyRoutes);

// ─── Health Checks ──────────────────────────────────────────────────────────
app.get("/api/v1/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: Math.round(process.uptime()),
    db: mongoose.connection.readyState === 1 ? "connected" : "connecting",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    app: "Navjivan API",
    version: "3.0.0",
    docs: "/api/v1",
    db: mongoose.connection.readyState === 1 ? "connected" : "connecting",
  });
});

// ─── Global Error Handler ───────────────────────────────────────────────────
app.use(globalErrorHandler);

// ─── Start Server ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Navjivan SaaS API v3.0 running on port ${PORT}`);
  console.log(`📡 Registered v1 routes: /api/v1/auth, /api/v1/profile, /api/v1/questionnaire, /api/v1/recommendation, /api/v1/plans, /api/v1/tasks, /api/v1/progress, /api/v1/chat, /api/v1/community, /api/v1/gamification, /api/v1/geofencing, /api/v1/nutrition, /api/v1/steps, /api/v1/goals, /api/v1/rewards, /api/v1/fitsquad, /api/v1/ai`);

  registerCronJobs();
});

export default app;
