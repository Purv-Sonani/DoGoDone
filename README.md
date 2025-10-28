DoGoDone - Kanban Task Management Board

A full-stack, single-page web application designed for personal task management using a Kanban-style board. Users can register/login, create tasks with priorities, and move them through "To Do," "In Progress," and "Done" stages via drag-and-drop or buttons.

Live Demo: https://do-go-done.vercel.app/

Features

Secure User Authentication: Sign up, log in, and log out functionality handled by Firebase Authentication. Each user's tasks are private.

Task Management (CRUD): Create, Read, Update (status, priority), and Delete tasks.

Kanban Board Interface: Visual organization of tasks into "To Do," "In Progress," and "Done" columns.

Drag & Drop: Intuitively move tasks between columns.

Button-Based Status Change: Alternative method to move tasks using card buttons.

Task Prioritization: Assign High, Medium, or Low priority, visually indicated by card background color.

Search Functionality: Filter tasks based on title or description in real-time.

Responsive Design: Adapts to different screen sizes, from desktop to mobile.

Tech Stack

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
