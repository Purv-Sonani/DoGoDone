import admin from 'firebase-admin';

// Make sure you have the 'serviceAccountKey.json' in your /backend folder
import serviceAccount from '../serviceAccountKey.json' with { type: "json" };

// Safer Firebase Admin initialization
// This ensures we always have a reference to the app
let firebaseApp;
if (!admin.apps.length) {
    firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
} else {
    firebaseApp = admin.app(); // Get the default app if already initialized
}

/**
 * This middleware verifies the Firebase auth token.
 */
const authMiddleware = async (req, res, next) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const token = header.split(' ')[1];

    try {
        const decodedToken = await admin.auth(firebaseApp).verifyIdToken(token);
        req.userId = decodedToken.uid; // Add user ID to the request object
        next();
    } catch (error) {
        // --- THIS IS THE NEW, SAFER LOGGING ---
        console.error("--- AUTHENTICATION FAILED (INSIDE CATCH BLOCK) ---");
        console.error("Token from frontend was REJECTED.");
        console.error("This almost certainly means your backend 'serviceAccountKey.json' does not match your frontend 'firebaseConfig'.");
        
        // Safely get the Project ID
        try {
            console.error("Backend Project ID (from service key):", serviceAccount.project_id);
        } catch (e) {
            console.error("Could not read 'project_id' from serviceAccountKey.json.");
        }
        
        console.error("Full Error Details:", error.code, error.message);
        // --- END OF NEW LOGGING ---

        res.status(400).json({ message: 'Token is not valid. See backend console for details.' });
    }
};

export default authMiddleware;

