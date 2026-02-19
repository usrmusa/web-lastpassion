import { auth, db, COLLECTIONS } from './core/FirebaseService.js';
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { init as initProductLoader } from './script.js';

// Make auth and db globally available for older parts of the code if needed
window.auth = auth;
window.db = db;

// Initial UI Setup: Fetch Logo and Banner from SSOT
async function loadSiteBranding() {
  try {
    const brandingDoc = await getDoc(doc(db, COLLECTIONS.PRODUCTS, 'main'));
    if (brandingDoc.exists()) {
      const data = brandingDoc.data();
      if (data.logoUrl) document.getElementById('site-logo').src = data.logoUrl;
      if (data.bannerUrl) document.getElementById('site-banner').src = data.bannerUrl;
    }
  } catch (e) {
    console.error("Error loading branding:", e);
  }
}

// Auth State Listener
const authLinks = document.getElementById('authLinks');
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // 1. Initial name from Auth profile - Show immediately
    let name = user.displayName || user.email.split('@')[0];
    authLinks.innerHTML = `<a href="/authentication/profile.html" class="nav-user-link">Hi, ${name}</a>`;

    // 2. Background fetch for the most up-to-date Full Name
    try {
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.displayName) {
           authLinks.innerHTML = `<a href="/authentication/profile.html" class="nav-user-link">Hi, ${data.displayName}</a>`;
        }
      }
    } catch (e) {
      console.error("Error updating display name:", e);
    }
  } else {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    authLinks.innerHTML = `<a href="/authentication/login.html?returnUrl=/${currentPath}">Login</a>`;
  }
  
  // Hide loader once auth state is determined
  document.getElementById('global-loader').classList.add('hidden');
});

// Initialize all page components
async function initializePage() {
    await loadSiteBranding();
    await initProductLoader(); // from script.js
}

initializePage();
