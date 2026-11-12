import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';
import * as webpush from 'web-push';
import { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } from '@/lib/vapid';

// Configuração do VAPID para Web Push Nativo Universal (Google Chrome, Android, Apple iOS Safari)
webpush.setVapidDetails(
  VAPID_SUBJECT,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientName, serviceName, time, date, barberName } = body;

    const notifTitle = '💈 Novo Agendamento Mauro Barber!';
    const notifBody = `${clientName || 'Cliente'} agendou ${serviceName || 'Corte'} para ${date || 'hoje'} às ${time || 'horário marcado'}${barberName ? ` (${barberName})` : ''}.`;

    const pushPayload = JSON.stringify({
      title: notifTitle,
      body: notifBody,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/favicon-32x32.png',
      data: {
        url: '/admin/agendamentos',
        clientName: clientName || '',
        time: time || '',
        date: date || '',
      },
    });

    // 1. Canal Principal: Disparo Nativo Web Push VAPID (100% Gratuito & Autônomo)
    const webPushSnap = await getDocs(collection(db, 'admin_webpush_subscriptions'));
    let webPushSuccessCount = 0;

    const webPushPromises = webPushSnap.docs.map(async (docSnap) => {
      const sub = docSnap.data();
      if (!sub.endpoint || !sub.keys) return null;

      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.keys.p256dh,
              auth: sub.keys.auth,
            },
          },
          pushPayload,
          {
            urgency: 'high',
            TTL: 60 * 60 * 24, // 24 horas
          }
        );
        webPushSuccessCount++;
        return { id: docSnap.id, ok: true };
      } catch (err: any) {
        console.error(`[VAPID Push] Erro ao enviar para ${docSnap.id}:`, err?.statusCode || err?.message);
        // Se a inscrição expirou no celular (410 Gone ou 404), remove do banco
        if (err?.statusCode === 410 || err?.statusCode === 404) {
          try {
            await deleteDoc(doc(db, 'admin_webpush_subscriptions', docSnap.id));
          } catch (delErr) {
            console.log('Erro ao remover sub expirada:', delErr);
          }
        }
        return { id: docSnap.id, ok: false, error: err?.message };
      }
    });

    await Promise.all(webPushPromises);

    // 2. Canal Secundário: Legado FCM (caso exista chave do Firebase configurada)
    let fcmServerKey = process.env.FIREBASE_SERVER_KEY || '';
    if (!fcmServerKey) {
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'fcm'));
        if (settingsDoc.exists()) {
          fcmServerKey = settingsDoc.data()?.serverKey || '';
        }
      } catch (settingsErr) {
        // Ignora
      }
    }

    let fcmSuccessCount = 0;
    if (fcmServerKey && fcmServerKey.startsWith('AAAA')) {
      const fcmTokensSnap = await getDocs(collection(db, 'admin_fcm_tokens'));
      const fcmTokens: string[] = [];
      fcmTokensSnap.forEach((d) => {
        const data = d.data();
        if (data.token) fcmTokens.push(data.token);
      });

      if (fcmTokens.length > 0) {
        const fcmPromises = fcmTokens.map(async (token) => {
          try {
            const res = await fetch('https://fcm.googleapis.com/fcm/send', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `key=${fcmServerKey}`,
              },
              body: JSON.stringify({
                to: token,
                notification: {
                  title: notifTitle,
                  body: notifBody,
                  icon: '/icons/icon-192x192.png',
                  badge: '/icons/favicon-32x32.png',
                  click_action: '/admin/agendamentos',
                },
                data: {
                  url: '/admin/agendamentos',
                  clientName: clientName || '',
                  time: time || '',
                },
                priority: 'high',
              }),
            });
            if (res.ok) fcmSuccessCount++;
          } catch (e) {
            // Ignora
          }
        });
        await Promise.all(fcmPromises);
      }
    }

    const totalSent = webPushSuccessCount + fcmSuccessCount;
    console.log(`[NotifyAdmin] Web Push entregue: ${webPushSuccessCount} aparelho(s), FCM entregue: ${fcmSuccessCount}.`);

    return NextResponse.json({
      success: true,
      sent: totalSent,
      webPushSent: webPushSuccessCount,
      fcmSent: fcmSuccessCount,
      totalRegistered: webPushSnap.size,
      message: totalSent > 0 
        ? `Notificação entregue com sucesso em segundo plano para ${totalSent} aparelho(s)!`
        : webPushSnap.size === 0
          ? 'Abra o painel admin no seu celular uma vez para registrar seu aparelho.'
          : 'Disparo efetuado.',
    });
  } catch (error: any) {
    console.error('[NotifyAdmin] Erro interno:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro interno no envio de push' },
      { status: 500 }
    );
  }
}
