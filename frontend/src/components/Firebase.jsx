// Firebase.jsx
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "login-auth-b193f.firebaseapp.com",
  projectId: "login-auth-b193f",
  storageBucket: "login-auth-b193f.firebasestorage.app",
  messagingSenderId: "613634565446",
  appId: "1:613634565446:web:20c3eaa6ce4cf3e68eb147",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account"
});

export default app;
