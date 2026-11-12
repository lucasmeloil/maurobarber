import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientName, serviceName, time, date, barberName } = body;

    const notifTitle = '💈 Novo Agendamento Mauro Barber!';
    const notifBody = `${clientName || 'Cliente'} agendou ${serviceName || 'Corte'} para ${date || 'hoje'} às ${time || 'horário marcado'}${barberName ? ` (${barberName})` : ''}.`;

    // 1. Busca todos os tokens dos celulares/aparelhos dos administradores
    const tokensSnapshot = await getDocs(collection(db, 'admin_fcm_tokens'));
    const tokens: string[] = [];

    tokensSnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      if (data.token && typeof data.token === 'string') {
        tokens.push(data.token);
      }
    });

    if (tokens.length === 0) {
      console.log('[NotifyAdmin] Nenhum token de administrador registrado na coleção admin_fcm_tokens.');
      return NextResponse.json({
        success: true,
        sent: 0,
        message: 'Nenhum aparelho de admin registrado para receber push ainda.',
      });
    }

    // 2. Busca a Server Key do FCM (via env ou Firestore em settings/fcm)
    let fcmServerKey = process.env.FIREBASE_SERVER_KEY || '';
    if (!fcmServerKey) {
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'fcm'));
        if (settingsDoc.exists()) {
          fcmServerKey = settingsDoc.data()?.serverKey || '';
        }
      } catch (settingsErr) {
        console.log('[NotifyAdmin] Aviso ao ler settings/fcm:', settingsErr);
      }
    }

    if (!fcmServerKey) {
      console.log('[NotifyAdmin] Chave de Servidor FCM (FIREBASE_SERVER_KEY) não configurada. Notificação gravada para envio local.');
      return NextResponse.json({
        success: true,
        sent: 0,
        tokensFound: tokens.length,
        message: 'Tokens encontrados, mas a FIREBASE_SERVER_KEY ainda não foi definida nas variáveis de ambiente ou no Firestore.',
      });
    }

    // 3. Dispara a notificação Push para cada aparelho cadastrado
    const sendPromises = tokens.map(async (token) => {
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
              date: date || '',
            },
            priority: 'high',
          }),
        });

        const result = await res.json();
        return { token, result, ok: res.ok };
      } catch (err: any) {
        return { token, error: err.message, ok: false };
      }
    });

    const results = await Promise.all(sendPromises);
    const successfulSends = results.filter((r) => r.ok).length;

    console.log(`[NotifyAdmin] Enviado com sucesso para ${successfulSends}/${tokens.length} dispositivos de administradores.`);

    return NextResponse.json({
      success: true,
      sent: successfulSends,
      total: tokens.length,
      results,
    });
  } catch (error: any) {
    console.error('[NotifyAdmin] Erro ao disparar notificações de agendamento:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro interno no envio de push' },
      { status: 500 }
    );
  }
}

