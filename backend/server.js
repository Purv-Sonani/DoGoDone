import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import tasksRouter from "./routes/tasks.js";

// const app = express();
// const port = process.env.PORT || 5001;

// // --- MIDDLEWARE ---
// app.use(cors());
// app.use(express.json());

// // --- DATABASE CONNECTION ---
// const uri = "mongodb+srv://purv_do_go_done:Purv%402809@dogodonecluster.3y9vus0.mongodb.net/";
// // const uri = "mongodb+srv://temp_admin:testpass123@dogodonecluster.3y9vus0.mongodb.net/";

// mongoose
//   .connect(uri)
//   .then(() => console.log("MongoDB connection established successfully"))
//   .catch((err) => console.log(err));

// app.use("/api/tasks", tasksRouter);

// // --- API ENDPOINTS ---
// app.get("/api/test", (req, res) => {
//   res.json({ message: "Hello from the backend!" });
// });

// export default app;
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
