'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  CheckCheck, 
  Check, 
  Clock, 
  Calendar, 
  ExternalLink, 
  User, 
  ChevronRight,
  Scissors,
  CheckCircle2,
  Inbox
} from 'lucide-react';
import { useApp } from '@/app/context/AppContext';
import { useToast } from '@/app/context/ToastContext';

interface AdminNavbarProps {
  collapsed: boolean;
  isMobile: boolean;
}

export default function AdminNavbar({ collapsed, isMobile }: AdminNavbarProps) {
  const { appointments, unreadNotifications, markAsViewed, markOneAsViewed, currentUser } = useApp();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'unread' | 'all'>('unread');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Fecha ao pressionar ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Ordena por data decrescente
  const sortedAppointments = [...appointments].sort(
    (a, b) => new Date(b.date + 'T' + (b.time || '00:00')).getTime() - new Date(a.date + 'T' + (a.time || '00:00')).getTime()
  );

  const unreadList = sortedAppointments.filter(a => !a.viewed);
  const displayedList = filter === 'unread' ? unreadList : sortedAppointments.slice(0, 30);

  const handleMarkAllRead = async () => {
    await markAsViewed();
    showToast('Todas as notificações foram marcadas como lidas!', 'success');
  };

  const handleMarkOneRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await markOneAsViewed(id);
    showToast('Notificação marcada como lida.', 'success');
  };

  const todayFormatted = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long'
  });

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-[#070707]/90 backdrop-blur-md border-b border-white/10 z-40 flex items-center justify-between px-4 md:px-8 transition-all duration-300 ${
        isMobile ? 'left-0' : collapsed ? 'left-[80px]' : 'left-[250px]'
      }`}
    >
      {/* Título e Data no Topo */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex flex-col">
          <span className="text-xs text-gray-400 capitalize">{todayFormatted}</span>
          <span className="text-sm font-bold text-white font-heading">Painel de Gestão</span>
        </div>
      </div>

      {/* Ações da Direita */}
      <div className="flex items-center gap-3 md:gap-5 ml-auto">
        {/* Link para o Site Público */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg transition-all"
          title="Ver o site da barbearia em nova aba"
        >
          <span>Ver Site</span>
          <ExternalLink size={13} />
        </Link>

        {/* Central de Notificações */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`relative p-2.5 rounded-xl border transition-all ${
              isOpen
                ? 'bg-white text-black border-white shadow-lg'
                : 'bg-black/60 border-white/10 text-gray-300 hover:text-white hover:border-white/20 hover:bg-white/5'
            }`}
            title="Central de Notificações"
            aria-label="Notificações"
          >
            <Bell size={19} />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[11px] font-black rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center border-2 border-[#070707] shadow-lg animate-pulse">
                {unreadNotifications > 99 ? '99+' : unreadNotifications}
              </span>
            )}
          </button>

          {/* Dropdown Menu da Central de Notificações */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-3 w-[360px] sm:w-[420px] bg-[#111111] border border-white/15 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden z-50 text-white"
              >
                {/* Cabeçalho do Dropdown */}
                <div className="p-4 border-b border-white/10 bg-black/40 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-base flex items-center gap-2">
                      <Bell size={16} className="text-[#d4af37]" /> Central de Notificações
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {unreadNotifications > 0
                        ? `${unreadNotifications} agendamento${unreadNotifications > 1 ? 's' : ''} não lido${unreadNotifications > 1 ? 's' : ''}`
                        : 'Todas as notificações estão em dia'}
                    </p>
                  </div>
                  {unreadNotifications > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-green-400 hover:text-green-300 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all active:scale-95"
                      title="Marcar todos os agendamentos pendentes como lidos"
                    >
                      <CheckCheck size={14} /> Marcar todas lidas
                    </button>
                  )}
                </div>

                {/* Filtros: Não Lidas vs Todas */}
                <div className="px-4 py-2 border-b border-white/5 bg-black/20 flex gap-2">
                  <button
                    onClick={() => setFilter('unread')}
                    className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                      filter === 'unread'
                        ? 'bg-white text-black'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Não lidas ({unreadList.length})
                  </button>
                  <button
                    onClick={() => setFilter('all')}
                    className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                      filter === 'all'
                        ? 'bg-white text-black'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Recentes ({sortedAppointments.length})
                  </button>
                </div>

                {/* Lista de Notificações */}
                <div className="max-h-[360px] overflow-y-auto divide-y divide-white/5 scrollbar-thin">
                  {displayedList.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-500 mb-1">
                        <CheckCircle2 size={24} className="text-green-500" />
                      </div>
                      <span className="font-bold text-sm text-white">Nenhum aviso pendente</span>
                      <p className="text-xs text-gray-500 max-w-[240px]">
                        {filter === 'unread'
                          ? 'Você já visualizou todos os novos agendamentos!'
                          : 'Nenhum agendamento registrado até o momento.'}
                      </p>
                    </div>
                  ) : (
                    displayedList.map(appt => {
                      const isUnread = !appt.viewed;
                      return (
                        <div
                          key={appt.id}
                          className={`p-3.5 transition-colors flex items-start justify-between gap-3 ${
                            isUnread
                              ? 'bg-green-500/5 hover:bg-green-500/10 border-l-2 border-green-500'
                              : 'hover:bg-white/5'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-white truncate">
                                {appt.clientName}
                              </h4>
                              {isUnread && (
                                <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30">
                                  Novo
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-gray-300 mt-0.5 flex items-center gap-1.5 truncate">
                              <Scissors size={12} className="text-gray-400 flex-shrink-0" />
                              <span className="truncate">{appt.serviceName}</span>
                              <span className="text-gray-500">•</span>
                              <span className="font-semibold text-white">
                                R$ {Number(appt.price || 0).toFixed(2)}
                              </span>
                            </p>

                            <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-1.5">
                              <span className="flex items-center gap-1">
                                <Calendar size={11} /> {appt.date ? appt.date.split('-').reverse().join('/') : ''}
                              </span>
                              <span className="flex items-center gap-1 font-semibold text-yellow-400">
                                <Clock size={11} /> {appt.time}
                              </span>
                              <span className="capitalize text-gray-500">
                                {appt.barberName || 'Barbeiro'}
                              </span>
                            </div>
                          </div>

                          {/* Ações da Notificação */}
                          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                            {isUnread && (
                              <button
                                onClick={e => handleMarkOneRead(appt.id, e)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-green-500/20 text-gray-400 hover:text-green-400 border border-white/5 hover:border-green-500/30 transition-all"
                                title="Marcar este agendamento como lido"
                              >
                                <Check size={14} />
                              </button>
                            )}
                            <span
                              className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                appt.status === 'confirmed'
                                  ? 'border-green-500/40 text-green-400 bg-green-500/10'
                                  : appt.status === 'cancelled'
                                    ? 'border-red-500/40 text-red-500 bg-red-500/10'
                                    : appt.status === 'completed'
                                      ? 'border-blue-500/40 text-blue-400 bg-blue-500/10'
                                      : 'border-yellow-500/40 text-yellow-400 bg-yellow-500/10'
                              }`}
                            >
                              {appt.status === 'pending' ? 'Pendente' : appt.status}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Rodapé do Dropdown */}
                <div className="p-3 border-t border-white/10 bg-black/40 text-center">
                  <Link
                    href="/admin/agendamentos"
                    onClick={() => setIsOpen(false)}
                    className="text-xs font-bold text-gray-300 hover:text-white flex items-center justify-center gap-1 py-1 transition-colors"
                  >
                    <span>Ver todos os agendamentos na tabela</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Perfil do Administrador */}
        <div className="flex items-center gap-2 pl-2 border-l border-white/10">
          <div className="w-8 h-8 rounded-full bg-white text-black font-bold flex items-center justify-center text-xs shadow-md">
            MB
          </div>
          <div className="hidden lg:flex flex-col">
            <span className="text-xs font-bold text-white leading-tight">Mauro Barber</span>
            <span className="text-[10px] text-gray-400">Administrador</span>
          </div>
        </div>
      </div>
    </header>
  );
}
