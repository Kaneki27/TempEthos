import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const hasFirebaseConfig = typeof window !== 'undefined' 
  ? !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY 
  : !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

const app = hasFirebaseConfig 
  ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApp())
  : null;

const auth = app ? getAuth(app) : null;
const firestore = app ? getFirestore(app) : null;
const storage = app ? getStorage(app) : null;

export { app, auth, firestore, storage, hasFirebaseConfig };
