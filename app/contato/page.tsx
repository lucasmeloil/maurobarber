import { Phone, MapPin, Instagram } from 'lucide-react';
import Link from 'next/link';
import PageBanner from '../components/PageBanner';

export default function ContactPage() {
  return (
    <>
      <PageBanner title="Entre em Contato" subtitle="Estamos prontos para te atender" />
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Link href="https://wa.me/557999914079" target="_blank" className="flex flex-col items-center text-center p-8 bg-[#111] border border-white/5 rounded-2xl hover:bg-[#1a1a1a] transition-all group hover:-translate-y-2 shadow-lg">
             <Phone size={48} className="mb-6 text-white group-hover:scale-110 transition-transform group-hover:text-[#25D366]"/>
             <h3 className="text-xl font-bold mb-2 text-white">WhatsApp</h3>
             <p className="text-gray-400 group-hover:text-white transition-colors">(79) 99914-079</p>
          </Link>
          
          <Link href="https://instagram.com/maurobarber" className="flex flex-col items-center text-center p-8 bg-[#111] border border-white/5 rounded-2xl hover:bg-[#1a1a1a] transition-all group hover:-translate-y-2 shadow-lg">
             <Instagram size={48} className="mb-6 text-white group-hover:scale-110 transition-transform group-hover:text-[#E1306C]"/>
             <h3 className="text-xl font-bold mb-2 text-white">Instagram</h3>
             <p className="text-gray-400 group-hover:text-white transition-colors">@maurobarber</p>
          </Link>
          
          <div className="flex flex-col items-center text-center p-8 bg-[#111] border border-white/5 rounded-2xl cursor-default hover:-translate-y-2 transition-transform shadow-lg">
             <MapPin size={48} className="mb-6 text-white"/>
             <h3 className="text-xl font-bold mb-2 text-white">Localização</h3>
             <p className="text-gray-400">Rua Exemplo, 123<br/>Cidade/UF</p>
          </div>
        </div>
      </div>
    </>
  );
}
