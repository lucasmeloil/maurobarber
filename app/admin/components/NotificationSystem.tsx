'use client';
import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/app/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, X, Clock, Calendar } from 'lucide-react';

interface ActiveNotification {
  id: string;
  title: string;
  message: string;
  clientName: string;
  time: string;
  date: string;
  data: any;
  timestamp: number;
}

export default function NotificationSystem() {
  const { appointments, updateAppointmentStatus } = useApp();
  const [notifications, setNotifications] = useState<ActiveNotification[]>([]);
  const prevAppointmentsRef = useRef(appointments);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isInitialSyncRef = useRef(true);
  const notifiedIdsRef = useRef<Set<string>>(new Set());

  // Inicializa o áudio de notificação de forma segura
  useEffect(() => {
    try {
      audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audioRef.current.volume = 0.5;
    } catch (e) {
      console.log('Audio init warning:', e);
    }
  }, []);

  // Monitora novos agendamentos em tempo real sem disparar o histórico ao recarregar a página
  useEffect(() => {
    // 1. Se ainda não há agendamentos carregados, aguarda a primeira carga do Firestore
    if (appointments.length === 0 && isInitialSyncRef.current) {
      return;
    }

    // 2. Primeira carga concluída: marca todos os agendamentos existentes como já conhecidos
    // Isso impede completamente que agendamentos antigos disparem pop-ups ao recarregar a página!
    if (isInitialSyncRef.current) {
      appointments.forEach(a => notifiedIdsRef.current.add(a.id));
      prevAppointmentsRef.current = appointments;
      isInitialSyncRef.current = false;
      return;
    }

    // 3. Data de hoje (YYYY-MM-DD) para ignorar pendências antigas de dias anteriores
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // 4. Filtra apenas agendamentos que acabaram de ser criados em TEMPO REAL nesta sessão
    const newRealTimeApps = appointments.filter(a => {
      // Ignora se já foi notificado
      if (notifiedIdsRef.current.has(a.id)) return false;
      // Deve ser novo na lista (não existia no snapshot anterior)
      const existedBefore = prevAppointmentsRef.current.some(p => p.id === a.id);
      if (existedBefore) return false;
      // Deve ser pendente
      if (a.status !== 'pending') return false;
      // Deve ser agendamento atual ou futuro (ignora pendências de dias que já passaram)
      if (a.date && a.date < todayStr) return false;

      return true;
    });

    if (newRealTimeApps.length > 0) {
      // Toca o alerta sonoro para o novo agendamento real
      audioRef.current?.play().catch(e => console.log('Audio play blocked by browser policy:', e));

      const newNotifs: ActiveNotification[] = newRealTimeApps.map(app => {
        notifiedIdsRef.current.add(app.id);
        return {
          id: app.id,
          title: 'Novo Agendamento!',
          message: `${app.clientName} agendou para ${app.time}`,
          clientName: app.clientName,
          time: app.time,
          date: app.date,
          data: app,
          timestamp: Date.now()
        };
      });

      // Adiciona mantendo no máximo 3 notificações ativas simultâneas para não poluir a tela
      setNotifications(prev => [...newNotifs, ...prev].slice(0, 3));
    }

    prevAppointmentsRef.current = appointments;
  }, [appointments]);

  // Auto-dismiss: remove cada notificação automaticamente após 9 segundos
  useEffect(() => {
    if (notifications.length === 0) return;
    const timer = setInterval(() => {
      const now = Date.now();
      setNotifications(prev => prev.filter(n => now - n.timestamp < 9000));
    }, 1000);
    return () => clearInterval(timer);
  }, [notifications]);

  const handleConfirm = (id: string, phone: string, name: string, date: string, time: string) => {
    updateAppointmentStatus(id, 'confirmed');
    setNotifications(prev => prev.filter(n => n.id !== id));

    const formattedDate = date ? date.split('-').reverse().join('/') : '';
    const message = `Olá *${name}*!%0ASeu agendamento na Mauro Barber para *${formattedDate}* às *${time}* foi CONFIRMADO.%0ATe esperamos! 💈`;

    if (confirm('Abrir WhatsApp para enviar a confirmação para o cliente?')) {
      let cleanPhone = (phone || '').replace(/\D/g, '');
      if (cleanPhone.length >= 10 && cleanPhone.length <= 11) {
        cleanPhone = `55${cleanPhone}`;
      }
      window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
    }
  };

  const handleDismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fixed top-5 right-5 z-[100] flex flex-col gap-3 pointer-events-none max-w-sm w-full">
      <AnimatePresence>
        {notifications.map(notif => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 80, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.9, transition: { duration: 0.2 } }}
            className="pointer-events-auto bg-[#141414] border-l-4 border-green-500 text-white p-4 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-white/10 relative overflow-hidden backdrop-blur-md"
          >
            {/* Brilho decorativo sutil */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl pointer-events-none -mr-8 -mt-8" />

            <div className="flex justify-between items-start gap-3">
              <div className="flex items-start gap-3">
                <div className="bg-green-500/20 p-2.5 rounded-xl border border-green-500/30 text-green-400 mt-0.5">
                  <Bell size={18} className="animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-400 px-2 py-0.5 rounded border border-green-500/20">
                      Chegou Agora
                    </span>
                  </div>
                  <h4 className="font-bold text-base text-white mt-1 leading-snug">
                    {notif.clientName}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-gray-300 mt-1">
                    <span className="flex items-center gap-1 font-semibold text-white">
                      <Clock size={12} className="text-[#d4af37]" /> {notif.time}
                    </span>
                    <span className="flex items-center gap-1 text-gray-400">
                      <Calendar size={12} /> {notif.date.split('-').reverse().join('/')}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDismiss(notif.id)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
                title="Fechar aviso"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex gap-2 mt-4 pt-3 border-t border-white/5">
              <button
                onClick={() =>
                  handleConfirm(
                    notif.data.id,
                    notif.data.phone,
                    notif.data.clientName,
                    notif.data.date,
                    notif.data.time
                  )
                }
                className="flex-1 bg-green-600 hover:bg-green-500 text-white text-xs font-bold py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                <Check size={14} /> Confirmar & WhatsApp
              </button>
              <button
                onClick={() => handleDismiss(notif.id)}
                className="px-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-medium py-2.5 rounded-lg transition-colors"
              >
                Ver depois
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
