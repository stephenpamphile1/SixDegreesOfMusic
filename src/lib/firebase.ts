import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    authDomain: "six-degrees-of-music-admin.firebaseapp.com",
    projectId: "six-degrees-of-music-admin",
    storageBucket: "six-degrees-of-music-admin.appspot.com",
    messagingSenderId: "729776064370",
    appId: "1:729776064370:android:e1ae9b03132a7261a07feb"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
