import {
  getApp,
  getApps,
  initializeApp,
} from "firebase/app";
import {
  browserLocalPersistence,
  getAuth,
  GoogleAuthProvider,
  setPersistence,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBIAywN0TR4liPcNQnITQqS8mTrLbZF0Yo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "taxpal-db310.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "taxpal-db310",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "taxpal-db310.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "18557961824",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:18557961824:web:34fa7e801149adc718a505",
};

export const isGoogleAuthConfigured = Object.values(firebaseConfig).every(Boolean);

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const authReady = setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Firebase persistence setup failed:", error);
});

export const provider = new GoogleAuthProvider();
provider.addScope("email");
provider.addScope("profile");
provider.setCustomParameters({
  prompt: "select_account",
});
