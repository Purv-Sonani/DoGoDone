import express from "express";
import Task from "../models/task.model.js"; // Import our Task model

const router = express.Router();

// --- 1. GET ALL TASKS ---
// Handles GET requests to /api/tasks/
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find(); // Find all tasks in the database
    res.json(tasks); // Send them back as JSON
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- 2. CREATE A NEW TASK ---
// Handles POST requests to /api/tasks/
router.post("/", async (req, res) => {
  // Get title, description, AND PRIORITY from the request body
  const { title, description, priority } = req.body; // <-- UPDATED THIS LINE

  // Create a new Task object
  const newTask = new Task({
    title: title,
    description: description,
    priority: priority, // <-- ADDED THIS LINE
    // 'status' will default to 'todo' as defined in our model
  });

  try {
    const savedTask = await newTask.save(); // Save it to the database
    res.status(201).json(savedTask); // Send back the new task
  } catch (err) {
    res.status(400).json({ message: err.message }); // 400 = bad request
  }
});

// --- 3. UPDATE A TASK (e.g., change status) ---
// Handles PUT requests to /api/tasks/some_id
router.put("/:id", async (req, res) => {
  try {
    const taskId = req.params.id;
    const updates = req.body; // e.g., { status: 'inprogress' }

    const updatedTask = await Task.findByIdAndUpdate(taskId, updates, {
      new: true, // This option returns the modified document
    });

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(updatedTask); // Send back the updated task
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- 4. DELETE A TASK ---
// Handles DELETE requests to /api/tasks/some_id
router.delete("/:id", async (req, res) => {
  try {
    const taskId = req.params.id;
    const deletedTask = await Task.findByIdAndDelete(taskId);

    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
