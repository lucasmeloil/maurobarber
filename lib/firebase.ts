import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCABz2AFIgkyMy-ufqTlLwEOVGnt9RKR_c",
  authDomain: "mauro-b.firebaseapp.com",
  projectId: "mauro-b",
  storageBucket: "mauro-b.firebasestorage.app",
  messagingSenderId: "409690979779",
  appId: "1:409690979779:web:8583cfff175fc5951c1176"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
