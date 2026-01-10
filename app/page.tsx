'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { Phone } from 'lucide-react';
import ImageCard from './components/ImageCard';

const slides = [
  {
    headline: "Estilo e precisão",
    subheadline: "Cortes modernos e atendimento profissional",
    image: "/assets/slide1.png",
    cta: { label: "Agendar agora", path: "/agendar" }
  },
  {
    headline: "Sua barbearia de confiança",
    subheadline: "Ambiente climatizado e confortável",
    image: "/assets/slide2.png",
    cta: { label: "Ver serviços", path: "/servicos" }
  }
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] w-full overflow-hidden bg-black">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
          >
            <Image
              src={slides[currentSlide].image}
              alt={slides[currentSlide].headline}
              fill
              className="object-cover opacity-60"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10 pointer-events-none">
          <motion.div 
             key={`content-${currentSlide}`}
             initial={{ y: 30, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: 0.5, duration: 0.8 }}
             className="pointer-events-auto"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-heading text-white mb-6 tracking-tight drop-shadow-2xl">
                {slides[currentSlide].headline}
            </h1>
            <p className="text-lg md:text-2xl text-gray-200 mb-10 max-w-2xl mx-auto drop-shadow-md font-light">
                {slides[currentSlide].subheadline}
            </p>
            
            <Link
              href={slides[currentSlide].cta.path}
              className="inline-block px-8 py-4 bg-white text-black font-bold rounded-full text-lg hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95"
            >
              {slides[currentSlide].cta.label}
            </Link>
          </motion.div>
        </div>

        {/* Indicators */}
        <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-3 z-20">
            {slides.map((_, index) => (
                <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    aria-label={`Ir para slide ${index + 1}`}
                    className={clsx(
                        "w-3 h-3 rounded-full transition-all duration-300",
                        index === currentSlide ? "bg-white w-8" : "bg-white/40 hover:bg-white/60"
                    )}
                />
            ))}
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-black text-white overflow-hidden">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
                 <ImageCard 
                    src="/assets/slide1.png" 
                    alt="Interior da Barbearia" 
                    title="Ambiente Premium"
                    subtitle="Conforto e sofisticação para você."
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

      {/* New Gallery Section */}
      <section className="py-24 bg-[#050505]">
        <div className="container mx-auto px-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
            >
                <h2 className="text-3xl md:text-5xl font-bold font-heading text-white mb-4">Nossa Arte</h2>
                <p className="text-gray-400 max-w-2xl mx-auto">Confira alguns dos nossos trabalhos e o ambiente que preparamos para você.</p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <ImageCard 
                    src="/assets/slide1.png" 
                    alt="Corte Clássico" 
                    title="Corte Clássico"
                    subtitle="A elegância que nunca sai de moda."
                />
                <ImageCard 
                    src="/assets/slide2.png" 
                    alt="Barboterapia" 
                    title="Barboterapia"
                    subtitle="Relaxamento e cuidado para sua pele."
                />
                 <ImageCard 
                    src="/assets/slide1.png" 
                    alt="Estilo Moderno" 
                    title="Estilo Moderno"
                    subtitle="Tendências e personalidade."
                />
            </div>
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
    </div>
  );
}
