// Import necessary Firebase modules for app initialization, Firestore (database), and Auth (authentication)
import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

// Firebase configuration object containing sensitive credentials.
// The values are sourced from environment variables for security and flexibility.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY, // Public API key for accessing Firebase
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, // Auth domain used for Firebase Authentication
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, // Firebase project ID
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, // Firebase storage bucket for file uploads
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, // Sender ID for Firebase Cloud Messaging
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID, // Firebase app ID for identifying the application
};

// Initialize the Firebase app instance with the provided configuration
// `initializeApp` sets up the connection between your app and Firebase services
const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize Firestore (Firebase's database service) using the Firebase app instance
const firestore: Firestore = getFirestore(app);

// Initialize Firebase Authentication using the Firebase app instance
const auth: Auth = getAuth(app);

// Export the initialized Firebase app, Firestore, and Auth instances for use in other parts of the application
export { app, firestore, auth };
