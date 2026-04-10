import { create } from 'zustand';
import { productionService } from '../services/productionService';

/**
 * ProductionStore — manages production pipeline state with real-time Firestore synchronization.
 */
export const useProductionStore = create((set, get) => ({
    productionOrders: [],
    tailors: [],
    filterTailor: 'all',
    isLoading: false,
    error: null,
    subs: {
        orders: null,
        tailors: null
    },

    clearError: () => set({ error: null }),

    /**
     * Initializes the store by setting up real-time listeners for production orders and tailors.
     */
    init: async () => {
        const { subs } = get();
        // Clean up any old listeners
        Object.values(subs).forEach(unsub => unsub && unsub());

        set({ isLoading: true, error: null });
        try {
            const newSubs = {
                orders: productionService.getProductionOrders((orders) => set({ productionOrders: orders, isLoading: false })),
                tailors: productionService.getTailors((tailors) => set({ tailors })),
            };

            set({ subs: newSubs });
        } catch (error) {
            console.error("ProductionStore Init Error:", error);
            set({ isLoading: false, error: 'Failed to initialize production pipeline.' });
        }
    },

    destroy: () => {
        const { subs } = get();
        Object.values(subs).forEach(unsub => unsub && unsub());
        set({ subs: { orders: null, tailors: null } });
    },

    getFilteredProduction: () => {
        const { productionOrders, filterTailor } = get();
        let filtered = [...productionOrders];
        if (filterTailor !== 'all') {
            filtered = filtered.filter(o => o.tailorId === filterTailor);
        }
        return filtered;
    },

    setFilterTailor: (tailorId) => set({ filterTailor: tailorId }),

    updateProductionStatus: async (orderId, field, value) => {
        set({ isLoading: true, error: null });
        try {
            await productionService.updateProductionStatus(orderId, field, value);
            set({ isLoading: false });
        } catch (error) {
            set({ isLoading: false, error: 'Failed to update production status.' });
            throw error;
        }
    },
    
    // ... Additional actions as needed (kept simplified)
}));
