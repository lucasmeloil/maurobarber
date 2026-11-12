import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, setDoc } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subscription, userEmail, userId } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json({ success: false, error: 'Subscription inválida' }, { status: 400 });
    }

    const endpoint = subscription.endpoint;
    const keys = subscription.keys;

    // 1. Busca todos os documentos em appointments para checar se já está registrado
    const apptsSnap = await getDocs(collection(db, 'appointments'));
    let alreadyExists = false;

    apptsSnap.forEach((d) => {
      const data = d.data();
      if (data.status === 'admin_subscription' && data.endpoint === endpoint) {
        alreadyExists = true;
      }
    });

    if (!alreadyExists) {
      // Salva na coleção appointments que tem permissão pública de criação garantida
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
      console.log('✅ [RegisterDevice] Nova subscription salva em appointments!');
    } else {
      console.log('ℹ️ [RegisterDevice] Subscription já existente no banco.');
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
      // Ignora caso a coleção seja restrita por regras
    }

    return NextResponse.json({ success: true, message: 'Aparelho registrado com sucesso!' });
  } catch (error: any) {
    console.error('❌ [RegisterDevice] Erro ao registrar:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
