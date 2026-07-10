import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCskwpd580PygL3H-o89DeO4UvKbgNDcgk",
  authDomain: "tennis-pickleball-champ.firebaseapp.com",
  projectId: "tennis-pickleball-champ",
  storageBucket: "tennis-pickleball-champ.firebasestorage.app",
  messagingSenderId: "794562751285",
  appId: "1:794562751285:web:9cec4a17c10573c3253a7c"
};

// Check if the user has replaced the placeholders
const isConfigured = 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "PLACEHOLDER_API_KEY" && 
  firebaseConfig.projectId !== "PLACEHOLDER_PROJECT_ID";

let app;
let db;

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("Firebase/Firestore successfully initialized!");
  } catch (error) {
    console.error("Error initializing Firebase:", error);
  }
} else {
  console.warn(
    "Firebase is not configured yet. The app will fall back to localStorage mode."
  );
}

export { app, db, isConfigured };
