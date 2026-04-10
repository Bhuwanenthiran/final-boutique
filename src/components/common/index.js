import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS, getColors } from '../../theme';
import { useThemeStore } from '../../store/themeStore';

export const Card = ({ children, style, onPress, elevated = false }) => {
    const isDark = useThemeStore(s => s.isDark);
    const C = getColors(isDark);

    const content = (
        <View style={[
            styles.card,
            { backgroundColor: C.bgCard, borderColor: C.borderLight },
            elevated && SHADOWS.medium,
            style
        ]}>
            {children}
        </View>
    );
    if (onPress) {
        return (
            <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
                {content}
            </TouchableOpacity>
        );
    }
    return content;
};

export const SectionHeader = ({ title, subtitle, actionText, onAction, icon }) => {
    const isDark = useThemeStore(s => s.isDark);
    const C = getColors(isDark);

    return (
        <View style={styles.sectionHeader}>
            <View style={{ flex: 1 }}>
                <View style={styles.sectionTitleRow}>
                    {icon && <Ionicons name={icon} size={20} color={C.primary} style={{ marginRight: SIZES.sm }} />}
                    <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>{title}</Text>
                </View>
                {subtitle && <Text style={[styles.sectionSubtitle, { color: C.textMuted }]}>{subtitle}</Text>}
            </View>
            {actionText && (
                <TouchableOpacity onPress={onAction} style={styles.sectionAction}>
                    <Text style={[styles.sectionActionText, { color: C.primary }]}>{actionText}</Text>
                    <Ionicons name="chevron-forward" size={14} color={C.primary} />
                </TouchableOpacity>
            )}
        </View>
    );
};

export const StatusBadge = ({ status, size = 'medium' }) => {
    const isDark = useThemeStore(s => s.isDark);
    const C = getColors(isDark);

    const getStatusStyle = () => {
        switch (status?.toLowerCase().replace(/\s/g, '_')) {
            case 'completed': case 'ready': case 'delivered':
                return { bg: C.successLight, text: C.success, dot: C.success };
            case 'in_progress': case 'in_production': case 'stitching':
                return { bg: C.warningLight, text: C.warning, dot: C.warning };
            case 'pending':
                return { bg: C.slateLight, text: C.slate, dot: C.slate };
            case 'marking': case 'cutting':
                return { bg: C.primaryMuted, text: C.primary, dot: C.primary };
            case 'cancelled': case 'on_hold':
                return { bg: C.errorLight, text: C.error, dot: C.error };
            default:
                return { bg: C.borderLight, text: C.textSecondary, dot: C.textMuted };
        }
    };
    const s = getStatusStyle();
    const isSmall = size === 'small';

    return (
        <View style={[styles.badge, { backgroundColor: s.bg }, isSmall && styles.badgeSmall]}>
            <View style={[styles.badgeDot, { backgroundColor: s.dot }, isSmall && styles.badgeDotSmall]} />
            <Text style={[styles.badgeText, { color: s.text }, isSmall && styles.badgeTextSmall]}>
                {status?.replace(/_/g, ' ')}
            </Text>
        </View>
    );
};

export const FloatingButton = ({ onPress, icon = 'add', label }) => {
    const insets = useSafeAreaInsets();
    const isDark = useThemeStore(s => s.isDark);
    const C = getColors(isDark);

    return (
        <TouchableOpacity
            style={[styles.fab, { bottom: SIZES.xl + insets.bottom }]}
            onPress={onPress}
            activeOpacity={0.85}
        >
            <View style={[styles.fabInner, { backgroundColor: C.primary }]}>
                <Ionicons name={icon} size={24} color={C.textOnPrimary} />
                {label && <Text style={[styles.fabLabel, { color: C.textOnPrimary }]}>{label}</Text>}
            </View>
        </TouchableOpacity>
    );
};

export const ScreenWrapper = ({ children, style, useSafeBottom = true, useSafeTop = true }) => {
    const insets = useSafeAreaInsets();
    const isDark = useThemeStore(s => s.isDark);
    const C = getColors(isDark);

    return (
        <View style={[
            { flex: 1, backgroundColor: C.bg },
            useSafeTop && { paddingTop: insets.top },
            useSafeBottom && { paddingBottom: insets.bottom },
            style
        ]}>
            {children}
        </View>
    );
};

