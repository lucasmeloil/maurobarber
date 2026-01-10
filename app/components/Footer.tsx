import { Facebook, Instagram, Twitter } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-white/90 backdrop-blur-sm text-gray-600 py-12 border-t border-black/5 pb-24 md:pb-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <Image 
            src="/img/logo.png" 
            width={160} 
            height={60} 
            alt="Mauro Barber Logo" 
            className="mb-6 h-12 w-auto object-contain"
            unoptimized
          />
          <p className="text-sm leading-relaxed">
            Elevando sua autoestima com cortes precisos e um ambiente de primeira classe. Estilo é a nossa assinatura.
          </p>
        </div>
        
        <div>
          <h4 className="text-black font-bold mb-4">Links Rápidos</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-black transition-colors">Início</Link></li>
            <li><Link href="/servicos" className="hover:text-black transition-colors">Serviços</Link></li>
            <li><Link href="/agendar" className="hover:text-black transition-colors">Agendamento</Link></li>
            <li><Link href="/contato" className="hover:text-black transition-colors">Contato</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-black font-bold mb-4">Horários</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between"><span>Seg - Sex</span> <span>08:00 - 18:00</span></li>
            <li className="flex justify-between"><span>Sábado</span> <span>08:00 - 18:00</span></li>
            <li className="flex justify-between"><span>Domingo</span> <span>Fechado</span></li>
          </ul>
        </div>

        <div>
          <h4 className="text-black font-bold mb-4">Siga-nos</h4>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-black transition-colors"><Instagram size={20} /></Link>
            <Link href="#" className="hover:text-black transition-colors"><Facebook size={20} /></Link>
            <Link href="#" className="hover:text-black transition-colors"><Twitter size={20} /></Link>
          </div>
          <div className="mt-6 flex flex-col gap-2">
             <p className="text-xs text-gray-500">Rua Josué Passos, 821</p>
             <p className="text-xs text-gray-500 font-bold hover:text-black transition-colors">
                <a href="https://wa.me/557999914079" target="_blank" rel="noopener noreferrer">
                    +55 (79) 99914-079
                </a>
             </p>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-black/5 text-center text-xs text-gray-500">
        <div className="flex flex-col md:flex-row justify-between items-center gap-2">
            <p>&copy; {new Date().getFullYear()} Mauro Barber. Todos os direitos reservados.</p>
            <p>
                Desenvolvido por <a href="https://www.nexussofttech.com.br" target="_blank" rel="noopener noreferrer" className="font-bold hover:text-black transition-colors">NEXUS SOFT TECH</a>
            </p>
        </div>
      </div>
    </footer>
  );
}
