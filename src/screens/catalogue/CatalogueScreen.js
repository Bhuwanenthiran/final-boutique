import React, { useState } from 'react';
import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity,
    FlatList, Modal, Platform, TextInput, KeyboardAvoidingView, Keyboard
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../theme';
import { useCatalogueStore } from '../../store/catalogueStore';
import { useOrderStore } from '../../store/orderStore';
import { Card, EmptyState, StatusBadge, LoadingOverlay, ErrorOverlay, ScreenWrapper } from '../../components/common';
import { FormButton, SearchBar } from '../../components/forms';
import { formatDate } from '../../services/dateUtils';

const TABS = [
    { key: 'hold', label: 'Hold', icon: 'pause-circle-outline' },
    { key: 'cancelled', label: 'Cancelled', icon: 'close-circle-outline' },
    { key: 'alteration', label: 'Alterations', icon: 'build-outline' },
    { key: 'delivered', label: 'Delivered', icon: 'checkmark-circle-outline' },
];

const TAB_ADD_CONFIG = {
    hold: {
        title: 'Add Hold Order',
        icon: 'pause-circle-outline',
        color: COLORS.warning,
        notePlaceholder: 'Reason for hold (e.g. Payment pending)',
    },
    cancelled: {
        title: 'Add Cancellation',
        icon: 'close-circle-outline',
        color: COLORS.error,
        notePlaceholder: 'Reason for cancellation',
    },
    alteration: {
        title: 'Add Alteration',
        icon: 'build-outline',
        color: COLORS.slate,
        notePlaceholder: 'Alteration details (e.g. Shorten sleeve by 1 inch)',
    },
    delivered: {
        title: 'Add Delivered Record',
        icon: 'checkmark-circle-outline',
        color: COLORS.success,
        notePlaceholder: 'Delivery notes (e.g. Delivered to home)',
    },
};

const EMPTY_FORM = { orderNo: '', name: '', note: '' };

// ─── Card Components ─────────────────────────────────────────────────────────

const DeliveredItem = React.memo(({ item, onConfirm, isLoading }) => (
    <Card elevated style={styles.catalogueCard}>
        <View style={styles.cardRow}>
            <View style={[styles.cardIconWrap, { backgroundColor: COLORS.success + '15' }]}>
                <Ionicons name="checkmark-circle-outline" size={22} color={COLORS.success} />
            </View>
            <View style={{ flex: 1, marginLeft: SIZES.md }}>
                <View style={styles.rowBetween}>
                    <Text style={styles.cardTitle}>{item.customerName}</Text>
                    <Text style={styles.priceText}>₹{item.totalAmount || 0}</Text>
                </View>
                <Text style={styles.cardSubtitle}>{item.orderNo} — {item.designName || 'Boutique Item'}</Text>
                <Text style={styles.cardMeta}>Delivered: {formatDate(item.deliveredAt)} • {item.deliveredBy}</Text>
            </View>
        </View>
        <View style={styles.cardActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => onConfirm('delete_delivered', item)} disabled={isLoading}>
                <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                <Text style={[styles.actionText, { color: COLORS.error }]}>Delete Record</Text>
            </TouchableOpacity>
        </View>
    </Card>
));

const HoldItem = React.memo(({ item, onConfirm, isLoading }) => (
    <Card elevated style={styles.catalogueCard}>
        <View style={styles.cardRow}>
            <View style={[styles.cardIconWrap, { backgroundColor: COLORS.warningLight }]}>
                <Ionicons name="pause-circle-outline" size={22} color={COLORS.warning} />
            </View>
            <View style={{ flex: 1, marginLeft: SIZES.md }}>
                <Text style={styles.cardTitle}>{item.customerName}</Text>
                <Text style={styles.cardSubtitle}>{item.designName || item.orderNo}</Text>
                <Text style={styles.cardMeta}>Order: {item.orderId || item.orderNo} • {formatDate(item.holdDate)}</Text>
            </View>
        </View>
        {item.reason || item.note ? (
            <View style={styles.reasonWrap}>
                <Ionicons name="information-circle-outline" size={14} color={COLORS.textMuted} />
                <Text style={styles.reasonText}>{item.reason || item.note}</Text>
            </View>
        ) : null}
        <View style={styles.cardActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => onConfirm('restore', item)} disabled={isLoading}>
                <Ionicons name="refresh-outline" size={16} color={COLORS.success} />
                <Text style={[styles.actionText, { color: COLORS.success }]}>Restore</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => onConfirm('delete_hold', item)} disabled={isLoading}>
                <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                <Text style={[styles.actionText, { color: COLORS.error }]}>Delete</Text>
            </TouchableOpacity>
        </View>
    </Card>
));

