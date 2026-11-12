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
import { VAPID_PUBLIC_KEY, urlBase64ToUint8Array } from '@/lib/vapid';

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

  // Notification Permission & Web Push VAPID Listener
  useEffect(() => {
    const setupNotifications = async () => {
        try {
            if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') return;

                // 1. Inscrição Web Push Nativa VAPID (Acorda Celular na Tela de Bloqueio sem precisar de Firebase Server Key)
                if ('PushManager' in window) {
                    try {
                        const registration = await navigator.serviceWorker.ready;
                        let subscription = await registration.pushManager.getSubscription();
                        
                        if (!subscription) {
                            subscription = await registration.pushManager.subscribe({
                                userVisibleOnly: true,
                                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
                            });
                        }

                        if (subscription && currentUser) {
                            const subJson = subscription.toJSON();
                            const subKey = btoa(subscription.endpoint).slice(-40).replace(/[^a-zA-Z0-9]/g, '_');
                            await setDoc(doc(db, 'admin_webpush_subscriptions', subKey), {
                                endpoint: subJson.endpoint,
                                keys: subJson.keys,
                                userId: currentUser.id || currentUser.email || 'admin',
                                userEmail: currentUser.email || '',
                                updatedAt: new Date().toISOString(),
                                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
                            }, { merge: true });
                            console.log('✅ [VAPID] Celular inscrito para notificações em segundo plano!');
                        }
                    } catch (vapidErr) {
                        console.log('[VAPID] Erro ao registrar inscrição:', vapidErr);
                    }
                }

                // 2. Registro Legado FCM (Compatibilidade extra)
                try {
                    const messaging = (await import('firebase/messaging')).getMessaging();
                    const { getToken, onMessage } = await import('firebase/messaging');
                    const token = await getToken(messaging, { 
                        vapidKey: 'BlaykffShaRHseNc_3wG4IVr4Z4TGD3qoqEKbjTCXsqsxfFr_tnNtq8lvTRMeAwveCljP1d0v5Qced1b3D16QSE'
                    });
                    if (token && currentUser) {
                        await setDoc(doc(db, 'admin_fcm_tokens', token), {
                            token,
                            userId: currentUser.id || currentUser.email || 'admin',
                            userEmail: currentUser.email || '',
                            updatedAt: new Date().toISOString(),
                            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
                        }, { merge: true });
                    }
                    onMessage(messaging, (payload) => {
                        const notifTitle = payload.notification?.title || payload.data?.title || 'Novo Agendamento Mauro Barber';
                        const notifBody = payload.notification?.body || payload.data?.body || 'Um novo agendamento foi realizado.';
                        new Notification(notifTitle, {
                            body: notifBody,
                            icon: '/icons/icon-192x192.png',
                            badge: '/icons/favicon-32x32.png',
                        });
                    });
                } catch (fcmErr) {
                    console.log('[FCM] Fallback ignorado:', fcmErr);
                }
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
