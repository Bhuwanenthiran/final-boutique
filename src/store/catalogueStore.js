import { create } from 'zustand';
import { catalogueService } from '../services/catalogueService';

/**
 * CatalogueStore — manages hold orders, cancellations, and alterations.
 * 
 * ARCHITECTURE: Screen → Store → Service → Data Source
 * This store NEVER imports mockData directly. All data flows through catalogueService.
 * ID generation and date normalization happen in the service.
 */
export const useCatalogueStore = create((set, get) => ({
    holdOrders: [],
    cancelledOrders: [],
    alterations: [],
    activeTab: 'hold',
    isLoading: false,
    error: null,
    unsubscribes: {},

    clearError: () => set({ error: null }),

    /**
     * Initialize catalogue data with real-time subscriptions.
     */
    init: () => {
        get().subscribeToCatalogue();
    },

    /**
     * Subscribe to all catalogue-related collections.
     */
    subscribeToCatalogue: () => {
        const { unsubscribes } = get();
        // Prevent double subscriptions
        if (unsubscribes.hold || unsubscribes.cancelled || unsubscribes.alterations) return;

        console.log("Subscribing to Catalogue Firestore updates...");

        const unsubHold = catalogueService.subscribeHoldOrders((data) => {
            set({ holdOrders: data });
        });

        const unsubCancelled = catalogueService.subscribeCancelledOrders((data) => {
            set({ cancelledOrders: data });
        });

        const unsubAlteration = catalogueService.subscribeAlterations((data) => {
            set({ alterations: data });
        });

        set({
            unsubscribes: {
                hold: unsubHold,
                cancelled: unsubCancelled,
                alterations: unsubAlteration
            }
        });
    },

    /**
     * Clean up all subscriptions.
     */
    destroy: () => {
        const { unsubscribes } = get();
        console.log("Cleaning up Catalogue listeners...");
        if (unsubscribes.hold) unsubscribes.hold();
        if (unsubscribes.cancelled) unsubscribes.cancelled();
        if (unsubscribes.alterations) unsubscribes.alterations();
        
        set({ unsubscribes: {} });
    },

    setActiveTab: (tab) => set({ activeTab: tab }),

    addHoldOrder: async (order) => {
        set({ isLoading: true, error: null });
        try {
            await catalogueService.addHoldOrder(order);
            set({ isLoading: false });
        } catch (error) {
            set({ isLoading: false, error: 'Failed to place order on hold.' });
            // Error handled in UI
            throw error;
        }
    },

    removeHoldOrder: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await catalogueService.removeHoldOrder(id);
            set({ isLoading: false });
        } catch (error) {
            set({ isLoading: false, error: 'Failed to remove hold order.' });
            // Error handled in UI
            throw error;
        }
    },

    restoreHoldOrder: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await catalogueService.restoreHoldOrder(id);
            set({ isLoading: false });
        } catch (error) {
            set({ isLoading: false, error: 'Failed to restore hold order.' });
            // Error handled in UI
            throw error;
        }
    },

    addCancelledOrder: async (order) => {
        set({ isLoading: true, error: null });
        try {
            await catalogueService.addCancelledOrder(order);
            set({ isLoading: false });
        } catch (error) {
            set({ isLoading: false, error: 'Failed to process cancellation.' });
            // Error handled in UI
            throw error;
        }
    },

    deleteCancelledOrder: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await catalogueService.deleteCancelledOrder(id);
            set({ isLoading: false });
        } catch (error) {
            set({ isLoading: false, error: 'Failed to delete cancellation record.' });
            // Error handled in UI
            throw error;
        }
    },

    addAlteration: async (alteration) => {
        set({ isLoading: true, error: null });
        try {
            await catalogueService.addAlteration(alteration);
            set({ isLoading: false });
        } catch (error) {
            set({ isLoading: false, error: 'Failed to add alteration record.' });
            // Error handled in UI
            throw error;
        }
    },

    updateAlteration: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
            await catalogueService.updateAlteration(id, updates);
            set({ isLoading: false });
        } catch (error) {
            set({ isLoading: false, error: 'Failed to update alteration.' });
            // Error handled in UI
            throw error;
        }
    },

    deleteAlteration: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await catalogueService.deleteAlteration(id);
            set({ isLoading: false });
        } catch (error) {
            set({ isLoading: false, error: 'Failed to delete alteration record.' });
            throw error;
        }
    },


}));
