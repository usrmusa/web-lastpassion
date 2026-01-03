/**
 * FirebaseService.js - Single Source of Truth for Firebase
 * Centrally managed configuration and utilities for Last Passion.
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyC_QPmomjx6YmP55SiorvkODVHf7-z8mTA",
  authDomain: "digilayn-core-app.firebaseapp.com",
  projectId: "digilayn-core-app",
  storageBucket: "digilayn-core-app.firebasestorage.app",
  messagingSenderId: "362012916883",
  appId: "1:362012916883:web:cade5dfb804dcf92912166",
  measurementId: "G-GGNE86WGK9"
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
