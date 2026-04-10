import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../theme';
import { useOrderStore } from '../../store/orderStore';
import { useProductionStore } from '../../store/productionStore';
import {
    StatusBadge, Card, EmptyState,
    LoadingOverlay, ErrorCard, ErrorOverlay, ScreenWrapper
} from '../../components/common';

// ─── Inline FilterChip (forms/index.js has no FilterChip export) ─────────────
const FilterChip = ({ label, active, onPress, disabled }) => (
    <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        style={[
            chipStyles.chip,
            active && chipStyles.chipActive,
        ]}
    >
        <Text style={[chipStyles.chipText, active && chipStyles.chipTextActive]}>
            {label}
        </Text>
    </TouchableOpacity>
);

const chipStyles = StyleSheet.create({
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: COLORS.bgCard,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginRight: 8,
    },
    chipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    chipText: {
        fontSize: 13,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    chipTextActive: {
        color: COLORS.textOnPrimary,
        fontWeight: '700',
    },
});


// ─── Stage Config ────────────────────────────────────────────────────────────
const PRODUCTION_STAGES = [
    { key: 'marking',     label: 'Marking',          icon: 'pencil-outline',                color: COLORS.slate },
    { key: 'production1', label: 'P1-Base',           icon: 'construct-outline',             color: COLORS.primary },
    { key: 'production2', label: 'P2-Aari',           icon: 'flower-outline',                color: COLORS.accent },
    { key: 'production3', label: 'P3-Add-ons',        icon: 'sparkles-outline',              color: COLORS.primary },
    { key: 'cutting',     label: 'Cutting',           icon: 'cut-outline',                   color: COLORS.warning },
    { key: 'stitching',   label: 'Stitching',         icon: 'checkmark-done-circle-outline', color: COLORS.success },
];

const STAGE_KEYS = PRODUCTION_STAGES.map(s => s.key);

