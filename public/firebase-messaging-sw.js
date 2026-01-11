importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyCABz2AFIgkyMy-ufqTlLwEOVGnt9RKR_c",
  authDomain: "mauro-b.firebaseapp.com",
  projectId: "mauro-b",
  storageBucket: "mauro-b.firebasestorage.app",
  messagingSenderId: "409690979779",
  appId: "1:409690979779:web:8583cfff175fc5951c1176"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/img/logo.png' // Certifique-se de ter um ícone aqui
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
