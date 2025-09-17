// firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeAuth,
  getAuth,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  inMemoryPersistence,
  browserPopupRedirectResolver,
} from "firebase/auth";
import { getFirestore, serverTimestamp } from "firebase/firestore";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FB_APP_ID,
  measurementId: import.meta.env.VITE_FB_MEASUREMENT_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// IMPORTANT: use initializeAuth ONCE with a resolver; reuse with getAuth()
let auth;
try {
  auth = initializeAuth(app, {
    persistence: [
      indexedDBLocalPersistence,
      browserLocalPersistence,
      inMemoryPersistence,
    ],
    popupRedirectResolver: browserPopupRedirectResolver,
  });
} catch {
  auth = getAuth(app);
}
export async function initMessagingAndStoreToken() {
  if (!(await isSupported())) return null;

  const perm = await Notification.requestPermission();
  if (perm !== "granted") return null;

  const messaging = getMessaging(app);
  const token = await getToken(messaging, {
    vapidKey: import.meta.env.VITE_FB_VAPID_KEY,
  });
  if (!token) return null;
  console.log("FCM token:", token);

  // Save token to Firestore under the user
  const user = auth.currentUser;
  if (!user) return token; // or wait for auth ready, then save

  // One-doc-per-token (good for multi-device)
  await setDoc(
    doc(db, "users", user.uid, "fcmTokens", token),
    {
      token,
      updatedAt: serverTimestamp(),
      ua: navigator.userAgent,
    },
    { merge: true }
  );
}
export { auth };
export const db = getFirestore(app);
export const now = serverTimestamp;
