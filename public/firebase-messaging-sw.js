importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyA6U7PrjbQlGtyAyTHT3Iik1LvgK50Kk_E",
  authDomain: "maurobarber-44a91.firebaseapp.com",
  projectId: "maurobarber-44a91",
  storageBucket: "maurobarber-44a91.firebasestorage.app",
  messagingSenderId: "727174753035",
  appId: "1:727174753035:web:e2a5215db9135332fa100e"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Mensagem push em segundo plano recebida:', payload);
  
  const notificationTitle = payload.notification?.title || payload.data?.title || 'Mauro Barber';
  const notificationBody = payload.notification?.body || payload.data?.body || 'Você tem uma nova notificação.';
  const clickAction = payload.data?.click_action || payload.fcmOptions?.link || '/admin/agendamentos';

  const notificationOptions = {
    body: notificationBody,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/favicon-32x32.png',
    vibrate: [200, 100, 200],
    data: {
      url: clickAction,
      dateOfArrival: Date.now()
    },
    actions: [
      { action: 'open', title: 'Ver Agendamento' }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Ação ao tocar na notificação flutuante
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/admin/agendamentos';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
