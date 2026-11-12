import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, query, where, deleteDoc } from 'firebase/firestore';
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
    const { clientName, serviceName, time, date, barberName, subscription: directSubscription } = body;

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

    let webPushSuccessCount = 0;
    const targetSubscriptions: Array<{ endpoint: string; keys: { p256dh: string; auth: string }; docId?: string; source?: string }> = [];

    // CASO A: Se for teste direto vindo com subscription no body
    if (directSubscription && directSubscription.endpoint && directSubscription.keys) {
      targetSubscriptions.push({
        endpoint: directSubscription.endpoint,
        keys: directSubscription.keys,
      });
    }

    // CASO B: Busca inscrições salvas no Firestore na coleção appointments (100% permitida por regras)
    try {
      const q = query(collection(db, 'appointments'), where('status', '==', 'admin_subscription'));
      const apptSubsSnap = await getDocs(q);
      apptSubsSnap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.endpoint && data.keys) {
          // Evita duplicar se já foi adicionado pelo directSubscription
          if (!targetSubscriptions.some((s) => s.endpoint === data.endpoint)) {
            targetSubscriptions.push({
              endpoint: data.endpoint,
              keys: data.keys,
              docId: docSnap.id,
              source: 'appointments',
            });
          }
        }
      });
    } catch (e) {
      console.log('[NotifyAdmin] Aviso ao ler subscriptions de appointments:', e);
    }

    // CASO C: Busca também em admin_webpush_subscriptions caso exista
    try {
      const webPushSnap = await getDocs(collection(db, 'admin_webpush_subscriptions'));
      webPushSnap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.endpoint && data.keys) {
          if (!targetSubscriptions.some((s) => s.endpoint === data.endpoint)) {
            targetSubscriptions.push({
              endpoint: data.endpoint,
              keys: data.keys,
              docId: docSnap.id,
              source: 'admin_webpush_subscriptions',
            });
          }
        }
      });
    } catch (e) {
      // Ignora erro se regras bloquearem
    }

    if (targetSubscriptions.length === 0) {
      console.log('[NotifyAdmin] Nenhuma subscription encontrada no banco nem no body.');
      return NextResponse.json({
        success: false,
        sent: 0,
        message: 'Nenhum celular vinculado. Toque em "Vincular Este Celular às Notificações" primeiro.',
      });
    }

    // Dispara para todos os aparelhos
    const sendPromises = targetSubscriptions.map(async (sub) => {
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
        return { endpoint: sub.endpoint, ok: true };
      } catch (err: any) {
        console.error(`[VAPID Push] Erro ao enviar para ${sub.endpoint}:`, err?.statusCode || err?.message);
        // Se a inscrição expirou no celular (410 Gone ou 404), remove do banco
        if ((err?.statusCode === 410 || err?.statusCode === 404) && sub.docId && sub.source) {
          try {
            await deleteDoc(doc(db, sub.source, sub.docId));
          } catch (delErr) {
            // Ignora
          }
        }
        return { endpoint: sub.endpoint, ok: false, error: err?.message };
      }
    });

    await Promise.all(sendPromises);

    console.log(`[NotifyAdmin] Web Push entregue com sucesso para ${webPushSuccessCount}/${targetSubscriptions.length} aparelho(s).`);

    return NextResponse.json({
      success: webPushSuccessCount > 0,
      sent: webPushSuccessCount,
      totalRegistered: targetSubscriptions.length,
      message: webPushSuccessCount > 0
        ? `🎉 Notificação entregue na tela de bloqueio para ${webPushSuccessCount} celular(es)!`
        : 'A notificação foi enviada aos servidores da Apple/Google, mas o aparelho não respondeu.',
    });
  } catch (error: any) {
    console.error('[NotifyAdmin] Erro interno:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro interno no envio de push' },
      { status: 500 }
    );
  }
}
