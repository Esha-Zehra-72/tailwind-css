// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
    apiKey: "AIzaSyA4N2_2HXrA5Gx1vgREjhXxRgTy7YvzFBU",
    authDomain: "pushnotificationsusinffirebase.firebaseapp.com",
    projectId: "pushnotificationsusinffirebase",
    storageBucket: "pushnotificationsusinffirebase.firebasestorage.app",
    messagingSenderId: "454292944406",
    appId: "1:454292944406:web:ec7a3d1129a8bf06816737",
    measurementId: "G-6B1RZPY6BX"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app)
export const auth = getAuth(app)

export const generateToken = async () => {
    const permission = await Notification.requestPermission()
    console.log("Permission = ", permission)
    if (permission === 'granted') {
        const token = await getToken(messaging, {
            vapidKey: "BGj8ZCI-T1eLNqmQErsru-d-7PHxS4IJPE9NQOQ5Wxtyn3jYV065CkJ0FzhepD9gZheTwlSu9ti7RyO0pZoyM1A"
        })
        console.log("Token = ", token)
    }

}