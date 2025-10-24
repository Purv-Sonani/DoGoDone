import admin from "firebase-admin";
import fs from "fs";

// This function assumes 'serviceAccountKey.json' is in the SAME folder (backend/)
// You must get this file from your Firebase Project Settings > Service accounts
const serviceAccountPath = "./serviceAccountKey.json";

if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath));

  // Initialize the Firebase Admin SDK
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else {
  console.error("!!! FATAL ERROR: 'serviceAccountKey.json' not found. !!!");
  console.error("Please download it from your Firebase project settings and place it in the 'backend' folder.");
  // We don't exit the process here, but auth will fail.
}

// This is our Express middleware function
const authMiddleware = async (req, res, next) => {
  // Get the token from the "Authorization" header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send({ message: "Unauthorized: No token provided." });
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    // Verify the token with Firebase
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Add the user's ID to the request object
    req.userId = decodedToken.uid;

    // Continue to the next function (our API route)
    next();
  } catch (error) {
    console.error("Error verifying token:", error.message);
    return res.status(401).send({ message: "Unauthorized: Invalid token." });
  }
};

export default authMiddleware;
