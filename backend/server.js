import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import tasksRouter from "./routes/tasks.js";

const app = express();
const port = process.env.PORT || 5001;
// const port = 5001;

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
const uri = "mongodb+srv://purv_do_go_done:Purv%402809@dogodonecluster.3y9vus0.mongodb.net/";
// const uri = "mongodb+srv://temp_admin:testpass123@dogodonecluster.3y9vus0.mongodb.net/";

// (Make sure your connection string is correct here)

mongoose
  .connect(uri)
  .then(() => console.log("MongoDB connection established successfully"))
  .catch((err) => console.log(err));

app.use("/api/tasks", tasksRouter);

// --- API ENDPOINTS ---
app.get("/api/test", (req, res) => {
  res.json({ message: "Hello from the backend!" });
});

// --- (We will add the task endpoints here next) ---

// --- START THE SERVER ---
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
