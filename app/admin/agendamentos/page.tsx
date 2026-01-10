'use client';
import { useState } from 'react';
import { useApp, Appointment } from '@/app/context/AppContext';
import { useToast } from '@/app/context/ToastContext';
import { Check, X, Clock, MessageCircle, MoreVertical, Edit2, Trash2, CalendarCheck, UserX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AppointmentsAdminPage() {
  const { appointments, updateAppointmentStatus, updateAppointment, deleteAppointment, services } = useApp();
  const { showToast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Appointment>>({});

  const handleConfirm = (id: string, phone: string, name: string, date: string, time: string) => {
    updateAppointmentStatus(id, 'confirmed');
    showToast('Agendamento confirmado!', 'success');
    
    // Simulate Notification / WhatsApp message
    const message = `Olá *${name}*!%0ASeu agendamento na Mauro Barber para *${date}* às *${time}* foi CONFIRMADO.%0ATe esperamos! 💈`;
    if(confirm('Confirmar agendamento e notificar cliente via WhatsApp?')) {
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    }
  };

  const handleChangeStatus = (id: string, status: Appointment['status']) => {
    updateAppointmentStatus(id, status);
    const msg = status === 'completed' ? 'Marcao como Comparecido' : status === 'noshow' ? 'Marcado como Não Veio' : 'Status atualizado';
    showToast(msg, status === 'noshow' ? 'error' : 'success');
  };

  const handleDelete = (id: string) => {
    if(confirm('Tem certeza que deseja excluir permanentemente este agendamento?')) {
        deleteAppointment(id);
        showToast('Agendamento excluído.', 'error');
    }
  };

  const startEdit = (appt: Appointment) => {
    setEditingId(appt.id);
    setEditForm(appt);
  };

  const saveEdit = () => {
    if(editingId && editForm) {
        updateAppointment(editingId, editForm);
        setEditingId(null);
        showToast('Agendamento atualizado!', 'success');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-heading">Gerenciar Agendamentos</h1>
        <div className="text-gray-400">Total: {appointments.length}</div>
      </div>

      <div className="grid gap-4">
        {appointments.length === 0 ? (
            <p className="text-gray-500">Nenhum agendamento registrado ainda.</p>
        ) : (
            appointments.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(appt => (
                <motion.div 
                    key={appt.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-[#111] border p-6 rounded-xl flex flex-col gap-4 relative overflow-hidden transition-colors ${
                        appt.status === 'confirmed' ? 'border-[#25D366]/30' : 
                        appt.status === 'cancelled' ? 'border-red-900/30 opacity-60' : 
                        appt.status === 'completed' ? 'border-blue-500/30' :
                        appt.status === 'noshow' ? 'border-orange-500/30 opacity-60' :
                        'border-white/10'
                    }`}
                >
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4 flex gap-2">
                         <span className={`text-xs px-2 py-1 rounded-full border font-bold uppercase tracking-wider ${
                            appt.status === 'confirmed' ? 'border-green-500 text-green-500 bg-green-500/10' :
                            appt.status === 'cancelled' ? 'border-red-500 text-red-500 bg-red-500/10' :
                            appt.status === 'completed' ? 'border-blue-500 text-blue-500 bg-blue-500/10' :
                            appt.status === 'noshow' ? 'border-orange-500 text-orange-500 bg-orange-500/10' :
                            'border-yellow-500 text-yellow-500 bg-yellow-500/10'
                        }`}>
                            {appt.status === 'pending' ? 'Pendente' : 
                             appt.status === 'confirmed' ? 'Confirmado' : 
                             appt.status === 'completed' ? 'Compareceu' :
                             appt.status === 'noshow' ? 'Não Veio' :
                             'Cancelado'}
                        </span>
                    </div>

                    {/* Edit Mode */}
                    {editingId === appt.id ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/50 p-4 rounded-lg border border-white/5">
                            <input 
                                className="bg-black border border-white/20 p-2 rounded text-white" 
                                value={editForm.clientName} 
                                onChange={e => setEditForm({...editForm, clientName: e.target.value})}
                                placeholder="Nome do Cliente"
                            />
                            <input 
                                className="bg-black border border-white/20 p-2 rounded text-white" 
                                value={editForm.phone} 
                                onChange={e => setEditForm({...editForm, phone: e.target.value})}
                                placeholder="Telefone"
                            />
                            <div className="flex gap-2">
                                <input 
                                    className="bg-black border border-white/20 p-2 rounded text-white flex-1" 
                                    type="date"
                                    value={editForm.date} 
                                    onChange={e => setEditForm({...editForm, date: e.target.value})}
                                />
                                <input 
                                    className="bg-black border border-white/20 p-2 rounded text-white w-24" 
                                    type="time"
                                    value={editForm.time} 
                                    onChange={e => setEditForm({...editForm, time: e.target.value})}
                                />
                            </div>
                            <div className="flex gap-2 justify-end mt-2 md:mt-0 col-span-1 md:col-span-2">
                                <button onClick={() => setEditingId(null)} className="px-4 py-2 text-gray-400 hover:text-white text-sm">Cancelar</button>
                                <button onClick={saveEdit} className="bg-green-600 px-4 py-2 rounded text-white text-sm hover:bg-green-500">Salvar Alterações</button>
                            </div>
                        </div>
                    ) : (
                        /* Display Mode */
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                             <div>
                                <h3 className="font-bold text-xl text-white mb-1">{appt.clientName}</h3>
                                <div className="flex flex-col gap-1">
                                    <p className="text-gray-400 text-sm flex items-center gap-2">
                                        <Clock size={14} className="text-[#d4af37]" /> {appt.date} às <span className="text-white font-bold">{appt.time}</span>
                                    </p>
                                    <p className="text-gray-400 text-sm flex items-center gap-2">
                                         <span className="w-3.5 h-3.5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">✂</span> 
                                         {appt.serviceName}
                                    </p>
                                    <p className="text-gray-500 text-xs mt-1">Tel: {appt.phone}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                                {/* Actions based on status */}
                                {appt.status === 'pending' && (
                                    <>
                                        <button onClick={() => handleConfirm(appt.id, appt.phone, appt.clientName, appt.date, appt.time)} className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-lg" title="Confirmar">
                                            <Check size={18} />
                                        </button>
                                        <button onClick={() => handleChangeStatus(appt.id, 'cancelled')} className="bg-red-900/30 hover:bg-red-900/50 text-red-400 p-2 rounded-lg" title="Cancelar">
                                            <X size={18} />
                                        </button>
                                    </>
                                )}

                                {appt.status === 'confirmed' && (
                                    <>
                                        <button onClick={() => handleChangeStatus(appt.id, 'completed')} className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg flex items-center gap-2 text-sm px-3" title="Marcar como Comparecido">
                                            <CalendarCheck size={16} /> <span className="hidden md:inline">Compareceu</span>
                                        </button>
                                        <button onClick={() => handleChangeStatus(appt.id, 'noshow')} className="bg-orange-600/30 hover:bg-orange-600/50 text-orange-400 p-2 rounded-lg flex items-center gap-2 text-sm px-3" title="Não Veio">
                                            <UserX size={16} /> <span className="hidden md:inline">Não Veio</span>
                                        </button>
                                    </>
                                )}

                                <div className="w-px h-8 bg-white/10 mx-2 hidden md:block"></div>
                                
                                <button onClick={() => startEdit(appt)} className="text-gray-500 hover:text-white p-2 hover:bg-white/5 rounded-lg transition-colors">
                                    <Edit2 size={18} />
                                </button>
                                <button onClick={() => handleDelete(appt.id)} className="text-red-900 hover:text-red-500 p-2 hover:bg-red-900/10 rounded-lg transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            ))
        )}
      </div>
    </div>
  );
}
