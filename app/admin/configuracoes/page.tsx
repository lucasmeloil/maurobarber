'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Bell, Shield, Smartphone, CheckCircle, AlertTriangle, Send, RefreshCw, Zap, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { VAPID_PUBLIC_KEY, urlBase64ToUint8Array } from '@/lib/vapid';
import { useApp } from '@/app/context/AppContext';

export default function AdminSettingsPage() {
  const { currentUser } = useApp();
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [registeredCount, setRegisteredCount] = useState(0);
  const [isCurrentDeviceRegistered, setIsCurrentDeviceRegistered] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  // Carrega dispositivos cadastrados do Firestore
  const loadData = async () => {
    setLoading(true);
    try {
      if (typeof window !== 'undefined') {
        const ua = navigator.userAgent.toLowerCase();
        setIsIOS(/iphone|ipad|ipod/.test(ua));
      }

      // 1. Busca contagem de aparelhos cadastrados em appointments (status=admin_subscription)
      const q = query(collection(db, 'appointments'), where('status', '==', 'admin_subscription'));
      const snap = await getDocs(q);
      setRegisteredCount(snap.size);

      // 2. Checa se o aparelho atual já tem inscrição ativa no navegador
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        setIsCurrentDeviceRegistered(!!sub);
      }
    } catch (err: any) {
      console.error('Erro ao carregar configurações:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Vincula o celular atual ao Web Push Nativo VAPID
  const handleRegisterThisDevice = async () => {
    setRegistering(true);
    setStatusMessage(null);

    try {
      if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        throw new Error('Seu navegador não suporta notificações em segundo plano.');
      }

      if (!('PushManager' in window)) {
        if (isIOS) {
          throw new Error('No iPhone, para receber notificações na tela de bloqueio, você precisa adicionar este app à sua Tela de Início (toque em Compartilhar > Adicionar à Tela de Início) e abrir por lá.');
        }
        throw new Error('Push Manager não suportado neste navegador.');
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Permissão negada. Ative as notificações nas configurações do seu iPhone em Ajustes > Safari ou Notificações.');
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
        // Envia para o backend salvar no banco
        const res = await fetch('/api/notifications/register-device', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscription: subscription.toJSON(),
            userEmail: currentUser?.email || 'admin@maurobarber.com.br',
            userId: currentUser?.id || 'admin',
          }),
        });

        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || 'Erro ao registrar no banco de dados.');
        }

        setIsCurrentDeviceRegistered(true);
        setStatusMessage({
          text: '✅ Este celular foi vinculado com sucesso! Agora toque em "Testar Notificação" para testar.',
          type: 'success',
        });
        await loadData();
      }
    } catch (err: any) {
      setStatusMessage({
        text: err.message || 'Erro ao vincular aparelho.',
        type: 'error',
      });
    } finally {
      setRegistering(false);
    }
  };

  // Teste de notificação com contagem regressiva para dar tempo de bloquear o celular
  const handleTestNotification = async () => {
    setTestSending(true);
    setStatusMessage({
      text: '⏳ Preparando envio em 3 segundos... Bloqueie a tela do celular agora para testar!',
      type: 'info',
    });
    setCountdown(3);

    const timer = setInterval(async () => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          triggerPush();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const triggerPush = async () => {
    try {
      // Pega a inscrição do navegador atual para envio direto e garantido
      let directSub = null;
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          directSub = sub.toJSON();
        }
      }

      const res = await fetch('/api/notifications/notify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: 'Teste de Agendamento',
          serviceName: 'Corte Degradê & Barba',
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          date: 'Hoje',
          barberName: 'Mauro Barber',
          subscription: directSub,
        }),
      });

      const data = await res.json();
      if (data.success && data.sent > 0) {
        setStatusMessage({
          text: `🎉 Notificação disparada com sucesso para ${data.sent} aparelho(s)!`,
          type: 'success',
        });
      } else {
        setStatusMessage({
          text: data.message || 'Nenhum celular vinculado. Toque em "Vincular Este Celular" primeiro.',
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
    <div className="p-4 sm:p-6 md:p-10 max-w-3xl mx-auto space-y-6 pb-24 md:pb-12 text-white">
      {/* Header Responsivo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-[#d4af37] text-xs font-semibold uppercase tracking-wider mb-1">
            <Zap className="w-3.5 h-3.5" />
            Notificações em Segundo Plano
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-white">
            Tela de Bloqueio & Alertas
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">
            Receba notificações flutuantes mesmo com o celular no bolso ou app fechado.
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs transition-colors self-start cursor-pointer border border-white/10"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Alerta de Status */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`p-3.5 rounded-2xl flex items-start gap-2.5 text-xs sm:text-sm border leading-relaxed ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                : statusMessage.type === 'info'
                ? 'bg-blue-950/50 border-blue-500/40 text-blue-300'
                : 'bg-red-950/50 border-red-500/40 text-red-300'
            }`}
          >
            {statusMessage.type === 'success' && <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
            {statusMessage.type === 'info' && <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />}
            {statusMessage.type === 'error' && <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
            <span className="flex-1">{statusMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Principal: Ativação e Teste */}
      <div className="bg-[#111116] border border-[#d4af37]/30 rounded-2xl sm:rounded-3xl p-5 sm:p-7 space-y-5 shadow-xl relative overflow-hidden">
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-xl sm:rounded-2xl bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30 flex-shrink-0">
            <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Status do seu aparelho:</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isCurrentDeviceRegistered
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {isCurrentDeviceRegistered ? 'Conectado à Tela de Bloqueio' : 'Não Vinculado'}
              </span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {isCurrentDeviceRegistered
                ? 'Este celular está configurado! Quando um cliente agendar, ele acenderá a tela e vibrará no seu bolso.'
                : 'Toque no botão dourado abaixo para vincular este celular à central de agendamentos.'}
            </p>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col gap-2.5 pt-1">
          <button
            onClick={handleRegisterThisDevice}
            disabled={registering}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa771c] hover:from-[#e5c055] hover:to-[#be8922] text-black font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Smartphone className="w-4 h-4" />
            {registering ? 'Vinculando Aparelho...' : 'Vincular Este Celular às Notificações'}
          </button>

          <button
            type="button"
            onClick={handleTestNotification}
            disabled={testSending}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer border border-white/10"
          >
            <Send className="w-4 h-4 text-[#d4af37]" />
            {testSending && countdown !== null
              ? `Bloqueie a tela! Enviando em ${countdown}s...`
              : 'Testar Notificação (Bloqueie a Tela)'}
          </button>
        </div>

        {/* Dica iPhone */}
        {isIOS && (
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-[11px] text-zinc-400 space-y-1">
            <div className="font-semibold text-[#f8e7b3] flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#d4af37]" /> Dica Importante para iPhone:
            </div>
            <p className="leading-relaxed">
              No iOS, a Apple exige que o app esteja adicionado à <strong>Tela de Início</strong> para receber alertas com a tela bloqueada. Se ainda não adicionou, toque no botão Compartilhar do Safari e em <em>"Adicionar à Tela de Início"</em>.
            </p>
          </div>
        )}
      </div>

      {/* Card de Dispositivos Conectados */}
      <div className="bg-[#111116] border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#d4af37]" />
            <h2 className="text-sm sm:text-base font-bold text-white">Aparelhos Conectados</h2>
          </div>
          <span className="text-[11px] font-semibold text-[#d4af37] px-2.5 py-0.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20">
            {registeredCount} celular(es)
          </span>
        </div>
      </div>
    </div>
  );
}
