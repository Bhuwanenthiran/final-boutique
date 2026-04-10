// ─────────────────────────────────────────────
// Firebase Configuration & Initialization
// File: src/config/firebase.js
// ─────────────────────────────────────────────

import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyBrz7XwOKaISTkaQKkPFjZ94E-F0E8O-vQ",
  authDomain: "boutique-management-app-b63bc.firebaseapp.com",
  projectId: "boutique-management-app-b63bc",
  storageBucket: "boutique-management-app-b63bc.firebasestorage.app",
  messagingSenderId: "766812307637",
  appId: "1:766812307637:web:35e35afd95a725f3ed3efc",
  measurementId: "G-9YKV5CY1SN",
};

// Prevent duplicate app initialization (important for hot-reload in Expo)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// ── Auth: use AsyncStorage persistence on mobile, default on web ──────────────
let auth;
if (Platform.OS === 'web') {
    auth = getAuth(app);
} else {
    // initializeAuth can only be called ONCE per app instance.
    // On Expo hot-reload, the module re-executes but the app already has auth,
    // so initializeAuth throws. We catch that and get the existing instance.
    try {
        auth = initializeAuth(app, {
            persistence: getReactNativePersistence(AsyncStorage),
        });
    } catch (e) {
        // Already initialized — retrieve the existing auth instance
        auth = getAuth(app);
    }
}

export { auth };
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
