'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

interface PageBannerProps {
  title: string;
  subtitle?: string;
  image?: string;
}

export default function PageBanner({ title, subtitle, image = "/assets/slide2.png" }: PageBannerProps) {
  return (
    <div className="relative w-full h-[40vh] min-h-[300px] overflow-hidden flex items-center justify-center bg-black">
      <div className="absolute inset-0">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover opacity-50 contrast-125"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-black/40 to-transparent" />
      </div>

      <div className="relative z-10 text-center px-4 max-w-4xl">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "circOut" }}
          className="text-4xl md:text-6xl font-bold font-heading text-white mb-4 tracking-tight drop-shadow-2xl uppercase"
        >
          {title}
        </motion.h1>
        
        {subtitle && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "100%" }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="h-1 bg-white mx-auto rounded-full max-w-[100px] mb-4"
          />
        )}

        {subtitle && (
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-lg text-gray-200 font-light tracking-wide"
            >
                {subtitle}
            </motion.p>
        )}
      </div>
    </div>
  );
}
