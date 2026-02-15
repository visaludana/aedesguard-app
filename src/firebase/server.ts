import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// This module is for SERVER-SIDE use only.

let app: FirebaseApp;
if (!getApps().length) {
    try {
        // For Firebase App Hosting
        app = initializeApp();
    } catch (e) {
        if (process.env.NODE_ENV === 'production') {
            console.warn('Automatic server-side Firebase initialization failed. Falling back to firebaseConfig.');
        }
        app = initializeApp(firebaseConfig);
    }
} else {
    app = getApp();
}

export const firestore = getFirestore(app);