export const EmptyState = ({ icon, title, subtitle, actionLabel, onAction }) => {
    const isDark = useThemeStore(s => s.isDark);
    const C = getColors(isDark);

    return (
        <View style={styles.emptyState}>
            <View style={[styles.emptyIconWrap, { backgroundColor: C.primaryMuted }]}>
                <Ionicons name={icon || 'folder-open-outline'} size={48} color={C.textMuted} />
            </View>
            <Text style={[styles.emptyTitle, { color: C.textSecondary }]}>{title}</Text>
            {subtitle && <Text style={[styles.emptySubtitle, { color: C.textMuted }]}>{subtitle}</Text>}
            {actionLabel && (
                <TouchableOpacity style={[styles.emptyAction, { backgroundColor: C.primary }]} onPress={onAction}>
                    <Text style={[styles.emptyActionText, { color: C.textOnPrimary }]}>{actionLabel}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

export const LoadingSkeleton = ({ width = '100%', height = 16, style }) => {
    const isDark = useThemeStore(s => s.isDark);
    const C = getColors(isDark);
    return (
        <View style={[styles.skeleton, { width, height, borderRadius: height / 2, backgroundColor: C.borderLight }, style]} />
    );
};

export const LoadingOverlay = ({ visible, message = 'Loading...' }) => {
    const isDark = useThemeStore(s => s.isDark);
    const C = getColors(isDark);

    if (!visible) return null;

    return (
        <View style={styles.loadingOverlay}>
            <View style={[styles.loadingCard, { backgroundColor: C.bgCard }]}>
                <ActivityIndicator size="large" color={C.primary} />
                <Text style={[styles.loadingText, { color: C.textSecondary }]}>{message}</Text>
            </View>
        </View>
    );
};

export const Divider = ({ style }) => {
    const isDark = useThemeStore(s => s.isDark);
    const C = getColors(isDark);
    return <View style={[styles.divider, { backgroundColor: C.divider }, style]} />;
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.bgCard,
        borderRadius: SIZES.radiusLg,
        padding: SIZES.base,
        marginBottom: SIZES.md,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        ...SHADOWS.small,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.lg,
        paddingVertical: SIZES.md,
        marginTop: SIZES.sm,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: SIZES.subtitle,
        color: COLORS.textPrimary,
        ...FONTS.semiBold,
        letterSpacing: 0.3,
    },
    sectionSubtitle: {
        fontSize: SIZES.small,
        color: COLORS.textMuted,
        marginTop: 2,
        ...FONTS.regular,
    },
    sectionAction: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionActionText: {
        fontSize: SIZES.small,
        color: COLORS.primary,
        ...FONTS.medium,
        marginRight: 2,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.xs + 2,
        borderRadius: SIZES.radiusFull,
    },
    badgeSmall: {
        paddingHorizontal: SIZES.sm,
        paddingVertical: SIZES.xs,
    },
    badgeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: SIZES.xs + 2,
    },
    badgeDotSmall: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        marginRight: SIZES.xs,
    },
    badgeText: {
        fontSize: SIZES.small,
        ...FONTS.medium,
        textTransform: 'capitalize',
    },
    badgeTextSmall: {
        fontSize: SIZES.caption,
    },
    fab: {
        position: 'absolute',
        bottom: SIZES.xl,
        right: SIZES.lg,
        zIndex: 100,
    },
    fabInner: {
        backgroundColor: COLORS.primary,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        ...SHADOWS.golden,
    },
    fabLabel: {
        color: COLORS.textOnPrimary,
        fontSize: SIZES.small,
        ...FONTS.semiBold,
        marginLeft: SIZES.xs,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SIZES.xxxl * 2,
        paddingHorizontal: SIZES.xl,
    },
    emptyIconWrap: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: COLORS.primaryMuted,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SIZES.lg,
    },
    emptyTitle: {
        fontSize: SIZES.bodyLg,
        color: COLORS.textSecondary,
        ...FONTS.semiBold,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: SIZES.body,
        color: COLORS.textMuted,
        ...FONTS.regular,
        textAlign: 'center',
        marginTop: SIZES.sm,
        lineHeight: 20,
    },
    emptyAction: {
        marginTop: SIZES.lg,
        backgroundColor: COLORS.primary,
        paddingHorizontal: SIZES.xl,
        paddingVertical: SIZES.md,
        borderRadius: SIZES.radiusFull,
    },
    emptyActionText: {
        color: COLORS.textOnPrimary,
        fontSize: SIZES.body,
        ...FONTS.semiBold,
    },
    skeleton: {
        backgroundColor: COLORS.borderLight,
        opacity: 0.6,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.divider,
        marginVertical: SIZES.md,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
    loadingCard: {
        borderRadius: SIZES.radiusLg,
        padding: SIZES.xl,
        alignItems: 'center',
        ...SHADOWS.medium,
        minWidth: 140,
    },
    loadingText: {
        marginTop: SIZES.md,
    },
});

