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
    <div className="fixed bottom-0 left-0 w-full bg-black text-white border-t border-gray-800 md:hidden z-50 pb-[env(safe-area-inset-bottom)] shadow-xl">
      <nav className="flex justify-around items-center h-16">
        {items.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link 
              key={item.path} 
              href={item.path} 
              className={clsx(
                "relative flex flex-col items-center justify-center p-2 w-full transition-transform hover:scale-105",
                isActive ? "text-white" : "text-gray-400"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabMobile"
                  className="absolute top-0 w-8 h-1 bg-white rounded-b-md"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] mt-1 font-medium">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
