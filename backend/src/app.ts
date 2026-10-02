import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { config } from "./config";
import analysisRoutes from "./routes/analysisRoutes";
import authRoutes from "./routes/authRoutes";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(cors({ origin: config.frontendUrl, credentials: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", version: "1.0.0" });
});

app.use("/api/auth", authRoutes);
app.use("/api", analysisRoutes);

app.use(errorHandler);

export { app };