export const ErrorCard = ({ title, message, onRetry, icon = 'alert-circle-outline' }) => {
    const isDark = useThemeStore(s => s.isDark);
    const C = getColors(isDark);

    return (
        <View style={[styles.errorCard, { backgroundColor: C.errorLight, borderColor: C.error + '30' }]}>
            <View style={styles.errorHeader}>
                <View style={[styles.errorIconWrap, { backgroundColor: C.error + '20' }]}>
                    <Ionicons name={icon} size={24} color={C.error} />
                </View>
                <View style={{ flex: 1, marginLeft: SIZES.md }}>
                    <Text style={[styles.errorTitle, { color: C.textPrimary }]}>{title || 'Something went wrong'}</Text>
                    <Text style={[styles.errorText, { color: C.textSecondary }]}>{message}</Text>
                </View>
            </View>
            {onRetry && (
                <TouchableOpacity
                    style={[styles.retryBtn, { backgroundColor: C.error }]}
                    onPress={onRetry}
                    activeOpacity={0.8}
                >
                    <Ionicons name="refresh-outline" size={16} color={C.textOnPrimary} />
                    <Text style={[styles.retryText, { color: C.textOnPrimary }]}>Try Again</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

export const ErrorOverlay = ({ visible, error, onRetry, onClose }) => {
    const isDark = useThemeStore(s => s.isDark);
    const C = getColors(isDark);

    if (!visible || !error) return null;

    return (
        <View style={styles.loadingOverlay}>
            <View style={[styles.errorOverlayCard, { backgroundColor: C.bgCard }]}>
                <View style={[styles.errorIconWrapLarge, { backgroundColor: C.error + '15' }]}>
                    <Ionicons name="warning-outline" size={40} color={C.error} />
                </View>
                <Text style={[styles.errorOverlayTitle, { color: C.textPrimary }]}>Operation Failed</Text>
                <Text style={[styles.errorOverlayMessage, { color: C.textMuted }]}>{error}</Text>

                <View style={styles.errorActions}>
                    {onClose && (
                        <TouchableOpacity
                            style={[styles.closeBtn, { borderColor: C.border }]}
                            onPress={onClose}
                        >
                            <Text style={[styles.closeBtnText, { color: C.textSecondary }]}>Dismiss</Text>
                        </TouchableOpacity>
                    )}
                    {onRetry && (
                        <TouchableOpacity
                            style={[styles.retryFullBtn, { backgroundColor: C.primary }]}
                            onPress={onRetry}
                        >
                            <Ionicons name="refresh-outline" size={18} color={C.textOnPrimary} />
                            <Text style={[styles.retryFullText, { color: C.textOnPrimary }]}>Retry Action</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
};

const extraStyles = StyleSheet.create({
    errorCard: {
        borderRadius: SIZES.radiusLg,
        padding: SIZES.lg,
        borderWidth: 1,
        marginHorizontal: SIZES.lg,
        marginVertical: SIZES.md,
    },
    errorHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    errorIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorTitle: {
        fontSize: SIZES.body,
        ...FONTS.semiBold,
    },
    errorText: {
        fontSize: SIZES.small,
        marginTop: 4,
        lineHeight: 18,
    },
    retryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: SIZES.md,
        paddingVertical: SIZES.sm,
        borderRadius: SIZES.radiusMd,
    },
    retryText: {
        fontSize: SIZES.small,
        ...FONTS.semiBold,
        marginLeft: 6,
    },
    errorOverlayCard: {
        width: '85%',
        borderRadius: SIZES.radiusXl,
        padding: SIZES.xl,
        alignItems: 'center',
        ...SHADOWS.large,
    },
    errorIconWrapLarge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SIZES.lg,
    },
    errorOverlayTitle: {
        fontSize: SIZES.subtitle,
        ...FONTS.bold,
        marginBottom: SIZES.sm,
    },
    errorOverlayMessage: {
        fontSize: SIZES.body,
        textAlign: 'center',
        marginBottom: SIZES.xl,
        lineHeight: 22,
    },
    errorActions: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
    },
    closeBtn: {
        flex: 1,
        paddingVertical: SIZES.md,
        borderRadius: SIZES.radiusMd,
        borderWidth: 1,
        alignItems: 'center',
        marginRight: SIZES.sm,
    },
    closeBtnText: {
        fontSize: SIZES.body,
        ...FONTS.medium,
    },
    retryFullBtn: {
        flex: 2,
        flexDirection: 'row',
        paddingVertical: SIZES.md,
        borderRadius: SIZES.radiusMd,
        alignItems: 'center',
        justifyContent: 'center',
    },
    retryFullText: {
        fontSize: SIZES.body,
        ...FONTS.bold,
        marginLeft: 8,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SIZES.xxl,
        minHeight: 300,
    },
    emptyIconWrap: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SIZES.lg,
    },
    emptyTitle: {
        fontSize: SIZES.subtitle,
        ...FONTS.bold,
        marginBottom: SIZES.sm,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: SIZES.body,
        ...FONTS.regular,
        textAlign: 'center',
        marginBottom: SIZES.xl,
        paddingHorizontal: SIZES.lg,
        lineHeight: 22,
    },
    emptyAction: {
        paddingHorizontal: SIZES.xl,
        paddingVertical: SIZES.md,
        borderRadius: SIZES.radiusMd,
        ...SHADOWS.small,
    },
    emptyActionText: {
        fontSize: SIZES.body,
        ...FONTS.semiBold,
    },
});

// Update styles at the bottom to merge extraStyles
Object.assign(styles, extraStyles);
