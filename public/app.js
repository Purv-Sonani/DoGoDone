// --- IMPORT FIREBASE FUNCTIONS ---
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, getIdToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// --- Wait for the page to load ---
window.addEventListener("DOMContentLoaded", () => {
  // Now it's safe to get the auth object
  const auth = window.firebaseAuth;

  // --- GET ALL HTML ELEMENTS ---
  const API_URL = "/api/tasks";
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
  let addTaskForm, titleInput, descriptionInput, priorityInput, addTaskBtn;
  let todoList, inProgressList, doneList, taskLists;
  let todoCount, inProgressCount, doneCount;
  let searchBar, lastSaved;

  // Drag & Drop state
  let draggedTaskId = null;

  // --- HELPER FUNCTIONS ---

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
    // Only run if lastSaved has been found
    if (lastSaved) {
      const now = new Date();
      const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      lastSaved.textContent = `Last saved: ${time}`;
    }
  }

  /**
   * Renders a single task card
   */
  function renderTask(task) {
    const taskCard = document.createElement("div");
    taskCard.className = `task-card priority-${task.priority}`;
    // Ensure the data-id is always set
    if (!task._id) {
      console.error("Task is missing _id:", task); // Debugging
    }
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
        // Add a check inside renderTask if needed
        if (!task._id) {
          console.error("Task fetched from API is missing _id:", task);
        }
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

  // --- AUTHENTICATION & APP LOGIC ---
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

        initializeAppLogic();

        fetchAllTasks();
      } else {
        // User is logged out
        console.log("User is logged out");
        appContainer.style.display = "none";
        authContainer.style.display = "flex";
        currentUserId = null;
      }
    });

    // Auth form toggling logic
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

    // Login form submit
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

    // Sign Up form submit
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

    // Logout button click
    logoutButton.addEventListener("click", () => {
      signOut(auth);
    });

    // --- FUNCTION TO SET UP ALL APP EVENT LISTENERS ---
    function initializeAppLogic() {
      // Get app elements *after* DOM is ready and user is logged in
      addTaskForm = document.getElementById("add-task-form-helper");
      titleInput = document.getElementById("task-title");
      descriptionInput = document.getElementById("task-description");
      priorityInput = document.getElementById("task-priority");
      addTaskBtn = document.getElementById("add-task-btn");

      todoList = document.getElementById("todo-list");
      inProgressList = document.getElementById("inprogress-list");
      doneList = document.getElementById("done-list");
      taskLists = [todoList, inProgressList, doneList];

      todoCount = document.getElementById("todo-count");
      inProgressCount = document.getElementById("inprogress-count");
      doneCount = document.getElementById("done-count");

      searchBar = document.getElementById("search-bar");
      lastSaved = document.getElementById("last-saved");

      // --- EVENT LISTENER: HANDLE NEW TASK FORM SUBMIT ---
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

      // --- EVENT LISTENER: HANDLE BUTTON CLICKS (MOVE & DELETE) ---
      appContainer.addEventListener("click", async (e) => {
        if (!e.target.matches(".delete-btn") && !e.target.matches(".move-btn")) {
          return;
        }
        if (!auth.currentUser) return;

        const button = e.target;
        const action = button.dataset.action;
        const taskCard = button.closest(".task-card");
        const taskId = taskCard?.dataset.id;

        console.log("Button clicked!", { action, taskId });
        if (!taskId) {
          console.error("Could not find taskId from taskCard:", taskCard);
          return; // Stop if taskId is null or undefined
        }

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

      //DRAG AND DROP EVENT LISTENERS ---
      taskLists.forEach((list) => {
        list.addEventListener("dragstart", (e) => {
          if (e.target.matches(".task-card")) {
            draggedTaskId = e.target.dataset.id;
            console.log("Drag Start - Task ID:", draggedTaskId);
            setTimeout(() => e.target.classList.add("dragging"), 0);
          }
        });
        list.addEventListener("dragend", (e) => {
          if (e.target.matches(".task-card")) {
            console.log("Drag End - Task ID:", draggedTaskId);
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
          console.log("Drop Event - Dragged Task ID:", draggedTaskId); // Debugging
          if (!draggedTaskId || !auth.currentUser) {
            console.error("Drop failed - No draggedTaskId or user logged out");
            draggedTaskId = null; // Reset if drop fails
            return;
          }

          const newStatus = column.dataset.status;
          const draggedCard = document.querySelector(`[data-id="${draggedTaskId}"]`);

          if (!draggedCard) {
            console.error("Could not find dragged card element for ID:", draggedTaskId);
            draggedTaskId = null; // Reset if card not found
            return;
          }

          column.appendChild(draggedCard);

          const currentDraggedId = draggedTaskId; // Store it before resetting
          draggedTaskId = null; // Reset global variable immediately after drop

          try {
            const headers = await getAuthHeaders();
            console.log(`Sending PUT to ${API_URL}/${currentDraggedId} with status ${newStatus}`); // Debugging
            await fetch(`${API_URL}/${currentDraggedId}`, {
              // Use the stored ID
              method: "PUT",
              headers: headers,
              body: JSON.stringify({ status: newStatus }),
            });
            fetchAllTasks();
          } catch (error) {
            console.error("Error updating task status:", error);
            fetchAllTasks(); // Revert on error
          }
        });
      });

      // --- EVENT LISTENER: HANDLE SEARCH ---
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

      // --- STYLE THE PRIORITY DROPDOWN ON CHANGE ---
      priorityInput.addEventListener("change", (e) => {
        e.target.className = `select-${e.target.value}`;
      });
      priorityInput.dispatchEvent(new Event("change"));
    } // End of initializeAppLogic
  } else {
    console.error("Firebase Auth is not initialized. Check firebase-init.js");
  }
});
