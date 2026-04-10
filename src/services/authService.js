import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

/**
 * Authenticates a user and retrieves their profile from Firestore
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{uid: string, name: string, role: string}>}
 */
export const loginUser = async (email, password) => {
  try {
    // 1. Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const { uid } = userCredential.user;

    // 2. Fetch user details from 'users' collection
    const userDocRef = doc(db, 'users', uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      throw new Error('User record not found in database');
    }

    const userData = userDocSnap.data();

    return {
      uid,
      name: userData.name || 'Unknown',
      role: userData.role || 'user'
    };
  } catch (error) {
    console.error('Login Error:', error.message);
    throw error;
  }
};
