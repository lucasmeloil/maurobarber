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
             <p className="text-gray-400 group-hover:text-white transition-colors">(79) 9991-4079</p>
          </Link>
          
          <Link href="https://instagram.com/maurobarbershop2 className="flex flex-col items-center text-center p-8 bg-[#111] border border-white/5 rounded-2xl hover:bg-[#1a1a1a] transition-all group hover:-translate-y-2 shadow-lg">
             <Instagram size={48} className="mb-6 text-white group-hover:scale-110 transition-transform group-hover:text-[#E1306C]"/>
             <h3 className="text-xl font-bold mb-2 text-white">Instagram</h3>
             <p className="text-gray-400 group-hover:text-white transition-colors">@maurobarbershop2</p>
          </Link>
          
          <a href="https://www.google.com/maps/search/?api=1&query=Rua+Josué+passos+821" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-center p-8 bg-[#111] border border-white/5 rounded-2xl hover:bg-[#1a1a1a] transition-all group hover:-translate-y-2 shadow-lg">
             <MapPin size={48} className="mb-6 text-white group-hover:scale-110 transition-transform group-hover:text-red-500"/>
             <h3 className="text-xl font-bold mb-2 text-white">Localização</h3>
             <p className="text-gray-400 group-hover:text-white transition-colors">Rua Josué Passos, 821</p>
          </a>
        </div>
        
        {/* Real-time Map Section */}
        <div className="mt-16 bg-[#111] p-4 rounded-2xl border border-white/5 max-w-4xl mx-auto">
             <iframe 
                src="https://maps.google.com/maps?q=Rua+Josu%C3%A9+Passos,+821&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                width="100%" 
                height="450" 
                style={{ border: 0, borderRadius: '1rem' }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
        </div>
      </div>
    </>
  );
}
