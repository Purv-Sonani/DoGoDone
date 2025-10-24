import mongoose from "mongoose";
const { Schema } = mongoose;

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      required: true,
      enum: ["todo", "inprogress", "done"],
      default: "todo",
    },
    priority: {
      type: String,
      required: true,
      enum: ["low", "medium", "high"],
      default: "low",
    },
    // This field links the task to a specific Firebase User ID
    ownerId: {
      type: String,
      required: true,
      index: true, // Makes lookups by ownerId faster
    },
  },
  {
    timestamps: true,
  }
);

// This creates the 'Task' model based on the schema
const Task = mongoose.model("Task", taskSchema);

export default Task;
