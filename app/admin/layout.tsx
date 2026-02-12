'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import AdminSidebar from './components/AdminSidebar';
import NotificationSystem from './components/NotificationSystem';
import { useApp } from '../context/AppContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { currentUser, loadingAuth } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (!loadingAuth && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, loadingAuth, router]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Notification Permission & Listener
  useEffect(() => {
    const setupNotifications = async () => {
        try {
            if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                const messaging = (await import('firebase/messaging')).getMessaging();
                const { getToken, onMessage } = await import('firebase/messaging');
                
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    const token = await getToken(messaging, { 
                        vapidKey: 'BlaykffShaRHseNc_3wG4IVr4Z4TGD3qoqEKbjTCXsqsxfFr_tnNtq8lvTRMeAwveCljP1d0v5Qced1b3D16QSE'
                    });
                    console.log('FCM Token:', token);
                    // Aqui você salvaria esse token no Firestore na coleção 'admin_tokens' para usar depois
                }

                onMessage(messaging, (payload) => {
                    console.log('Message received. ', payload);
                    // Custom toast ou alerta visual aqui
                    new Notification(payload.notification?.title || 'Novo Agendamento', {
                        body: payload.notification?.body,
                        icon: '/img/logo.png'
                    });
                });
            }
        } catch (error) {
            console.log('Error configuring notifications:', error);
        }
    };

    if (currentUser) {
        setupNotifications();
    }
  }, [currentUser]);

  if (loadingAuth) {
      return (
          <div className="flex bg-[#0a0a0a] min-h-screen text-white items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
      );
  }

  if (!currentUser) return null;

  return (
    <div className="flex bg-[#0a0a0a] min-h-screen text-white">
      <NotificationSystem />
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <motion.div 
        animate={{ marginLeft: isMobile ? 0 : (collapsed ? 80 : 250) }}
        className="flex-1 transition-all duration-300 p-4 pt-20 md:p-8 w-full overflow-hidden"
      >
        {children}
      </motion.div>
    </div>
  );
}
