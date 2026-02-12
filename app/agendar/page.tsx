'use client';
import { useState, useEffect, Suspense } from 'react';
import { Calendar, Clock, User, Phone, Scissors } from 'lucide-react';
import { useApp } from '@/app/context/AppContext';
import { useToast } from '@/app/context/ToastContext';
import PageBanner from '../components/PageBanner';
import { useSearchParams } from 'next/navigation';

function ScheduleForm() {
  const { services, addAppointment, team, isSlotAvailable } = useApp();
  const searchParams = useSearchParams();
  const preSelectedBarberId = searchParams.get('barberId');

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<string>('');
  
  const barbers = team.filter(m => m.role === 'barber');
  console.log("Barbeiros carregados na página de agendamento:", barbers);
  
  useEffect(() => {
    if(preSelectedBarberId) {
        setSelectedBarber(preSelectedBarberId);
    }
  }, [preSelectedBarberId]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedServices.length === 0) {
        showToast('Selecione pelo menos um serviço!', 'error');
        return;
    }

    if (!selectedBarber && barbers.length > 0) {
        showToast('Selecione um profissional!', 'error');
        return;
    }
    
    if (!formData.hora) {
        showToast('Selecione um horário!', 'error');
        return;
    }

    const selectedServiceObjects = services.filter(s => selectedServices.includes(s.id));
    const serviceName = selectedServiceObjects.map(s => s.name).join(' + ');
    const serviceId = selectedServices.join(',');
    const barber = team.find(b => b.id === selectedBarber);

    // Format phone number to ensure +55 prefix for Brazil
    let formattedPhone = formData.telefone.replace(/\D/g, '');
    if (formattedPhone.length >= 10 && formattedPhone.length <= 11) {
        formattedPhone = `55${formattedPhone}`;
    }

    const success = await addAppointment({
        clientName: formData.nome,
        phone: formattedPhone,
        serviceId: serviceId,
        serviceName: serviceName,
        barberId: selectedBarber || undefined,
        barberName: barber ? barber.name : 'Qualquer Profissional',
        price: totalPrice,
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
    setSelectedBarber('');
  };

  // Generate time slots from 09:00 to 20:00
  const timeSlots = [];
  for (let h = 9; h < 20; h++) {
      timeSlots.push(`${h.toString().padStart(2, '0')}:00`);
      timeSlots.push(`${h.toString().padStart(2, '0')}:30`);
  }

  return (
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

            {barbers.length > 0 ? (
                <div>
                    <label className="block text-sm text-gray-400 mb-4 flex items-center gap-2">
                        <User size={16} /> Profissional
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {barbers.map(b => (
                            <div 
                                key={b.id}
                                onClick={() => setSelectedBarber(b.id)}
                                className={`cursor-pointer border rounded-2xl p-4 flex flex-col items-center gap-3 transition-all transform ${selectedBarber === b.id ? 'bg-white text-black border-white scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-black border-gray-800 text-gray-500 hover:border-gray-600'}`}
                            >
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg ${selectedBarber === b.id ? 'bg-black text-white' : 'bg-gray-800 text-gray-400'}`}>
                                    {b.name.substring(0, 2).toUpperCase()}
                                </div>
                                <span className="font-bold text-sm text-center">{b.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="bg-yellow-900/10 border border-yellow-900/30 p-4 rounded-xl text-center">
                    <p className="text-yellow-500 text-sm">Nenhum barbeiro disponível no momento. Verifique o cadastro no Admin.</p>
                </div>
            )}

            <div>
                 <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                    <Calendar size={16} /> Data
                </label>
                <input 
                    type="date" 
                    name="data"
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.data}
                    onChange={handleChange}
                    className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
                    required
                />
            </div>

            {/* Time Grid Selection */}
            {formData.data && selectedBarber && selectedServices.length > 0 ? (
                 <div className="animate-fade-in">
                    <label className="block text-sm text-gray-400 mb-4 flex items-center gap-2">
                        <Clock size={16} /> Horários Disponíveis
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {timeSlots.map((time) => {
                            // Check availability using context logic
                            const serviceId = selectedServices.join(',');
                            const available = isSlotAvailable(formData.data, time, serviceId, selectedBarber);
                            
                            return (
                                <button
                                    key={time}
                                    type="button"
                                    disabled={!available}
                                    onClick={() => setFormData({...formData, hora: time})}
                                    className={`
                                        py-3 px-1 rounded-xl text-sm font-black transition-all border
                                        ${!available 
                                            ? 'bg-red-500/10 border-red-500/40 text-red-500 cursor-not-allowed line-through opacity-40' 
                                            : formData.hora === time 
                                                ? 'bg-white text-black border-white scale-105 shadow-xl' 
                                                : 'bg-black border-gray-800 text-green-500 hover:border-green-500 hover:scale-[1.05]'
                                        }
                                    `}
                                >
                                    {time}
                                </button>
                            );
                        })}
                    </div>
                    {formData.hora && (
                        <p className="text-green-500 text-xs mt-3 text-center font-bold">Horário {formData.hora} selecionado!</p>
                    )}
                </div>
            ) : (
                <div className="bg-white/5 rounded-2xl p-8 text-center text-gray-400 text-sm border border-dashed border-white/10">
                    {!selectedServices.length ? "Selecione os serviços para continuar." : 
                     !selectedBarber ? "Quase lá! Escolha o barbeiro." : 
                     "Para finalizar, escolha a data desejada."}
                </div>
            )}

            <div>
                 <label className="block text-sm text-gray-400 mb-2 mt-4">Observações</label>
                 <textarea 
                    name="observacoes"
                    value={formData.observacoes}
                    onChange={handleChange}
                    className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white transition-colors min-h-[100px]"
                 />
            </div>

            <button 
                type="submit"
                disabled={!formData.hora || !formData.data || !selectedBarber || selectedServices.length === 0}
                className={`w-full font-bold py-4 rounded-lg transition-all text-lg mt-4 shadow-lg transform
                    ${(!formData.hora || !formData.data || !selectedBarber || selectedServices.length === 0)
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'bg-white text-black hover:bg-gray-200 hover:shadow-xl hover:scale-[1.02] active:scale-95'
                    }
                `}
            >
                Confirmar Agendamento
            </button>
        </form>
      </div>
  );
}

export default function SchedulePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Carregando agendamento...</div>}>
            <PageBanner title="Agendamento" subtitle="Reserve seu momento" />
            <div className="container mx-auto px-4 py-16">
                <ScheduleForm />
            </div>
        </Suspense>
    );
}
