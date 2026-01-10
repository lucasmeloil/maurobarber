'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
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
        <header className="fixed top-0 w-full min-h-[70px] md:min-h-[80px] bg-white/90 md:bg-white/80 backdrop-blur-md z-50 flex items-center justify-between px-4 md:px-8 lg:px-16 border-b border-black/10">
            <Link href="/" className="z-50 relative">
                <Image 
                    src="/img/logo.png" 
                    width={120} 
                    height={40} 
                    alt="Mauro Barber Logo" 
                    className="w-auto h-10 md:h-12 object-contain"
                />
            </Link>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
                {items.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <Link key={item.path} href={item.path} className={clsx("relative text-sm font-medium transition-colors hover:text-black", isActive ? "text-black" : "text-gray-600")}>
                            {item.label}
                            {isActive && (
                                <motion.div 
                                    layoutId="activeTabDesktop"
                                    className="absolute -bottom-[29px] left-0 right-0 h-[2px] bg-black"
                                />
                            )}
                        </Link>
                    )
                })}
            </nav>

            <div className="hidden md:flex items-center gap-4">
                <Link href="/agendar" className="bg-black text-white px-6 py-2.5 rounded-full font-bold text-sm hover:scale-105 transition-transform active:scale-95">
                    Agendar Agora
                </Link>
            </div>

            {/* Mobile Hamburger Trigger */}
            <button 
                className="md:hidden text-black p-2 z-50 relative"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
        </header>

        {/* Mobile Full Screen Menu */}
        <AnimatePresence>
            {isMobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 bg-white z-40 pt-24 px-8 flex flex-col md:hidden"
                >
                    <nav className="flex flex-col gap-6 text-center">
                        {items.map((item) => (
                            <Link 
                                key={item.path} 
                                href={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={clsx("text-2xl font-bold transition-colors", pathname === item.path ? "text-black" : "text-gray-500")}
                            >
                                {item.label}
                            </Link>
                        ))}
                        <hr className="border-black/10 my-4"/>
                         <Link 
                            href="/agendar" 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="bg-black text-white py-4 rounded-xl font-bold text-lg mt-4 active:scale-95 transition-transform"
                        >
                            Agendar Agora
                        </Link>
                    </nav>
                </motion.div>
            )}
        </AnimatePresence>
    </>
  );
}
