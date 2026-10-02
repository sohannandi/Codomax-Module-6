import { app } from "./app";
import mongoose from "mongoose";
import { config } from "./config";

async function start() {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.warn("MongoDB connection failed:", (error as Error).message);
    console.log("Running without database (analysis will not be saved)");
  }

  app.listen(config.port, () => {
    console.log(`Backend running on http://localhost:${config.port}`);
  });
}

start().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});