const CancelledItem = React.memo(({ item, onConfirm, isLoading }) => (
    <Card elevated style={styles.catalogueCard}>
        <View style={styles.cardRow}>
            <View style={[styles.cardIconWrap, { backgroundColor: COLORS.errorLight }]}>
                <Ionicons name="close-circle-outline" size={22} color={COLORS.error} />
            </View>
            <View style={{ flex: 1, marginLeft: SIZES.md }}>
                <Text style={styles.cardTitle}>{item.customerName}</Text>
                <Text style={styles.cardSubtitle}>{item.designName || item.orderNo}</Text>
                <Text style={styles.cardMeta}>Order: {item.orderId || item.orderNo} • {formatDate(item.cancelledDate)}</Text>
            </View>
        </View>
        {item.reason || item.note ? (
            <View style={styles.reasonWrap}>
                <Ionicons name="information-circle-outline" size={14} color={COLORS.textMuted} />
                <Text style={styles.reasonText}>Reason: {item.reason || item.note}</Text>
            </View>
        ) : null}
        <View style={styles.cardActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => onConfirm('delete_cancelled', item)} disabled={isLoading}>
                <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                <Text style={[styles.actionText, { color: COLORS.error }]}>Delete</Text>
            </TouchableOpacity>
        </View>
    </Card>
));

const AlterationItem = React.memo(({ item, onConfirm, isLoading }) => (
    <Card elevated style={styles.catalogueCard}>
        <View style={styles.cardRow}>
            <View style={[styles.cardIconWrap, { backgroundColor: COLORS.slateLight }]}>
                <Ionicons name="build-outline" size={22} color={COLORS.slate} />
            </View>
            <View style={{ flex: 1, marginLeft: SIZES.md }}>
                <Text style={styles.cardTitle}>{item.customerName}</Text>
                <Text style={styles.cardSubtitle}>{item.item || item.orderNo} — {item.type || 'Alteration'}</Text>
                <Text style={styles.cardMeta}>{formatDate(item.date)}</Text>
            </View>
            <StatusBadge status={item.status} size="small" />
        </View>
        {(item.notes || item.note) ? (
            <View style={styles.reasonWrap}>
                <Ionicons name="document-text-outline" size={14} color={COLORS.textMuted} />
                <Text style={styles.reasonText}>{item.notes || item.note}</Text>
            </View>
        ) : null}
        <View style={styles.cardActions}>
            {item.status !== 'completed' && (
                <TouchableOpacity style={styles.actionBtn} onPress={() => onConfirm('complete_alteration', item)} disabled={isLoading}>
                    <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.success} />
                    <Text style={[styles.actionText, { color: COLORS.success }]}>Complete</Text>
                </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.actionBtn} onPress={() => onConfirm('delete_alteration', item)} disabled={isLoading}>
                <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                <Text style={[styles.actionText, { color: COLORS.error }]}>Delete</Text>
            </TouchableOpacity>
        </View>
    </Card>
));

// ─── Main Screen ─────────────────────────────────────────────────────────────

