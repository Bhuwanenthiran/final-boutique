import {
    collection, doc,
    addDoc, deleteDoc, updateDoc,
    onSnapshot, serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';

// ─── Firestore collection references ───────────────────────────────────────
const HOLD_REF       = collection(db, 'holdOrders');
const CANCELLED_REF  = collection(db, 'cancelledOrders');
const ALTERATION_REF = collection(db, 'alterations');

/**
 * Strips undefined values so Firestore never throws.
 */
function clean(obj) {
    return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
}

/**
 * CatalogueService — Firestore backend for Hold, Cancelled & Alteration records.
 *
 * Collections:
 *   holdOrders      → { orderNo, customerName, note, reason, holdDate, status, createdAt, createdBy }
 *   cancelledOrders → { orderNo, customerName, note, reason, cancelledDate, status, refunded, createdAt, createdBy }
 *   alterations     → { orderNo, customerName, note, notes, item, type, date, status, createdAt, createdBy }
 */
class CatalogueService {

    // ===== Hold Orders =====

    subscribeHoldOrders(callback) {
        return onSnapshot(HOLD_REF, (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            callback(data);
        }, (err) => {
            console.error('subscribeHoldOrders error:', err.message);
            callback([]);
        });
    }

    async addHoldOrder(order) {
        const payload = clean({
            orderNo:      order.orderNo || order.orderId || '',
            customerName: order.customerName || '',
            reason:       order.reason || order.note || '',
            note:         order.note || '',
            holdDate:     order.holdDate || Date.now(),
            status:       'hold',
            createdAt:    serverTimestamp(),
            createdBy:    auth.currentUser?.uid || 'anonymous',
        });
        const ref = await addDoc(HOLD_REF, payload);
        return { id: ref.id, ...payload, holdDate: order.holdDate || Date.now() };
    }

    async removeHoldOrder(id) {
        await deleteDoc(doc(db, 'holdOrders', id));
        return { id };
    }

    async restoreHoldOrder(id) {
        // Mark as restored then delete from hold collection
        await deleteDoc(doc(db, 'holdOrders', id));
        return { id };
    }

    // ===== Cancelled Orders =====

    subscribeCancelledOrders(callback) {
        return onSnapshot(CANCELLED_REF, (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            callback(data);
        }, (err) => {
            console.error('subscribeCancelledOrders error:', err.message);
            callback([]);
        });
    }

    async addCancelledOrder(order) {
        const payload = clean({
            orderNo:       order.orderNo || order.orderId || '',
            customerName:  order.customerName || '',
            reason:        order.reason || order.note || '',
            note:          order.note || '',
            cancelledDate: order.cancelledDate || Date.now(),
            status:        'cancelled',
            refunded:      order.refunded || false,
            createdAt:     serverTimestamp(),
            createdBy:     auth.currentUser?.uid || 'anonymous',
        });
        const ref = await addDoc(CANCELLED_REF, payload);
        return { id: ref.id, ...payload, cancelledDate: order.cancelledDate || Date.now() };
    }

    async deleteCancelledOrder(id) {
        await deleteDoc(doc(db, 'cancelledOrders', id));
        return { id };
    }

    // ===== Alterations =====

    subscribeAlterations(callback) {
        return onSnapshot(ALTERATION_REF, (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            callback(data);
        }, (err) => {
            console.error('subscribeAlterations error:', err.message);
            callback([]);
        });
    }

    async addAlteration(alteration) {
        const payload = clean({
            orderNo:      alteration.orderNo || alteration.item || '',
            customerName: alteration.customerName || '',
            item:         alteration.item || alteration.orderNo || '',
            type:         alteration.type || 'Alteration',
            notes:        alteration.notes || alteration.note || '',
            note:         alteration.note || '',
            date:         alteration.date || Date.now(),
            status:       alteration.status || 'pending',
            createdAt:    serverTimestamp(),
            createdBy:    auth.currentUser?.uid || 'anonymous',
        });
        const ref = await addDoc(ALTERATION_REF, payload);
        return { id: ref.id, ...payload, date: alteration.date || Date.now() };
    }

    async updateAlteration(id, updates) {
        const payload = clean({ ...updates, updatedAt: serverTimestamp() });
        await updateDoc(doc(db, 'alterations', id), payload);
        return { id, ...updates };
    }

    async deleteAlteration(id) {
        await deleteDoc(doc(db, 'alterations', id));
        return { id };
    }
}

export const catalogueService = new CatalogueService();
