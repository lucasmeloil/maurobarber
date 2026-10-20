'use client';
import { useState, useEffect, Suspense } from 'react';
import { Calendar, Clock, User, Phone, Scissors } from 'lucide-react';
import { useApp } from '@/app/context/AppContext';
import { useToast } from '@/app/context/ToastContext';
import PageBanner from '../components/PageBanner';
import { useSearchParams } from 'next/navigation';

export const formatDurationDisplay = (val: string | number): string => {
    if (!val) return '30 min';
    const str = String(val).trim();
    if (/^\d+$/.test(str)) {
        const mins = parseInt(str);
        if (mins >= 60) {
            const h = Math.floor(mins / 60);
            const m = mins % 60;
            return m > 0 ? `${h}h ${m}min` : `${h}h`;
        }
        return `${str} min`;
    }
    return str;
};

export const calculateEndTime = (startTime: string, durationMins: number): string => {
    if (!startTime) return '';
    const [h, m] = startTime.split(':').map(Number);
    const totalStartMins = h * 60 + m;
    const totalEndMins = totalStartMins + durationMins;
    const endH = Math.floor(totalEndMins / 60) % 24;
    const endM = totalEndMins % 60;
    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
};

function ScheduleForm() {
    const { services, addAppointment, team, isSlotAvailable, getTotalDuration } = useApp();
    const searchParams = useSearchParams();
    const preSelectedBarberId = searchParams.get('barberId');

    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [selectedBarber, setSelectedBarber] = useState<string>('');

    const barbers = team.filter(m => m.role === 'barber');

    useEffect(() => {
        if (preSelectedBarberId) {
            setSelectedBarber(preSelectedBarberId);
        }
    }, [preSelectedBarberId]);

    const getTodayString = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getNextDays = () => {
        const days = [];
        const today = new Date();
        const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

        for (let i = 0; i < 7; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);

            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const dayNum = String(d.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${dayNum}`;

            let label = '';
            if (i === 0) label = 'Hoje';
            else if (i === 1) label = 'Amanhã';
            else label = `${daysOfWeek[d.getDay()]}, ${dayNum}/${month}`;

            days.push({
                dateStr,
                label,
                dayOfWeek: daysOfWeek[d.getDay()],
                dayNum,
                isToday: i === 0,
            });
        }
        return days;
    };

    const [formData, setFormData] = useState({
        nome: '',
        telefone: '',
        data: getTodayString(),
        hora: '',
        observacoes: ''
    });

    const [currentTime, setCurrentTime] = useState(new Date());

    // Sincroniza o relógio a cada 30 segundos para garantir precisão em tempo real
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 30000);
        return () => clearInterval(timer);
    }, []);

    const isSlotInPast = (dateStr: string, timeSlot: string): boolean => {
        if (!dateStr || !timeSlot) return false;
        const year = currentTime.getFullYear();
        const month = String(currentTime.getMonth() + 1).padStart(2, '0');
        const day = String(currentTime.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;

        // Se a data já for no passado
        if (dateStr < todayStr) return true;

        // Se a data for hoje, checa a hora e minuto atuais
        if (dateStr === todayStr) {
            const [slotHours, slotMinutes] = timeSlot.split(':').map(Number);
            const currentHours = currentTime.getHours();
            const currentMinutes = currentTime.getMinutes();

            if (slotHours < currentHours) return true;
            if (slotHours === currentHours && slotMinutes <= currentMinutes) return true;
        }

        return false;
    };

    const handleDateSelect = (dateStr: string) => {
        setFormData(prev => {
            const willBePast = prev.hora ? isSlotInPast(dateStr, prev.hora) : false;
            return {
                ...prev,
                data: dateStr,
                hora: willBePast ? '' : prev.hora
            };
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        if (e.target.name === 'data') {
            handleDateSelect(e.target.value);
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
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

    const totalDurationMinutes = getTotalDuration(selectedServices.join(','));
    const totalDurationText = formatDurationDisplay(totalDurationMinutes);
    const estimatedEndTime = calculateEndTime(formData.hora, totalDurationMinutes);

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

        if (isSlotInPast(formData.data, formData.hora)) {
            showToast('O horário selecionado já passou! Escolha outro horário.', 'error');
            setFormData(prev => ({ ...prev, hora: '' }));
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

        // Format date to DD/MM/YYYY for the WhatsApp message
        let formattedDate = formData.data;
        if (formData.data) {
            const parts = formData.data.split('-');
            if (parts.length === 3) {
                formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
            }
        }

        // Construct WhatsApp message with appointment details including duration and end time
        const message = `Olá! Gostaria de confirmar meu agendamento:\n\n` +
            `*Cliente:* ${formData.nome}\n` +
            `*Telefone:* ${formData.telefone}\n` +
            `*Serviço(s):* ${serviceName}\n` +
            `*Profissional:* ${barber ? barber.name : 'Qualquer Profissional'}\n` +
            `*Data:* ${formattedDate}\n` +
            `*Horário:* ${formData.hora} (término previsto às ${estimatedEndTime})\n` +
            `*Duração Estimada:* ${totalDurationMinutes} min\n` +
            `*Valor:* R$ ${totalPrice.toFixed(2)}\n` +
            (formData.observacoes.trim() ? `*Observações:* ${formData.observacoes.trim()}` : '');

        const whatsappUrl = `https://wa.me/557999914079?text=${encodeURIComponent(message)}`;

        showToast('Agendamento enviado com sucesso! Redirecionando para o WhatsApp...', 'success');

        // Clear form state
        setFormData({ nome: '', telefone: '', data: getTodayString(), hora: '', observacoes: '' });
        setSelectedServices([]);
        setSelectedBarber('');

        // Redirect to WhatsApp
        window.location.href = whatsappUrl;
    };

    // Horários disponíveis com horas e minutos: Manhã (08h às 11h30) e Tarde/Noite (14h às 19h30)
    const morningSlots = [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'
    ];

    const afternoonSlots = [
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
    ];

    const nextDays = getNextDays();

    const renderSlotButton = (time: string) => {
        const serviceId = selectedServices.join(',');
        const isPast = isSlotInPast(formData.data, time);
        const isConflict = !isSlotAvailable(formData.data, time, serviceId, selectedBarber);
        const available = !isPast && !isConflict;

        return (
            <button
                key={time}
                type="button"
                disabled={!available}
                onClick={() => setFormData({ ...formData, hora: time })}
                title={
                    isPast
                        ? 'Horário já expirado hoje'
                        : isConflict
                            ? 'Horário já ocupado na agenda'
                            : `Disponível às ${time} (término aprox. às ${calculateEndTime(time, totalDurationMinutes)})`
                }
                className={`
                    py-2.5 px-1 rounded-xl text-xs md:text-sm font-black transition-all border flex flex-col items-center justify-center
                    ${!available
                        ? 'bg-red-500/10 border-red-500/30 text-red-500/50 cursor-not-allowed line-through opacity-40'
                        : formData.hora === time
                            ? 'bg-white text-black border-white scale-105 shadow-xl ring-2 ring-white/50'
                            : 'bg-black border-gray-800 text-green-400 hover:border-green-400 hover:scale-[1.04]'
                    }
                `}
            >
                <span>{time}</span>
                {isPast && (
                    <span className="text-[9px] no-underline font-semibold tracking-tighter opacity-80 mt-0.5">
                        Já passou
                    </span>
                )}
                {!isPast && isConflict && (
                    <span className="text-[9px] no-underline font-semibold tracking-tighter opacity-80 mt-0.5">
                        Ocupado
                    </span>
                )}
            </button>
        );
    };

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
                                    className={`cursor-pointer border rounded-xl p-4 transition-all flex justify-between items-center ${
                                        isSelected
                                            ? 'bg-white text-black border-white'
                                            : 'bg-black border-gray-800 text-gray-400 hover:border-gray-600'
                                    }`}
                                >
                                    <div>
                                        <span className="font-bold block text-sm md:text-base">{s.name}</span>
                                        <span
                                            className={`text-xs flex items-center gap-1 mt-0.5 ${
                                                isSelected ? 'text-gray-700' : 'text-gray-500'
                                            }`}
                                        >
                                            <Clock size={12} /> {formatDurationDisplay(s.duration)}
                                        </span>
                                    </div>
                                    <span className={`font-bold ${isSelected ? 'text-black' : 'text-white'}`}>
                                        R$ {Number(s.price).toFixed(2)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    {selectedServices.length > 0 && (
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-white">
                            <div>
                                <span className="text-gray-400 text-xs block">Total Estimado:</span>
                                <span className="text-xl font-bold font-heading">R$ {totalPrice.toFixed(2)}</span>
                            </div>
                            <div className="sm:text-right">
                                <span className="text-gray-400 text-xs block">Tempo de Atendimento:</span>
                                <span className="text-sm font-bold text-yellow-400 flex items-center gap-1.5">
                                    <Clock size={14} /> {totalDurationText} ({totalDurationMinutes} min)
                                </span>
                            </div>
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
                                    className={`cursor-pointer border rounded-2xl p-4 flex flex-col items-center gap-3 transition-all transform ${
                                        selectedBarber === b.id
                                            ? 'bg-white text-black border-white scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                                            : 'bg-black border-gray-800 text-gray-500 hover:border-gray-600'
                                    }`}
                                >
                                    <div
                                        className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg ${
                                            selectedBarber === b.id ? 'bg-black text-white' : 'bg-gray-800 text-gray-400'
                                        }`}
                                    >
                                        {b.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <span className="font-bold text-sm text-center">{b.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-yellow-900/10 border border-yellow-900/30 p-4 rounded-xl text-center">
                        <p className="text-yellow-500 text-sm">
                            Nenhum barbeiro disponível no momento. Verifique o cadastro no Admin.
                        </p>
                    </div>
                )}

                <div>
                    <label className="block text-sm text-gray-400 mb-2 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Calendar size={16} className="text-white" /> Data do Agendamento
                        </span>
                        {formData.data && (
                            <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20 uppercase tracking-wider">
                                {new Date(formData.data + 'T00:00:00').toLocaleDateString('pt-BR', {
                                    weekday: 'short',
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                })}
                            </span>
                        )}
                    </label>

                    {/* Quick Selection Chips */}
                    <div className="flex gap-2 overflow-x-auto pb-3 mb-3 pt-1 scrollbar-thin">
                        {nextDays.map(item => {
                            const isSelected = formData.data === item.dateStr;
                            return (
                                <button
                                    key={item.dateStr}
                                    type="button"
                                    onClick={() => handleDateSelect(item.dateStr)}
                                    className={`flex-shrink-0 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center min-w-[80px] ${
                                        isSelected
                                            ? 'bg-white text-black border-white scale-105 shadow-lg'
                                            : 'bg-black border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white'
                                    }`}
                                >
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Full Styled Date Input */}
                    <div className="relative">
                        <input
                            type="date"
                            name="data"
                            min={getTodayString()}
                            value={formData.data}
                            onChange={handleChange}
                            style={{ colorScheme: 'dark' }}
                            className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3.5 text-white font-medium focus:outline-none focus:border-white transition-all cursor-pointer accent-white hover:border-gray-600 text-base"
                            required
                        />
                    </div>
                </div>

                {/* Time Grid Selection em Horas e Minutos */}
                {formData.data && selectedBarber && selectedServices.length > 0 ? (
                    <div className="animate-fade-in space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm text-gray-400 flex items-center gap-2">
                                <Clock size={16} /> Horários Disponíveis (Horas e Minutos)
                            </label>
                            <span className="text-xs text-gray-500">
                                Horário atual: {String(currentTime.getHours()).padStart(2, '0')}:
                                {String(currentTime.getMinutes()).padStart(2, '0')}
                            </span>
                        </div>

                        {/* Turno Manhã */}
                        <div>
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                                Turno Manhã
                            </span>
                            <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 gap-2.5">
                                {morningSlots.map(time => renderSlotButton(time))}
                            </div>
                        </div>

                        {/* Turno Tarde / Noite */}
                        <div>
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                                Turno Tarde / Noite
                            </span>
                            <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                                {afternoonSlots.map(time => renderSlotButton(time))}
                            </div>
                        </div>

                        {/* Alerta de Horário e Término Previsto em Horas e Minutos */}
                        {formData.hora && (
                            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3.5 mt-3 text-center">
                                <p className="text-green-400 text-sm font-bold flex flex-wrap items-center justify-center gap-2">
                                    <span>
                                        Início: <strong>{formData.hora}</strong>
                                    </span>
                                    <span>•</span>
                                    <span>
                                        Término previsto: <strong>{estimatedEndTime}</strong>
                                    </span>
                                    <span className="text-xs font-normal text-green-300">
                                        ({totalDurationMinutes} min de atendimento)
                                    </span>
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-white/5 rounded-2xl p-8 text-center text-gray-400 text-sm border border-dashed border-white/10">
                        {!selectedServices.length
                            ? 'Selecione os serviços para continuar.'
                            : !selectedBarber
                                ? 'Quase lá! Escolha o barbeiro.'
                                : 'Para finalizar, escolha a data desejada.'}
                    </div>
                )}

                <div>
                    <label className="block text-sm text-gray-400 mb-2 mt-4">Observações</label>
                    <textarea
                        name="observacoes"
                        value={formData.observacoes}
                        onChange={handleChange}
                        placeholder="Alguma preferência ou observação para o barbeiro?"
                        className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white transition-colors min-h-[100px]"
                    />
                </div>

                <button
                    type="submit"
                    disabled={
                        !formData.hora ||
                        !formData.data ||
                        !selectedBarber ||
                        selectedServices.length === 0 ||
                        isSlotInPast(formData.data, formData.hora)
                    }
                    className={`w-full font-bold py-4 rounded-lg transition-all text-lg mt-4 shadow-lg transform ${
                        !formData.hora ||
                        !formData.data ||
                        !selectedBarber ||
                        selectedServices.length === 0 ||
                        isSlotInPast(formData.data, formData.hora)
                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            : 'bg-white text-black hover:bg-gray-200 hover:shadow-xl hover:scale-[1.02] active:scale-95'
                    }`}
                >
                    Confirmar Agendamento
                </button>
            </form>
        </div>
    );
}

export default function SchedulePage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
                    Carregando agendamento...
                </div>
            }
        >
            <PageBanner title="Agendamento" subtitle="Reserve seu momento" />
            <div className="container mx-auto px-4 py-16">
                <ScheduleForm />
            </div>
        </Suspense>
    );
}
