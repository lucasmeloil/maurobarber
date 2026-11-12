// Service Worker Universal Mauro Barber (Web Push Nativo VAPID + FCM)

// 1. Receptor de Notificação Push Nativa em Segundo Plano (Acorda o Celular Bloqueado)
self.addEventListener('push', (event) => {
  console.log('[SW] Push nativo recebido em segundo plano:', event);

  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: '💈 Mauro Barber', body: event.data.text() };
    }
  }

  const notificationTitle = data.title || '💈 Novo Agendamento Mauro Barber!';
  const notificationOptions = {
    body: data.body || 'Um novo agendamento foi realizado.',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/favicon-32x32.png',
    vibrate: [300, 100, 300, 100, 300],
    data: {
      url: data.data?.url || '/admin/agendamentos',
      dateOfArrival: Date.now()
    },
    actions: [
      { action: 'open', title: 'Ver Agendamento' }
    ]
  };

  event.waitUntil(self.registration.showNotification(notificationTitle, notificationOptions));
});

// 2. Ação ao tocar na notificação flutuante na tela de bloqueio
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
