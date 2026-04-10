import { create } from 'zustand';
import { productionService } from '../services/productionService';

/**
 * FinishingStore — manages finishing/quality-check state.
 *
 * ARCHITECTURE: Screen → Store → Service → Firestore
 * All data flows through productionService. No mock data.
 */

const EMPTY_FINISHING = {
    checking: false,
    ironing: false,
    threadCutting: false,
    approval: false,       // matches Firestore field & service key
    approvedBy: null,
    approvedAt: null,
    isReady: false,
};

export const useFinishingStore = create((set, get) => ({
    finishingRecords: {},
    isLoading: false,
    error: null,

    clearError: () => set({ error: null }),

    /**
     * Load finishing status for a specific order from Firestore.
     * Called when user selects an order on the Finishing screen.
     */
    loadFinishing: async (orderId) => {
        if (!orderId) return;
        set({ isLoading: true, error: null });
        try {
            const finishing = await productionService.getFinishingStatus(orderId);
            set((state) => ({
                finishingRecords: { ...state.finishingRecords, [orderId]: finishing },
                isLoading: false,
            }));
        } catch (error) {
            set({ isLoading: false, error: 'Failed to load quality check data.' });
        }
    },

    /**
     * init() — resets store state. Per-order data is loaded via loadFinishing().
     */
    init: async () => {
        set({ finishingRecords: {}, isLoading: false, error: null });
    },

    getFinishing: (orderId) => {
        const records = get().finishingRecords;
        return records[orderId] || { ...EMPTY_FINISHING };
    },

    /**
     * Marks a single finishing step as complete.
     * Delegates validation to productionService.updateFinishingStatus().
     */
    toggleChecklist: async (orderId, field) => {
        set({ isLoading: true, error: null });
        try {
            await productionService.updateFinishingStatus(orderId, field);
            // Refresh this order's finishing data from Firestore
            const updated = await productionService.getFinishingStatus(orderId);
            set((state) => ({
                finishingRecords: { ...state.finishingRecords, [orderId]: updated },
                isLoading: false,
            }));
        } catch (err) {
            set({ isLoading: false, error: err.message || 'Failed to update quality check status.' });
            throw err;
        }
    },

    /**
     * Marks the order as fully approved and ready for delivery.
     */
    markAsReady: async (orderId, approvedBy) => {
        set({ isLoading: true, error: null });
        try {
            const result = await productionService.markAsReady(orderId, approvedBy);
            set((state) => ({
                finishingRecords: {
                    ...state.finishingRecords,
                    [orderId]: {
                        ...(state.finishingRecords[orderId] || {}),
                        isReady: true,
                        approval: true,
                        approvedBy: result.approvedBy,
                        approvedAt: result.approvedAt,
                    },
                },
                isLoading: false,
            }));
        } catch (err) {
            set({ isLoading: false, error: err.message || 'Failed to grant quality approval.' });
            throw err;
        }
    },
}));

