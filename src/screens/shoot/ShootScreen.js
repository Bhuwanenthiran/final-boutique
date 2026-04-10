import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../../theme';
import { useShootStore } from '../../store/shootStore';
import { useOrderStore } from '../../store/orderStore';
import { Card, LoadingOverlay, ErrorOverlay, EmptyState, ScreenWrapper } from '../../components/common';

const OrderShootItem = React.memo(({ order, isCompleted, onToggle }) => (
    <Card elevated style={styles.orderCard}>
        <View style={styles.cardContent}>
            <View style={styles.infoSection}>
                <Text style={styles.customerName}>{order.customerName}</Text>
                <Text style={styles.orderId}>ORDER {order.orderNo || order.id}</Text>
                {order.designName && (
                    <Text style={styles.designName}>{order.designName}</Text>
                )}
            </View>

            <TouchableOpacity 
                style={[
                    styles.checkboxContainer, 
                    isCompleted && styles.checkboxActive
                ]} 
                onPress={() => onToggle(order.id)}
                activeOpacity={0.7}
            >
                <View style={[
                    styles.checkbox, 
                    { 
                        borderColor: isCompleted ? COLORS.success : COLORS.border,
                        backgroundColor: isCompleted ? COLORS.success : 'transparent' 
                    }
                ]}>
                    {isCompleted && (
                        <Ionicons name="checkmark" size={16} color="white" />
                    )}
                </View>
                <Text style={[
                    styles.checkboxLabel, 
                    { color: isCompleted ? COLORS.success : COLORS.textSecondary }
                ]}>
                    {isCompleted ? 'Completed' : 'Pending'}
                </Text>
            </TouchableOpacity>
        </View>
    </Card>
));

const ShootScreen = () => {
    const insets = useSafeAreaInsets();
    
    const orders = useOrderStore((s) => s.orders);
    const shootStatuses = useShootStore((s) => s.shootStatuses);
    const initShootStore = useShootStore((s) => s.init);
    const toggleStatus = useShootStore((s) => s.toggleShootStatus);
    const error = useShootStore((s) => s.error);
    const clearError = useShootStore((s) => s.clearError);

    useEffect(() => {
        initShootStore();
    }, []);

    const handleToggle = (orderId) => {
        toggleStatus(orderId).catch(() => {});
    };

    const renderItem = ({ item }) => {
        const statusData = shootStatuses[item.id];
        const isCompleted = statusData ? statusData.shootCompleted : false;
        
        return (
            <OrderShootItem 
                order={item} 
                isCompleted={isCompleted} 
                onToggle={handleToggle}
            />
        );
    };

    return (
        <ScreenWrapper useSafeTop>
            {/* Error overlay for network failures */}
            <ErrorOverlay
                visible={!!error}
                error={error}
                onClose={clearError}
            />
            
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Media & Shoot</Text>
                <Text style={styles.headerSubtitle}>Manage product photography status</Text>
            </View>

            {orders.length === 0 ? (
                <EmptyState
                    icon="camera-outline"
                    title="No orders found"
                    subtitle="Orders will appear here once they are created."
                />
            ) : (
                <FlatList
                    data={orders}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={[
                        styles.listContent, 
                        { paddingBottom: insets.bottom + 40 }
                    ]}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: SIZES.lg,
        paddingTop: SIZES.lg,
        paddingBottom: SIZES.md,
    },
    headerTitle: {
        fontSize: SIZES.heading,
        ...FONTS.bold,
        color: COLORS.textPrimary,
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: SIZES.small,
        ...FONTS.regular,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    listContent: {
        paddingHorizontal: SIZES.lg,
        paddingTop: SIZES.sm,
    },
    orderCard: {
        marginBottom: SIZES.md,
        padding: SIZES.md,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    infoSection: {
        flex: 1,
        marginRight: SIZES.md,
    },
    customerName: {
        fontSize: SIZES.bodyLg,
        ...FONTS.semiBold,
        color: COLORS.textPrimary,
    },
    orderId: {
        fontSize: 11,
        ...FONTS.medium,
        color: COLORS.textMuted,
        marginTop: 1,
        textTransform: 'uppercase',
    },
    designName: {
        fontSize: SIZES.small,
        ...FONTS.regular,
        color: COLORS.textSecondary,
        marginTop: 4,
        fontStyle: 'italic',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SIZES.sm,
        paddingHorizontal: SIZES.md,
        borderRadius: SIZES.radiusFull,
        backgroundColor: COLORS.bgElevated,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        minWidth: 110,
        justifyContent: 'center',
    },
    checkboxActive: {
        backgroundColor: COLORS.successLight,
        borderColor: COLORS.success + '20',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 6,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxLabel: {
        fontSize: 12,
        ...FONTS.semiBold,
        marginLeft: SIZES.sm,
    },
});

export default ShootScreen;
