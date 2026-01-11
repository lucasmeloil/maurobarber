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
