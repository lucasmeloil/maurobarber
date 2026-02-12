import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyA6U7PrjbQlGtyAyTHT3Iik1LvgK50Kk_E",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "maurobarber-44a91.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "maurobarber-44a91",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "maurobarber-44a91.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "727174753035",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:727174753035:web:e2a5215db9135332fa100e",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-XXXXXXXXXX"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Use standard Firestore for maximum browser compatibility
// Persistence is handled automatically by the newer SDKs in many cases, 
// or we can enable it specifically if needed.
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Initialize Analytics safely (only on client side)
let analytics: any = null;
if (typeof window !== "undefined") {
    isSupported().then(yes => {
        if (yes) {
            analytics = getAnalytics(app);
            console.log("📊 Analytics Inicializado");
        }
    });
}

export { app, db, auth, storage, analytics };
