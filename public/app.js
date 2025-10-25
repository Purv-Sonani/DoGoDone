// --- 1. IMPORT FIREBASE FUNCTIONS ---
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, getIdToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// --- THIS IS THE FIX: Wait for the page to load ---
window.addEventListener("DOMContentLoaded", () => {
  // Now it's safe to get the auth object
  const auth = window.firebaseAuth;

  // --- 2. GET ALL HTML ELEMENTS ---
  const API_URL = "http://localhost:5001/api/tasks";
  let currentUserId = null;

  // Main containers
  const authContainer = document.getElementById("auth-container");
  const appContainer = document.getElementById("app-container");
  const userEmailDisplay = document.getElementById("user-email-display");
  const logoutButton = document.getElementById("logout-button");

  // Auth forms & toggles
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const showLoginBtn = document.getElementById("show-login");
  const showSignupBtn = document.getElementById("show-signup");
  const authError = document.getElementById("auth-error");
  const loginToggleText = showSignupBtn.closest(".auth-toggle");
  const signupToggleText = showLoginBtn.closest(".auth-toggle");

  // Main app form
  const addTaskForm = document.getElementById("add-task-form-helper");
  const titleInput = document.getElementById("task-title");
  const descriptionInput = document.getElementById("task-description");
  const priorityInput = document.getElementById("task-priority");
  const addTaskBtn = document.getElementById("add-task-btn");

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

  // Drag & Drop state
  let draggedTaskId = null;

  // --- 3. HELPER FUNCTIONS ---

  /**
   * Gets a fresh auth token and returns headers for an API call.
   */
  async function getAuthHeaders() {
    if (!auth.currentUser) {
      throw new Error("No user is logged in.");
    }
    try {
      // Force refresh the token to prevent using a stale one
      const token = await getIdToken(auth.currentUser, /*forceRefresh*/ true);
      return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
    } catch (error) {
      console.error("Error getting auth token:", error);
      signOut(auth);
      throw new Error("Auth token invalid, logging out.");
    }
  }

  /**
   * Updates the "Last saved" timestamp
   */
  function updateLastSaved() {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    lastSaved.textContent = `Last saved: ${time}`;
  }

  /**
   * Renders a single task card
   */
  function renderTask(task) {
    const taskCard = document.createElement("div");
    taskCard.className = `task-card priority-${task.priority}`;
    taskCard.dataset.id = task._id;
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

  /**
   * Fetches all tasks from the API and renders them
   */
  async function fetchAllTasks() {
    if (!auth.currentUser) return;

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(API_URL, {
        headers: { Authorization: headers.Authorization },
      });

      if (response.status === 401) {
        console.warn("Auth token invalid, forcing logout.");
        signOut(auth);
        return;
      }
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

  // --- 4. AUTHENTICATION & APP LOGIC ---
  if (auth) {
    /**
     * Main listener for authentication state
     */
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is logged in
        console.log("User is logged in:", user.email);
        currentUserId = user.uid;
        userEmailDisplay.textContent = user.email;

        authContainer.style.display = "none";
        appContainer.style.display = "block";

        // --- THIS IS THE FIX ---
        // Now that the user is logged in and the app is visible,
        // we can safely add all our app-related event listeners.
        initialize_app_listeners();
        // --- END OF FIX ---

        fetchAllTasks();
      } else {
        // User is logged out
        console.log("User is logged out");
        appContainer.style.display = "none";
        authContainer.style.display = "flex";
        currentUserId = null;
      }
    });

    // Auth form toggling logic (This is safe to run here)
    showSignupBtn.addEventListener("click", (e) => {
      e.preventDefault();
      loginForm.style.display = "none";
      loginToggleText.style.display = "none";
      signupForm.style.display = "block";
      signupToggleText.style.display = "block";
      authError.style.display = "none";
    });
    showLoginBtn.addEventListener("click", (e) => {
      e.preventDefault();
      loginForm.style.display = "block";
      loginToggleText.style.display = "block";
      signupForm.style.display = "none";
      signupToggleText.style.display = "none";
      authError.style.display = "none";
    });

    // Login form submit (Safe to run here)
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;
      try {
        await signInWithEmailAndPassword(auth, email, password);
        authError.style.display = "none";
      } catch (error) {
        console.error("Login failed:", error.message);
        authError.textContent = `Error: ${error.code}`;
        authError.style.display = "block";
      }
    });

    // Sign Up form submit (Safe to run here)
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("signup-email").value;
      const password = document.getElementById("signup-password").value;
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        authError.style.display = "none";
      } catch (error) {
        console.error("Sign up failed:", error.message);
        authError.textContent = `Error: ${error.code}`;
        authError.style.display = "block";
      }
    });

    // Logout button click (Safe to run here)
    logoutButton.addEventListener("click", () => {
      signOut(auth);
    });

    // --- 5. FUNCTION TO SET UP ALL APP EVENT LISTENERS ---
    // This function is now called only *after* login is successful
    function initialize_app_listeners() {
      // --- 7. EVENT LISTENER: HANDLE NEW TASK FORM SUBMIT ---
      addTaskBtn.addEventListener("click", async () => {
        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();
        const priority = priorityInput.value;
        if (!title || !auth.currentUser) return;

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
          fetchAllTasks();
        } catch (error) {
          console.error("Error creating task:", error);
        }
      });
      addTaskForm.addEventListener("submit", (e) => e.preventDefault());

      // --- 8. EVENT LISTENER: HANDLE BUTTON CLICKS (MOVE & DELETE) ---
      appContainer.addEventListener("click", async (e) => {
        if (!e.target.matches(".delete-btn") && !e.target.matches(".move-btn")) {
          return;
        }
        if (!auth.currentUser) return;

        const button = e.target;
        const action = button.dataset.action;
        const taskCard = button.closest(".task-card");
        const taskId = taskCard.dataset.id;

        try {
          if (action === "delete") {
            const headers = await getAuthHeaders();
            await fetch(`${API_URL}/${taskId}`, {
              method: "DELETE",
              headers: { Authorization: headers.Authorization },
            });
          } else {
            const newStatus = action;
            const headers = await getAuthHeaders();
            await fetch(`${API_URL}/${taskId}`, {
              method: "PUT",
              headers: headers,
              body: JSON.stringify({ status: newStatus }),
            });
          }
          fetchAllTasks();
        } catch (error) {
          console.error(`Error with action ${action}:`, error);
        }
      });

      // --- 10. DRAG AND DROP EVENT LISTENERS ---
      taskLists.forEach((list) => {
        list.addEventListener("dragstart", (e) => {
          if (e.target.matches(".task-card")) {
            draggedTaskId = e.target.dataset.id;
            setTimeout(() => e.target.classList.add("dragging"), 0);
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
          if (!draggedTaskId || !auth.currentUser) return;

          const newStatus = column.dataset.status;
          const draggedCard = document.querySelector(`[data-id="${draggedTaskId}"]`);

          column.appendChild(draggedCard);

          try {
            const headers = await getAuthHeaders();
            await fetch(`${API_URL}/${draggedTaskId}`, {
              method: "PUT",
              headers: headers,
              body: JSON.stringify({ status: newStatus }),
            });
            fetchAllTasks();
          } catch (error) {
            console.error("Error updating task status:", error);
            fetchAllTasks();
          }
        });
      });

      // --- 9. EVENT LISTENER: HANDLE SEARCH ---
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

      // --- 11. STYLE THE PRIORITY DROPDOWN ON CHANGE ---
      priorityInput.addEventListener("change", (e) => {
        e.target.className = `select-${e.target.value}`;
      });
      priorityInput.dispatchEvent(new Event("change"));
    }
  } else {
    console.error("Firebase Auth is not initialized. Check firebase-init.js");
  }
}); // <-- THIS IS THE CLOSING BRACKET for 'DOMContentLoaded'
