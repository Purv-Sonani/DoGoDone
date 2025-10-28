import dotenv from "dotenv";
dotenv.config(); // Loads environment variables from .env file locally

import admin from "firebase-admin";

const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!serviceAccountString) {
  console.error("CRITICAL ERROR: FIREBASE_SERVICE_ACCOUNT environment variable is not set or empty.");
  throw new Error("FIREBASE_SERVICE_ACCOUNT environment variable is not set.");
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(serviceAccountString);
} catch (e) {
  console.error("CRITICAL ERROR: Failed to parse FIREBASE_SERVICE_ACCOUNT JSON.");
  console.error("Ensure the environment variable value is the complete, valid JSON content.");
  throw new Error("Failed to parse FIREBASE_SERVICE_ACCOUNT JSON.");
}

// Firebase Admin initialization
let firebaseApp;
if (!admin.apps.length) {
  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin initialized successfully."); // Add success log
  } catch (initError) {
    console.error("CRITICAL ERROR: Firebase Admin initialization failed.");
    console.error(initError);
    throw new Error("Firebase Admin initialization failed.");
  }
} else {
  firebaseApp = admin.app();
  console.log("Firebase Admin already initialized."); // Add log
}

/**
 * This middleware verifies the Firebase auth token.
 */
const authMiddleware = async (req, res, next) => {
  // Add a log to see if middleware is even running
  console.log("Auth middleware executing...");

  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    console.log("Auth middleware: No token provided.");
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  const token = header.split(" ")[1];

  try {
    console.log("Auth middleware: Verifying token..."); // Add log
    const decodedToken = await admin.auth(firebaseApp).verifyIdToken(token);
    console.log("Auth middleware: Token verified successfully for UID:", decodedToken.uid); // Add log
    req.userId = decodedToken.uid;
    next();
  } catch (error) {
    console.error("--- AUTHENTICATION FAILED (INSIDE CATCH BLOCK) ---");
    console.error("Token from frontend was REJECTED.");
    console.error("Backend Project ID (from service key):", serviceAccount.project_id);
    console.error("Full Error Details:", error.code, error.message);
    res.status(400).json({ message: "Token is not valid. See backend console for details." });
  }
};

export default authMiddleware;
