/**
 * FirebaseService.js - Single Source of Truth for Firebase
 * Centrally managed configuration and utilities for Last Passion.
 */
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

// Constants for SSOT
export const COLLECTIONS = {
    PRODUCTS: "lastpassion",
    USERS: "users",
    USERNAMES: "usernames"
};

export const STORAGE_PATHS = {
    PRODUCTS: "lastpassion",
    PROFILES: "users"
};

export const PRODUCT_VISIBILITY = {
    PUBLIC: "public",
    EXCLUSIVE: "exclusive",
    PRIVATE: "private",
    COMING_SOON: "coming_soon"
};

// Wrapper for Auth logic (Legacy compatibility + helper)
export const AuthService = {
    signIn: (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    },
    signUp: async (email, password, name) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        return userCredential;
    },
    getCurrentUser: () => auth.currentUser,
    logout: () => auth.signOut()
};
