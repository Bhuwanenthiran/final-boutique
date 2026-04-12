import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Modal, Animated, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../theme';
import { useFinishingStore } from '../../store/finishingStore';
import { useOrderStore } from '../../store/orderStore';
import { Card, LoadingOverlay, ErrorOverlay, EmptyState, ScreenWrapper } from '../../components/common';
import { FormButton, FormInput } from '../../components/forms';
import { formatDate } from '../../services/dateUtils';

const CHECKLIST_ITEMS = [
    { key: 'checking',      label: 'Quality Checking',  icon: 'search-outline',           description: 'Inspect stitching quality & measurements' },
    { key: 'ironing',       label: 'Ironing & Pressing', icon: 'flame-outline',            description: 'Press and iron the garment' },
    { key: 'threadCutting', label: 'Thread Cutting',    icon: 'cut-outline',               description: 'Clean loose threads & finishing' },
    { key: 'approval',      label: 'Quality Approval',  icon: 'shield-checkmark-outline',  description: 'Final quality check & approval' },
];

const FinishingScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const allOrders = useOrderStore((s) => s.orders);
    const orders = allOrders.filter(o => {
        const stage = (o.productionStage || '').toUpperCase();
        const status = (o.status || '').toLowerCase();
        return stage === 'READY' || status === 'ready';
    });
    const finishingRecords = useFinishingStore((s) => s.finishingRecords);
    const getFinishing = useFinishingStore((s) => s.getFinishing);
    const loadFinishing = useFinishingStore((s) => s.loadFinishing);
    const toggleChecklist = useFinishingStore((s) => s.toggleChecklist);
    const markAsReady = useFinishingStore((s) => s.markAsReady);
    const isLoading = useFinishingStore((s) => s.isLoading);
    const error = useFinishingStore((s) => s.error);
    const clearError = useFinishingStore((s) => s.clearError);
    const updateOrderStatus = useOrderStore((s) => s.updateOrderStatus);
    const markAsDelivered = useOrderStore((s) => s.markAsDelivered);
    const orderLoading = useOrderStore((s) => s.isLoading);

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [approverName, setApproverName] = useState('');
    const [showConfetti, setShowConfetti] = useState(false);
    const [deliveryConfirm, setDeliveryConfirm] = useState(false);
    const fadeAnim = useRef(new Animated.Value(1)).current;

    // Auto-select first order when list loads
    useEffect(() => {
        if (!selectedOrder && orders.length > 0) {
            setSelectedOrder(orders[0].id);
        }
    }, [orders.length, selectedOrder]);

    // Load finishing data whenever selected order changes
    useEffect(() => {
        if (selectedOrder) loadFinishing(selectedOrder);
    }, [selectedOrder, loadFinishing]);

    useEffect(() => {
        console.log("Filtered Finishing Orders:", orders.length);
    }, [orders.length]);

    const finishing = getFinishing(selectedOrder);

    const isStepLocked = (itemKey) => {
        const idx = CHECKLIST_ITEMS.findIndex(i => i.key === itemKey);
        if (idx === 0) return false;
        const prevKey = CHECKLIST_ITEMS[idx - 1].key;
        return !finishing[prevKey];
    };

    const isStepCompletedLocally = (itemKey) => {
        return finishing[itemKey];
    }

    const allChecked = finishing.checking && finishing.ironing && finishing.threadCutting && finishing.approval;

    const handleToggle = async (key) => {
        if (isStepLocked(key)) {
            Alert.alert('Step Locked', 'Complete previous step first.');
            return;
        }

        const idx = CHECKLIST_ITEMS.findIndex(i => i.key === key);
        if (isStepCompletedLocally(key)) {
            if (idx < CHECKLIST_ITEMS.length - 1) {
                const nextKey = CHECKLIST_ITEMS[idx + 1].key;
                if (finishing[nextKey]) {
                    Alert.alert('Step Locked', 'Cannot uncheck a step if subsequent steps are completed.');
                    return;
                }
            }
        }

        Animated.sequence([
            Animated.timing(fadeAnim, { toValue: 0.5, duration: 100, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true })
        ]).start();

        try {
            await toggleChecklist(selectedOrder, key);
        } catch (error) {
            // Handled via store state
        }
    };

    const handleMarkReady = async () => {
        if (!approverName.trim()) {
            Alert.alert('Required', 'Please enter approver name');
            return;
        }

        try {
            await markAsReady(selectedOrder, approverName);
            await updateOrderStatus(selectedOrder, 'Ready');
            setShowApprovalModal(false);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
            Alert.alert('✨ Order Ready!', 'This order has been marked as ready for delivery.');
        } catch (error) {
            // Handled via store state
        }
    };

    const completedCount = CHECKLIST_ITEMS.filter(i => finishing[i.key]).length;
    const progressPercent = (completedCount / CHECKLIST_ITEMS.length) * 100;

    const handleDelivery = async () => {
        const order = orders.find(o => o.id === selectedOrder);
        if (!order) {
            console.warn("Finishing Delivery: No order found for ID", selectedOrder);
            return;
        }

        try {
            console.log("Finalizing delivery for order:", order.id);
            await markAsDelivered(order);
            setSelectedOrder(null);
            Alert.alert('✅ Delivered!', `${order.customerName}'s order has been marked as delivered.`);
        } catch (err) {
            console.error("Delivery Error:", err);
            Alert.alert('Error', 'Failed to complete delivery. Please check your connection.');
        }
    };

    return (
        <ScreenWrapper useSafeTop>
            {/* Only show loading overlay for finishing checklist operations, NOT for delivery */}
            <LoadingOverlay visible={(isLoading || orderLoading) && !error} message="Processing..." />
            <ErrorOverlay
                visible={!!error}
                error={error}
                onRetry={null}
                onClose={clearError}
            />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Finishing</Text>
                <Text style={styles.headerSubtitle}>Quality check & prepare for delivery</Text>
            </View>

            {orders.length === 0 ? (
                <EmptyState
                    icon="checkmark-done-outline"
                    title="No orders for finishing"
                    subtitle="Orders completed in production will appear here for quality check"
                />
            ) : (
                <>
                    {/* Order Selector */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.orderTabs}
                        keyboardShouldPersistTaps="handled"
                    >
                        {orders.map(order => (
                            <TouchableOpacity
                                key={order.id}
                                style={[styles.orderTab, selectedOrder === order.id && styles.orderTabActive]}
                                onPress={() => setSelectedOrder(order.id)}
                                disabled={isLoading}
                            >
                                <Text style={[styles.orderTabId, selectedOrder === order.id && styles.orderTabIdActive]}>{order.orderNo || order.id}</Text>
                                <Text style={[styles.orderTabName, selectedOrder === order.id && styles.orderTabNameActive]} numberOfLines={1}>
                                    {order.customerName}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Progress Circle */}
                        <View style={styles.progressSection}>
                            <View style={styles.progressCircle}>
                                <Text style={styles.progressNumber}>{completedCount}/{CHECKLIST_ITEMS.length}</Text>
                                <Text style={styles.progressLabel}>Completed</Text>
                            </View>
                            <View style={styles.progressBarWrap}>
                                <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
                            </View>
                        </View>

                        {/* Checklist */}
                        {CHECKLIST_ITEMS.map((item, idx) => {
                            const locked = isStepLocked(item.key);
                            const completed = finishing[item.key];
                            return (
                                <Animated.View key={item.key} style={{ opacity: locked ? 0.5 : fadeAnim }}>
                                    <TouchableOpacity
                                        activeOpacity={locked ? 1 : 0.7}
                                        onPress={() => handleToggle(item.key)}
                                        disabled={locked || isLoading}
                                    >
                                        <Card style={[styles.checkItem, completed && styles.checkItemDone]}>
                                            <View style={styles.checkRow}>
                                                <TouchableOpacity
                                                    style={[styles.checkbox, completed && styles.checkboxChecked]}
                                                    onPress={() => handleToggle(item.key)}
                                                    disabled={locked || isLoading}
                                                >
                                                    {completed ? (
                                                        <Ionicons name="checkmark" size={16} color={COLORS.textOnPrimary} />
                                                    ) : locked ? (
                                                        <Ionicons name="lock-closed" size={14} color={COLORS.border} />
                                                    ) : null}
                                                </TouchableOpacity>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={[styles.checkLabel, completed && styles.checkLabelDone]}>{item.label}</Text>
                                                    <Text style={styles.checkDesc}>{item.description}</Text>
                                                </View>
                                                <View style={[styles.checkIcon, { backgroundColor: completed ? COLORS.successLight : COLORS.bgElevated }]}>
                                                    <Ionicons name={item.icon} size={18} color={completed ? COLORS.success : COLORS.textMuted} />
                                                </View>
                                            </View>
                                        </Card>
                                    </TouchableOpacity>
                                </Animated.View>
                            );
                        })}

                        {/* Delivery Section */}
                        {finishing.isReady && (
                            <View style={[styles.deliveryBtnSection, { zIndex: 100 }]}>
                                {!deliveryConfirm ? (
                                    <TouchableOpacity 
                                        style={styles.mainDeliveryBtn}
                                        onPress={() => setDeliveryConfirm(true)}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="car-outline" size={24} color={COLORS.textOnPrimary} />
                                        <Text style={styles.mainDeliveryBtnText}>Complete Delivery</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <View style={styles.confirmPanel}>
                                        <Text style={styles.confirmText}>Are you sure this order is delivered?</Text>
                                        <View style={styles.confirmActions}>
                                            <TouchableOpacity 
                                                style={[styles.confirmBtn, styles.cancelBtn]} 
                                                onPress={() => setDeliveryConfirm(false)}
                                            >
                                                <Text style={styles.cancelBtnText}>Cancel</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity 
                                                style={[styles.confirmBtn, styles.yesBtn]} 
                                                onPress={handleDelivery}
                                                disabled={orderLoading}
                                            >
                                                <Text style={styles.yesBtnText}>{orderLoading ? 'Processing...' : 'Yes, Delivered'}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
                            </View>
                        )}

                        {/* Mark as Ready Button */}
                        {!finishing.isReady && (
                            <View style={[styles.readyBtnWrap, !allChecked && { opacity: 0.5 }]}>
                                <FormButton
                                    title="✨ Mark as Ready"
                                    icon="checkmark-done-outline"
                                    onPress={() => {
                                        if (!allChecked) {
                                            Alert.alert('Incomplete', 'Please complete all checklist items first');
                                            return;
                                        }
                                        setShowApprovalModal(true);
                                    }}
                                    disabled={!allChecked}
                                    loading={isLoading}
                                />
                            </View>
                        )}

                        {/* Confetti Animation Placeholder */}
                        {showConfetti && (
                            <View style={styles.confettiOverlay}>
                                <Text style={styles.confettiEmoji}>🎉</Text>
                                <Text style={styles.confettiText}>Order is Ready!</Text>
                            </View>
                        )}

                        <View style={{ height: 40 }} />
                    </ScrollView>
                </>
            )}

            {/* Approval Modal */}
            <Modal visible={showApprovalModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Ionicons name="shield-checkmark-outline" size={32} color={COLORS.primary} />
                            <Text style={styles.modalTitle}>Approve & Mark Ready</Text>
                            <Text style={styles.modalSubtitle}>This will mark the order as ready for delivery</Text>
                        </View>

                        <FormInput
                            label="Approved By"
                            value={approverName}
                            onChangeText={setApproverName}
                            placeholder="Enter your name"
                            icon="person-outline"
                            required
                            editable={!isLoading}
                        />

                        {/* Signature Area */}
                        <TouchableOpacity style={styles.signatureArea} disabled={isLoading}>
                            <Ionicons name="finger-print-outline" size={28} color={COLORS.textMuted} />
                            <Text style={styles.signatureText}>Digital Signature</Text>
                            <Text style={styles.signatureHint}>Tap to sign (simulated)</Text>
                        </TouchableOpacity>

                        <View style={styles.modalActions}>
                            <FormButton
                                title="Cancel"
                                variant="outline"
                                onPress={() => setShowApprovalModal(false)}
                                size="medium"
                                disabled={isLoading}
                            />
                            <View style={{ width: SIZES.sm }} />
                            <FormButton
                                title="Approve"
                                icon="checkmark-circle-outline"
                                onPress={handleMarkReady}
                                size="medium"
                                loading={isLoading}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
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
    orderTabs: {
        paddingHorizontal: SIZES.lg,
        paddingBottom: SIZES.md,
    },
    orderTab: {
        backgroundColor: COLORS.bgCard,
        borderRadius: SIZES.radiusMd,
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.sm,
        marginRight: SIZES.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
        minWidth: 90,
    },
    orderTabActive: {
        backgroundColor: COLORS.primaryMuted,
        borderColor: COLORS.primary,
    },
    orderTabId: {
        fontSize: SIZES.caption,
        color: COLORS.textMuted,
        ...FONTS.medium,
    },
    orderTabIdActive: { color: COLORS.primary },
    orderTabName: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
        ...FONTS.regular,
        marginTop: 2,
    },
    orderTabNameActive: {
        color: COLORS.primary,
        ...FONTS.medium,
    },
    scrollContent: {
        paddingHorizontal: SIZES.lg,
        paddingBottom: 20,
    },
    progressSection: {
        alignItems: 'center',
        marginBottom: SIZES.lg,
    },
    progressCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primaryMuted,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SIZES.md,
        borderWidth: 3,
        borderColor: COLORS.primary,
    },
    progressNumber: {
        fontSize: SIZES.title,
        color: COLORS.primary,
        ...FONTS.bold,
    },
    progressLabel: {
        fontSize: SIZES.caption,
        color: COLORS.textMuted,
        ...FONTS.regular,
    },
    progressBarWrap: {
        width: '100%',
        height: 6,
        backgroundColor: COLORS.borderLight,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: 6,
        backgroundColor: COLORS.success,
        borderRadius: 3,
    },
    checkItem: {
        marginBottom: SIZES.sm,
    },
    checkItemDone: {
        borderColor: COLORS.success + '40',
        backgroundColor: COLORS.successLight + '40',
    },
    checkRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: COLORS.border,
        marginRight: SIZES.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: COLORS.success,
        borderColor: COLORS.success,
    },
    checkLabel: {
        fontSize: SIZES.bodyLg,
        color: COLORS.textPrimary,
        ...FONTS.medium,
    },
    checkLabelDone: {
        color: COLORS.success,
        textDecorationLine: 'line-through',
    },
    checkDesc: {
        fontSize: SIZES.caption,
        color: COLORS.textMuted,
        ...FONTS.regular,
        marginTop: 2,
    },
    checkIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    approvalCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.successLight,
        borderColor: COLORS.success + '30',
        marginTop: SIZES.md,
    },
    approvalTitle: {
        fontSize: SIZES.bodyLg,
        color: COLORS.success,
        ...FONTS.semiBold,
    },
    approvalMeta: {
        fontSize: SIZES.caption,
        color: COLORS.textSecondary,
        ...FONTS.regular,
        marginTop: 2,
    },
    deliveryBtnSection: {
        marginTop: SIZES.lg,
        padding: SIZES.md,
        backgroundColor: COLORS.bgCard,
        borderRadius: SIZES.radiusLg,
        borderWidth: 1,
        borderColor: COLORS.primary + '20',
        ...SHADOWS.medium,
    },
    mainDeliveryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        paddingVertical: SIZES.md + 4,
        borderRadius: SIZES.radiusMd,
        ...SHADOWS.golden,
    },
    mainDeliveryBtnText: {
        fontSize: SIZES.bodyLg,
        color: COLORS.textOnPrimary,
        ...FONTS.bold,
        marginLeft: SIZES.sm,
    },
    confirmPanel: {
        padding: SIZES.sm,
        alignItems: 'center',
    },
    confirmText: {
        fontSize: SIZES.body,
        color: COLORS.textPrimary,
        ...FONTS.medium,
        marginBottom: SIZES.md,
        textAlign: 'center',
    },
    confirmActions: {
        flexDirection: 'row',
        width: '100%',
    },
    confirmBtn: {
        flex: 1,
        paddingVertical: SIZES.md,
        borderRadius: SIZES.radiusMd,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelBtn: {
        backgroundColor: COLORS.bgElevated,
        marginRight: SIZES.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    yesBtn: {
        backgroundColor: COLORS.success,
    },
    cancelBtnText: {
        color: COLORS.textSecondary,
        ...FONTS.medium,
    },
    yesBtnText: {
        color: COLORS.textOnPrimary,
        ...FONTS.bold,
    },
    readyBtnWrap: {
        marginTop: SIZES.xl,
    },
    confettiOverlay: {
        alignItems: 'center',
        marginTop: SIZES.lg,
    },
    confettiEmoji: {
        fontSize: 48,
    },
    confettiText: {
        fontSize: SIZES.subtitle,
        color: COLORS.success,
        ...FONTS.bold,
        marginTop: SIZES.sm,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: COLORS.bgOverlay,
        justifyContent: 'center',
        paddingHorizontal: SIZES.xl,
    },
    modalContent: {
        backgroundColor: COLORS.bgCard,
        borderRadius: SIZES.radiusXl,
        padding: SIZES.xl,
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: SIZES.xl,
    },
    modalTitle: {
        fontSize: SIZES.subtitle,
        color: COLORS.textPrimary,
        ...FONTS.bold,
        marginTop: SIZES.md,
    },
    modalSubtitle: {
        fontSize: SIZES.small,
        color: COLORS.textMuted,
        ...FONTS.regular,
        marginTop: 4,
        textAlign: 'center',
    },
    signatureArea: {
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
        borderRadius: SIZES.radiusMd,
        padding: SIZES.xl,
        alignItems: 'center',
        marginVertical: SIZES.md,
        backgroundColor: COLORS.bgElevated,
    },
    signatureText: {
        fontSize: SIZES.body,
        color: COLORS.textSecondary,
        ...FONTS.medium,
        marginTop: SIZES.sm,
    },
    signatureHint: {
        fontSize: SIZES.caption,
        color: COLORS.textMuted,
        ...FONTS.regular,
        marginTop: 2,
    },
    modalActions: {
        flexDirection: 'row',
        marginTop: SIZES.md,
    },
});

export default FinishingScreen;
