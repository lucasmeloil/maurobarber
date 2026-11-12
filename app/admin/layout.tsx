'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import AdminSidebar from './components/AdminSidebar';
import AdminNavbar from './components/AdminNavbar';
import NotificationSystem from './components/NotificationSystem';
import { useApp } from '../context/AppContext';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

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
                    if (token && currentUser) {
                        console.log('[FCM] Token de administrador obtido com sucesso:', token);
                        await setDoc(doc(db, 'admin_fcm_tokens', token), {
                            token,
                            userId: currentUser.id || currentUser.email || 'admin',
                            userEmail: currentUser.email || '',
                            updatedAt: new Date().toISOString(),
                            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
                        }, { merge: true });
                    }
                }

                onMessage(messaging, (payload) => {
                    console.log('Mensagem FCM em primeiro plano recebida:', payload);
                    const notifTitle = payload.notification?.title || payload.data?.title || 'Novo Agendamento Mauro Barber';
                    const notifBody = payload.notification?.body || payload.data?.body || 'Um novo agendamento foi realizado.';
                    
                    new Notification(notifTitle, {
                        body: notifBody,
                        icon: '/icons/icon-192x192.png',
                        badge: '/icons/favicon-32x32.png',
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
      <AdminNavbar collapsed={collapsed} isMobile={isMobile} />
      <motion.div 
        animate={{ marginLeft: isMobile ? 0 : (collapsed ? 80 : 250) }}
        className="flex-1 transition-all duration-300 p-4 pt-24 md:p-8 md:pt-24 w-full overflow-hidden"
      >
        {children}
      </motion.div>
    </div>
  );
}
