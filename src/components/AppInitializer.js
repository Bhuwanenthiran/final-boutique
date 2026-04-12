import React, { useEffect, useState } from 'react';
import { useOrderStore } from '../store/orderStore';
import { useProductionStore } from '../store/productionStore';
import { useFinishingStore } from '../store/finishingStore';
import { useCatalogueStore } from '../store/catalogueStore';
import { useShootStore } from '../store/shootStore';
import { useAuthStore } from '../store/authStore';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

/**
 * AppInitializer — initializes all stores on mount.
 * 
 * Flow: AppInitializer → Store.init() → Service.getData() → Data Source
 */
const AppInitializer = ({ children }) => {
    const initOrders = useOrderStore((s) => s.init);
    const initProduction = useProductionStore((s) => s.init);
    const initFinishing = useFinishingStore((s) => s.init);
    const initCatalogue = useCatalogueStore((s) => s.init);
    const initShoots = useShootStore((s) => s.init);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    
    // Crucial for mobile: Async storage loads fast in Zustand, but Firebase internal
    // auth takes an extra millisecond to restore. We must wait for Firebase.
    const [firebaseReady, setFirebaseReady] = useState(false);

    useEffect(() => {
        console.log("[AppInitializer] Monitoring Firebase Auth state...");
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (user) {
                console.log("[AppInitializer] Firebase Auth: Authenticated as", user.email);
                setFirebaseReady(true);
            } else {
                console.warn("[AppInitializer] Firebase Auth: Not Authenticated");
                setFirebaseReady(false);
                
                // STALE SESSION FIX: 
                // If the app thinks it's logged in (from local storage) but Firebase says NO,
                // we must force a logout to clear the local "zombie" session.
                if (isAuthenticated) {
                    console.error("[AppInitializer] Stale Session Detected! Redirecting to login...");
                    const { useAuthStore } = await import('../store/authStore');
                    useAuthStore.getState().logout();
                }
            }
        });
        return unsub;
    }, [isAuthenticated]);

    useEffect(() => {
        console.log("[AppInitializer] Store Init Check:", { isAuthenticated, firebaseReady });

        // Only fetch from Firestore when Firebase explicitly confirms the user token is active
        if (!isAuthenticated) return;

        if (!firebaseReady) {
            console.warn("[AppInitializer] Waiting for Firebase session sync...");
            return;
        }

        console.log("[AppInitializer] Starting all store listeners...");
        Promise.all([
            initOrders(),
            initProduction(),
            initFinishing(),
            initCatalogue(),
            initShoots(),
        ]).then(() => {
            console.log("[AppInitializer] All stores initialized successfully.");
        }).catch((err) => {
            console.error("[AppInitializer] Store Init Error:", err);
            useOrderStore.setState({ isLoading: false, error: 'Initialization failed' });
            useProductionStore.setState({ isLoading: false });
        });
    }, [isAuthenticated, firebaseReady]);

    return children;
};

export default AppInitializer;
