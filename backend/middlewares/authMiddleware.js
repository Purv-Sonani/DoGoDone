import dotenv from "dotenv";
dotenv.config(); // Load variables from .env immediately

import admin from "firebase-admin";
import fs from "fs"; // Import the File System module
import path from "path"; // Import the Path module
import { fileURLToPath } from "url"; // Helper for ES modules

let serviceAccount;

const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;

if (serviceAccountString) {
  console.log("Found FIREBASE_SERVICE_ACCOUNT env var. Attempting to parse...");
  try {
    serviceAccount = JSON.parse(serviceAccountString);
    console.log("Successfully parsed FIREBASE_SERVICE_ACCOUNT from env var.");
  } catch (e) {
    console.error("CRITICAL ERROR: Failed to parse FIREBASE_SERVICE_ACCOUNT JSON from env var.");
    console.error("Ensure the environment variable value in Vercel is the complete, valid JSON content.");
    console.error("Error details:", e);
    throw new Error(`Failed to parse FIREBASE_SERVICE_ACCOUNT JSON: ${e.message}`);
  }
} else {
  // Fallback to the Local way (reading the file path from env var)
  console.log("FIREBASE_SERVICE_ACCOUNT env var not found. Attempting local file path...");
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (!serviceAccountPath) {
    console.error("CRITICAL ERROR: Neither FIREBASE_SERVICE_ACCOUNT nor FIREBASE_SERVICE_ACCOUNT_PATH environment variables are set.");
    throw new Error("Required Firebase service account environment variable is not set.");
  }

  // Construct the absolute path relative to the current file
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const absolutePath = path.resolve(__dirname, serviceAccountPath);

  try {
    // Read the file content directly
    const fileContent = fs.readFileSync(absolutePath, "utf8");
    // Parse the file content as JSON
    serviceAccount = JSON.parse(fileContent);
    console.log("Successfully read and parsed service account file from local path:", absolutePath);
  } catch (e) {
    console.error(`CRITICAL ERROR: Failed to read or parse service account file at local path: ${absolutePath}`);
    console.error("Ensure the path in .env (e.g., ./serviceAccountKey.json) is correct and the JSON file exists in the backend folder and is valid.");
    console.error("Error details:", e);
    throw new Error(`Failed to read/parse service account file: ${e.message}`);
  }
}

// Firebase Admin initialization
let firebaseApp;
if (!admin.apps.length) {
  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin initialized successfully using project ID:", serviceAccount.project_id);
  } catch (initError) {
    console.error("CRITICAL ERROR: Firebase Admin initialization failed.");
    console.error("Check if the parsed serviceAccount object is valid.");
    console.error(initError);
    throw new Error("Firebase Admin initialization failed.");
  }
} else {
  firebaseApp = admin.app();
  console.log("Firebase Admin already initialized.");
}

/**
 * This middleware verifies the Firebase auth token.
 */
const authMiddleware = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  const token = header.split(" ")[1];

  try {
    const decodedToken = await admin.auth(firebaseApp).verifyIdToken(token);
    req.userId = decodedToken.uid;
    next();
  } catch (error) {
    console.error("--- AUTHENTICATION FAILED (INSIDE CATCH BLOCK) ---");
    console.error("Token from frontend was REJECTED.");
    try {
      if (serviceAccount && serviceAccount.project_id) {
        console.error("Backend Project ID (from service key/env):", serviceAccount.project_id);
      } else {
        console.error("Could not read project_id from service account object.");
      }
    } catch (e) {
      console.error("Error accessing service account project_id:", e);
    }
    console.error("Full Error Details:", error.code, error.message);
    res.status(400).json({ message: "Token is not valid. See backend console for details." });
  }
};

export default authMiddleware;
