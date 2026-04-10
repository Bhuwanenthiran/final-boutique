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
        const unsub = onAuthStateChanged(auth, (user) => {
            setFirebaseReady(!!user);
        });
        return unsub;
    }, []);

    useEffect(() => {
        // Only fetch from Firestore when Firebase explicitly confirms the user token is active
        if (!isAuthenticated || !firebaseReady) return;

        Promise.all([
            initOrders(),
            initProduction(),
            initFinishing(),
            initCatalogue(),
            initShoots(),
        ]).catch((err) => {
            console.error("AppInitializer Store Init Error:", err);
            useOrderStore.setState({ isLoading: false });
            useProductionStore.setState({ isLoading: false });
        });
    }, [isAuthenticated, firebaseReady]);

    return children;
};

export default AppInitializer;
