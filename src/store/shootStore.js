import { create } from 'zustand';
import { shootService } from '../services/shootService';

export const useShootStore = create((set, get) => ({
    shootStatuses: {}, 
    isLoading: false,
    error: null,
    unsubscribe: null,

    clearError: () => set({ error: null }),

    init: () => {
        // Prevent multiple listeners
        if (get().unsubscribe) return;

        console.log("Starting Shoot Media real-time sync...");
        const unsub = shootService.subscribeShootStatuses((statuses) => {
            set({ shootStatuses: statuses, isLoading: false });
        });
        
        set({ unsubscribe: unsub });
    },

    destroy: () => {
        const { unsubscribe } = get();
        if (unsubscribe) unsubscribe();
        set({ unsubscribe: null, shootStatuses: {} });
    },

    toggleShootStatus: async (orderId) => {
        const currentStatuses = get().shootStatuses;
        const currentData = currentStatuses[orderId];
        const currentStatus = currentData ? currentData.shootCompleted : false;
        const newStatus = !currentStatus;

        // --- Optimistic Update (Instant UI change) ---
        const optimisticStatuses = {
            ...currentStatuses,
            [orderId]: { 
                ...currentData, 
                shootCompleted: newStatus,
                isOptimistic: true // Mark as pending sync
            }
        };
        set({ shootStatuses: optimisticStatuses, error: null });

        try {
            await shootService.updateShootStatus(orderId, newStatus);
            // The real-time listener will replace the optimistic state 
            // once the server confirms the write.
        } catch (error) {
            // Revert on error
            set({ 
                shootStatuses: currentStatuses,
                error: 'Failed to sync with cloud. Check your connection.' 
            });
            throw error;
        }
    },
}));
