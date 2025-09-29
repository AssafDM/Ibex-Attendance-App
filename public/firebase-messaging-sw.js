import { initializeApp } from "firebase/app";

/* public/firebase-messaging-sw.js */
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.4/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.4/firebase-messaging-compat.js"
);
const firebaseConfig = {
  apiKey: "AIzaSyBaIqv6Bkf9x90k5wl0uGDmtKU78ojhfEQ",
  authDomain: "ibex-attendance.firebaseapp.com",
  projectId: "ibex-attendance",
  storageBucket: "ibex-attendance.firebasestorage.app",
  messagingSenderId: "531732185770",
  appId: "1:531732185770:web:796184bb6ca45cb8d646d3",
  measurementId: "G-86WT6FC7CW",
};
const app = initializeApp(firebaseConfig);
const messaging = firebase.messaging(app);
messaging.onBackgroundMessage(({ data }) => {
  if (!data) return;
  self.registration.showNotification(data.title || "Notification", {
    body: data.body,
    icon: data.icon,
  });
});
