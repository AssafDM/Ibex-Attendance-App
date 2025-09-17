/* public/firebase-messaging-sw.js */
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.4/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.4/firebase-messaging-compat.js"
);

const messaging = firebase.messaging();
messaging.onBackgroundMessage(({ data }) => {
  if (!data) return;
  self.registration.showNotification(data.title || "Notification", {
    body: data.body,
    icon: data.icon,
  });
});
