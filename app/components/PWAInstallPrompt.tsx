'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share2, PlusSquare, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // 1. Registra o Service Worker globalmente para habilitar o PWA e o Web Push
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registrado com escopo:', reg.scope);
        })
        .catch((err) => {
          console.log('[PWA] Falha ao registrar Service Worker:', err);
        });
    }

    // 2. Verifica se já está rodando como App instalado (Standalone)
    const isStandaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    setIsStandalone(isStandaloneMode);

    if (isStandaloneMode) {
      return; // Já está no modo App, não mostra aviso
    }

    // 3. Verifica se o usuário já dispensou hoje
    const dismissedUntil = localStorage.getItem('maurobarber_pwa_dismissed');
    if (dismissedUntil && Date.now() < Number(dismissedUntil)) {
      return;
    }

    // 4. Detecção de iOS (iPhone/iPad)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 5. Captura o evento nativo de instalação no Android/Chrome/Desktop
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // No iOS, se não estiver instalado e não foi dispensado, exibe após 3 segundos
    if (isIosDevice && !isStandaloneMode) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3500);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        console.log('[PWA] Usuário aceitou a instalação');
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setShowIOSGuide(false);
    // Não incomoda novamente pelas próximas 48 horas
    const expires = Date.now() + 48 * 60 * 60 * 1000;
    localStorage.setItem('maurobarber_pwa_dismissed', String(expires));
  };

  if (isStandalone || !isVisible) {
    return null;
  }

  return (
    <>
      {/* Banner Flutuante de Instalação */}
      <AnimatePresence>
        {isVisible && !showIOSGuide && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 bg-[#0d0d12]/95 backdrop-blur-xl border border-[#d4af37]/40 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_25px_rgba(212,175,55,0.2)] rounded-2xl p-4 text-white"
          >
            <div className="flex items-start gap-3.5">
              <div className="relative w-12 h-12 flex-shrink-0 rounded-xl overflow-hidden shadow-md border border-[#d4af37]/30 bg-black">
                <Image
                  src="/icons/icon-192x192.png"
                  alt="Mauro Barber App Icon"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-[#f8e7b3] tracking-wide">
                    Instalar App Mauro Barber
                  </h4>
                  <button
                    onClick={handleDismiss}
                    className="text-zinc-400 hover:text-white p-1 rounded-lg transition-colors"
                    aria-label="Fechar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                  Adicione à sua tela inicial para agendar em 1 toque e receber notificações instantâneas.
                </p>

                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={handleInstallClick}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa771c] hover:from-[#e5c055] hover:to-[#be8922] text-black font-semibold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    {isIOS ? <Smartphone className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                    Instalar App
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs transition-colors cursor-pointer"
                  >
                    Mais tarde
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Guia de Instalação para iPhone (iOS Safari) */}
      <AnimatePresence>
        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="w-full max-w-sm bg-[#111116] border border-[#d4af37]/40 rounded-3xl p-6 text-white shadow-2xl relative"
            >
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white p-2 rounded-full bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl overflow-hidden border border-[#d4af37]/40 bg-black">
                  <Image
                    src="/icons/icon-192x192.png"
                    alt="Mauro Barber"
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#f8e7b3]">Como instalar no iPhone</h3>
                  <p className="text-xs text-zinc-400">Rápido e sem precisar da App Store</p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs text-zinc-300 my-4">
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-7 h-7 rounded-lg bg-[#d4af37]/20 flex items-center justify-center text-[#d4af37] font-bold text-sm">
                    1
                  </div>
                  <div className="flex-1">
                    Toque no botão <span className="inline-flex items-center gap-1 font-semibold text-white bg-white/10 px-1.5 py-0.5 rounded"><Share2 className="w-3.5 h-3.5 text-[#d4af37]" /> Compartilhar</span> na barra do Safari.
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-7 h-7 rounded-lg bg-[#d4af37]/20 flex items-center justify-center text-[#d4af37] font-bold text-sm">
                    2
                  </div>
                  <div className="flex-1">
                    Role as opções e toque em <span className="inline-flex items-center gap-1 font-semibold text-white bg-white/10 px-1.5 py-0.5 rounded"><PlusSquare className="w-3.5 h-3.5 text-[#d4af37]" /> Adicionar à Tela de Início</span>.
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-7 h-7 rounded-lg bg-[#d4af37]/20 flex items-center justify-center text-[#d4af37] font-bold text-sm">
                    3
                  </div>
                  <div className="flex-1">
                    Toque em <strong className="text-white">Adicionar</strong> no canto superior direito e pronto! O ícone dourado do app já estará na sua tela inicial.
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa771c] text-black font-bold text-xs transition-all active:scale-95 cursor-pointer"
              >
                Entendi
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

