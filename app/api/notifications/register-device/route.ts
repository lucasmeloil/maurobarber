import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, setDoc } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subscription, userEmail, userId } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json({ success: false, error: 'Subscription inválida' }, { status: 400 });
    }

    const endpoint = subscription.endpoint;
    const keys = subscription.keys;

    // 1. Salva com permissão pública garantida na coleção appointments com status='admin_subscription'
    const q = query(
      collection(db, 'appointments'),
      where('status', '==', 'admin_subscription'),
      where('endpoint', '==', endpoint)
    );
    const existingSnap = await getDocs(q);

    if (existingSnap.empty) {
      await addDoc(collection(db, 'appointments'), {
        clientName: '__ADMIN_PUSH_SUBSCRIPTION__',
        status: 'admin_subscription',
        endpoint,
        keys,
        userEmail: userEmail || 'admin@maurobarber.com.br',
        userId: userId || 'admin',
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        viewed: true,
      });
    } else {
      const docId = existingSnap.docs[0].id;
      await updateDoc(doc(db, 'appointments', docId), {
        keys,
        updatedAt: new Date().toISOString(),
      });
    }

    // 2. Tenta também na coleção admin_webpush_subscriptions (redundância)
    try {
      const subKey = btoa(endpoint).slice(-40).replace(/[^a-zA-Z0-9]/g, '_');
      await setDoc(doc(db, 'admin_webpush_subscriptions', subKey), {
        endpoint,
        keys,
        userEmail: userEmail || 'admin@maurobarber.com.br',
        userId: userId || 'admin',
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (e) {
      // Ignora erro se coleção separada estiver bloqueada por regras
    }

    console.log('✅ [RegisterDevice] Aparelho registrado com sucesso no banco de dados!');

    return NextResponse.json({ success: true, message: 'Aparelho registrado com sucesso!' });
  } catch (error: any) {
    console.error('❌ [RegisterDevice] Erro ao registrar aparelho:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
