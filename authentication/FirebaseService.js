/**
 * FirebaseService.js
 * Handles direct interaction with Firebase Authentication.
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyC_QPmomjx6YmP55SiorvkODVHf7-z8mTA",
  authDomain: "digilayn-core-app.firebaseapp.com",
  projectId: "digilayn-core-app",
  storageBucket: "digilayn-core-app.firebasestorage.app",
  messagingSenderId: "362012916883",
  appId: "1:362012916883:web:cade5dfb804dcf92912166",
  measurementId: "G-GGNE86WGK9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export const FirebaseService = {
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
