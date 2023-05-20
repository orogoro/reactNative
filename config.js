import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeAuth, getReactNativePersistence } from "firebase/auth/react-native";

const firebaseConfig = {
  apiKey: "AIzaSyBeDJMBNLyun4Nhe4lFD5e-0bN0QwVtGKA",
  authDomain: "react-native-app-5d2d8.firebaseapp.com",
  projectId: "react-native-app-5d2d8",
  storageBucket: "react-native-app-5d2d8.appspot.com",
  messagingSenderId: "10848666745",
  appId: "1:10848666745:web:c6a7e21065ec186e1340a8",
};

// Initialize Firebase
export const db = initializeApp(firebaseConfig);
export const auth = initializeAuth(db, {
  persistence: getReactNativePersistence(AsyncStorage),
});
export const storage = getStorage(db);
export const store = getFirestore(db);
