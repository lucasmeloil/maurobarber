'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ChevronLeft, ChevronRight } from 'lucide-react';
import ImageCard from './components/ImageCard';
import { useApp } from './context/AppContext';


export default function Home() {
  const { team, services } = useApp();
  const barbers = team.filter(m => m.role === 'barber');
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);

  const galleryImages = [
    { src: "/assets/gallery/arte1.png", title: "Barba e Detalhes", subtitle: "Precisão em cada movimento." },
    { src: "/assets/gallery/arte2.png", title: "Finalização", subtitle: "Cuidado com o contorno." },
    { src: "/assets/gallery/arte3.png", title: "Corte Moderno", subtitle: "Degradê impecável." },
    { src: "/assets/gallery/arte4.png", title: "Estilo Clássico", subtitle: "Tradição e modernidade." },
    { src: "/assets/gallery/arte5.png", title: "Visual Completo", subtitle: "Barba, cabelo e bigode." },
  ];

  const nextImage = () => setCurrentGalleryIndex((prev) => (prev + 1) % galleryImages.length);
  const prevImage = () => setCurrentGalleryIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);

  useEffect(() => {
    const timer = setInterval(nextImage, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative min-h-[calc(100svh-72px)] md:min-h-[92vh] w-full overflow-hidden bg-black flex items-center pt-[76px] md:pt-28 pb-3 md:pb-16">
        {/* Hero Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black opacity-60" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2.5 md:gap-12">
            
            {/* Imagem do Hero (Aumentada no limite do mobile, 100% completa) */}
            <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="w-full md:w-[45%] lg:w-[42%] order-1 md:order-2 flex justify-center">
              <motion.div whileHover={{ scale: 1.02, rotateY: -3, rotateX: 2 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="relative aspect-[4/5] w-full max-w-[255px] xs:max-w-[275px] sm:max-w-[330px] md:max-w-none rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.9)] border border-white/15 group bg-zinc-950" style={{ perspective: 1000 }}>
                <Image 
                  src="/assets/hero-banner.png" 
                  alt="Mauro Barber Agendamento" 
                  fill 
                  className="object-contain md:object-cover object-center transition-transform duration-700" 
                  priority 
                />
                <div className="absolute inset-0 border-2 border-orange-500/0 group-hover:border-orange-500/30 rounded-2xl md:rounded-[2.5rem] transition-colors duration-500 pointer-events-none" />
              </motion.div>
            </motion.div>

            {/* Conteúdo de Texto e Botões */}
            <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8 }} className="w-full md:w-1/2 text-center md:text-left order-2 md:order-1">
              
              {/* Badges de Prova Social e Status */}
              <div className="inline-flex flex-wrap items-center justify-center md:justify-start gap-1.5 mb-1.5 md:mb-5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] md:text-xs font-semibold backdrop-blur-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Horários Disponíveis Hoje
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] md:text-xs font-semibold backdrop-blur-md">
                  ⭐ 4.9 • Referência
                </span>
              </div>

              <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-6xl lg:text-7xl font-bold font-heading text-white mb-1 md:mb-5 tracking-tight leading-tight">
                Seu Estilo <br className="hidden xs:inline" /> <span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent italic">nossa marca.</span>
              </h1>
              
              <p className="text-xs sm:text-sm md:text-xl text-zinc-300 mb-2.5 md:mb-8 max-w-xl mx-auto md:mx-0 font-light leading-relaxed">
                Referência em barbearia clássica e visuais modernos. Agende seu horário em tempo real e viva uma experiência incomparável.
              </p>
              
              {/* Botões: em mobile lado a lado (grid de 2 colunas) para economizar altura vertical */}
              <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 md:gap-4 justify-center md:justify-start max-w-md mx-auto md:mx-0">
                <Link 
                  href="/agendar" 
                  className="px-3 py-2.5 md:px-8 md:py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl md:rounded-2xl text-xs sm:text-base md:text-lg shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:scale-105 active:scale-95 transition-all text-center flex items-center justify-center"
                >
                  Agendar Agora
                </Link>
                <Link 
                  href="/servicos" 
                  className="px-3 py-2.5 md:px-8 md:py-4 bg-white/5 border border-white/15 text-white font-semibold rounded-xl md:rounded-2xl text-xs sm:text-base md:text-lg hover:bg-white/10 hover:border-white/30 transition-all text-center backdrop-blur-md flex items-center justify-center"
                >
                  Ver Serviços
                </Link>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Stats Bar (Prova Social) */}
      <section className="border-y border-white/10 bg-[#070707] py-8 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-3">
              <p className="text-3xl md:text-4xl font-extrabold text-white mb-1 tracking-tight">+500</p>
              <p className="text-xs md:text-sm text-zinc-400 font-medium uppercase tracking-wider">Cortes Realizados</p>
            </div>
            <div className="p-3">
              <p className="text-3xl md:text-4xl font-extrabold text-orange-400 mb-1 tracking-tight">4.9 ★</p>
              <p className="text-xs md:text-sm text-zinc-400 font-medium uppercase tracking-wider">Avaliação Média</p>
            </div>
            <div className="p-3">
              <p className="text-3xl md:text-4xl font-extrabold text-white mb-1 tracking-tight">1+ Anos</p>
              <p className="text-xs md:text-sm text-zinc-400 font-medium uppercase tracking-wider">De Tradição</p>
            </div>
            <div className="p-3">
              <p className="text-3xl md:text-4xl font-extrabold text-emerald-400 mb-1 tracking-tight">100%</p>
              <p className="text-xs md:text-sm text-zinc-400 font-medium uppercase tracking-wider">Satisfação do Cliente</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-black text-white overflow-hidden">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
                 <ImageCard 
                    src="/assets/ambiente-real.jpg" 
                    alt="Ambiente Mauro Barber" 
                    title="Nosso Ambiente"
                    subtitle="Estrutura moderna, climatizada e pensada para o seu máximo conforto."
                 />
            </div>
            <div className="order-1 md:order-2">
                <motion.h2 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-3xl md:text-5xl font-bold font-heading mb-6"
                >
                    Mais que um corte, <br/><span className="text-gray-500">uma experiência.</span>
                </motion.h2>
                <p className="text-gray-400 text-lg mb-6 leading-relaxed">
                    Fundada com a missão de resgatar a tradição da barbearia clássica aliada às técnicas modernas, a Mauro Barber é o refúgio do homem moderno. Aqui, cada detalhe é pensado para o seu conforto, desde a toalha quente até o café expresso cortesia.
                </p>
                <ul className="space-y-4 mb-8">
                    {['Ambiente climatizado e exclusivo', 'Profissionais com certificação internacional', 'Produtos premium para barba e cabelo'].map((item, index) => (
                        <li key={index} className="flex items-center gap-3 text-gray-300">
                            <span className="w-2 h-2 bg-white rounded-full" />
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
      </section>

      {/* Services Section - Dynamic from DB */}
      <section className="py-24 bg-black border-t border-white/5">
        <div className="container mx-auto px-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
            >
                <h2 className="text-3xl md:text-5xl font-bold font-heading text-white mb-4">Serviços Exclusivos</h2>
                <p className="text-gray-400 max-w-2xl mx-auto">Excelência em cada detalhe, do clássico ao moderno.</p>
            </motion.div>

            {services.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service, i) => (
                        <motion.div
                            key={service.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-[#111] border border-white/5 p-8 rounded-2xl hover:border-orange-500/30 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-2xl font-bold text-white group-hover:text-orange-500 transition-colors">{service.name || 'Serviço'}</h3>
                                <span className="text-xl font-bold text-orange-500">R$ {(Number(service.price) || 0).toFixed(2)}</span>
                            </div>
                            <p className="text-gray-400 mb-6">{service.duration || '30 min'}</p>
                            <Link href={`/agendar?serviceId=${service.id}`} className="inline-flex items-center gap-2 text-white font-bold hover:gap-4 transition-all">
                                Agendar agora <span className="text-orange-500">→</span>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-zinc-900/30 rounded-3xl border border-dashed border-white/10">
                    <p className="text-gray-500 italic">Nenhum serviço disponível no momento.</p>
                    <Link href="/servicos" className="text-blue-400 text-sm mt-2 inline-block">Ver todos os serviços</Link>
                </div>
            )}
        </div>
      </section>

      {/* New Gallery Section with Slider */}
      <section className="py-24 bg-[#050505]">
        <div className="container mx-auto px-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
            >
                <h2 className="text-3xl md:text-5xl font-bold font-heading text-white mb-4">Nossa Arte</h2>
                <p className="text-gray-400 max-w-2xl mx-auto">Confira alguns dos nossos trabalhos e a excelência que entregamos em cada corte.</p>
            </motion.div>
            
            <div className="max-w-4xl mx-auto relative group">
                <motion.div 
                    className="relative aspect-[4/5] md:aspect-video w-full rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-white/10"
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.5 }}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentGalleryIndex}
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.8 }}
                            className="absolute inset-0"
                        >
                            <Image 
                                src={galleryImages[currentGalleryIndex].src} 
                                alt={galleryImages[currentGalleryIndex].title}
                                fill
                                className="object-cover"
                            />
                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            
                            {/* Content Info */}
                            <div className="absolute bottom-10 left-10 right-10">
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="border-l-4 border-orange-500 pl-6"
                                >
                                    <h3 className="text-2xl md:text-4xl font-bold text-white mb-2">{galleryImages[currentGalleryIndex].title}</h3>
                                    <p className="text-gray-300 text-lg">{galleryImages[currentGalleryIndex].subtitle}</p>
                                </motion.div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="absolute inset-y-0 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button 
                            onClick={prevImage}
                            className="p-3 bg-black/50 hover:bg-orange-500 text-white rounded-full backdrop-blur-md transition-all hover:scale-110"
                        >
                            <ChevronLeft size={30} />
                        </button>
                        <button 
                            onClick={nextImage}
                            className="p-3 bg-black/50 hover:bg-orange-500 text-white rounded-full backdrop-blur-md transition-all hover:scale-110"
                        >
                            <ChevronRight size={30} />
                        </button>
                    </div>

                    {/* Indicators */}
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
                        {galleryImages.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentGalleryIndex(idx)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentGalleryIndex ? 'w-8 bg-orange-500' : 'w-2 bg-white/30'}`}
                            />
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
      </section>

      {/* Team/Barbers Section - Dynamic from DB */}
      <section className="py-24 bg-[#050505] border-t border-white/5">
            <div className="container mx-auto px-4">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-5xl font-bold font-heading text-white mb-4">Nossos Profissionais</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">Escolha seu barbeiro de preferência e agende seu horário.</p>
                </motion.div>

                {barbers.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-center">
                        {barbers.map((barber, i) => (
                            <motion.div
                                key={barber.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Link href={`/agendar?barberId=${barber.id}`} className="block group">
                                    <div className="bg-[#111] p-6 rounded-2xl border border-white/5 hover:border-orange-500/30 transition-all text-center group-hover:bg-[#1a1a1a]">
                                        <div className="w-24 h-24 mx-auto bg-zinc-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform overflow-hidden">
                                            {barber.avatar ? (
                                                <img src={barber.avatar} alt={barber.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={40} className="text-gray-400" />
                                            )}
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-orange-500 transition-colors uppercase tracking-wider">{barber.name}</h3>
                                        <p className="text-xs text-orange-500 mb-4 font-bold tracking-[0.2em] uppercase">Mestre Barbeiro</p>
                                        <span className="inline-block px-6 py-2 bg-white text-black text-xs font-black rounded-full group-hover:bg-orange-500 group-hover:text-white transition-all uppercase tracking-widest">
                                            Reservar
                                        </span>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-zinc-900/30 rounded-3xl border border-dashed border-white/10">
                         <p className="text-gray-500 italic">Nenhum profissional disponível no momento.</p>
                    </div>
                )}
            </div>
        </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-black border-y border-white/5">
         <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-center text-white mb-16">
                O que dizem nossos clientes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { name: "Carlos Silva", text: "Melhor atendimento da cidade. O Mauro é um profissional incrível, sempre acerta no corte.", rating: 5 },
                    { name: "André Santos", text: "Ambiente sensacional. A cerveja gelada enquanto espera faz toda a diferença.", rating: 5 },
                    { name: "Ricardo Oliveira", text: "Preço justo pela qualidade entregue. Virei cliente fiel desde a primeira vez.", rating: 5 }
                ].map((review, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.2 }}
                        className="bg-[#111] p-8 rounded-2xl border border-white/5 shadow-xl hover:-translate-y-2 transition-transform"
                    >
                        <div className="flex gap-1 mb-4 text-[#FFD700]">
                            {[...Array(review.rating)].map((_, r) => <span key={r}>★</span>)}
                        </div>
                        <p className="text-gray-300 mb-6 italic">"{review.text}"</p>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center font-bold text-white">
                                {review.name.charAt(0)}
                            </div>
                            <span className="font-bold text-white">{review.name}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
         </div>
      </section>

      {/* Final Call to Action Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-black via-zinc-950 to-[#070707] relative overflow-hidden">
        {/* Glow de fundo */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-500/15 via-transparent to-transparent pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="p-8 md:p-14 rounded-[2.5rem] bg-gradient-to-b from-zinc-900/90 to-black/90 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl relative"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider mb-6">
              Experiência VIP Mauro Barber
            </span>

            <h2 className="text-3xl md:text-5xl font-extrabold font-heading text-white mb-6 tracking-tight leading-tight">
              Pronto para elevar o seu visual ao <span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">próximo nível?</span>
            </h2>

            <p className="text-base md:text-xl text-zinc-300 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
              Não perca tempo em filas. Escolha seu barbeiro favorito, o serviço desejado e marque em tempo real pelo nosso sistema exclusivo.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/agendar" 
                className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold rounded-2xl text-lg shadow-[0_0_30px_rgba(249,115,22,0.45)] hover:shadow-[0_0_40px_rgba(249,115,22,0.7)] hover:scale-105 active:scale-95 transition-all text-center"
              >
                Agendar Meu Horário Agora
              </Link>
              
              <a 
                href="https://wa.me/557999914079" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/15 text-white font-semibold rounded-2xl text-lg hover:bg-white/10 hover:border-white/30 transition-all text-center"
              >
                Dúvidas no WhatsApp
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
