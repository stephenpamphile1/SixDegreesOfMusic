import { initializeApp } from "@react-native-firebase/app";

const firebaseConfig = {
    projectId: "six-degrees-of-music-admin",
    appId: "1:729776064370:android:e1ae9b03132a7261a07feb"
};

const app = initializeApp(firebaseConfig);

export default app;