const CatalogueScreen = () => {
    const insets = useSafeAreaInsets();
    const activeTab = useCatalogueStore((s) => s.activeTab);
    const setActiveTab = useCatalogueStore((s) => s.setActiveTab);
    const holdOrders = useCatalogueStore((s) => s.holdOrders);
    const cancelledOrders = useCatalogueStore((s) => s.cancelledOrders);
    const alterations = useCatalogueStore((s) => s.alterations);
    const removeHoldOrder = useCatalogueStore((s) => s.removeHoldOrder);
    const restoreHoldOrder = useCatalogueStore((s) => s.restoreHoldOrder);
    const deleteCancelledOrder = useCatalogueStore((s) => s.deleteCancelledOrder);
    const deleteAlteration = useCatalogueStore((s) => s.deleteAlteration);
    const updateAlteration = useCatalogueStore((s) => s.updateAlteration);
    const addHoldOrder = useCatalogueStore((s) => s.addHoldOrder);
    const addCancelledOrder = useCatalogueStore((s) => s.addCancelledOrder);
    const addAlteration = useCatalogueStore((s) => s.addAlteration);
    
    // Order Store for Delivered tab
    const orders = useOrderStore((s) => s.orders);
    const deleteOrder = useOrderStore((s) => s.deleteOrder);

    const catalogueLoading = useCatalogueStore((s) => s.isLoading);
    const orderLoading = useOrderStore((s) => s.isLoading);
    // Only show global loading overlay for confirm actions (delete/restore), NOT for adds
    const isLoading = catalogueLoading || orderLoading;
    const error = useCatalogueStore((s) => s.error);
    const clearError = useCatalogueStore((s) => s.clearError);

    const [searchQuery, setSearchQuery] = useState('');

    // ─── Confirmation modal state ───
    const [showConfirm, setShowConfirm] = useState(false);
    const [modalAction, setModalAction] = useState(null);
    const [modalItem, setModalItem] = useState(null);

    // ─── Add entry modal state ───
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [formError, setFormError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const confirmAction = (action, item) => {
        setModalAction(action);
        setModalItem(item);
        setShowConfirm(true);
    };

    const executeAction = async () => {
        try {
            if (modalAction === 'restore') await restoreHoldOrder(modalItem.id);
            else if (modalAction === 'delete_hold') await removeHoldOrder(modalItem.id);
            else if (modalAction === 'delete_cancelled') await deleteCancelledOrder(modalItem.id);
            else if (modalAction === 'delete_alteration') await deleteAlteration(modalItem.id);
            else if (modalAction === 'delete_delivered') await deleteOrder(modalItem.id);
            else if (modalAction === 'complete_alteration') await updateAlteration(modalItem.id, { status: 'completed' });
        } catch (_) { /* handled by store */ }
        setShowConfirm(false);
    };

    const openAddModal = () => {
        setForm(EMPTY_FORM);
        setFormError('');
        setShowAdd(true);
    };

    const handleAdd = async () => {
        if (!form.orderNo.trim()) { setFormError('Order number is required.'); return; }
        if (!form.name.trim()) { setFormError('Customer name is required.'); return; }
        setFormError('');
        setIsSaving(true);

        // Snapshot values before closing modal so async ops still have correct data
        const snapshot = {
            orderNo: form.orderNo.trim(),
            customerName: form.name.trim(),
            note: form.note.trim(),
            tab: activeTab,
        };

        // Close the modal IMMEDIATELY so the screen never goes blank
        Keyboard.dismiss();
        setShowAdd(false);

        try {
            const base = {
                orderNo: snapshot.orderNo,
                customerName: snapshot.customerName,
                note: snapshot.note,
                createdAt: Date.now(),
            };

            if (snapshot.tab === 'hold') {
                await addHoldOrder({ ...base, orderId: base.orderNo, reason: base.note, holdDate: Date.now(), status: 'hold' });
            } else if (snapshot.tab === 'cancelled') {
                await addCancelledOrder({ ...base, orderId: base.orderNo, reason: base.note, cancelledDate: Date.now(), status: 'cancelled', refunded: false });
            } else if (snapshot.tab === 'delivered') {
                await useOrderStore.getState().addOrder({
                    ...base,
                    designName: 'Catalogue Entry',
                    status: 'delivered',
                    deliveredAt: Date.now(),
                    deliveredBy: 'Manual Entry',
                    totalAmount: 0,
                    advanceAmount: 0,
                    balanceAmount: 0,
                    priority: 'low',
                    items: []
                });
            } else {
                await addAlteration({ ...base, item: base.orderNo, type: 'Alteration', notes: base.note, date: Date.now(), status: 'pending' });
            }
        } catch (err) {
            console.error('Manual add error:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const renderHoldItem = ({ item }) => <HoldItem item={item} onConfirm={confirmAction} isLoading={isLoading} />;
    const renderCancelledItem = ({ item }) => <CancelledItem item={item} onConfirm={confirmAction} isLoading={isLoading} />;
    const renderAlterationItem = ({ item }) => <AlterationItem item={item} onConfirm={confirmAction} isLoading={isLoading} />;
    const renderDeliveredItem = ({ item }) => <DeliveredItem item={item} onConfirm={confirmAction} isLoading={isLoading} />;

    const getCurrentData = () => {
        switch (activeTab) {
            case 'hold': return { data: holdOrders, renderItem: renderHoldItem, emptyIcon: 'pause-outline', emptyTitle: 'No hold orders' };
            case 'cancelled': return { data: cancelledOrders, renderItem: renderCancelledItem, emptyIcon: 'close-outline', emptyTitle: 'No cancelled orders' };
            case 'alteration': return { data: alterations, renderItem: renderAlterationItem, emptyIcon: 'build-outline', emptyTitle: 'No alterations' };
            case 'delivered': {
                const delivered = orders.filter(o => o.status === 'delivered');
                return { data: delivered, renderItem: renderDeliveredItem, emptyIcon: 'checkmark-circle-outline', emptyTitle: 'No delivery records' };
            }
            default: return { data: [], renderItem: () => null, emptyIcon: 'ellipse', emptyTitle: 'No data' };
        }
    };

    const { data: sourceData, renderItem, emptyIcon, emptyTitle } = getCurrentData();
    const addConfig = TAB_ADD_CONFIG[activeTab];

    const filteredData = React.useMemo(() => {
        if (!searchQuery.trim()) return sourceData;
        const q = searchQuery.toLowerCase();
        return sourceData.filter(item => {
            const name = item.customerName || item.name || '';
            const orderNo = item.orderNo || '';
            return name.toLowerCase().includes(q) || orderNo.toLowerCase().includes(q);
        });
    }, [searchQuery, sourceData]);

    return (
        <ScreenWrapper useSafeTop>
            <LoadingOverlay visible={isSaving} message="Saving..." />
            <ErrorOverlay visible={!!error} error={error} onRetry={executeAction} onClose={clearError} />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Catalogue</Text>
                    <Text style={styles.headerSubtitle}>Hold, cancelled & alteration records</Text>
                </View>
            </View>

            {/* Search */}
            <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={`Search ${activeTab} records...`}
                style={{ marginBottom: SIZES.sm }}
            />

            {/* Segmented Control */}
            <View style={styles.segmentedControl}>
                {TABS.map(tab => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.segment, activeTab === tab.key && styles.segmentActive]}
                        onPress={() => setActiveTab(tab.key)}
                        disabled={isLoading}
                    >
                        <Ionicons name={tab.icon} size={16} color={activeTab === tab.key ? COLORS.primary : COLORS.textMuted} />
                        <Text style={[styles.segmentText, activeTab === tab.key && styles.segmentTextActive]}>{tab.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* List */}
            {filteredData.length === 0 ? (
                <EmptyState 
                    icon={emptyIcon} 
                    title={emptyTitle} 
                    subtitle="Tap + to add a new record" 
                    actionLabel="Add Record"
                    onAction={openAddModal}
                />
            ) : (
                <FlatList
                    data={filteredData}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={[styles.listContent, { paddingBottom: 150 + insets.bottom }]}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={8}
                />
            )}



            {/* ── Confirmation Modal ── */}
            <Modal visible={showConfirm} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalIconWrap}>
                            <Ionicons
                                name={modalAction?.includes('delete') ? 'trash-outline' : modalAction === 'restore' ? 'refresh-outline' : 'checkmark-circle-outline'}
                                size={32}
                                color={modalAction?.includes('delete') ? COLORS.error : COLORS.success}
                            />
                        </View>
                        <Text style={styles.modalTitle}>
                            {modalAction?.includes('delete') ? 'Delete Record?' : modalAction === 'restore' ? 'Restore Order?' : 'Mark Complete?'}
                        </Text>
                        <Text style={styles.modalDesc}>
                            {modalAction?.includes('delete') ? 'This action cannot be undone.' : 'Are you sure you want to proceed?'}
                        </Text>
                        <View style={styles.modalActions}>
                            <FormButton title="Cancel" variant="outline" onPress={() => setShowConfirm(false)} size="small" disabled={isLoading} />
                            <View style={{ width: SIZES.sm }} />
                            <FormButton title={modalAction?.includes('delete') ? 'Delete' : 'Confirm'} onPress={executeAction} size="small" loading={isLoading} />
                        </View>
                    </View>
                </View>
            </Modal>

            {/* ── Add Entry Modal ── */}
            <Modal visible={showAdd} transparent animationType="slide">
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ flex: 1 }}
                >
                    <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowAdd(false)}>
                        <TouchableOpacity activeOpacity={1} style={styles.addModalContent}>
                            {/* Modal Header */}
                            <View style={styles.addModalHeader}>
                                <View style={[styles.addModalIcon, { backgroundColor: addConfig.color + '20' }]}>
                                    <Ionicons name={addConfig.icon} size={22} color={addConfig.color} />
                                </View>
                                <Text style={styles.addModalTitle}>{addConfig.title}</Text>
                                <TouchableOpacity onPress={() => setShowAdd(false)}>
                                    <Ionicons name="close" size={22} color={COLORS.textMuted} />
                                </TouchableOpacity>
                            </View>

                            {/* Fields */}
                            <View style={styles.fieldGroup}>
                                <Text style={styles.fieldLabel}>Order Number *</Text>
                                <View style={styles.inputWrap}>
                                    <Ionicons name="receipt-outline" size={16} color={COLORS.textMuted} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="e.g. ORD-2024-001"
                                        placeholderTextColor={COLORS.textLight}
                                        value={form.orderNo}
                                        onChangeText={v => setForm(f => ({ ...f, orderNo: v }))}
                                        autoCapitalize="characters"
                                    />
                                </View>
                            </View>

                            <View style={styles.fieldGroup}>
                                <Text style={styles.fieldLabel}>Customer Name *</Text>
                                <View style={styles.inputWrap}>
                                    <Ionicons name="person-outline" size={16} color={COLORS.textMuted} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Customer full name"
                                        placeholderTextColor={COLORS.textLight}
                                        value={form.name}
                                        onChangeText={v => setForm(f => ({ ...f, name: v }))}
                                    />
                                </View>
                            </View>

                            <View style={styles.fieldGroup}>
                                <Text style={styles.fieldLabel}>Note</Text>
                                <View style={[styles.inputWrap, styles.textareaWrap]}>
                                    <TextInput
                                        style={[styles.input, styles.textarea]}
                                        placeholder={addConfig.notePlaceholder}
                                        placeholderTextColor={COLORS.textLight}
                                        value={form.note}
                                        onChangeText={v => setForm(f => ({ ...f, note: v }))}
                                        multiline
                                        numberOfLines={3}
                                        textAlignVertical="top"
                                    />
                                </View>
                            </View>

                            {/* Error */}
                            {!!formError && (
                                <View style={styles.formErrorWrap}>
                                    <Ionicons name="alert-circle-outline" size={14} color={COLORS.error} />
                                    <Text style={styles.formErrorText}>{formError}</Text>
                                </View>
                            )}

                            {/* Actions */}
                            <View style={styles.addModalActions}>
                                <FormButton title="Cancel" variant="outline" onPress={() => setShowAdd(false)} style={{ flex: 1, marginRight: SIZES.sm }} />
                                <FormButton title="Save" onPress={handleAdd} loading={isSaving} style={{ flex: 1 }} />
                            </View>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </Modal>
            
            <TouchableOpacity 
                style={styles.fab} 
                onPress={openAddModal}
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={30} color={COLORS.textOnPrimary} />
            </TouchableOpacity>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: SIZES.lg,
        paddingTop: SIZES.lg,
        paddingBottom: SIZES.sm,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: { fontSize: SIZES.heading, color: COLORS.textPrimary, ...FONTS.bold, letterSpacing: -0.5 },
    headerSubtitle: { fontSize: SIZES.small, color: COLORS.textMuted, ...FONTS.regular, marginTop: 2 },
    segmentedControl: {
        flexDirection: 'row',
        marginHorizontal: SIZES.lg,
        backgroundColor: COLORS.bgElevated,
        borderRadius: SIZES.radiusMd,
        padding: SIZES.xs,
        marginBottom: SIZES.md,
    },
    segment: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SIZES.sm + 2, borderRadius: SIZES.radiusSm },
    segmentActive: { backgroundColor: COLORS.bgCard, ...SHADOWS.small },
    segmentText: { fontSize: SIZES.small, color: COLORS.textMuted, ...FONTS.medium, marginLeft: 4 },
    segmentTextActive: { color: COLORS.primary, ...FONTS.semiBold },
    listContent: { paddingHorizontal: SIZES.lg, paddingBottom: 20 },
    catalogueCard: { marginBottom: SIZES.md },
    cardRow: { flexDirection: 'row', alignItems: 'center' },
    cardIconWrap: { width: 44, height: 44, borderRadius: SIZES.radiusMd, justifyContent: 'center', alignItems: 'center' },
    cardTitle: { fontSize: SIZES.bodyLg, color: COLORS.textPrimary, ...FONTS.semiBold },
    cardSubtitle: { fontSize: SIZES.small, color: COLORS.textSecondary, ...FONTS.regular, marginTop: 1 },
    cardMeta: { fontSize: SIZES.caption, color: COLORS.textMuted, ...FONTS.regular, marginTop: 2 },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    priceText: { fontSize: SIZES.bodyLg, color: COLORS.success, ...FONTS.bold },
    reasonWrap: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: COLORS.bgElevated, borderRadius: SIZES.radiusSm, padding: SIZES.md, marginTop: SIZES.md },
    reasonText: { fontSize: SIZES.small, color: COLORS.textSecondary, ...FONTS.regular, marginLeft: 6, flex: 1, lineHeight: 18 },
    cardActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: SIZES.md, paddingTop: SIZES.sm, borderTopWidth: 1, borderTopColor: COLORS.borderLight },
    actionBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SIZES.md, paddingVertical: SIZES.sm, marginLeft: SIZES.sm, borderRadius: SIZES.radiusFull, backgroundColor: COLORS.bgElevated },
    actionText: { fontSize: SIZES.small, ...FONTS.medium, marginLeft: 4 },
    // FAB
    fab: {
        position: 'absolute',
        right: SIZES.lg,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        elevation: 5,
        ...SHADOWS.large,
    },
    // Modals shared
    modalOverlay: { flex: 1, backgroundColor: COLORS.bgOverlay, justifyContent: 'center', paddingHorizontal: SIZES.xxl },
    modalContent: { backgroundColor: COLORS.bgCard, borderRadius: SIZES.radiusXl, padding: SIZES.xl, alignItems: 'center' },
    modalIconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.bgElevated, justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.md },
    modalTitle: { fontSize: SIZES.subtitle, color: COLORS.textPrimary, ...FONTS.bold },
    modalDesc: { fontSize: SIZES.body, color: COLORS.textMuted, ...FONTS.regular, marginTop: SIZES.sm, textAlign: 'center' },
    modalActions: { flexDirection: 'row', marginTop: SIZES.xl },
    // Add modal
    addModalContent: {
        backgroundColor: COLORS.bgCard,
        marginHorizontal: 0,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: SIZES.xl,
        paddingBottom: SIZES.xxl,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    addModalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SIZES.xl },
    addModalIcon: { width: 40, height: 40, borderRadius: SIZES.radiusMd, justifyContent: 'center', alignItems: 'center', marginRight: SIZES.md },
    addModalTitle: { flex: 1, fontSize: SIZES.subtitle, color: COLORS.textPrimary, ...FONTS.bold },
    fieldGroup: { marginBottom: SIZES.md },
    fieldLabel: { fontSize: SIZES.small, color: COLORS.textSecondary, ...FONTS.medium, marginBottom: SIZES.xs },
    inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgElevated, borderRadius: SIZES.radiusMd, borderWidth: 1, borderColor: COLORS.borderLight, paddingHorizontal: SIZES.md },
    inputIcon: { marginRight: SIZES.sm },
    input: { flex: 1, fontSize: SIZES.body, color: COLORS.textPrimary, paddingVertical: SIZES.md, ...FONTS.regular },
    textareaWrap: { alignItems: 'flex-start', paddingVertical: SIZES.sm },
    textarea: { minHeight: 72, paddingVertical: SIZES.xs },
    formErrorWrap: { flexDirection: 'row', alignItems: 'center', marginBottom: SIZES.md, backgroundColor: COLORS.errorLight, padding: SIZES.md, borderRadius: SIZES.radiusSm },
    formErrorText: { fontSize: SIZES.small, color: COLORS.error, ...FONTS.medium, marginLeft: 6 },
    addModalActions: { flexDirection: 'row', marginTop: SIZES.lg },
});

export default CatalogueScreen;
