'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { Settings, Bell, Shield, Smartphone, Key, CheckCircle, AlertTriangle, Send, RefreshCw, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { VAPID_PUBLIC_KEY, urlBase64ToUint8Array } from '@/lib/vapid';
import { useApp } from '@/app/context/AppContext';

export default function AdminSettingsPage() {
  const { currentUser } = useApp();
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [registeredSubscriptions, setRegisteredSubscriptions] = useState<any[]>([]);

  // Carrega dispositivos cadastrados no Firestore
  const loadData = async () => {
    setLoading(true);
    try {
      const subsSnap = await getDocs(collection(db, 'admin_webpush_subscriptions'));
      const list: any[] = [];
      subsSnap.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      setRegisteredSubscriptions(list);
    } catch (err: any) {
      console.error('Erro ao carregar configurações:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Ativa e inscreve o aparelho atual no Web Push Nativo VAPID
  const handleRegisterThisDevice = async () => {
    setRegistering(true);
    setStatusMessage(null);

    try {
      if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        throw new Error('Seu navegador não suporta Service Worker.');
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Permissão de notificação negada pelo navegador. Ative nas permissões do site.');
      }

      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }

      if (subscription) {
        const subJson = subscription.toJSON();
        const subKey = btoa(subscription.endpoint).slice(-40).replace(/[^a-zA-Z0-9]/g, '_');

        await setDoc(doc(db, 'admin_webpush_subscriptions', subKey), {
          endpoint: subJson.endpoint,
          keys: subJson.keys,
          userId: currentUser?.id || currentUser?.email || 'admin',
          userEmail: currentUser?.email || 'admin@maurobarber.com.br',
          updatedAt: new Date().toISOString(),
          userAgent: navigator.userAgent,
        }, { merge: true });

        setStatusMessage({
          text: '✅ Este aparelho foi inscrito com sucesso! Ele agora receberá alertas com a tela bloqueada ou app minimizado.',
          type: 'success',
        });
        await loadData();
      }
    } catch (err: any) {
      setStatusMessage({
        text: `Erro ao inscrever aparelho: ${err.message}`,
        type: 'error',
      });
    } finally {
      setRegistering(false);
    }
  };

  const handleTestNotification = async () => {
    setTestSending(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/notifications/notify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: 'Teste Mauro Barber',
          serviceName: 'Corte Degrade Premium',
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          date: 'Hoje',
          barberName: 'Admin',
        }),
      });
      const data = await res.json();
      if (data.success && data.sent > 0) {
        setStatusMessage({
          text: `🎉 Notificação disparada com sucesso para ${data.sent} aparelho(s)! Bloqueie a tela ou minimize para testar.`,
          type: 'success',
        });
      } else {
        setStatusMessage({
          text: data.message || 'Nenhum aparelho conectado. Clique no botão "Ativar Este Aparelho Agora" primeiro.',
          type: 'error',
        });
      }
    } catch (err: any) {
      setStatusMessage({
        text: `Erro ao enviar teste: ${err.message}`,
        type: 'error',
      });
    } finally {
      setTestSending(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-[#d4af37] text-sm font-semibold mb-1">
            <Zap className="w-4 h-4" />
            WEB PUSH NATIVO (100% GRATUITO)
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-white">
            Notificações em Segundo Plano & Tela de Bloqueio
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Receba notificações flutuantes instantâneas no seu celular mesmo com a tela apagada ou app minimizado.
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs transition-colors self-start cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Atualizar
        </button>
      </div>

      {statusMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl flex items-center gap-3 text-sm border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-red-950/40 border-red-500/30 text-red-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </motion.div>
      )}

      {/* Card 1: Ação Rápida de Inscrição e Teste */}
      <div className="bg-[#111116] border border-[#d4af37]/30 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-2xl bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30">
            <Bell className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-1.5">
              Protocolo VAPID Ativo
            </div>
            <h2 className="text-lg font-bold text-white">Ativar Notificações no seu Celular</h2>
            <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
              Clique no botão abaixo pelo celular do gestor para vincular o aparelho à central de agendamentos. Quando qualquer cliente agendar, seu telefone acenderá e vibrará na mesma hora.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleRegisterThisDevice}
            disabled={registering}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa771c] hover:from-[#e5c055] hover:to-[#be8922] text-black font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Smartphone className="w-4 h-4" />
            {registering ? 'Inscrevendo Celular...' : 'Ativar Este Aparelho Agora'}
          </button>

          <button
            type="button"
            onClick={handleTestNotification}
            disabled={testSending}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer border border-white/10"
          >
            <Send className="w-4 h-4 text-[#d4af37]" />
            {testSending ? 'Disparando Teste...' : 'Testar Notificação (Bloqueie a Tela)'}
          </button>
        </div>
      </div>

      {/* Card 2: Aparelhos Ativos Conectados */}
      <div className="bg-[#111116] border border-white/10 rounded-3xl p-6 md:p-8 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/5 text-zinc-300 border border-white/5">
              <Shield className="w-6 h-6 text-[#d4af37]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Celulares do Gestor Conectados</h2>
              <p className="text-xs text-zinc-400">
                Dispositivos habilitados para receber alertas mesmo com a tela apagada.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30">
            {registeredSubscriptions.length} conectado(s)
          </span>
        </div>

        <div className="divide-y divide-white/5 pt-2">
          {registeredSubscriptions.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-400 space-y-2">
              <p>Nenhum aparelho conectado ainda.</p>
              <p className="text-zinc-500 text-[11px]">
                Abra este painel no seu celular e clique no botão dourado <strong>"Ativar Este Aparelho Agora"</strong> acima.
              </p>
            </div>
          ) : (
            registeredSubscriptions.map((sub, idx) => (
              <div key={sub.id || idx} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="min-w-0">
                  <div className="font-semibold text-white truncate">
                    {sub.userEmail || sub.userId || 'Celular do Gestor'}
                  </div>
                  <div className="text-zinc-500 truncate text-[11px] mt-0.5">
                    Atualizado em: {sub.updatedAt ? new Date(sub.updatedAt).toLocaleString('pt-BR') : 'Recentemente'}
                  </div>
                </div>
                <span className="text-[10px] text-emerald-400 font-medium px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 flex-shrink-0">
                  Conectado à Tela de Bloqueio
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
