'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import AdminSidebar from './components/AdminSidebar';
import NotificationSystem from './components/NotificationSystem';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      router.push('/login');
    } else {
      setAuthorized(true);
    }
  }, [router]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!authorized) return null;

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
