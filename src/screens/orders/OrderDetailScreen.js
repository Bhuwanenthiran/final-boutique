import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../theme';
import { useOrderStore } from '../../store/orderStore';
import { StatusBadge, Card, Divider, ScreenWrapper } from '../../components/common';
import { formatDate } from '../../services/dateUtils';

const OrderDetailScreen = ({ route, navigation }) => {
    const insets = useSafeAreaInsets();
    const { orderId } = route.params;
    const orders = useOrderStore((s) => s.orders);
    const order = orders.find(o => o.id === orderId);

    if (!order) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Order not found</Text>
            </View>
        );
    }

    const progressStages = [
        { key: 'pending', label: 'Pending', icon: 'time-outline' },
        { key: 'marking', label: 'Marking', icon: 'pencil-outline' },
        { key: 'cutting', label: 'Cutting', icon: 'cut-outline' },
        { key: 'stitching', label: 'Stitching', icon: 'construct-outline' },
        { key: 'production', label: 'Production', icon: 'cog-outline' },
        { key: 'completed', label: 'Completed', icon: 'checkmark-circle-outline' },
    ];

    const currentStageIdx = progressStages.findIndex(s => s.key === order.productionStage);

    return (
        <ScreenWrapper useSafeTop>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{order.id}</Text>
                <TouchableOpacity style={styles.moreBtn}>
                    <Ionicons name="ellipsis-vertical" size={20} color={COLORS.textPrimary} />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
            >
                {/* Status Banner */}
                <View style={styles.statusBanner}>
                    <StatusBadge status={order.status} />
                    <Text style={styles.dateLabel}>Created {formatDate(order.createdAt)}</Text>
                </View>

                {/* Customer Info */}
                <Card elevated style={styles.sectionCard}>
                    <View style={styles.sectionHead}>
                        <Ionicons name="person-outline" size={18} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>Customer</Text>
                    </View>
                    <Text style={styles.customerNameDetail}>{order.customerName}</Text>
                    <Divider />
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Design</Text>
                        <Text style={styles.infoValue}>{order.designName}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Category</Text>
                        <Text style={styles.infoValue}>{order.category}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Tailor</Text>
                        <Text style={styles.infoValue}>{order.tailorName || 'Not Assigned'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Priority</Text>
                        <View style={[styles.priorityTag, {
                            backgroundColor: order.priority === 'high' ? COLORS.errorLight : order.priority === 'medium' ? COLORS.warningLight : COLORS.successLight,
                        }]}>
                            <Text style={[styles.priorityText, {
                                color: order.priority === 'high' ? COLORS.error : order.priority === 'medium' ? COLORS.warning : COLORS.success,
                            }]}>{order.priority}</Text>
                        </View>
                    </View>
                </Card>

                {/* Measurements */}
                <Card elevated style={styles.sectionCard}>
                    <View style={styles.sectionHead}>
                        <Ionicons name="resize-outline" size={18} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>Measurements</Text>
                    </View>
                    <View style={styles.measureGrid}>
                        {Object.entries(order.measurements || {}).map(([key, val]) => {
                            // Convert camelCase key to readable label (e.g. 'sleeveLength' -> 'Sleeve Length')
                            const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase());
                            return (
                                <View key={key} style={styles.measureItem}>
                                    <Text style={styles.measureLabel}>{label}</Text>
                                    <Text style={styles.measureValue}>{val}"</Text>
                                </View>
                            );
                        })}
                    </View>
                </Card>

                {/* Order Tracker */}
                <Card elevated style={styles.sectionCard}>
                    <View style={styles.sectionHead}>
                        <Ionicons name="git-branch-outline" size={18} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>Order Status Tracker</Text>
                    </View>
                    <View style={styles.tracker}>
                        {progressStages.map((stage, idx) => {
                            const isCompleted = idx < currentStageIdx;
                            const isCurrent = idx === currentStageIdx;
                            return (
                                <View key={stage.key} style={styles.trackerStep}>
                                    <View style={styles.trackerLineWrap}>
                                        <View style={[
                                            styles.trackerDot,
                                            isCompleted && styles.trackerDotCompleted,
                                            isCurrent && styles.trackerDotCurrent,
                                        ]}>
                                            <Ionicons
                                                name={isCompleted ? 'checkmark' : stage.icon}
                                                size={14}
                                                color={isCompleted || isCurrent ? COLORS.textOnPrimary : COLORS.textMuted}
                                            />
                                        </View>
                                        {idx < progressStages.length - 1 && (
                                            <View style={[styles.trackerLine, isCompleted && styles.trackerLineCompleted]} />
                                        )}
                                    </View>
                                    <View style={styles.trackerContent}>
                                        <Text style={[
                                            styles.trackerLabel,
                                            (isCompleted || isCurrent) && styles.trackerLabelActive,
                                        ]}>{stage.label}</Text>
                                        {isCurrent && <Text style={styles.trackerCurrent}>Current Stage</Text>}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </Card>

                {/* Payment */}
                <Card elevated style={styles.sectionCard}>
                    <View style={styles.sectionHead}>
                        <Ionicons name="wallet-outline" size={18} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>Payment</Text>
                    </View>
                    <View style={styles.paymentSummary}>
                        <View style={styles.paymentRow}>
                            <Text style={styles.paymentLabel}>Total Amount</Text>
                            <Text style={styles.paymentValue}>₹{order.totalAmount.toLocaleString('en-IN')}</Text>
                        </View>
                        <View style={styles.paymentRow}>
                            <Text style={styles.paymentLabel}>Advance Paid</Text>
                            <Text style={[styles.paymentValue, { color: COLORS.success }]}>₹{order.advanceAmount.toLocaleString('en-IN')}</Text>
                        </View>
                        <View style={styles.paymentDivider} />
                        <View style={styles.paymentRow}>
                            <Text style={styles.paymentFinalLabel}>Balance Due</Text>
                            <Text style={styles.paymentFinalValue}>₹{order.balanceAmount.toLocaleString('en-IN')}</Text>
                        </View>
                    </View>
                    <View style={styles.progressBarWrap}>
                        <View style={[styles.progressBarFill, { width: `${(order.advanceAmount / order.totalAmount) * 100}%` }]} />
                    </View>
                    <Text style={styles.progressPercent}>{Math.round((order.advanceAmount / order.totalAmount) * 100)}% paid</Text>
                </Card>

                {/* Notes */}
                {order.notes && (
                    <Card elevated style={styles.sectionCard}>
                        <View style={styles.sectionHead}>
                            <Ionicons name="document-text-outline" size={18} color={COLORS.primary} />
                            <Text style={styles.sectionTitle}>Notes</Text>
                        </View>
                        <Text style={styles.notesText}>{order.notes}</Text>
                    </Card>
                )}

                {/* Delivery */}
                <Card elevated style={[styles.sectionCard, styles.deliveryCard]}>
                    <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
                    <View style={{ marginLeft: SIZES.md, flex: 1 }}>
                        <Text style={styles.deliveryLabel}>Delivery Date</Text>
                        <Text style={styles.deliveryDate}>{formatDate(order.deliveryDate)}</Text>
                    </View>
                </Card>

                <View style={{ height: 40 }} />
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.lg,
        paddingTop: SIZES.sm,
        paddingBottom: SIZES.md,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.bgCard,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.small,
    },
    headerTitle: {
        fontSize: SIZES.subtitle,
        color: COLORS.textPrimary,
        ...FONTS.semiBold,
        letterSpacing: 0.5,
    },
    moreBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingHorizontal: SIZES.lg,
        paddingBottom: 20,
    },
    statusBanner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SIZES.md,
    },
    dateLabel: {
        fontSize: SIZES.caption,
        color: COLORS.textMuted,
        ...FONTS.regular,
    },
    sectionCard: {
        marginBottom: SIZES.md,
    },
    sectionHead: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SIZES.md,
    },
    sectionTitle: {
        fontSize: SIZES.bodyLg,
        color: COLORS.textPrimary,
        ...FONTS.semiBold,
        marginLeft: SIZES.sm,
    },
    customerNameDetail: {
        fontSize: SIZES.title,
        color: COLORS.textPrimary,
        ...FONTS.bold,
        marginBottom: SIZES.sm,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SIZES.sm,
    },
    infoLabel: {
        fontSize: SIZES.body,
        color: COLORS.textMuted,
        ...FONTS.regular,
    },
    infoValue: {
        fontSize: SIZES.body,
        color: COLORS.textPrimary,
        ...FONTS.medium,
    },
    priorityTag: {
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.xs,
        borderRadius: SIZES.radiusFull,
    },
    priorityText: {
        fontSize: SIZES.caption,
        ...FONTS.semiBold,
        textTransform: 'capitalize',
    },
    measureGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    measureItem: {
        width: '50%',
        paddingVertical: SIZES.sm,
        paddingRight: SIZES.md,
    },
    measureLabel: {
        fontSize: SIZES.caption,
        color: COLORS.textMuted,
        ...FONTS.regular,
    },
    measureValue: {
        fontSize: SIZES.bodyLg,
        color: COLORS.textPrimary,
        ...FONTS.semiBold,
        marginTop: 2,
    },
    tracker: {
        paddingLeft: SIZES.xs,
    },
    trackerStep: {
        flexDirection: 'row',
        minHeight: 48,
    },
    trackerLineWrap: {
        alignItems: 'center',
        width: 30,
    },
    trackerDot: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    trackerDotCompleted: {
        backgroundColor: COLORS.success,
    },
    trackerDotCurrent: {
        backgroundColor: COLORS.primary,
        ...SHADOWS.golden,
    },
    trackerLine: {
        width: 2,
        flex: 1,
        backgroundColor: COLORS.border,
        marginVertical: 2,
    },
    trackerLineCompleted: {
        backgroundColor: COLORS.success,
    },
    trackerContent: {
        flex: 1,
        marginLeft: SIZES.md,
        paddingBottom: SIZES.sm,
    },
    trackerLabel: {
        fontSize: SIZES.body,
        color: COLORS.textMuted,
        ...FONTS.regular,
    },
    trackerLabelActive: {
        color: COLORS.textPrimary,
        ...FONTS.semiBold,
    },
    trackerCurrent: {
        fontSize: SIZES.caption,
        color: COLORS.primary,
        ...FONTS.medium,
        marginTop: 2,
    },
    paymentSummary: {
        backgroundColor: COLORS.bgElevated,
        borderRadius: SIZES.radiusMd,
        padding: SIZES.md,
    },
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SIZES.sm,
    },
    paymentLabel: {
        fontSize: SIZES.body,
        color: COLORS.textSecondary,
        ...FONTS.regular,
    },
    paymentValue: {
        fontSize: SIZES.body,
        color: COLORS.textPrimary,
        ...FONTS.medium,
    },
    paymentDivider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: SIZES.sm,
    },
    paymentFinalLabel: {
        fontSize: SIZES.bodyLg,
        color: COLORS.textPrimary,
        ...FONTS.semiBold,
    },
    paymentFinalValue: {
        fontSize: SIZES.bodyLg,
        color: COLORS.primary,
        ...FONTS.bold,
    },
    progressBarWrap: {
        height: 6,
        backgroundColor: COLORS.borderLight,
        borderRadius: 3,
        marginTop: SIZES.md,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: 6,
        backgroundColor: COLORS.success,
        borderRadius: 3,
    },
    progressPercent: {
        fontSize: SIZES.caption,
        color: COLORS.textMuted,
        ...FONTS.regular,
        marginTop: SIZES.xs,
    },
    notesText: {
        fontSize: SIZES.body,
        color: COLORS.textSecondary,
        ...FONTS.regular,
        lineHeight: 20,
    },
    deliveryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primaryMuted,
        borderColor: COLORS.primarySoft,
    },
    deliveryLabel: {
        fontSize: SIZES.caption,
        color: COLORS.textMuted,
        ...FONTS.regular,
    },
    deliveryDate: {
        fontSize: SIZES.subtitle,
        color: COLORS.primary,
        ...FONTS.bold,
        marginTop: 2,
    },
    errorText: {
        fontSize: SIZES.bodyLg,
        color: COLORS.error,
        textAlign: 'center',
        marginTop: 100,
    },
});

export default OrderDetailScreen;
