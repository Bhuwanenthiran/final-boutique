import { create } from 'zustand';
import { orderService } from '../services/orderService';

/**
 * OrderStore — manages all order-related state with real-time Firestore synchronization.
 */
export const useOrderStore = create((set, get) => ({
    orders: [],
    customers: [],
    designs: [],
    tailors: [],
    designTemplates: null,
    measurementFields: [],
    draftOrder: null,
    filterStatus: 'all',
    searchQuery: '',
    isLoading: false,
    error: null,
    subs: {
        orders: null,
        customers: null,
        designs: null,
        tailors: null
    },

    clearError: () => set({ error: null }),

    /**
     * Initializes the store by setting up real-time Firestore listeners for all collections.
     */
    init: async () => {
        const { subs } = get();
        // 1. Clean up any existing listeners
        Object.values(subs).forEach(unsub => unsub && unsub());

        set({ isLoading: true, error: null });
        try {
            // 2. Setup real-time listeners (The service handles the onSnapshot logic)
            const newSubs = {
                orders: orderService.getOrders((orders) => set({ orders, isLoading: false })),
                customers: orderService.getCustomers((customers) => set({ customers })),
                designs: orderService.getDesigns((designs) => set({ designs })),
                tailors: orderService.getTailors((tailors) => set({ tailors })),
            };

            // 3. Load static reference data (one-time fetch)
            const [designTemplates, measurementFields] = await Promise.all([
                orderService.getDesignTemplates(),
                orderService.getMeasurementFields(),
            ]);

            set({
                subs: newSubs,
                designTemplates,
                measurementFields,
                isLoading: false
            });
        } catch (error) {
            console.error("OrderStore Init Error:", error);
            set({ isLoading: false, error: 'Failed to initialize store.' });
        }
    },

    // Alias for pull-to-refresh compatibility
    fetchOrders: () => get().init(),

    // Stop all active listeners manually (useful on logout)
    destroy: () => {
        const { subs } = get();
        Object.values(subs).forEach(unsub => unsub && unsub());
        set({ subs: { orders: null, customers: null, designs: null, tailors: null } });
    },

    getFilteredOrders: () => {
        const { orders, filterStatus, searchQuery } = get();
        let filtered = [...orders];
        if (filterStatus !== 'all') {
            filtered = filtered.filter(o => {
                const status = (o.status || 'active').toLowerCase().replace(/\s/g, '_');
                return status === filterStatus.toLowerCase().replace(/\s/g, '_');
            });
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(o =>
                (o.customerName || '').toLowerCase().includes(q) ||
                (o.designName || '').toLowerCase().includes(q) ||
                (o.orderNo || '').toLowerCase().includes(q) ||
                (o.id || '').toLowerCase().includes(q)
            );
        }
        return filtered;
    },

    setFilterStatus: (status) => set({ filterStatus: status }),
    setSearchQuery: (query) => set({ searchQuery: query }),

    addOrder: async (orderData) => {
        set({ isLoading: true, error: null });
        try {
            const newOrder = await orderService.addOrder(orderData);
            set({ draftOrder: null, isLoading: false });
            return newOrder;
        } catch (error) {
            const message = error.message.includes('permission') 
                ? 'Missing permissions to create order.' 
                : (error.message || 'Failed to create order.');
            set({ isLoading: false, error: message });
            throw error;
        }
    },

    updateOrder: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
            await orderService.updateOrder(id, updates);
            set({ isLoading: false });
        } catch (error) {
            set({ isLoading: false, error: error.message || 'Update failed.' });
            throw error;
        }
    },

    deleteOrder: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await orderService.deleteOrder(id);
            set({ isLoading: false });
        } catch (error) {
            set({ isLoading: false, error: 'Delete failed.' });
            throw error;
        }
    },

    saveDraft: (draft) => set({ draftOrder: draft }),
    clearDraft: () => set({ draftOrder: null }),

    updateOrderStatus: async (id, status) => {
        set({ isLoading: true, error: null });
        try {
            const updates = { status };
            
            // If marking as delivered, ensure we update production stage so it leaves active workflows
            if (status.toLowerCase() === 'delivered') {
                updates.productionStage = 'delivered';
                updates.deliveredAt = Date.now();
                updates.balanceAmount = 0;
            }

            await orderService.updateOrder(id, updates);
            
            // Immutably update state so UI reflects the new status immediately
            set((state) => ({
                orders: state.orders.map(order => 
                    order.id === id ? { ...order, ...updates } : order
                ),
                isLoading: false
            }));
        } catch (error) {
            set({ isLoading: false, error: 'Status update failed.' });
            throw error;
        }
    },

    markAsDelivered: async (targetOrder) => {
        if (!targetOrder?.id) return;
        set({ isLoading: true, error: null });
        try {
            const updates = {
                status: 'delivered',
                productionStage: 'delivered',
                deliveredAt: Date.now(),
                deliveredBy: targetOrder.tailorName || 'Staff',
                balanceAmount: 0,
            };

            await orderService.updateOrder(targetOrder.id, updates);
            
            // Immutably update state so UI excludes it from active lists immediately
            set((state) => ({
                orders: state.orders.map(o => 
                    o.id === targetOrder.id ? { ...o, ...updates } : o
                ),
                isLoading: false
            }));
        } catch (error) {
            set({ isLoading: false, error: 'Delivery failed: ' + (error.message || 'Unknown error') });
            throw error;
        }
    },
}));
