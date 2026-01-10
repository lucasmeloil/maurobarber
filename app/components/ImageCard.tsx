'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface ImageCardProps {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function ImageCard({ src, alt, title, subtitle, className }: ImageCardProps) {
  return (
    <motion.div 
      className={`relative group overflow-hidden rounded-3xl shadow-2xl cursor-pointer ${className}`}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ y: -10 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="relative h-[400px] w-full">
        <Image 
          src={src} 
          alt={alt} 
          fill 
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
        
        {/* Content on Hover/Default */}
        <div className="absolute bottom-0 left-0 w-full p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          {(title || subtitle) && (
             <div className="border-l-4 border-white pl-4">
                {title && <h3 className="text-2xl font-bold text-white font-heading mb-1 drop-shadow-md">{title}</h3>}
                {subtitle && <p className="text-gray-300 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">{subtitle}</p>}
             </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
