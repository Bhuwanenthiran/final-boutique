import { db } from '../config/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const TAILORS_REF = collection(db, 'tailors');

const mockTailors = [
    { id: 'mock-1', name: 'Master Salim', experience: '15 years', specialty: 'Bridal Blouses' },
    { id: 'mock-2', name: 'Ravi Kumar', experience: '8 years', specialty: 'Salwar Suits' },
    { id: 'mock-3', name: 'Anita Ben', experience: '12 years', specialty: 'Embroidery' },
    { id: 'mock-4', name: 'Master Abbas', experience: '20 years', specialty: 'Lehengas' },
    { id: 'mock-5', name: 'Suresh Tailor', experience: '6 years', specialty: 'Sarees' },
    { id: 'mock-6', name: 'Zoya Khan', experience: '10 years', specialty: 'Western Wear' },
    { id: 'mock-7', name: 'Irfan Master', experience: '18 years', specialty: 'Indo-Western' },
    { id: 'mock-8', name: 'Priya Didi', experience: '5 years', specialty: 'Alterations' }
];

/**
 * TailorService — managing tailor-related firebase interactions.
 */
class TailorService {
    /**
     * Set up real-time listener for tailors with fallback support.
     * 
     * @param {Function} onUpdate - Success callback
     * @returns {Function} - Unsubscribe function
     */
    getTailors(onUpdate) {
        return onSnapshot(TAILORS_REF, (snap) => {
            // Check for empty state
            if (snap.empty) {
                console.log("Fallback to Mock Tailors");
                onUpdate(mockTailors);
                return;
            }

            // Map and sanitize data
            const firestoreTailors = snap.docs.map(doc => {
                const data = doc.data();
                
                // Data Safety: Ensure mandatory fields exist and provide fallbacks for undefined values
                return {
                    id: doc.id,
                    name: data.name || 'Unknown Tailor',
                    experience: data.experience || 'Not specified',
                    specialty: data.specialty || data.experience || 'General' // Keep for UI compatibility
                };
            }).filter(tailor => tailor.id && tailor.name);

            console.log("Firestore Tailors:", firestoreTailors.length);
            onUpdate(firestoreTailors);
        }, (error) => {
            console.error("Firestore Error in getTailors:", error.message);
            console.log("Fallback to Mock Tailors");
            onUpdate(mockTailors);
        });
    }
}

export const tailorService = new TailorService();
