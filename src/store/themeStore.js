import { create } from 'zustand';

// Dark mode removed — app always uses light theme.
export const useThemeStore = create(() => ({
    isDark: false,
}));
