import { create } from 'zustand';
import { productionService } from '../services/productionService';

/**
 * ShootStore — manages product shoot/media state.
 * 
 * ARCHITECTURE: Screen → Store → Service → Data Source
 * This store NEVER imports mockData directly. All data flows through productionService.
 */
export const useShootStore = create((set, get) => ({
    shoots: [],
    isLoading: false,
    error: null,

    clearError: () => set({ error: null }),

    /**
     * Initialize shoot data from the service layer.
     */
    init: async () => {
        set({ isLoading: true, error: null });
        try {
            const shoots = await productionService.getShoots();
            set({ shoots, isLoading: false });
        } catch (error) {
            set({ isLoading: false, error: 'Failed to load media records.' });
            // Error handled in UI
        }
    },

    getShootByOrder: (orderId) => {
        return get().shoots.find(s => s.orderId === orderId) || null;
    },

    addShoot: async (shoot) => {
        set({ isLoading: true, error: null });
        try {
            const newShoot = await productionService.addShoot(shoot);
            set((state) => ({
                shoots: [...state.shoots, newShoot],
                isLoading: false,
            }));
        } catch (error) {
            set({ isLoading: false, error: 'Failed to create shoot record.' });
            // Error handled in UI
            throw error;
        }
    },

    updateShoot: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
            await productionService.updateShoot(id, updates);
            set((state) => ({
                shoots: state.shoots.map(s => s.id === id ? { ...s, ...updates } : s),
                isLoading: false,
            }));
        } catch (error) {
            set({ isLoading: false, error: 'Failed to update shoot status.' });
            // Error handled in UI
            throw error;
        }
    },

    addImage: (shootId, imageObj) => set((state) => ({
        shoots: state.shoots.map(s =>
            s.id === shootId ? { ...s, images: [...s.images, imageObj] } : s
        ),
    })),

    uploadImage: async (uri, path = 'shoots') => {
        set({ isLoading: true, error: null });
        try {
            const uploaded = await productionService.uploadImage(uri, path);
            set({ isLoading: false });
            return uploaded;
        } catch (error) {
            set({ isLoading: false, error: 'Upload failed. Check your network.' });
            throw error;
        }
    },

    removeImage: (shootId, imageId) => set((state) => ({
        shoots: state.shoots.map(s =>
            s.id === shootId ? { ...s, images: s.images.filter(i => (i.remoteUrl || i.localUri) !== imageId) } : s
        ),
    })),
}));

