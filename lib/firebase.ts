import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCOACkPBfqLW9b5aPo6sdX13JJb_CHsmHg",
  authDomain: "maurobarber-90f20.firebaseapp.com",
  projectId: "maurobarber-90f20",
  storageBucket: "maurobarber-90f20.firebasestorage.app",
  messagingSenderId: "1040436780782",
  appId: "1:1040436780782:web:67d70ce37c7ae746f19dff"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
