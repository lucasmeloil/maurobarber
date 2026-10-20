'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Maximize2, X, Sparkles, MapPin, CheckCircle2 } from 'lucide-react';

interface ImageCardProps {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function ImageCard({ src, alt, title = "Nosso Ambiente", subtitle, className = "" }: ImageCardProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <>
      <motion.div 
        className={`relative group overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950 shadow-[0_20px_50px_rgba(0,0,0,0.85)] cursor-pointer transition-all duration-500 hover:border-orange-500/40 hover:shadow-[0_20px_60px_rgba(249,115,22,0.15)] ${className}`}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        onClick={() => setIsFullscreen(true)}
      >
        {/* Container com proporção vertical 3:4 perfeita para exibir a foto completa no mobile e desktop */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-black flex items-center justify-center">
          <Image 
            src={src} 
            alt={alt} 
            fill 
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            className="object-contain md:object-cover md:object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />

          {/* Gradiente sutil inferior para legibilidade */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/20 pointer-events-none" />

          {/* Badges superiores em Glassmorphism */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white shadow-lg">
              <MapPin size={12} className="text-orange-500" /> Studio Mauro Barber
            </span>

            <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-gray-200 group-hover:border-orange-500/50 group-hover:text-white transition-colors shadow-lg">
              <Maximize2 size={13} className="text-orange-400" />
              <span className="hidden sm:inline">Ver foto completa</span>
            </span>
          </div>

          {/* Conteúdo inferior do Card Moderno */}
          <div className="absolute bottom-0 left-0 w-full p-5 sm:p-6 z-10 flex flex-col justify-end">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-orange-400 uppercase tracking-wider mb-1.5">
              <Sparkles size={12} /> Espaço Climatizado & Exclusivo
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-white font-heading mb-1.5 drop-shadow-md">
              {title}
            </h3>

            <p className="text-gray-300 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-3 drop-shadow">
              {subtitle || "Iluminação hexagonal de alta precisão, cadeira ergonômica e conforto total para você relaxar."}
            </p>

            {/* Chips de Destaques da Barbearia */}
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/10">
              <span className="text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-sm text-gray-200 border border-white/10">
                ❄️ Climatizado
              </span>
              <span className="text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-sm text-gray-200 border border-white/10">
                💡 LED Hexagonal
              </span>
              <span className="text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-sm text-gray-200 border border-white/10">
                ☕ Café Cortesia
              </span>
              <span className="text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-sm text-gray-200 border border-white/10">
                📶 Wi-Fi 5G
              </span>
            </div>
          </div>
        </div>

        {/* Borda decorativa de destaque no hover */}
        <div className="absolute inset-0 rounded-[2rem] border-2 border-orange-500/0 group-hover:border-orange-500/30 transition-colors duration-500 pointer-events-none" />
      </motion.div>

      {/* Lightbox / Modal em Tela Cheia para visualização completa no mobile e desktop */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-8"
            onClick={() => setIsFullscreen(false)}
          >
            {/* Botão de Fechar */}
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-5 right-5 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/20 z-10"
              title="Fechar visualização"
            >
              <X size={22} />
            </button>

            {/* Imagem Completa em Resolução Total */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl max-h-[85vh] aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-white/10"
              onClick={e => e.stopPropagation()}
            >
              <Image
                src={src}
                alt={alt}
                fill
                priority
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 800px"
              />
            </motion.div>

            <div className="mt-4 text-center">
              <p className="text-white font-bold text-sm">Ambiente Mauro Barber</p>
              <p className="text-xs text-gray-400">Toque fora ou clique no X para fechar</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
