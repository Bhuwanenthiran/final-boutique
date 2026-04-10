/**
 * Mock data for the catalogue service.
 * Used as a fallback or for development before data is fully migrated to Firestore.
 */

export const MOCK_HOLD_ORDERS = [
    {
        id: 'hold1',
        customerName: 'Aarti Sharma',
        orderNumber: 'ORD-HP-001',
        holdDate: Date.now() - 86400000, // 1 day ago
        reason: 'Wedding date postponed',
        status: 'hold',
        items: ['Bridal Lehenga', 'Blouse'],
        totalAmount: 45000,
        paidAmount: 15000
    },
    {
        id: 'hold2',
        customerName: 'Priya Singh',
        orderNumber: 'ORD-HP-002',
        holdDate: Date.now() - 172800000, // 2 days ago
        reason: 'Waiting for fabric confirmation',
        status: 'hold',
        items: ['Salwar Suit'],
        totalAmount: 8500,
        paidAmount: 2000
    }
];

export const MOCK_CANCELLED_ORDERS = [
    {
        id: 'can1',
        customerName: 'Neha Gupta',
        orderNumber: 'ORD-C-001',
        cancelledDate: Date.now() - 432000000, // 5 days ago
        reason: 'Client changed mind',
        status: 'cancelled',
        refundStatus: 'completed'
    }
];

export const MOCK_ALTERATIONS = [
    {
        id: 'alt1',
        customerName: 'Meera Kapoor',
        orderId: 'ORD-123',
        date: Date.now() - 259200000, // 3 days ago
        details: 'Shorten sleeve by 1 inch',
        status: 'pending',
        priority: 'high'
    }
];
