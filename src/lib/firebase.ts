import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    authDomain: "six-degrees-of-music-admin.firebaseapp.com",
    projectId: "six-degrees-of-music-admin",
    storageBucket: "six-degrees-of-music-admin.appspot.com",
    messagingSenderId: "729776064370",
    appId: "1:729776064370:android:e1ae9b03132a7261a07feb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
