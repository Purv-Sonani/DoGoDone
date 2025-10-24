// --- 1. IMPORT FIREBASE FUNCTIONS ---
// These are globally available from index.html (window.firebaseAuth)
const auth = window.firebaseAuth;

// Import all the Auth functions we'll need
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// --- 2. GET ALL HTML ELEMENTS ---
// App containers
const authContainer = document.getElementById("auth-container");
const appContainer = document.getElementById("app-container");
// Auth forms
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const showLoginBtn = document.getElementById("show-login");
const showSignupBtn = document.getElementById("show-signup");
const authError = document.getElementById("auth-error");
// App Header
const logoutButton = document.getElementById("logout-button");
const userEmailDisplay = document.getElementById("user-email-display");
const searchBar = document.getElementById("search-bar");
// Task Form
const form = document.getElementById("add-task-form");
const titleInput = document.getElementById("task-title");
const descriptionInput = document.getElementById("task-description");
const priorityInput = document.getElementById("task-priority");
// Columns & Counts
const todoList = document.getElementById("todo-list");
const inProgressList = document.getElementById("inprogress-list");
const doneList = document.getElementById("done-list");
const taskLists = [todoList, inProgressList, doneList];
const todoCount = document.getElementById("todo-count");
const inProgressCount = document.getElementById("inprogress-count");
const doneCount = document.getElementById("done-count");
// Footer
const lastSaved = document.getElementById("last-saved");

// --- 3. STATE VARIABLES ---
const API_URL = "http://localhost:5001/api/tasks"; // Your Node.js backend
let draggedTaskId = null;
let allTasks = []; // A local cache for searching

// --- 4. AUTHENTICATION LOGIC ---

// Listen for changes in user login state
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in!
    userEmailDisplay.textContent = user.email;

    // Start fetching their tasks
    fetchAllTasks();

    // Show the app, hide the login screen
    appContainer.style.display = "block";
    authContainer.style.display = "none";
  } else {
    // User is signed out
    // Show login screen, hide the app
    appContainer.style.display = "none";
    authContainer.style.display = "flex";
  }
});

// Login form submit
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    authError.style.display = "none";
  } catch (error) {
    authError.textContent = error.message;
    authError.style.display = "block";
  }
});

// Signup form submit
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    authError.style.display = "none";
  } catch (error) {
    authError.textContent = error.message;
    authError.style.display = "block";
  }
});

// Logout button
logoutButton.addEventListener("click", () => {
  signOut(auth);
});

// Auth form toggling
showSignupBtn.addEventListener("click", (e) => {
  e.preventDefault();
  loginForm.style.display = "none";
  signupForm.style.display = "block";
  authError.style.display = "none";
});
showLoginBtn.addEventListener("click", (e) => {
  e.preventDefault();
  loginForm.style.display = "block";
  signupForm.style.display = "none";
  authError.style.display = "none";
});

// --- 5. SECURE API HELPER ---
// This function gets the user's token and adds it to the headers
async function getAuthHeaders() {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in.");

  const token = await user.getIdToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// --- 6. CORE APP LOGIC (FETCH) ---

// MAIN FUNCTION: Fetch all tasks
async function fetchAllTasks() {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(API_URL, { headers }); // Pass headers to GET

    if (!response.ok) {
      if (response.status === 401) signOut(auth); // Token is bad, log out
      throw new Error("Failed to fetch tasks");
    }

    const tasks = await response.json();
    allTasks = tasks; // Save to local cache

    // Clear UI
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
    filterTasks(); // Re-apply search filter
  } catch (error) {
    console.error("Error fetching tasks:", error);
  }
}

// Render a single task
function renderTask(task) {
  const taskCard = document.createElement("div");
  taskCard.className = `task-card priority-${task.priority}`;
  taskCard.dataset.id = task._id; // <-- Use MongoDB's _id
  taskCard.draggable = true;

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

  if (task.status === "todo") todoList.appendChild(taskCard);
  else if (task.status === "inprogress") inProgressList.appendChild(taskCard);
  else doneList.appendChild(taskCard);
}

// Handle New Task form
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();
  const priority = priorityInput.value;
  if (!title) return;

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(API_URL, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ title, description, priority }),
    });

    if (!response.ok) throw new Error("Failed to create task");

    titleInput.value = "";
    descriptionInput.value = "";
    priorityInput.value = "low";
    priorityInput.dispatchEvent(new Event("change"));

    fetchAllTasks(); // Re-fetch to get new task
  } catch (error) {
    console.error("Error creating task:", error);
  }
});

// Handle Button Clicks (Move & Delete)
document.querySelector(".content-container").addEventListener("click", async (e) => {
  if (!e.target.matches(".delete-btn, .move-btn")) return;

  const button = e.target;
  const action = button.dataset.action;
  const taskCard = button.closest(".task-card");
  const taskId = taskCard.dataset.id;

  try {
    const headers = await getAuthHeaders();

    if (action === "delete") {
      await fetch(`${API_URL}/${taskId}`, { method: "DELETE", headers });
    } else {
      // This is a 'move' action
      const newStatus = action;
      await fetch(`${API_URL}/${taskId}`, {
        method: "PUT",
        headers: headers,
        body: JSON.stringify({ status: newStatus }),
      });
    }
    fetchAllTasks(); // Re-fetch to update UI
  } catch (error) {
    console.error("Error updating task:", error);
  }
});

// --- 7. DRAG & DROP LOGIC ---
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

    // Check if the status is actually changing
    if (draggedCard.closest(".tasks-list").dataset.status === newStatus) {
      return;
    }

    // Optimistic UI update: move the card immediately
    column.appendChild(draggedCard);
    // Manually update counts for a snappier feel
    updateTaskCounts();

    try {
      const headers = await getAuthHeaders();
      await fetch(`${API_URL}/${draggedTaskId}`, {
        method: "PUT",
        headers: headers,
        body: JSON.stringify({ status: newStatus }),
      });
      // Final, authoritative update from server
      fetchAllTasks();
    } catch (error) {
      console.error("Error updating task status:", error);
      fetchAllTasks(); // Revert on error
    }
  });
});

// --- 8. SEARCH & HELPERS ---
searchBar.addEventListener("input", filterTasks);

function filterTasks() {
  const searchTerm = searchBar.value.toLowerCase();
  // Use the local cache `allTasks` to decide visibility
  allTasks.forEach((task) => {
    const card = document.querySelector(`[data-id="${task._id}"]`);
    if (!card) return;

    const title = task.title.toLowerCase();
    const description = (task.description || "").toLowerCase();

    if (title.includes(searchTerm) || description.includes(searchTerm)) {
      card.style.display = "flex";
    } else {
      card.style.display = "none";
    }
  });
}

// Helper to manually update counts (for snappy drag-drop)
function updateTaskCounts() {
  todoCount.textContent = todoList.childElementCount;
  inProgressCount.textContent = inProgressList.childElementCount;
  doneCount.textContent = doneList.childElementCount;
}

// Style the priority dropdown
priorityInput.addEventListener("change", (e) => {
  e.target.className = `select-${e.target.value}`;
});

// Update the "Last Saved" timestamp
function updateLastSaved() {
  const now = new Date();
  // Using German locale settings since we're in Berlin.
  const time = now.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  lastSaved.textContent = `Last saved: ${time} CET`;
}

// --- 9. INITIALIZE THE APP ---
priorityInput.dispatchEvent(new Event("change"));
// We don't call fetchAllTasks() here,
// onAuthStateChanged() will do it when the user logs in.
