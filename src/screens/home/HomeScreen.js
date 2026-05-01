import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, RefreshControl, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS, getColors } from '../../theme';
import { useThemeStore } from '../../store/themeStore';
import { useOrderStore } from '../../store/orderStore';
import { useProductionStore } from '../../store/productionStore';

import { Card, StatusBadge, LoadingOverlay, ErrorCard, ErrorOverlay, ScreenWrapper } from '../../components/common';

const { width } = Dimensions.get('window');

const RecentOrderCard = React.memo(({ order, navigation, colors }) => (
    <Card
        style={styles.recentOrderCard}
        onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
    >
        <View style={styles.orderTop}>
            <View>
                <Text style={[styles.orderId, { color: colors.textMuted }]}>{order.orderNo || order.id}</Text>
                <Text style={[styles.orderCustomer, { color: colors.textPrimary }]}>{order.customerName}</Text>
            </View>
            <StatusBadge status={order.status} size="small" />
        </View>
        <View style={[styles.orderBottom, { borderTopColor: colors.borderLight }]}>
            <View style={styles.orderMeta}>
                <Ionicons name="shirt-outline" size={13} color={colors.textMuted} />
                <Text style={[styles.orderMetaText, { color: colors.textMuted }]}>{order.designName}</Text>
            </View>
            <Text style={[styles.orderAmount, { color: colors.primary }]}>₹{order.totalAmount.toLocaleString('en-IN')}</Text>
        </View>
    </Card>
));

