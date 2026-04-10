import { db } from '../config/firebase';
import {
    collection,
    doc,
    getDoc,
    updateDoc,
    serverTimestamp,
    onSnapshot
} from 'firebase/firestore';
import { fromFirestoreTimestamp } from './dateUtils';
import { tailorService } from './tailorService';

const STAGES = ['pending', 'marking', 'production1', 'production2', 'production3', 'cutting', 'stitching', 'READY'];

class ProductionService {

    // ===== Production Orders (Firestore) =====

    getProductionOrders(onUpdate) {
        try {
            return onSnapshot(collection(db, 'orders'), (snapshot) => {
                const orders = snapshot.docs.map(docSnap => {
                    const data = docSnap.data();
                    return {
                        ...data,
                        id: docSnap.id,
                        updatedAt: fromFirestoreTimestamp(data.updatedAt),
                        createdAt: fromFirestoreTimestamp(data.createdAt),
                        deliveryDate: fromFirestoreTimestamp(data.deliveryDate),
                    };
                }).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
                onUpdate(orders);
            }, (error) => {
                console.error("Firestore getProductionOrders Snapshot Error:", error);
            });
        } catch (error) {
            console.error("Firestore getProductionOrders Error:", error);
            throw new Error("Could not load production pipeline.");
        }
    }

    async updateProductionStage(orderId, nextStage) {
        try {
            const orderRef = doc(db, 'orders', orderId);
            const orderSnap = await getDoc(orderRef);
            if (!orderSnap.exists()) throw new Error(`Order ${orderId} not found.`);

            const currentData = orderSnap.data();
            const currentStage = currentData.productionStage || 'pending';

            const currentIndex = STAGES.indexOf(currentStage);
            const nextIndex = STAGES.indexOf(nextStage);

            if (nextIndex === -1) throw new Error(`Invalid stage name: ${nextStage}`);
            if (nextIndex <= currentIndex) throw new Error(`Invalid transition: Cannot move back.`);
            if (nextIndex !== currentIndex + 1) throw new Error(`Workflow violation: Must move sequentially.`);

            const updatePayload = {
                productionStage: nextStage,
                updatedAt: serverTimestamp()
            };
            if (nextStage === 'stitching') updatePayload.isSentToFinishing = true;

            await updateDoc(orderRef, updatePayload);
            return { orderId, ...updatePayload };
        } catch (error) {
            console.error("Production Update Error:", error.message);
            throw error;
        }
    }

    async updateProductionStatus(orderId, field, value) {
        if (field === 'productionStage') return this.updateProductionStage(orderId, value);
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, { [field]: value, updatedAt: serverTimestamp() });
        return { orderId, field, value };
    }

    // ===== Tailors & Reference Data =====

    getTailors(onUpdate) {
        return tailorService.getTailors(onUpdate);
    }

    async assignTailor(orderId, tailorId, tailorName) {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, { tailorId, tailorName, updatedAt: serverTimestamp() });
        return { orderId, tailorId, tailorName };
    }

    _defaultFinishing() {
        return { checking: false, ironing: false, threadCutting: false, approval: false };
    }

    async getFinishingStatus(orderId) {
        try {
            const orderRef = doc(db, 'orders', orderId);
            const orderSnap = await getDoc(orderRef);
            if (!orderSnap.exists()) throw new Error(`Order ${orderId} not found.`);
            const data = orderSnap.data();
            return data.finishing ?? this._defaultFinishing();
        } catch (error) {
            console.error('getFinishingStatus Error:', error.message);
            throw error;
        }
    }

    async initializeFinishing(orderId) {
        try {
            const orderRef = doc(db, 'orders', orderId);
            const orderSnap = await getDoc(orderRef);
            if (!orderSnap.exists()) throw new Error(`Order ${orderId} not found.`);
            const data = orderSnap.data();
            if (data.finishing !== undefined) return { orderId, initialized: false };
            await updateDoc(orderRef, { finishing: this._defaultFinishing(), updatedAt: serverTimestamp() });
            return { orderId, initialized: true };
        } catch (error) {
            console.error('initializeFinishing Error:', error.message);
            throw error;
        }
    }

    async updateFinishingStatus(orderId, step) {
        try {
            const orderRef = doc(db, 'orders', orderId);
            const orderSnap = await getDoc(orderRef);
            if (!orderSnap.exists()) throw new Error(`Order ${orderId} not found.`);
            await updateDoc(orderRef, { [`finishing.${step}`]: true, updatedAt: serverTimestamp() });
            return { orderId, step, status: 'completed' };
        } catch (error) {
            console.error('updateFinishingStatus Error:', error.message);
            throw error;
        }
    }
    async markAsReady(orderId, approvedBy) {
        try {
            const orderRef = doc(db, 'orders', orderId);
            const updatePayload = {
                productionStage: 'READY',
                status: 'ready',
                'finishing.isReady': true,
                'finishing.approvedBy': approvedBy,
                'finishing.approvedAt': serverTimestamp(),
                updatedAt: serverTimestamp()
            };
            await updateDoc(orderRef, updatePayload);
            console.log("Updated to READY");
            return {
                orderId,
                approvedBy,
                approvedAt: new Date().getTime()
            };
        } catch (error) {
            console.error('markAsReady Error:', error.message);
            throw error;
        }
    }
}

export const productionService = new ProductionService();
