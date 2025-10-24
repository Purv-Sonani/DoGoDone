import express from "express";
import Task from "../models/task.model.js";
import authMiddleware from "../middlewares/authMiddleware.js"; // <-- 1. IMPORT MIDDLEWARE

const router = express.Router();

// --- 2. PROTECT ALL ROUTES ---
// This tells Express to use our middleware on EVERY route in this file.
// Any request to /api/tasks/* will be checked for a valid token first.
router.use(authMiddleware);

// --- 3. UPDATE ROUTES TO BE MULTI-TENANT ---

// --- GET ALL TASKS (for the logged-in user) ---
router.get("/", async (req, res) => {
  try {
    // Find all tasks that match the user's ID
    const tasks = await Task.find({ ownerId: req.userId });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- CREATE A NEW TASK (for the logged-in user) ---
router.post("/", async (req, res) => {
  const { title, description, priority } = req.body;

  const newTask = new Task({
    title: title,
    description: description,
    priority: priority,
    ownerId: req.userId, // <-- 4. LINK THE TASK TO THE USER
  });

  try {
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- UPDATE A TASK (and check ownership) ---
router.put("/:id", async (req, res) => {
  try {
    const taskId = req.params.id;
    const updates = req.body; // e.g., { status: 'inprogress' }

    // 5. CHECK OWNERSHIP
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    if (task.ownerId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You do not own this task" });
    }
    // ---

    const updatedTask = await Task.findByIdAndUpdate(taskId, updates, {
      new: true, // This option returns the modified document
    });
    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- DELETE A TASK (and check ownership) ---
router.delete("/:id", async (req, res) => {
  try {
    const taskId = req.params.id;

    // 5. CHECK OWNERSHIP
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    if (task.ownerId !== req.userId) {
      return res.status(403).json({ message: "Forbidden: You do not own this task" });
    }
    // ---

    await Task.findByIdAndDelete(taskId);
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
