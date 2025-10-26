import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import tasksRouter from "./routes/tasks.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
// Remove port, Vercel handles this
// const port = process.env.PORT || 5001;

// --- MIDDLEWARE ---
app.use(cors()); // Configure CORS properly later if needed
app.use(express.json());

// --- DATABASE CONNECTION ---
const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI environment variable is not set.");
}

mongoose
  .connect(uri)
  .then(() => console.log("MongoDB connection established successfully"))
  .catch((err) => console.error("MongoDB connection error:", err)); // Log errors

// --- API ENDPOINTS ---
// Assuming authMiddleware is used within tasksRouter or applied globally before
app.use("/api/tasks", tasksRouter);

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

export default app;
