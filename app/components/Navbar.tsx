'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Calendar, Sparkles } from 'lucide-react';
import Image from 'next/image';

const items = [
  { label: "Início", path: "/" },
  { label: "Serviços", path: "/servicos" },
  { label: "Agendar", path: "/agendar" },
  { label: "Contato", path: "/contato" }
];

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 w-full min-h-[72px] md:min-h-[82px] bg-[#070707]/90 backdrop-blur-xl z-50 flex items-center justify-between px-4 md:px-8 lg:px-16 border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
        {/* Logo Container com sombra/destaque especial para o logo preto sob navbar dark */}
        <Link href="/" className="z-50 relative group flex items-center">
          <div className="relative flex items-center px-3.5 py-1.5 rounded-2xl bg-white/95 backdrop-blur-md shadow-[0_0_22px_rgba(255,255,255,0.35),0_0_40px_rgba(249,115,22,0.2)] border border-white/80 group-hover:shadow-[0_0_28px_rgba(249,115,22,0.6)] group-hover:scale-105 transition-all duration-300">
            <Image 
              src="/img/favicon-new.png" 
              width={120} 
              height={42} 
              alt="Mauro Barber Logo" 
              className="w-auto h-9 md:h-11 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
              priority
            />
          </div>
        </Link>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {items.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path} 
                className={clsx(
                  "relative text-sm font-semibold transition-all duration-200 hover:text-white py-1",
                  isActive ? "text-white" : "text-zinc-400"
                )}
              >
                {item.label}
                {isActive && (
                  <motion.div 
                    layoutId="activeTabDesktop"
                    className="absolute -bottom-[29px] left-0 right-0 h-[2.5px] bg-gradient-to-r from-orange-500 to-amber-400 rounded-full shadow-[0_0_12px_rgba(249,115,22,0.9)]"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* CTA Button Desktop */}
        <div className="hidden md:flex items-center gap-4">
          <Link 
            href="/agendar" 
            className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-[0_0_20px_rgba(249,115,22,0.35)] hover:shadow-[0_0_28px_rgba(249,115,22,0.6)] hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <Calendar size={16} className="text-white/90" />
            <span>Agendar Horário</span>
          </Link>
        </div>

        {/* Mobile Hamburger Trigger */}
        <button 
          className="md:hidden text-white p-2.5 z-50 relative rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Abrir menu"
        >
          {isMobileMenuOpen ? <X size={26} className="text-orange-400" /> : <Menu size={26} />}
        </button>
      </header>

      {/* Mobile Full Screen Menu Dark Theme */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-[#090909]/98 backdrop-blur-2xl z-40 pt-28 px-6 flex flex-col md:hidden border-b border-white/10"
          >
            <nav className="flex flex-col gap-4 text-center">
              {items.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link 
                    key={item.path} 
                    href={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={clsx(
                      "text-xl font-bold py-3 px-4 rounded-xl transition-all duration-200",
                      isActive 
                        ? "bg-white/10 text-orange-400 border border-orange-500/30" 
                        : "text-zinc-300 hover:text-white hover:bg-white/5"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
              
              <div className="h-px bg-white/10 my-4" />
              
              <Link 
                href="/agendar" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-2xl font-bold text-lg shadow-[0_0_25px_rgba(249,115,22,0.4)] active:scale-95 transition-transform"
              >
                <Calendar size={20} />
                <span>Agendar Horário Agora</span>
              </Link>
              
              <p className="text-xs text-zinc-500 mt-4">
                Atendimento de Terça a Sábado • 08:00 às 19:00
              </p>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
