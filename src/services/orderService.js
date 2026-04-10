import { db, auth } from '../config/firebase';
import {
    collection, doc,
    onSnapshot, addDoc, updateDoc, deleteDoc,
    serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import { DESIGN_TEMPLATES, MEASUREMENT_FIELDS } from '../constants/appConstants';
import { now, toEpoch, fromFirestoreTimestamp } from './dateUtils';
import { tailorService } from './tailorService';

// ─── Firestore References ───
const ORDERS_REF = collection(db, 'orders');
const CUSTOMERS_REF = collection(db, 'customers');
const DESIGNS_REF = collection(db, 'designs');
const TAILORS_REF = collection(db, 'tailors');

const ORDER_DATE_FIELDS = ['deliveryDate', 'createdAt', 'updatedAt'];

/**
 * Normalizes Firestore timestamps to epoch ms
 */
function convertTimestamps(data) {
    const result = { ...data };
    ORDER_DATE_FIELDS.forEach(field => {
        if (field in result && result[field] != null) {
            result[field] = fromFirestoreTimestamp(result[field]);
        }
    });
    return result;
}

/**
 * Deep cleans an object to remove all undefined values recursively
 */
function deepStripUndefined(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(deepStripUndefined);

    const result = {};
    Object.entries(obj).forEach(([key, value]) => {
        if (value !== undefined) {
            result[key] = (typeof value === 'object') ? deepStripUndefined(value) : value;
        }
    });
    return result;
}

class OrderService {

    // ===== Real-time Listeners (Master Data) =====

    getOrders(onUpdate) {
        // We stop using orderBy('createdAt') in the query to avoid filtering out 
        // new documents with null local serverTimestamps.
        return onSnapshot(ORDERS_REF, (snapshot) => {
            const orders = snapshot.docs.map(docSnap =>
                convertTimestamps({ id: docSnap.id, ...docSnap.data() })
            );
            // Sort in memory instead
            orders.sort((a, b) => (b.createdAt || Date.now()) - (a.createdAt || Date.now()));
            onUpdate(orders);
        }, (error) => {
            console.error("Firestore getOrders Snapshot Error:", error.message);
        });
    }

    getCustomers(onUpdate) {
        return onSnapshot(CUSTOMERS_REF, (snap) => {
            onUpdate(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }, (error) => console.error("Firestore getCustomers Error:", error.message));
    }

    getDesigns(onUpdate) {
        return onSnapshot(DESIGNS_REF, (snap) => {
            onUpdate(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }, (error) => console.error("Firestore getDesigns Error:", error.message));
    }

    getTailors(onUpdate) {
        return tailorService.getTailors(onUpdate);
    }

    // ===== Write Operations =====

    async addOrder(order) {
        try {
            console.log("DEBUG: Preparing order data for Firestore...");

            // 1. Normalize Tailor Info
            const tailorId = order.tailorId || null;
            const tailorName = order.tailorName || 'Unknown Tailor';

            // 2. Normalize Measurements (Ensure strings/numbers, no undefined)
            const measurements = {};
            if (order.measurements) {
                Object.entries(order.measurements).forEach(([k, v]) => {
                    measurements[k] = (v === undefined || v === null) ? "" : String(v);
                });
            }

            // 3. Build compatibility payload with ownership/audit fields
            const payload = deepStripUndefined({
                ...order,
                tailorId,
                tailorName,
                measurements,
                status: order.status || 'active',
                productionStage: order.productionStage || 'pending',
                deliveryDate: toEpoch(order.deliveryDate),
                isSentToFinishing: order.isSentToFinishing || false,
                isDraft: order.isDraft || false,
                createdBy: auth.currentUser?.uid || 'anonymous',
                updatedBy: auth.currentUser?.uid || 'anonymous',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            // Remove numeric ID if present (Firestore will generate its own)
            delete payload.id;

            console.log("DEBUG: Data being sent to Firestore:", JSON.stringify(payload, null, 2));

            const docRef = await addDoc(ORDERS_REF, payload);
            console.log("DEBUG: Order created with ID:", docRef.id);

            return {
                ...order,
                id: docRef.id,
                status: payload.status,
                productionStage: payload.productionStage,
                createdAt: now(),
                updatedAt: now()
            };
        } catch (error) {
            console.error("Create Order Error:", error.message);
            if (error.code === 'permission-denied') {
                console.error("ROOT CAUSE: Firestore security rules blocked the write (Missing or insufficient permissions).");
            }
            throw new Error(error.message || "Failed to create order");
        }
    }

    async updateOrder(id, updates) {
        try {
            const docRef = doc(db, 'orders', id);

            // Normalize measurements if present
            let normalizedUpdates = { ...updates };
            if (updates.measurements) {
                const measurements = {};
                Object.entries(updates.measurements).forEach(([k, v]) => {
                    measurements[k] = (v === undefined || v === null) ? "" : String(v);
                });
                normalizedUpdates.measurements = measurements;
            }

            const payload = deepStripUndefined({
                ...normalizedUpdates,
                updatedBy: auth.currentUser?.uid || 'anonymous',
                updatedAt: serverTimestamp()
            });

            if ('deliveryDate' in payload) {
                payload.deliveryDate = toEpoch(payload.deliveryDate);
            }

            await updateDoc(docRef, payload);
            return { id, ...normalizedUpdates, updatedAt: now() };
        } catch (error) {
            console.error(`Order Update Error (${id}):`, error.message);
            throw error;
        }
    }

    async deleteOrder(id) {
        try {
            await deleteDoc(doc(db, 'orders', id));
            return true;
        } catch (error) {
            console.error("Order Delete Error:", error.message);
            throw error;
        }
    }

    // ===== Static Config =====
    async getMeasurementFields() { return [...MEASUREMENT_FIELDS]; }
    async getDesignTemplates() { return { ...DESIGN_TEMPLATES }; }
}

export const orderService = new OrderService();
