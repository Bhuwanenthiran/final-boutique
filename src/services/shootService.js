import { db, auth } from '../config/firebase';
import { 
    collection, doc, onSnapshot, setDoc, 
    serverTimestamp 
} from 'firebase/firestore';

const SHOOTS_REF = collection(db, 'shoots');

class ShootService {
    /**
     * Subscribe to all shoot statuses in real-time.
     * Maps the results by orderId for efficient lookup.
     */
    subscribeShootStatuses(onUpdate) {
        return onSnapshot(SHOOTS_REF, (snapshot) => {
            const statuses = {};
            snapshot.docs.forEach(docSnap => {
                statuses[docSnap.id] = { id: docSnap.id, ...docSnap.data() };
            });
            onUpdate(statuses);
        }, (error) => {
            console.error("Firestore subscribeShootStatuses Error:", error.message);
        });
    }

    /**
     * Toggles the shoot status for a specific order.
     */
    async updateShootStatus(orderId, isCompleted) {
        try {
            const docRef = doc(db, 'shoots', orderId);
            const payload = {
                orderId,
                shootCompleted: isCompleted,
                updatedAt: serverTimestamp(),
                updatedBy: auth.currentUser?.uid || 'anonymous'
            };
            await setDoc(docRef, payload, { merge: true });
            return payload;
        } catch (error) {
            console.error("Firestore updateShootStatus Error:", error.message);
            throw error;
        }
    }
}

export const shootService = new ShootService();