// ─── Order Card ───────────────────────────────────────────────────────────────
const OrderCard = React.memo(({ item, onCycleStatus, isLoading }) => {
    const isReady = (item.status || '').toLowerCase() === 'ready';
    const currentStageIdx = STAGE_KEYS.indexOf(item.productionStage);

    const stageInfo = PRODUCTION_STAGES.find(s => s.key === item.productionStage);
    const stageColor = stageInfo ? stageInfo.color : COLORS.textMuted;
    const stageIcon = stageInfo ? stageInfo.icon : (item.productionStage === 'pending' ? 'time-outline' : 'ellipse-outline');

    return (
        <Card elevated style={styles.taskCard}>
            {/* Header */}
            <View style={styles.taskHeader}>
                <View style={styles.taskHeaderLeft}>
                    <View style={[styles.stageIcon, { backgroundColor: stageColor + '22' }]}>
                        <Ionicons name={stageIcon} size={18} color={stageColor} />
                    </View>
                    <View>
                        <Text style={styles.taskId}>{item.orderNo || item.id}</Text>
                        <Text style={styles.taskCustomer}>{item.customerName}</Text>
                    </View>
                </View>
                <StatusBadge status={item.status} size="small" />
            </View>

            {/* Info Row */}
            <View style={styles.taskInfo}>
                <View style={styles.taskInfoItem}>
                    <Ionicons name="shirt-outline" size={13} color={COLORS.textMuted} />
                    <Text style={styles.taskInfoText}>{item.designName || 'No design'}</Text>
                </View>
                <View style={styles.taskInfoItem}>
                    <Ionicons name="person-outline" size={13} color={COLORS.textMuted} />
                    <Text style={styles.taskInfoText}>{item.tailorName || 'Unassigned'}</Text>
                </View>
            </View>

            {/* Stage Progress Bar */}
            <View style={styles.stagesRow}>
                {PRODUCTION_STAGES.map((stage, idx) => {
                    const isCompleted = currentStageIdx > idx || isReady;
                    const isActive = currentStageIdx === idx && !isReady;
                    return (
                        <View key={stage.key} style={styles.miniStage}>
                            <View style={[
                                styles.miniStageDot,
                                isCompleted && { backgroundColor: COLORS.success },
                                isActive && { backgroundColor: stage.color },
                            ]} />
                            <Text style={[
                                styles.miniStageLabel,
                                isActive && { color: stage.color, ...FONTS.semiBold },
                                isCompleted && { color: COLORS.success },
                            ]} numberOfLines={1}>
                                {stage.label}
                            </Text>
                        </View>
                    );
                })}
            </View>

            {/* Footer Actions */}
            <View style={styles.taskActions}>
                <View style={styles.taskFooterLeft}>
                    <Ionicons
                        name={isReady ? 'checkmark-done-circle' : 'time-outline'}
                        size={16}
                        color={isReady ? COLORS.success : COLORS.textMuted}
                    />
                    <Text style={[styles.taskFooterText, isReady && { color: COLORS.success }]}>
                        {isReady ? 'Finished' : 'In Progress'}
                    </Text>
                </View>
                {!isReady && (
                    <TouchableOpacity
                        style={styles.statusCycleBtn}
                        onPress={() => onCycleStatus(item.id, item.productionStage)}
                        disabled={isLoading}
                    >
                        <Ionicons name="arrow-forward-outline" size={14} color={COLORS.primary} />
                        <Text style={styles.statusCycleText}>
                            {item.productionStage === 'stitching' ? 'Finish & Mark Ready' : 'Next Stage'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </Card>
    );
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
const StitchingProductionScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();

    // Single call per store — follows React Rules of Hooks correctly
    const orders      = useOrderStore(s => s.orders);
    const tailors     = useOrderStore(s => s.tailors);
    const orderLoad   = useOrderStore(s => s.isLoading);
    const orderErr    = useOrderStore(s => s.error);

    const filterTailor     = useProductionStore(s => s.filterTailor);
    const setFilterTailor  = useProductionStore(s => s.setFilterTailor);
    const updateProdStatus = useProductionStore(s => s.updateProductionStatus);
    const clearError       = useProductionStore(s => s.clearError);

    // isUpdating is ONLY true when the user taps "Next Stage" — NOT on initial load.
    // This prevents the LoadingOverlay from covering the order list on first render.
    const [isUpdating, setIsUpdating] = useState(false);

    const isLoading = orderLoad;  // Only use orderStore's loading for initial load
    const error     = orderErr;

    // Filter: show all non-finished orders
    const filteredOrders = useMemo(() => {
        const safeOrders = Array.isArray(orders) ? orders : [];
        return safeOrders.filter(o => {
            const status = (o?.status || '').toLowerCase().trim();
            if (['ready', 'delivered', 'cancelled', 'on_hold', 'hold'].includes(status)) return false;
            if (filterTailor !== 'all' && o.tailorId !== filterTailor) return false;
            return true;
        });
    }, [orders, filterTailor]);

    // AppInitializer already calls orderStore.init() at app startup which sets up
    // a real-time onSnapshot listener. Calling init() again here would CANCEL
    // that existing subscription and restart it — causing all orders to briefly
    // disappear. So we simply read from the already-live store.
    const onRefresh = useCallback(() => {
        // The store is already real-time. No manual refresh needed.
        // Pull-to-refresh is kept for UX convention only.
    }, []);

    const cycleStatus = useCallback(async (orderId, currentStage) => {
        const stages = ['pending', 'marking', 'production1', 'production2', 'production3', 'cutting', 'stitching'];
        const idx = stages.indexOf(currentStage);
        setIsUpdating(true);
        try {
            if (currentStage === 'stitching') {
                // Single atomic write: sets status='ready', productionStage='READY',
                // finishing.isReady=true — which is what FinishingScreen filters on.
                const { productionService } = await import('../../services/productionService');
                await productionService.markAsReady(orderId, 'Production');
            } else {
                const nextStage = idx === -1 ? 'marking' : (stages[idx + 1] || 'stitching');
                let nextStatusLabel = 'In Production';
                if (nextStage === 'marking') nextStatusLabel = 'Marking';
                if (nextStage === 'cutting') nextStatusLabel = 'Cutting';
                await updateProdStatus(orderId, 'status', nextStatusLabel);
                await updateProdStatus(orderId, 'productionStage', nextStage);
            }
        } finally {
            setIsUpdating(false);
        }
    }, [updateProdStatus]);

    const renderItem = useCallback(({ item }) => (
        <OrderCard item={item} onCycleStatus={cycleStatus} isLoading={isLoading} />
    ), [cycleStatus, isLoading]);

    return (
        <ScreenWrapper useSafeTop>
            <LoadingOverlay visible={isUpdating} message="Updating status..." />
            <ErrorOverlay
                visible={!!error && filteredOrders.length > 0}
                error={error}
                onRetry={onRefresh}
                onClose={clearError}
            />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Production</Text>
                <Text style={styles.headerSubtitle}>{filteredOrders.length} orders in pipeline</Text>
            </View>

            {/* Tailor Filter Chips */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ flexGrow: 0, marginBottom: 12 }}
                contentContainerStyle={styles.filtersRow}
                keyboardShouldPersistTaps="handled"
            >
                <FilterChip
                    label="All Tailors"
                    active={filterTailor === 'all'}
                    onPress={() => setFilterTailor('all')}
                    disabled={isLoading}
                />
                {(tailors || []).map(t => (
                    <FilterChip
                        key={t.id}
                        label={t.name}
                        active={filterTailor === t.id}
                        onPress={() => setFilterTailor(t.id)}
                        disabled={isLoading}
                    />
                ))}
            </ScrollView>

            {/* Body */}
            {isLoading && filteredOrders.length === 0 ? (
                <View style={styles.centerMsg}>
                    <Text style={styles.centerMsgText}>Loading production...</Text>
                </View>
            ) : error && filteredOrders.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <ErrorCard
                        title="Failed to load Production"
                        message={error}
                        onRetry={onRefresh}
                    />
                </View>
            ) : filteredOrders.length === 0 ? (
                <EmptyState
                    icon="construct-outline"
                    title="No production orders"
                    subtitle="Orders in production will appear here"
                />
            ) : (
                <FlatList
                    data={filteredOrders}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={[styles.listContent, { paddingBottom: 100 + insets.bottom }]}
                    showsVerticalScrollIndicator={false}
                    style={{ flex: 1 }}
                    refreshing={isLoading}
                    onRefresh={onRefresh}
                    initialNumToRender={6}
                    windowSize={5}
                    maxToRenderPerBatch={5}
                    removeClippedSubviews={Platform.OS === 'android'}
                />
            )}
        </ScreenWrapper>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    header: {
        paddingHorizontal: SIZES.lg,
        paddingTop: SIZES.lg,
        paddingBottom: SIZES.sm,
    },
    headerTitle: {
        fontSize: SIZES.heading,
        color: COLORS.textPrimary,
        ...FONTS.bold,
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: SIZES.small,
        color: COLORS.textMuted,
        ...FONTS.regular,
        marginTop: 2,
    },
    filtersRow: {
        paddingHorizontal: SIZES.lg,
        paddingVertical: SIZES.sm,
    },
    listContent: {
        paddingHorizontal: SIZES.lg,
        paddingBottom: 20,
    },
    centerMsg: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SIZES.lg,
    },
    centerMsgText: {
        color: COLORS.textMuted,
        fontSize: SIZES.body,
        ...FONTS.regular,
    },
    taskCard: {
        marginBottom: SIZES.md,
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SIZES.md,
    },
    taskHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stageIcon: {
        width: 36,
        height: 36,
        borderRadius: SIZES.radiusMd,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SIZES.md,
    },
    taskId: {
        fontSize: SIZES.caption,
        color: COLORS.textMuted,
        ...FONTS.medium,
        letterSpacing: 0.5,
    },
    taskCustomer: {
        fontSize: SIZES.bodyLg,
        color: COLORS.textPrimary,
        ...FONTS.semiBold,
    },
    taskInfo: {
        flexDirection: 'row',
        marginBottom: SIZES.md,
    },
    taskInfoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: SIZES.lg,
    },
    taskInfoText: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
        marginLeft: 5,
        ...FONTS.regular,
    },
    stagesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        backgroundColor: COLORS.bgElevated,
        borderRadius: SIZES.radiusMd,
        paddingVertical: SIZES.sm,
        paddingHorizontal: SIZES.sm,
        marginBottom: SIZES.md,
    },
    miniStage: {
        alignItems: 'center',
        flex: 1,
        minWidth: 0,
    },
    miniStageDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.border,
        marginBottom: 3,
    },
    miniStageLabel: {
        fontSize: 9,
        color: COLORS.textMuted,
        textAlign: 'center',
        ...FONTS.regular,
    },
    taskActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: SIZES.sm,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
    },
    taskFooterLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    taskFooterText: {
        fontSize: SIZES.small,
        color: COLORS.textMuted,
        ...FONTS.medium,
        marginLeft: 6,
    },
    statusCycleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.xs + 2,
        borderRadius: SIZES.radiusFull,
        backgroundColor: COLORS.primaryMuted,
        borderWidth: 1,
        borderColor: COLORS.primarySoft,
    },
    statusCycleText: {
        fontSize: SIZES.small,
        color: COLORS.primary,
        ...FONTS.semiBold,
    },
});

export default StitchingProductionScreen;
