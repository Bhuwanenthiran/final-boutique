// Mellinam Designer Studio — Premium Design System
import { Platform } from 'react-native';

// Inspired by luxury tailoring studios: warm ivories, muted rose, gold accents
export const COLORS = {
    // Primary Palette — Warm & Luxurious
    primary: '#B8860B',        // Dark goldenrod — the thread of luxury
    primaryLight: '#D4A843',
    primarySoft: '#F5E6C8',
    primaryMuted: '#FDF2E0',

    // Accent — Muted Rose
    accent: '#C27A7A',
    accentLight: '#E8B4B4',
    accentSoft: '#FBE8E8',

    // Backgrounds
    bg: '#FDF6F0',             // Warm cream
    bgCard: '#FFFFFF',
    bgElevated: '#FFF9F4',
    bgOverlay: 'rgba(45, 35, 25, 0.4)',

    // Text
    textPrimary: '#2D2319',    // Dark warm brown
    textSecondary: '#7A6B5D',
    textMuted: '#A89888',
    textLight: '#C4B5A5',
    textOnPrimary: '#FFFFFF',

    // Status
    success: '#6B9E6B',
    successLight: '#E8F5E8',
    warning: '#D4A843',
    warningLight: '#FFF8E7',
    error: '#C27A7A',
    errorLight: '#FBE8E8',
    info: '#7A9EB8',
    infoLight: '#E8F0F8',

    // Borders & Dividers
    border: '#EDE5DC',
    borderLight: '#F5EFE8',
    divider: '#F0E8E0',

    // Shadows
    shadowColor: '#2D2319',

    // Special
    gold: '#B8860B',
    goldLight: '#F5E6C8',
    rose: '#C27A7A',
    roseLight: '#FBE8E8',
    sage: '#6B9E6B',
    sageLight: '#E8F5E8',
    slate: '#7A9EB8',
    slateLight: '#E8F0F8',
};

export const DARK_COLORS = {
    // Primary Palette — same gold for brand consistency
    primary: '#D4A843',
    primaryLight: '#E8C47A',
    primarySoft: '#3A2E1A',
    primaryMuted: '#2A2010',

    // Accent — Muted Rose (brightened slightly for dark bg)
    accent: '#D48A8A',
    accentLight: '#5A3030',
    accentSoft: '#3A2020',

    // Backgrounds
    bg: '#1A1612',             // Deep warm dark
    bgCard: '#231E18',
    bgElevated: '#2A2318',
    bgOverlay: 'rgba(0, 0, 0, 0.6)',

    // Text
    textPrimary: '#F5EDE0',
    textSecondary: '#B0A090',
    textMuted: '#7A6B5D',
    textLight: '#5A4E42',
    textOnPrimary: '#1A1612',

    // Status
    success: '#7BBD7B',
    successLight: '#1A2E1A',
    warning: '#D4A843',
    warningLight: '#2E2610',
    error: '#D48A8A',
    errorLight: '#2E1A1A',
    info: '#8AB8D4',
    infoLight: '#1A2A36',

    // Borders & Dividers
    border: '#3A3028',
    borderLight: '#2E2820',
    divider: '#302820',

    // Shadows
    shadowColor: '#000000',

    // Special
    gold: '#D4A843',
    goldLight: '#3A2E1A',
    rose: '#D48A8A',
    roseLight: '#3A2020',
    sage: '#7BBD7B',
    sageLight: '#1A2E1A',
    slate: '#8AB8D4',
    slateLight: '#1A2A36',
};

// Helper to get the right palette based on theme
export const getColors = (isDark) => (isDark ? DARK_COLORS : COLORS);

export const FONTS = {
    light: { fontWeight: '300', letterSpacing: 0.5 },
    regular: { fontWeight: '400', letterSpacing: 0.2 },
    medium: { fontWeight: '500', letterSpacing: 0.1 },
    semiBold: { fontWeight: '600', letterSpacing: -0.2 },
    bold: { fontWeight: '700', letterSpacing: -0.5 },

    serif: { fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif' },
    heading: { lineHeight: 34, letterSpacing: -0.8 },
    body: { lineHeight: 22 },
};

export const SIZES = {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    xxxl: 40,

    radiusSm: 8,
    radiusMd: 12,
    radiusLg: 16,
    radiusXl: 20,
    radiusFull: 999,

    caption: 11,
    small: 13,
    body: 15,
    bodyLg: 17,
    subtitle: 20,
    title: 24,
    heading: 30,
    hero: 38,
};

export const SHADOWS = {
    small: {
        ...Platform.select({
            web: { boxShadow: `0px 2px 8px rgba(45, 35, 25, 0.06)` },
            default: {
                shadowColor: COLORS.shadowColor,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 2,
            }
        })
    },
    medium: {
        ...Platform.select({
            web: { boxShadow: `0px 4px 16px rgba(45, 35, 25, 0.08)` },
            default: {
                shadowColor: COLORS.shadowColor,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 16,
                elevation: 4,
            }
        })
    },
    large: {
        ...Platform.select({
            web: { boxShadow: `0px 8px 24px rgba(45, 35, 25, 0.12)` },
            default: {
                shadowColor: COLORS.shadowColor,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.12,
                shadowRadius: 24,
                elevation: 8,
            }
        })
    },
    golden: {
        ...Platform.select({
            web: { boxShadow: `0px 4px 12px rgba(184, 134, 11, 0.2)` },
            default: {
                shadowColor: COLORS.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 12,
                elevation: 4,
            }
        })
    },
};

export default { COLORS, DARK_COLORS, getColors, FONTS, SIZES, SHADOWS };
