'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Scissors, Calendar, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const items = [
  { label: "Início", icon: Home, path: "/" },
  { label: "Serviços", icon: Scissors, path: "/servicos" },
  { label: "Agendar", icon: Calendar, path: "/agendar" },
  { label: "Contato", icon: Phone, path: "/contato" }
];

export default function MobileMenu() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 w-full bg-[#070707]/92 backdrop-blur-xl text-white border-t border-white/10 md:hidden z-50 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
      <nav className="flex justify-around items-center h-16">
        {items.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link 
              key={item.path} 
              href={item.path} 
              className={clsx(
                "relative flex flex-col items-center justify-center p-2 w-full transition-transform active:scale-95",
                isActive ? "text-orange-400 font-bold" : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabMobile"
                  className="absolute top-0 w-8 h-1 bg-gradient-to-r from-orange-500 to-amber-400 rounded-b-md shadow-[0_0_10px_rgba(249,115,22,0.9)]"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[11px] mt-1 tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
