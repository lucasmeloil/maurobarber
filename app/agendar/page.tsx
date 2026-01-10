'use client';
import { useState } from 'react';
import { Calendar, Clock, User, Phone, Scissors } from 'lucide-react';
import { useApp } from '@/app/context/AppContext';
import { useToast } from '@/app/context/ToastContext';
import PageBanner from '../components/PageBanner';

export default function SchedulePage() {
  const { services, addAppointment } = useApp();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    data: '',
    hora: '',
    observacoes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleService = (id: string) => {
    setSelectedServices(prev => 
        prev.includes(id) 
        ? prev.filter(sId => sId !== id)
        : [...prev, id]
    );
  };

  const totalPrice = services
    .filter(s => selectedServices.includes(s.id))
    .reduce((acc, curr) => acc + Number(curr.price), 0);

  const { showToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedServices.length === 0) {
        showToast('Selecione pelo menos um serviço!', 'error');
        return;
    }

    const selectedServiceObjects = services.filter(s => selectedServices.includes(s.id));
    const serviceName = selectedServiceObjects.map(s => s.name).join(' + ');
    const serviceId = selectedServices.join(',');

    // Attempt validation first
    const success = addAppointment({
        clientName: formData.nome,
        phone: formData.telefone,
        serviceId: serviceId,
        serviceName: serviceName,
        price: totalPrice, // Parsing passed price
        date: formData.data,
        time: formData.hora
    });

    if (!success) {
      showToast('Horário indisponível! Por favor, escolha outro horário.', 'error');
      return;
    }
    
    showToast('Agendamento enviado com sucesso!', 'success');
    setFormData({ nome: '', telefone: '', data: '', hora: '', observacoes: '' });
    setSelectedServices([]);
  };

  return (
    <>
      <PageBanner title="Agendamento" subtitle="Reserve seu momento" />
      <div className="container mx-auto px-4 py-16">
      
      <div className="max-w-2xl mx-auto bg-[#111] border border-white/10 p-8 rounded-2xl shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                    <User size={16} /> Nome Completo
                </label>
                <input 
                    type="text" 
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                    required
                />
            </div>

            <div>
                <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                    <Phone size={16} /> Telefone
                </label>
                <input 
                    type="tel" 
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                    required
                />
            </div>

            <div>
                <label className="block text-sm text-gray-400 mb-4 flex items-center gap-2">
                    <Scissors size={16} /> Serviços (Selecione um ou mais)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    {services.map(s => {
                        const isSelected = selectedServices.includes(s.id);
                        return (
                            <div 
                                key={s.id}
                                onClick={() => toggleService(s.id)}
                                className={`cursor-pointer border rounded-xl p-4 transition-all flex justify-between items-center ${isSelected ? 'bg-white text-black border-white' : 'bg-black border-gray-800 text-gray-400 hover:border-gray-600'}`}
                            >
                                <span className="font-bold">{s.name}</span>
                                <span className={isSelected ? 'text-black' : 'text-white'}>R$ {s.price}</span>
                            </div>
                        )
                    })}
                </div>
                {selectedServices.length > 0 && (
                     <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex justify-between items-center text-white">
                        <span className="text-gray-400">Total Estimado:</span>
                        <span className="text-xl font-bold font-heading">R$ {totalPrice.toFixed(2)}</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                        <Calendar size={16} /> Data
                    </label>
                    <input 
                        type="date" 
                        name="data"
                        value={formData.data}
                        onChange={handleChange}
                        className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                        <Clock size={16} /> Hora
                    </label>
                    <input 
                        type="time" 
                        name="hora"
                        value={formData.hora}
                        onChange={handleChange}
                        className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                        required
                    />
                </div>
            </div>

            <div>
                 <label className="block text-sm text-gray-400 mb-2">Observações</label>
                 <textarea 
                    name="observacoes"
                    value={formData.observacoes}
                    onChange={handleChange}
                    className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white transition-colors min-h-[100px]"
                 />
            </div>

            <button 
                type="submit"
                className="w-full bg-white text-black font-bold py-4 rounded-lg hover:bg-gray-200 transition-colors text-lg mt-4 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transform"
            >
                Confirmar Agendamento ({selectedServices.length} {selectedServices.length === 1 ? 'item' : 'itens'})
            </button>
        </form>
      </div>
    </div>
    </>
  );
}
