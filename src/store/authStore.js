import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { loginUser } from '../services/authService';

/**
 * AuthStore — manages authentication state.
 *
 * ARCHITECTURE: Screen → AuthStore → AuthService (Firebase auth)
 */

const AUTH_KEY = 'atelier_auth_session';
const VALID_ROLES = new Set(['admin', 'staff']);

/** Session Persistence Helpers */
const saveSession = async (session) => {
    try {
        const data = JSON.stringify(session);
        if (Platform.OS === 'web') {
            localStorage.setItem(AUTH_KEY, data);
        } else {
            await SecureStore.setItemAsync(AUTH_KEY, data);
        }
    } catch (e) {
        // Silently fail in dev/unsupported envs
    }
};

const loadSession = async () => {
    try {
        if (Platform.OS === 'web') {
            const data = localStorage.getItem(AUTH_KEY);
            return data ? JSON.parse(data) : null;
        } else {
            const data = await SecureStore.getItemAsync(AUTH_KEY);
            return data ? JSON.parse(data) : null;
        }
    } catch (e) {
        return null;
    }
};

const clearSession = async () => {
    try {
        if (Platform.OS === 'web') {
            localStorage.removeItem(AUTH_KEY);
        } else {
            await SecureStore.deleteItemAsync(AUTH_KEY);
        }
    } catch (e) {
        // ignore
    }
};

export const useAuthStore = create((set, get) => ({
    user: null,
    role: null,
    isAuthenticated: false,
    isLoading: false,
    isInitializing: true, // true on boot — prevents navigation flicker
    error: null,

    clearError: () => set({ error: null }),

    /**
     * Called once on app boot to restore persisted session.
     */
    initSession: async () => {
        set({ isInitializing: true });
        try {
            const session = await loadSession();
            if (session && session.user && VALID_ROLES.has(session.role)) {
                set({
                    user: session.user,
                    role: session.role,
                    isAuthenticated: true,
                });
            }
        } catch (e) {
            // Restore failed, stay logged out
        } finally {
            set({ isInitializing: false });
        }
    },

    /**
     * Login — validates credentials, sets user + role atomically.
     */
    login: async (email, password) => {
        if (get().isLoading) return; // Debounce duplicate calls
        set({ isLoading: true, error: null });

        try {
            // 1. Call Firebase Auth Service
            const userData = await loginUser(email, password);
            
            const user = { 
                id: userData.uid, 
                name: userData.name, 
                email 
            };
            const role = userData.role;

            // Guard: only accept known roles
            if (!VALID_ROLES.has(role)) {
                throw new Error('Unauthorised: unknown role returned from server.');
            }

            // 2. Persist Session
            await saveSession({ user, role });

            // 3. Update State
            set({ user, role, isAuthenticated: true, isLoading: false, error: null });
        } catch (err) {
            set({
                isLoading: false,
                error: err.message || 'Login failed. Please try again.',
                user: null,
                role: null,
                isAuthenticated: false,
            });
            throw err;
        }
    },

    /**
     * Logout — clears ALL auth state atomically.
     */
    logout: async () => {
        set({ isLoading: true });
        try {
            // 1. Clean up all real-time listeners first
            const { useOrderStore } = await import('./orderStore');
            const { useProductionStore } = await import('./productionStore');
            const { useFinishingStore } = await import('./finishingStore'); // if it exists
            const { useCatalogueStore } = await import('./catalogueStore');
            const { useShootStore } = await import('./shootStore');

            useOrderStore.getState().destroy();
            useProductionStore.getState().destroy();
            useCatalogueStore.getState().destroy();
            useShootStore.getState().destroy();
            
            // Check if finishing store has destroy
            const finishingStore = useFinishingStore.getState();
            if (finishingStore.destroy) finishingStore.destroy();

            // 2. Clear persisted session
            await clearSession();
        } finally {
            set({
                user: null,
                role: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            });
        }
    },
}));
