import { Facebook, Instagram, Twitter, Phone, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-[#070707] text-zinc-400 py-16 border-t border-white/10 pb-24 md:pb-16 relative overflow-hidden">
      {/* Glow de fundo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-orange-500/10 to-transparent blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-10 relative z-10">
        <div>
          {/* Logo container destacado com sombra/brilho */}
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-2xl bg-white/95 backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.3)] border border-white/70 mb-6">
            <Image 
              src="/img/favicon-new.png" 
              width={140} 
              height={48} 
              alt="Mauro Barber Logo" 
              className="h-10 w-auto object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
              unoptimized
            />
          </div>
          <p className="text-sm leading-relaxed text-zinc-400">
            Elevando sua autoestima com cortes precisos, barba alinhada e um ambiente de primeira classe. Seu estilo é a nossa marca.
          </p>
        </div>
        
        <div>
          <h4 className="text-white font-bold mb-4 tracking-wide text-sm uppercase text-orange-400">Links Rápidos</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/" className="hover:text-orange-400 transition-colors">Início</Link></li>
            <li><Link href="/servicos" className="hover:text-orange-400 transition-colors">Serviços</Link></li>
            <li><Link href="/agendar" className="hover:text-orange-400 transition-colors">Agendamento Online</Link></li>
            <li><Link href="/contato" className="hover:text-orange-400 transition-colors">Contato & Localização</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4 tracking-wide text-sm uppercase text-orange-400 flex items-center gap-2">
            <Clock size={16} />
            <span>Horários</span>
          </h4>
          <ul className="space-y-2.5 text-sm text-zinc-300">
            <li className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-zinc-400">Terça - Sexta</span> 
              <span className="font-medium text-white">08:00 - 12:00 | 14:00 - 19:00</span>
            </li>
            <li className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-zinc-400">Sábado</span> 
              <span className="font-medium text-white">08:00 - 12:00 | 14:00 - 19:00</span>
            </li>
            <li className="flex justify-between pt-1">
              <span className="text-zinc-400">Dom - Seg</span> 
              <span className="text-orange-400 font-semibold">Fechado</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4 tracking-wide text-sm uppercase text-orange-400">Atendimento & Redes</h4>
          <div className="flex gap-3 mb-5">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-orange-500 hover:text-white transition-all text-zinc-300">
              <Instagram size={18} />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-orange-500 hover:text-white transition-all text-zinc-300">
              <Facebook size={18} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-orange-500 hover:text-white transition-all text-zinc-300">
              <Twitter size={18} />
            </a>
          </div>
          <div className="flex flex-col gap-2.5 text-xs text-zinc-400">
             <p className="flex items-center gap-2">
                <MapPin size={14} className="text-orange-400 shrink-0" />
                <span>Rua Josué Passos, 821 - Itabaiana, SE</span>
             </p>
             <p className="flex items-center gap-2">
                <Phone size={14} className="text-orange-400 shrink-0" />
                <a href="https://wa.me/557999914079" target="_blank" rel="noopener noreferrer" className="hover:text-white font-semibold transition-colors">
                    +55 (79) 9991-4079
                </a>
             </p>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-white/10 text-xs text-zinc-500">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-center md:text-left">
            <p>&copy; {new Date().getFullYear()} Mauro Barber. Todos os direitos reservados.</p>
            <p>
                Desenvolvido por <a href="https://www.nexussofttech.com.br" target="_blank" rel="noopener noreferrer" className="font-semibold text-zinc-300 hover:text-orange-400 transition-colors">NEXUS SOFT TECH</a>
            </p>
        </div>
      </div>
    </footer>
  );
}
