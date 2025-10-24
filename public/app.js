// --- 1. SET UP GLOBALS ---
const API_URL = "http://localhost:5001/api/tasks";

// Form elements
const form = document.getElementById("add-task-form");
const titleInput = document.getElementById("task-title");
const descriptionInput = document.getElementById("task-description");
const priorityInput = document.getElementById("task-priority");

// Column lists
const todoList = document.getElementById("todo-list");
const inProgressList = document.getElementById("inprogress-list");
const doneList = document.getElementById("done-list");
const taskLists = [todoList, inProgressList, doneList];

// Column counts
const todoCount = document.getElementById("todo-count");
const inProgressCount = document.getElementById("inprogress-count");
const doneCount = document.getElementById("done-count");

// Search
const searchBar = document.getElementById("search-bar");

// Footer
const lastSaved = document.getElementById("last-saved");

// Variable to store the ID of the task being dragged
let draggedTaskId = null;

// --- 2. MAIN FUNCTION: FETCH ALL TASKS ---
async function fetchAllTasks() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Failed to fetch tasks");

    const tasks = await response.json();

    todoList.innerHTML = "";
    inProgressList.innerHTML = "";
    doneList.innerHTML = "";

    let todoC = 0,
      inProgressC = 0,
      doneC = 0;

    tasks.forEach((task) => {
      renderTask(task);
      if (task.status === "todo") todoC++;
      else if (task.status === "inprogress") inProgressC++;
      else doneC++;
    });

    todoCount.textContent = todoC;
    inProgressCount.textContent = inProgressC;
    doneCount.textContent = doneC;

    updateLastSaved();
  } catch (error) {
    console.error("Error fetching tasks:", error);
  }
}

// --- 3. HELPER FUNCTION: RENDER A SINGLE TASK ---
function renderTask(task) {
  const taskCard = document.createElement("div");
  // --- UPDATED: Add priority class to the card itself ---
  taskCard.className = `task-card priority-${task.priority}`;
  taskCard.dataset.id = task._id;
  taskCard.draggable = true;

  // --- UPDATED: Re-added move buttons ---
  taskCard.innerHTML = `
        <div class="task-card-header">
            <h4>${task.title}</h4>
        </div>
        <p>${task.description || ""}</p>
        <div class="task-card-footer">
            <div class="task-actions">
                ${task.status === "todo" ? `<button class="move-btn" data-action="inprogress">Start →</button>` : ""}
                ${task.status === "inprogress" ? `<button class="move-btn" data-action="todo">← Back</button>` : ""}
                ${task.status === "inprogress" ? `<button class="move-btn" data-action="done">Complete →</button>` : ""}
            </div>
            <button class="delete-btn" data-action="delete">X</button>
        </div>
    `;

  // Append to the correct column
  if (task.status === "todo") todoList.appendChild(taskCard);
  else if (task.status === "inprogress") inProgressList.appendChild(taskCard);
  else doneList.appendChild(taskCard);
}

// --- 4. EVENT LISTENER: HANDLE NEW TASK FORM SUBMIT ---
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();
  const priority = priorityInput.value;

  if (!title) return;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, priority }),
    });

    if (!response.ok) throw new Error("Failed to create task");

    titleInput.value = "";
    descriptionInput.value = "";
    priorityInput.value = "low";
    // Manually trigger the change event to reset the select's color
    priorityInput.dispatchEvent(new Event("change"));

    fetchAllTasks();
  } catch (error) {
    console.error("Error creating task:", error);
  }
});

// --- 5. EVENT LISTENER: HANDLE BUTTON CLICKS (MOVE & DELETE) ---
// One listener on the whole container to rule them all
document.querySelector(".content-container").addEventListener("click", async (e) => {
  // Check if the click was on a button we care about
  if (!e.target.matches(".delete-btn") && !e.target.matches(".move-btn")) {
    return;
  }

  const button = e.target;
  const action = button.dataset.action;
  const taskCard = button.closest(".task-card");
  const taskId = taskCard.dataset.id;

  if (action === "delete") {
    // Handle DELETE request
    try {
      await fetch(`${API_URL}/${taskId}`, { method: "DELETE" });
      fetchAllTasks(); // Re-fetch to update counts
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  } else {
    // Handle PUT request (moving the card)
    const newStatus = action; // e.g., 'inprogress', 'todo', 'done'
    try {
      const response = await fetch(`${API_URL}/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update task");

      fetchAllTasks(); // Re-fetch to update counts and move card
    } catch (error) {
      console.error("Error updating task:", error);
    }
  }
});

// --- 6. EVENT LISTENER: HANDLE SEARCH ---
searchBar.addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();

  document.querySelectorAll(".task-card").forEach((card) => {
    const title = card.querySelector("h4").textContent.toLowerCase();
    const description = card.querySelector("p").textContent.toLowerCase();

    if (title.includes(searchTerm) || description.includes(searchTerm)) {
      card.style.display = "flex";
    } else {
      card.style.display = "none";
    }
  });
});

// --- 7. DRAG AND DROP EVENT LISTENERS ---
// (This section is unchanged and works with the button logic)
taskLists.forEach((list) => {
  list.addEventListener("dragstart", (e) => {
    if (e.target.matches(".task-card")) {
      draggedTaskId = e.target.dataset.id;
      e.target.classList.add("dragging");
    }
  });
  list.addEventListener("dragend", (e) => {
    if (e.target.matches(".task-card")) {
      draggedTaskId = null;
      e.target.classList.remove("dragging");
    }
  });
});
taskLists.forEach((column) => {
  column.addEventListener("dragover", (e) => {
    e.preventDefault();
    column.classList.add("drag-over");
  });
  column.addEventListener("dragleave", () => {
    column.classList.remove("drag-over");
  });
  column.addEventListener("drop", async (e) => {
    e.preventDefault();
    column.classList.remove("drag-over");
    if (!draggedTaskId) return;
    const newStatus = column.dataset.status;
    const draggedCard = document.querySelector(`[data-id="${draggedTaskId}"]`);

    column.appendChild(draggedCard); // Optimistic UI Update

    try {
      await fetch(`${API_URL}/${draggedTaskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchAllTasks();
    } catch (error) {
      console.error("Error updating task status:", error);
      fetchAllTasks();
    }
  });
});

// --- 8. NEW: STYLE THE PRIORITY DROPDOWN ON CHANGE ---
priorityInput.addEventListener("change", (e) => {
  e.target.className = `select-${e.target.value}`;
});
// Also run it once on load to set the default color
priorityInput.dispatchEvent(new Event("change"));

// --- 9. HELPER FUNCTIONS ---
function updateLastSaved() {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  lastSaved.textContent = `Last saved: ${time}`;
}

// --- 10. INITIALIZE THE APP ---
fetchAllTasks();
