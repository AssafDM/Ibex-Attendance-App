/* public/firebase-messaging-sw.js */
self.addEventListener("install", (event) => {
  self.skipWaiting(); // activates immediately
});
self.addEventListener("activate", (event) => {
  clients.claim(); // take control of open tabs
});

const version = 810253;
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
const app = firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging(app);
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message",
    payload
  );
  const { title, body, icon } = payload.data || {};
  self.registration.showNotification(title || "Notification", { body, icon });
});
