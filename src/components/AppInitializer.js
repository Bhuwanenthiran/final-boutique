import React, { useEffect } from 'react';
import { useOrderStore } from '../store/orderStore';
import { useProductionStore } from '../store/productionStore';
import { useFinishingStore } from '../store/finishingStore';
import { useCatalogueStore } from '../store/catalogueStore';

import { useShootStore } from '../store/shootStore';

/**
 * AppInitializer — initializes all stores on mount.
 * 
 * ARCHITECTURE: This is the single point where stores load their initial data.
 * Each store's init() method calls the corresponding service, which reads from
 * the data source (currently mockData, future Firebase).
 * 
 * Flow: AppInitializer → Store.init() → Service.getData() → Data Source
 * 
 * Renders nothing — purely a side-effect component.
 */
const AppInitializer = ({ children }) => {
    const initOrders = useOrderStore((s) => s.init);
    const initProduction = useProductionStore((s) => s.init);
    const initFinishing = useFinishingStore((s) => s.init);
    const initCatalogue = useCatalogueStore((s) => s.init);

    const initShoots = useShootStore((s) => s.init);

    useEffect(() => {
        // Initialize all stores in parallel
        Promise.all([
            initOrders(),
            initProduction(),
            initFinishing(),
            initCatalogue(),

            initShoots(),
        ]).catch(() => {
            // Error handled in individual stores
        });
    }, []);

    return children;
};

export default AppInitializer;
