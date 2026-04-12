// ─────────────────────────────────────────────
// Firebase Configuration & Initialization
// File: src/config/firebase.js
// ─────────────────────────────────────────────

import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
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

// Prevent duplicate app initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// ── Auth: persistence ──────────────────────────────────────────────────
let auth;
if (Platform.OS === 'web') {
    auth = getAuth(app);
} else {
    try {
        auth = initializeAuth(app, {
            persistence: getReactNativePersistence(AsyncStorage),
        });
    } catch (e) {
        auth = getAuth(app);
    }
}

// ── Firestore: Offline Persistence ──────────────────────────────────────
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

export { auth, db };
export const storage = getStorage(app);
export default app;
