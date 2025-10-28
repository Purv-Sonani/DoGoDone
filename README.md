<h1 align="center">DoGoDone - Kanban Task Management Board</h1>

<p align="center">
A full-stack, single-page web application designed for personal task management using a Kanban-style board. Users can register/login, create tasks with priorities, and move them through "To Do," "In Progress," and "Done" stages via drag-and-drop or buttons.
</p>

<p align="center">
<a href="https://do-go-done.vercel.app/" target="_blank">
<img src="https://www.google.com/search?q=https://vercel.com/button" alt="Deploy with Vercel"/>
</a>
</p>

<p align="center">
Live Demo: <a href="https://do-go-done.vercel.app/" target="_blank">https://do-go-done.vercel.app/</a>
</p>

✨ Features

Secure User Authentication: Sign up, log in, and log out functionality handled by Firebase Authentication. Each user's tasks are private.

Task Management (CRUD): Create, Read, Update (status, priority), and Delete tasks.

Kanban Board Interface: Visual organization of tasks into "To Do," "In Progress," and "Done" columns.

Drag & Drop: Intuitively move tasks between columns.

Button-Based Status Change: Alternative method to move tasks using card buttons.

Task Prioritization: Assign High, Medium, or Low priority, visually indicated by card background color.

Search Functionality: Filter tasks based on title or description in real-time.

Responsive Design: Adapts to different screen sizes, from desktop to mobile.

🛠️ Tech Stack

Frontend:

HTML5

CSS3 (with CSS Variables for theming)

Vanilla JavaScript (ES Modules)

Firebase JS SDK (v11.6.1 for Authentication)

Backend:

Node.js (v22.x recommended)

Express.js

MongoDB (with Mongoose ODM)

Firebase Admin SDK (for backend token verification)

dotenv (for managing environment variables locally)

Authentication: Firebase Authentication (Email/Password)

Database: MongoDB Atlas (Cloud-hosted)

Deployment: Vercel

📸 Screenshots

(Coming Soon! Add screenshots of your login page and main board here.)

📁 Folder Structure

DoGoDone/ ├── backend/ │ ├── models/ │ │ └── task.model.js # Mongoose schema for tasks │ ├── routes/ │ │ └── tasks.js # API route handlers for tasks │ ├── authMiddleware.js # Firebase token verification │ ├── server.js # Express server setup │ ├── serviceAccountKey.json # Firebase Admin credentials (local, gitignored) │ ├── .env # Environment variables (local, gitignored) │ └── package.json # Backend dependencies ├── public/ │ ├── images/ │ │ └── favicon_io/ # Favicon files │ ├── index.html # Main HTML file (SPA) │ ├── style.css # All CSS styles │ ├── app.js # Frontend JavaScript logic │ └── firebase-init.js # Firebase client-side config ├── .gitignore # Specifies intentionally untracked files ├── README.md # Project description (this file) └── vercel.json # Vercel deployment configuration

🚀 Getting Started Locally

To run this project on your local machine:

Clone the repository:

git clone <YOUR_REPOSITORY_URL> cd DoGoDone

Backend Setup:

Navigate to the backend directory:

cd backend

Install dependencies:

npm install

Create a .env file in the backend directory. Populate it with your credentials:

# backend/.env

MONGODB_URI="mongodb+srv://<USERNAME>:<PASSWORD>@<YOUR_CLUSTER_URI>/DoGoDoneDB?retryWrites=true&w=majority" FIREBASE_SERVICE_ACCOUNT="{ ... paste the entire content of your serviceAccountKey.json file here ... }"

(Note: Get serviceAccountKey.json from your Firebase Project Settings -> Service accounts)

IMPORTANT: Ensure your serviceAccountKey.json file is also present in the backend directory (it's used by dotenv locally but ignored by Git).

Start the backend server:

npm start

The server will run on http://localhost:5001.

Frontend Setup:

No build step is required for the frontend.

Create a firebase-init.js file in the public directory (if you haven't already). Add your Firebase client-side configuration:

// public/firebase-init.js import { initializeApp } from "[https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js](https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js)"; import { getAuth } from "[https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js](https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js)";

// Replace with your actual Firebase config object const firebaseConfig = { apiKey: "...", authDomain: "...", projectId: "...", // ... etc };

const app = initializeApp(firebaseConfig); window.firebaseApp = app; window.firebaseAuth = getAuth(app);

Open the public/index.html file using a live server extension (like VS Code's "Live Server") to handle API requests correctly and avoid CORS issues.

Firebase Setup:

Ensure you have created a Firebase project.

Enable Email/Password authentication in the Firebase Authentication settings.

Add your local development domain (usually 127.0.0.1) to the Authorized domains list in Firebase Authentication -> Settings.

☁️ Deployment

This project is configured for easy deployment to Vercel.

Push your code to a GitHub repository.

Import the repository into Vercel.

Set the following environment variables in the Vercel project settings:

MONGODB_URI: Your MongoDB Atlas connection string.

FIREBASE_SERVICE_ACCOUNT: The entire JSON content of your serviceAccountKey.json file.

Vercel will automatically build and deploy using the vercel.json configuration.

Add your Vercel deployment URL (e.g., your-project.vercel.app) to the Authorized domains list in your Firebase Authentication settings.
