'use client';
import PageBanner from '../components/PageBanner';
import { useApp } from '@/app/context/AppContext';

export default function ServicesPage() {
  const { services } = useApp();

  return (
    <>
      <PageBanner title="Nossos Serviços" subtitle="Exceencia em cada detalhe" />
      <div className="container mx-auto px-4 py-16">
        {services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {services.map((service, index) => (
              <div key={service.id || index} className="bg-[#111] border border-white/10 p-8 rounded-2xl hover:bg-[#1a1a1a] transition-all hover:-translate-y-1 shadow-lg group">
                <h3 className="text-2xl font-bold mb-2 text-white group-hover:text-gray-200 transition-colors">{service.name}</h3>
                <div className="flex justify-between items-end mt-4">
                    <span className="text-gray-400 flex items-center gap-2">
                        ⏱ {service.duration}
                    </span>
                    <span className="text-3xl font-bold text-white">R$ {service.price.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-[#111] border border-dashed border-white/10 rounded-3xl max-w-2xl mx-auto">
            <p className="text-gray-500 mb-6 italic">Nenhum serviço disponível no momento.</p>
            <Link href="/agendar" className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all">
                Fazer Agendamento
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
