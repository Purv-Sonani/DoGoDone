import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCCZgE0siuEMZrzl961bQVzo1nReu0YjCc",
  authDomain: "dogodone-db187.firebaseapp.com",
  projectId: "dogodone-db187",
  storageBucket: "dogodone-db187.firebasestorage.app",
  messagingSenderId: "922123845631",
  appId: "1:922123845631:web:d324e49eba418efbdc71ca",
  measurementId: "G-PQE10J5EKD",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

window.firebaseApp = app;
window.firebaseAuth = getAuth(app);
