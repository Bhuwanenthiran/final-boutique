// ─────────────────────────────────────────────
// Firebase Configuration & Initialization
// File: src/config/firebase.js
// ─────────────────────────────────────────────

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ─── Paste your Firebase project config here ───
const firebaseConfig = {
  apiKey: "AIzaSyBrz7XwOKaISTkaQKkPFjZ94E-F0E8O-vQ",
  authDomain: "boutique-management-app-b63bc.firebaseapp.com",
  projectId: "boutique-management-app-b63bc",
  storageBucket: "boutique-management-app-b63bc.firebasestorage.app",
  messagingSenderId: "766812307637",
  appId: "1:766812307637:web:35e35afd95a725f3ed3efc",
  measurementId: "G-9YKV5CY1SN",
};
// ───────────────────────────────────────────────

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize & Export Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
