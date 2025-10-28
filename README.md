<div align="center">

# 🧩 DoGoDone - Kanban Task Management Board  

A **full-stack Kanban board** for personal task management.  

Built with modern web technologies to provide a **secure**, **responsive**, and **intuitive** experience.  

<p align="center">
  <a href="https://do-go-done.vercel.app/" target="_blank">
    <img src="https://vercel.com/button" alt="Deploy with Vercel"/>
  </a>
</p>

**Live Demo:** 👉 [https://do-go-done.vercel.app/](https://do-go-done.vercel.app/)

</div>

---

## 📚 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Screenshots](#screenshots)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Firebase Setup](#firebase-setup-local)
- [Deployment](#deployment)

---

## 📖 Overview

**DoGoDone** is a modern, full-stack single-page web application designed for **personal task management** using a **Kanban-style board**.  
It allows users to create accounts, manage their tasks across different stages, and ensures data privacy and persistence using **Firebase Authentication** and **MongoDB Atlas**.

### Why DoGoDone?

- 🔐 **Secure & Private:** Firebase Authentication ensures each user’s data is accessible only to them.  
- 🔄 **Full CRUD Functionality:** Create, read, update, and delete tasks easily.  
- 🎨 **Visual Workflow:** Organize tasks in “To Do”, “In Progress”, and “Done” columns.  
- 🖐️ **Intuitive Interaction:** Drag-and-drop or button-based status updates.  
- 🚦 **Prioritization:** Assign **High**, **Medium**, or **Low** priorities with color-coded cards.  
- 🔍 **Filtering:** Real-time search by title or description.  
- 📱 **Responsive Design:** Optimized for all screen sizes.  
- 💾 **Persistent Data:** Tasks stored securely in **MongoDB Atlas**.

---

## ✨ Features

✅ Secure User Authentication via Firebase  
✅ Full CRUD for task management  
✅ Kanban-style board interface  
✅ Drag-and-drop functionality  
✅ Priority levels (High, Medium, Low)  
✅ Live search filtering  
✅ Responsive UI  
✅ Persistent cloud storage  

---

## 🛠️ Tech Stack

### **Frontend**
- HTML5  
- CSS3 (CSS Variables)  
- Vanilla JavaScript (ES Modules)  
- Firebase JS SDK (v11.6.1 for Authentication)

### **Backend**
- Node.js (v22.x recommended)  
- Express.js  
- MongoDB (with Mongoose ODM)  
- Firebase Admin SDK (token verification)  
- dotenv (for environment variables)

### **Authentication**
- Firebase Authentication (Email/Password)

### **Database**
- MongoDB Atlas (Cloud-hosted)

### **Deployment**
- Vercel

---

## 📁 Folder Structure

```bash
DoGoDone/
├── backend/
│   ├── models/
│   │   └── task.model.js           # Mongoose schema for tasks
│   ├── routes/
│   │   └── tasks.js                # API route handlers
│   ├── authMiddleware.js           # Firebase token verification
│   ├── server.js                   # Express server setup
│   ├── serviceAccountKey.json      # Firebase Admin credentials (gitignored)
│   ├── .env                        # Environment variables (gitignored)
│   └── package.json                # Backend dependencies
│
├── public/
│   ├── images/
│   │   └── favicon_io/             # Favicon files
│   ├── index.html                  # Main SPA HTML file
│   ├── style.css                   # CSS styles
│   ├── app.js                      # Frontend logic
│   └── firebase-init.js            # Firebase config
│
├── .gitignore                      # Untracked files
├── README.md                       # Project documentation
└── vercel.json                     # Vercel deployment config
