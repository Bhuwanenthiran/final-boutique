import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, getColors } from '../../theme';
import { useThemeStore } from '../../store/themeStore';
import { useOrderStore } from '../../store/orderStore';
import { Card, StatusBadge, FloatingButton, EmptyState, LoadingOverlay, ErrorCard, ErrorOverlay, ScreenWrapper } from '../../components/common';
import { SearchBar, FilterChip } from '../../components/forms';
import { formatDate } from '../../services/dateUtils';

const ORDER_FILTERS = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'In Production', value: 'in_production' },
    { label: 'Ready', value: 'ready' },
    { label: 'Delivered', value: 'delivered' },
];

const OrderListItem = React.memo(({ item, navigation, colors, onPriorityColor }) => (
    <Card
        onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
    >
        <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
                <View style={[styles.priorityDot, { backgroundColor: onPriorityColor(item.priority) }]} />
                <View>
                    <Text style={[styles.orderId, { color: colors.textMuted }]}>{item.id}</Text>
                    <Text style={[styles.customerName, { color: colors.textPrimary }]}>{item.customerName}</Text>
                </View>
            </View>
            <StatusBadge status={item.status} size="small" />
        </View>

        <View style={[styles.cardBody, { borderTopColor: colors.borderLight }]}>
            <View style={styles.detailRow}>
                <Ionicons name="shirt-outline" size={14} color={colors.textMuted} />
                <Text style={[styles.detailText, { color: colors.textSecondary }]}>{item.designName}</Text>
            </View>
            <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
                <Text style={[styles.detailText, { color: colors.textSecondary }]}>Due: {formatDate(item.deliveryDate)}</Text>
            </View>
        </View>

        <View style={[styles.cardFooter, { borderTopColor: colors.borderLight }]}>
            <View>
                <Text style={[styles.amountLabel, { color: colors.textMuted }]}>Total</Text>
                <Text style={[styles.amountValue, { color: colors.primary }]}>₹{item.totalAmount.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.balanceWrap}>
                <Text style={[styles.balanceLabel, { color: colors.textMuted }]}>Balance</Text>
                <Text style={[styles.balanceValue, { color: colors.textPrimary }, item.balanceAmount > 0 && { color: colors.error }]}>
                    ₹{item.balanceAmount.toLocaleString('en-IN')}
                </Text>
            </View>
            {item.tailorName && (
                <View style={[styles.tailorBadge, { backgroundColor: colors.primaryMuted }]}>
                    <Ionicons name="person-outline" size={12} color={colors.primary} />
                    <Text style={[styles.tailorName, { color: colors.primary }]}>{item.tailorName}</Text>
                </View>
            )}
        </View>
    </Card>
));

