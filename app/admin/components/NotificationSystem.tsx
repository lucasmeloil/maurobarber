'use client';
import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/app/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, X } from 'lucide-react';

const NOTIFICATION_SOUND = 'data:audio/mp3;base64,//uQxAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQxAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq'; // Spacer, will replace with real base64 in next step or use a public URL if strictly needed, but better to use a simple beep. 
// Actually, a simple distinct beep is better. 
// Let's use a standard "ding" sound often available or a generated oscillator beep via Web Audio API to avoid huge strings.

export default function NotificationSystem() {
  const { appointments, updateAppointmentStatus } = useApp();
  const [notifications, setNotifications] = useState<any[]>([]);
  const prevAppointmentsRef = useRef(appointments);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Audio
  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audioRef.current.volume = 0.5;
  }, []);

  useEffect(() => {
    // Find new appointments (present in current but not in prev)
    const newApps = appointments.filter(a => 
        !prevAppointmentsRef.current.find(p => p.id === a.id) && 
        a.status === 'pending'
    );

    if (newApps.length > 0) {
        // Play Sound
        audioRef.current?.play().catch(e => console.log('Audio blocked', e));

        // Add to notification queue
        const newNotifications = newApps.map(app => ({
            id: app.id,
            title: 'Novo Agendamento!',
            message: `${app.clientName} agendou para ${app.time}`,
            data: app
        }));

        setNotifications(prev => [...prev, ...newNotifications]);
    }

    prevAppointmentsRef.current = appointments;
  }, [appointments]);

  const handleConfirm = (id: string, phone: string, name: string, date: string, time: string) => {
    updateAppointmentStatus(id, 'confirmed');
    setNotifications(prev => prev.filter(n => n.id !== id));
    
    // WhatsApp logic reused
    const message = `Olá *${name}*!%0ASeu agendamento na Mauro Barber para *${date}* às *${time}* foi CONFIRMADO.%0ATe esperamos! 💈`;
    if(confirm('Abrir WhatsApp para confirmar?')) {
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    }
  };

  const handleDismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      <AnimatePresence>
        {notifications.map((notif) => (
            <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.9 }}
                className="bg-[#1a1a1a] border-l-4 border-green-500 text-white p-4 rounded-lg shadow-2xl w-80 flex flex-col gap-2 relative overflow-hidden"
            >
                {/* Glossy effect */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full blur-xl -mr-10 -mt-10 pointer-events-none" />

                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                        <div className="bg-green-500/20 p-2 rounded-full">
                            <Bell size={18} className="text-green-500" />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm">{notif.title}</h4>
                            <p className="text-xs text-gray-300">{notif.message}</p>
                        </div>
                    </div>
                    <button onClick={() => handleDismiss(notif.id)} className="text-gray-500 hover:text-white">
                        <X size={16} />
                    </button>
                </div>

                <div className="flex gap-2 mt-2">
                    <button 
                        onClick={() => handleConfirm(notif.data.id, notif.data.phone, notif.data.clientName, notif.data.date, notif.data.time)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 rounded flex items-center justify-center gap-1 transition-colors"
                    >
                        <Check size={14} /> Confirmar
                    </button>
                    <button 
                        onClick={() => handleDismiss(notif.id)}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold py-2 rounded transition-colors"
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