const HomeScreen = ({ navigation }) => {
    const isDark = useThemeStore(s => s.isDark);
    const C = getColors(isDark);
    const insets = useSafeAreaInsets();
    const orders = useOrderStore((s) => s.orders);
    const initOrders = useOrderStore((s) => s.init);
    const isLoading = useOrderStore((s) => s.isLoading);
    const error = useOrderStore((s) => s.error);
    const clearError = useOrderStore((s) => s.clearError);
    const productionOrders = useProductionStore((s) => s.productionOrders);


    const onRefresh = React.useCallback(async () => {
        try {
            await initOrders();
        } catch (error) {
            // Error managed by stores
        }
    }, [initOrders]);

    const stats = React.useMemo(() => {
        const totalRevenue = orders.reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0);
        const pendingCollection = orders.reduce((sum, o) => sum + (parseFloat(o.balanceAmount) || 0), 0);
        const collectedAmount = totalRevenue - pendingCollection;
        const collectionRate = totalRevenue > 0 ? (collectedAmount / totalRevenue) : 0;

        return {
            pendingOrders: orders.filter(o => o?.status?.toLowerCase() === 'pending').length,
            inProduction: orders.filter(o => {
                const s = o?.status?.toLowerCase() || '';
                return ['in production', 'marking', 'cutting', 'active'].includes(s);
            }).length,
            readyOrders: orders.filter(o => o?.status?.toLowerCase() === 'ready').length,
            totalRevenue,
            pendingCollection,
            collectedAmount,
            collectionRate,
            recentOrders: orders.slice(0, 4)
        };
    }, [orders]);

    const quickActions = React.useMemo(() => [
        { icon: 'add-circle-outline', label: 'New Order', color: C.primary, screen: 'OrderEntry' },
        { icon: 'cut-outline', label: 'Production', color: C.accent, screen: 'StitchingProduction' },
        { icon: 'checkmark-done-outline', label: 'Finishing', color: C.success, screen: 'Finishing' },
        { icon: 'albums-outline', label: 'Catalogue', color: C.slate, screen: 'Catalogue' },
    ], [C]);

    return (
        <ScreenWrapper useSafeTop useSafeBottom={false}>
            <LoadingOverlay visible={isLoading && orders.length === 0 && !error} message="Loading dashboard..." />
            <ErrorOverlay
                visible={!!error && orders.length > 0}
                error={error}
                onRetry={onRefresh}
                onClose={clearError}
            />

            {error && orders.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', padding: SIZES.xl }}>
                    <ErrorCard
                        title="Dashboard Error"
                        message={error}
                        onRetry={onRefresh}
                    />
                </View>
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]}
                    refreshControl={
                        <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={C.primary} />
                    }
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.greeting, { color: C.textMuted }]}>Welcome back</Text>
                            <Text style={[styles.title, { color: C.textPrimary }]}>Mellinam Designer Studio</Text>
                        </View>
                        <Image 
                            source={require('../../../assets/logo.jpg')} 
                            style={styles.headerLogo}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Stats Cards */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsRow}>
                        <View style={[styles.statCard, { backgroundColor: C.primaryMuted }]}>
                            <View style={[styles.statIcon, { backgroundColor: C.primarySoft }]}>
                                <Ionicons name="receipt-outline" size={20} color={C.primary} />
                            </View>
                            <Text style={[styles.statValue, { color: C.textPrimary }]}>{orders.length}</Text>
                            <Text style={[styles.statLabel, { color: C.textSecondary }]}>Total Orders</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: C.warningLight }]}>
                            <View style={[styles.statIcon, { backgroundColor: isDark ? C.bgElevated : '#FFF0CC' }]}>
                                <Ionicons name="construct-outline" size={20} color={C.warning} />
                            </View>
                            <Text style={[styles.statValue, { color: C.textPrimary }]}>{stats.inProduction}</Text>
                            <Text style={[styles.statLabel, { color: C.textSecondary }]}>In Production</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: C.successLight }]}>
                            <View style={[styles.statIcon, { backgroundColor: isDark ? C.bgElevated : '#D4EDDA' }]}>
                                <Ionicons name="checkmark-circle-outline" size={20} color={C.success} />
                            </View>
                            <Text style={[styles.statValue, { color: C.textPrimary }]}>{stats.readyOrders}</Text>
                            <Text style={[styles.statLabel, { color: C.textSecondary }]}>Ready</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: C.slateLight }]}>
                            <View style={[styles.statIcon, { backgroundColor: isDark ? C.bgElevated : '#D0E2F0' }]}>
                                <Ionicons name="time-outline" size={20} color={C.slate} />
                            </View>
                            <Text style={[styles.statValue, { color: C.textPrimary }]}>{stats.pendingOrders}</Text>
                            <Text style={[styles.statLabel, { color: C.textSecondary }]}>Pending</Text>
                        </View>
                    </ScrollView>

                    {/* Revenue Card */}
                    <View style={[styles.revenueCard, { backgroundColor: isDark ? C.bgCard : C.textPrimary }]}>
                        <View style={styles.revenueHeader}>
                            <View style={{ flex: 1, marginRight: SIZES.md }}>
                                <Text style={[styles.revenueLabel, { color: isDark ? C.textSecondary : C.textLight }]}>Total Revenue</Text>
                                <Text 
                                    style={[styles.revenueValue, { color: isDark ? C.textPrimary : C.textOnPrimary }]}
                                    numberOfLines={1}
                                    adjustsFontSizeToFit
                                    minimumFontScale={0.5}
                                >
                                    ₹{stats.totalRevenue.toLocaleString('en-IN')}
                                </Text>
                            </View>
                            <View style={[styles.revenueBadge, { backgroundColor: isDark ? C.bgElevated : 'rgba(107, 158, 107, 0.2)' }]}>
                                <Ionicons name="wallet-outline" size={12} color={C.success} />
                                <Text style={[styles.revenueBadgeText, { color: C.success }]}>{(stats.collectionRate * 100).toFixed(0)}% Paid</Text>
                            </View>
                        </View>
                        <View style={[styles.revenueBar, { backgroundColor: isDark ? C.border : 'rgba(255,255,255,0.15)' }]}>
                            <View style={[styles.revenueBarFill, { width: `${stats.collectionRate * 100}%`, backgroundColor: C.primary }]} />
                        </View>
                        <View style={styles.revenueFooter}>
                            <Ionicons name="information-circle-outline" size={12} color={isDark ? C.textMuted : C.textLight} />
                            <Text style={[styles.revenueSubtext, { color: isDark ? C.textMuted : C.textLight, marginLeft: 4 }]}>
                                ₹{stats.pendingCollection.toLocaleString('en-IN')} pending collection
                            </Text>
                        </View>
                    </View>

                    {/* Quick Actions */}
                    <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>Quick Actions</Text>
                    <View style={styles.actionsGrid}>
                        {quickActions.map((action, idx) => (
                            <TouchableOpacity
                                key={idx}
                                style={[styles.actionCard, { backgroundColor: C.bgCard, borderColor: C.borderLight }]}
                                onPress={() => navigation.navigate(action.screen)}
                                activeOpacity={0.7}
                                disabled={isLoading}
                            >
                                <View style={[styles.actionIcon, { backgroundColor: action.color + '18' }]}>
                                    <Ionicons name={action.icon} size={24} color={action.color} />
                                </View>
                                <Text style={[styles.actionLabel, { color: C.textSecondary }]}>{action.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>



                    {/* Recent Orders */}
                    <View style={styles.sectionRow}>
                        <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>Recent Orders</Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('OrdersTab')}
                            disabled={isLoading}
                        >
                            <Text style={[styles.seeAll, { color: C.primary }]}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    {stats.recentOrders.map((order) => (
                        <RecentOrderCard
                            key={order.id}
                            order={order}
                            navigation={navigation}
                            colors={C}
                        />
                    ))}

                    <View style={{ height: 20 }} />
                </ScrollView>
            )}
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    scrollContent: {
        paddingBottom: SIZES.xxxl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SIZES.lg,
        paddingTop: SIZES.lg,
        paddingBottom: SIZES.md,
    },
    greeting: {
        fontSize: SIZES.body,
        color: COLORS.textMuted,
        ...FONTS.regular,
        letterSpacing: 0.5,
    },
    title: {
        fontSize: SIZES.heading,
        color: COLORS.textPrimary,
        ...FONTS.bold,
        letterSpacing: -0.5,
        marginTop: 2,
    },
    notifBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.bgCard,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.small,
    },
    notifDot: {
        position: 'absolute',
        top: 10,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.error,
        borderWidth: 2,
        borderColor: COLORS.bgCard,
    },
    statsRow: {
        paddingHorizontal: SIZES.lg,
        paddingVertical: SIZES.md,
    },
    statCard: {
        width: (width - SIZES.lg * 2 - SIZES.md * 3) / 2.2,
        borderRadius: SIZES.radiusLg,
        padding: SIZES.base,
        marginRight: SIZES.md,
        ...SHADOWS.small,
    },
    statIcon: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SIZES.md,
    },
    statValue: {
        fontSize: SIZES.title,
        color: COLORS.textPrimary,
        ...FONTS.bold,
    },
    statLabel: {
        fontSize: SIZES.caption,
        color: COLORS.textSecondary,
        ...FONTS.regular,
        marginTop: 2,
    },
    revenueCard: {
        marginHorizontal: SIZES.lg,
        backgroundColor: COLORS.textPrimary,
        borderRadius: SIZES.radiusXl,
        padding: SIZES.lg,
        marginTop: SIZES.sm,
        marginBottom: SIZES.xl,
        ...SHADOWS.medium,
    },
    revenueHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    revenueLabel: {
        fontSize: SIZES.small,
        color: COLORS.textLight,
        ...FONTS.regular,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    revenueValue: {
        fontSize: SIZES.hero,
        color: COLORS.textOnPrimary,
        ...FONTS.bold,
        marginTop: 4,
        letterSpacing: -0.5,
    },
    revenueBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(107, 158, 107, 0.2)',
        paddingHorizontal: SIZES.sm,
        paddingVertical: SIZES.xs,
        borderRadius: SIZES.radiusFull,
    },
    revenueBadgeText: {
        color: COLORS.success,
        fontSize: SIZES.caption,
        ...FONTS.semiBold,
        marginLeft: 4,
    },
    revenueBar: {
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 2,
        marginTop: SIZES.lg,
        marginBottom: SIZES.sm,
    },
    revenueBarFill: {
        height: 4,
        backgroundColor: COLORS.primary,
        borderRadius: 2,
    },
    revenueFooter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    revenueSubtext: {
        fontSize: SIZES.caption,
        color: COLORS.textLight,
        ...FONTS.medium,
    },
    sectionTitle: {
        fontSize: SIZES.subtitle,
        color: COLORS.textPrimary,
        ...FONTS.semiBold,
        paddingHorizontal: SIZES.lg,
        marginTop: SIZES.lg,
        marginBottom: SIZES.md,
    },
    sectionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: SIZES.lg,
    },
    seeAll: {
        fontSize: SIZES.small,
        color: COLORS.primary,
        ...FONTS.medium,
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: SIZES.lg,
        justifyContent: 'space-between',
    },
    actionCard: {
        width: (width - SIZES.lg * 2 - SIZES.md) / 2,
        backgroundColor: COLORS.bgCard,
        borderRadius: SIZES.radiusLg,
        padding: SIZES.base,
        marginBottom: SIZES.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        ...SHADOWS.small,
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: SIZES.radiusMd,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SIZES.sm,
    },
    actionLabel: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
        ...FONTS.medium,
    },
    alertCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.warningLight,
        marginHorizontal: SIZES.lg,
        borderRadius: SIZES.radiusMd,
        padding: SIZES.md,
        marginTop: SIZES.sm,
        borderWidth: 1,
        borderColor: COLORS.warning + '30',
    },
    alertIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.warning + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SIZES.md,
    },
    alertTitle: {
        fontSize: SIZES.body,
        color: COLORS.textPrimary,
        ...FONTS.semiBold,
    },
    alertDesc: {
        fontSize: SIZES.caption,
        color: COLORS.textSecondary,
        ...FONTS.regular,
        marginTop: 1,
    },
    recentOrderCard: {
        marginHorizontal: SIZES.lg,
        marginBottom: SIZES.sm,
    },
    orderTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SIZES.sm,
    },
    orderId: {
        fontSize: SIZES.caption,
        color: COLORS.textMuted,
        ...FONTS.medium,
        letterSpacing: 0.5,
    },
    orderCustomer: {
        fontSize: SIZES.bodyLg,
        color: COLORS.textPrimary,
        ...FONTS.semiBold,
        marginTop: 2,
    },
    orderBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: SIZES.sm,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
    },
    orderMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    orderMetaText: {
        fontSize: SIZES.small,
        color: COLORS.textMuted,
        ...FONTS.regular,
        marginLeft: 6,
    },
    orderAmount: {
        fontSize: SIZES.bodyLg,
        color: COLORS.primary,
        ...FONTS.bold,
    },
    headerLogo: {
        width: 48,
        height: 48,
        borderRadius: 8,
    },
});

export default HomeScreen;