const OrderListScreen = ({ navigation }) => {
    const isDark = useThemeStore(s => s.isDark);
    const C = getColors(isDark);
    const insets = useSafeAreaInsets();
    const orders = useOrderStore((s) => s.orders);
    const filterStatus = useOrderStore((s) => s.filterStatus);
    const searchQuery = useOrderStore((s) => s.searchQuery);
    const isLoading = useOrderStore((s) => s.isLoading);
    const error = useOrderStore((s) => s.error);
    const clearError = useOrderStore((s) => s.clearError);
    const setFilterStatus = useOrderStore((s) => s.setFilterStatus);
    const setSearchQuery = useOrderStore((s) => s.setSearchQuery);
    const getFilteredOrders = useOrderStore((s) => s.getFilteredOrders);
    const fetchOrders = useOrderStore((s) => s.fetchOrders);

    const filteredOrders = getFilteredOrders();

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return C.error;
            case 'medium': return C.warning;
            case 'low': return C.success;
            default: return C.textMuted;
        }
    };

    const onRefresh = async () => {
        await fetchOrders();
    };

    const renderOrder = ({ item }) => (
        <OrderListItem
            item={item}
            navigation={navigation}
            colors={C}
            onPriorityColor={getPriorityColor}
        />
    );

    return (
        <ScreenWrapper useSafeTop>
            <LoadingOverlay visible={isLoading && orders.length > 0 && !error} message="Updating orders..." />
            <ErrorOverlay
                visible={!!error && orders.length > 0}
                error={error}
                onRetry={onRefresh}
                onClose={clearError}
            />

            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: C.textPrimary }]}>Orders</Text>
                <Text style={[styles.headerSubtitle, { color: C.textMuted }]}>{orders.length} total orders</Text>
            </View>

            {/* Search */}
            <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search by customer, design, order ID..."
            />

            {/* Filters */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ flexGrow: 0, marginBottom: 12 }}
                contentContainerStyle={styles.filtersRow}
                keyboardShouldPersistTaps="handled"
            >
                {ORDER_FILTERS.map((f) => (
                    <FilterChip
                        key={f.value}
                        label={f.label}
                        active={filterStatus === f.value}
                        onPress={() => setFilterStatus(f.value)}
                        disabled={isLoading}
                    />
                ))}
            </ScrollView>

            {/* Order List */}
            {isLoading && orders.length === 0 ? (
                <View style={{ flex: 1, padding: SIZES.lg }}>
                    <Text style={{ color: C.textMuted, textAlign: 'center' }}>Loading orders...</Text>
                </View>
            ) : error && orders.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <ErrorCard
                        title="Connection Error"
                        message={error}
                        onRetry={onRefresh}
                    />
                </View>
            ) : filteredOrders.length === 0 ? (
                <EmptyState
                    icon="receipt-outline"
                    title="No orders found"
                    subtitle="Try adjusting your filters or add a new order"
                    actionLabel="Create Order"
                    onAction={() => navigation.navigate('OrderEntry')}
                />
            ) : (
                <FlatList
                    data={filteredOrders}
                    renderItem={renderOrder}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={[styles.listContent, { paddingBottom: 100 + insets.bottom }]}
                    showsVerticalScrollIndicator={false}
                    style={{ flex: 1 }}
                    refreshing={isLoading}
                    onRefresh={onRefresh}
                    initialNumToRender={6}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                    removeClippedSubviews={Platform.OS === 'android'}
                />
            )}

            <FloatingButton
                icon="add"
                onPress={() => navigation.navigate('OrderEntry')}
                disabled={isLoading}
            />
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
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
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SIZES.md,
    },
    cardHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priorityDot: {
        width: 4,
        height: 32,
        borderRadius: 2,
        marginRight: SIZES.md,
    },
    orderId: {
        fontSize: SIZES.caption,
        color: COLORS.textMuted,
        ...FONTS.medium,
        letterSpacing: 0.5,
    },
    customerName: {
        fontSize: SIZES.bodyLg,
        color: COLORS.textPrimary,
        ...FONTS.semiBold,
        marginTop: 1,
    },
    cardBody: {
        paddingVertical: SIZES.sm,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SIZES.xs,
    },
    detailText: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
        marginLeft: SIZES.sm,
        ...FONTS.regular,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: SIZES.sm,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
    },
    amountLabel: {
        fontSize: SIZES.caption,
        color: COLORS.textMuted,
        ...FONTS.regular,
    },
    amountValue: {
        fontSize: SIZES.bodyLg,
        color: COLORS.primary,
        ...FONTS.bold,
    },
    balanceWrap: {
        marginLeft: SIZES.xl,
    },
    balanceLabel: {
        fontSize: SIZES.caption,
        color: COLORS.textMuted,
        ...FONTS.regular,
    },
    balanceValue: {
        fontSize: SIZES.body,
        color: COLORS.textPrimary,
        ...FONTS.semiBold,
    },
    tailorBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 'auto',
        backgroundColor: COLORS.primaryMuted,
        paddingHorizontal: SIZES.sm,
        paddingVertical: SIZES.xs,
        borderRadius: SIZES.radiusFull,
    },
    tailorName: {
        fontSize: SIZES.caption,
        color: COLORS.primary,
        ...FONTS.medium,
        marginLeft: 4,
    },
});

export default OrderListScreen;
