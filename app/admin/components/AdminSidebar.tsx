import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { LayoutDashboard, Calendar, Scissors, ChevronLeft, ChevronRight, LogOut, Menu, X, Package, Users, DollarSign } from 'lucide-react';
import { useApp } from '@/app/context/AppContext';
import { useState, useEffect } from 'react';

const menuItems = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Agendamentos", path: "/admin/agendamentos", icon: Calendar },
  { label: "Serviços", path: "/admin/servicos", icon: Scissors },
  { label: "Produtos", path: "/admin/produtos", icon: Package },
  { label: "Financeiro", path: "/admin/financeiro", icon: DollarSign },
  { label: "Equipe", path: "/admin/equipe", icon: Users },
];

interface AdminSidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

export default function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();
  const { unreadNotifications, logout } = useApp();
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Desktop Sidebar
  const DesktopSidebar = (
    <motion.aside 
        animate={{ width: collapsed ? 80 : 250 }}
        className="hidden md:flex fixed left-0 top-0 h-full bg-[#050505] border-r border-white/10 z-50 flex-col transition-all duration-300 overflow-hidden"
    >
      <div className="p-6 flex items-center justify-between h-[80px]">
          <AnimatePresence>
            {!collapsed && (
                <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="font-bold text-xl text-white font-heading whitespace-nowrap"
                >
                    ADMIN
                </motion.span>
            )}
          </AnimatePresence>
          <button onClick={onToggle} className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-white/10 ml-auto">
              {collapsed ? <ChevronRight size={20}/> : <ChevronLeft size={20}/>}
          </button>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
                <Link 
                    key={item.path} 
                    href={item.path}
                    className={clsx(
                        "flex items-center gap-4 p-3 rounded-xl transition-all group overflow-hidden relative",
                        isActive ? "bg-white text-black" : "text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                    title={collapsed ? item.label : undefined}
                >
                    <item.icon size={22} className={clsx("min-w-[22px]", isActive ? "text-black" : "text-gray-400 group-hover:text-white")} />
                    {!collapsed && (
                        <motion.span 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            className="font-medium whitespace-nowrap"
                        >
                            {item.label}
                        </motion.span>
                    )}
                    {item.path === '/admin/agendamentos' && unreadNotifications > 0 && (
                        <span className="absolute right-2 top-2 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                </Link>
            )
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
         <button onClick={logout} className="w-full flex items-center gap-4 p-3 text-red-400 hover:text-red-300 hover:bg-red-900/10 rounded-xl transition-colors">
            <LogOut size={22} className="min-w-[22px]" />
            {!collapsed && <span className="whitespace-nowrap">Sair</span>}
         </button>
      </div>
    </motion.aside>
  );

  // Mobile Bottom Navigation
  return (
    <>
      {DesktopSidebar}

      {/* spacer for bottom nav */}
      <div className="md:hidden h-20" />

      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#050505] border-t border-white/10 z-50 flex items-center justify-around px-2 pb-safe">
        {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
            <Link 
                key={item.path} 
                href={item.path}
                className={clsx(
                    "flex flex-col items-center justify-center p-2 rounded-xl transition-all relative w-16",
                    isActive ? "text-white" : "text-gray-500 hover:text-gray-300"
                )}
            >
                <item.icon size={20} className={clsx(isActive && "text-white")} />
                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                {item.path === '/admin/agendamentos' && unreadNotifications > 0 && (
                    <span className="absolute top-1 right-3 w-2 h-2 bg-red-500 rounded-full" />
                )}
            </Link>
            )
        })}
        
        {/* Logout Button Mobile */}
        <button 
            onClick={logout}
            className="flex flex-col items-center justify-center p-2 text-gray-500 hover:text-red-400 w-16"
        >
            <LogOut size={20} />
            <span className="text-[10px] mt-1 font-medium">Sair</span>
        </button>
      </div>
    </>
  );
}
