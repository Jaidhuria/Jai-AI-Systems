import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyC8ucEOhI1kg15LHzbUHmP84i2LYdlLNJE",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "smartbus-8e09b.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "smartbus-8e09b",
  storageBucket:
    process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "smartbus-8e09b.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "967747934698",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:967747934698:web:073c3dd64315c0537a3a93",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-RMC220BZ5Q",
};

const app = initializeApp(firebaseConfig);
let analytics;
try {
  analytics = getAnalytics(app);
} catch (e) {
  analytics = null;
}

const auth = getAuth(app);

export { app, analytics, auth };