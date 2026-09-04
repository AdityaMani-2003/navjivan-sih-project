import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { connectDB } from "./config/connectDB.js";

import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import postRoutes from "./routes/post.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import sosRoutes from "./routes/sos.routes.js";
import uploadTestRoutes from "./routes/uploadTest.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

// Primary API Endpoints
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/sos", sosRoutes);
app.use("/api/upload-test", uploadTestRoutes);

// Fallback aliases for backwards compatibility
app.use("/auth", authRoutes);
app.use("/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
  res.send("LastPuff API Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
