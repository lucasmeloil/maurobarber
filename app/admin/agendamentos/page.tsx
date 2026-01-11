'use client';
import { useState } from 'react';
import { useApp, Appointment, Product } from '@/app/context/AppContext';
import { useToast } from '@/app/context/ToastContext';
import { Check, X, Clock, Edit2, Trash2, CalendarCheck, UserX, Plus, DollarSign, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AppointmentsAdminPage() {
  const { appointments, products, updateAppointmentStatus, updateAppointment, deleteAppointment, services, addAppointment, isSlotAvailable } = useApp();
  const { showToast } = useToast();
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Appointment>>({});

  const [newAppt, setNewAppt] = useState({
    clientName: '',
    phone: '',
    date: '',
    time: '',
    serviceId: '',
    serviceName: '',
    price: 0
  });

  // Invoice Modal State
  const [invoicingId, setInvoicingId] = useState<string | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<{ product: Product, qty: number }[]>([]);
  const [currentAppt, setCurrentAppt] = useState<Appointment | null>(null);

  const handleCreate = async () => {
    if(!newAppt.clientName || !newAppt.phone || !newAppt.date || !newAppt.time || !newAppt.serviceId) {
        showToast('Preencha todos os campos!', 'error');
        return;
    }

    if(!isSlotAvailable(newAppt.date, newAppt.time)) {
        showToast('Horário indisponível!', 'error');
        return;
    }

    const success = await addAppointment({
        clientName: newAppt.clientName,
        phone: newAppt.phone,
        serviceId: newAppt.serviceId,
        serviceName: newAppt.serviceName,
        date: newAppt.date,
        time: newAppt.time,
        price: newAppt.price
    });

    if(success) {
        showToast('Agendamento criado com sucesso!', 'success');
        setIsCreating(false);
        setNewAppt({ clientName: '', phone: '', date: '', time: '', serviceId: '', serviceName: '', price: 0 });
    } else {
        showToast('Erro ao criar agendamento.', 'error');
    }
  };

  const handleConfirm = async (id: string, phone: string, name: string, date: string, time: string) => {
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
    const msg = status === 'completed' ? 'Marcado como Comparecido' : status === 'noshow' ? 'Marcado como Não Veio' : 'Status atualizado';
    showToast(msg, status === 'noshow' ? 'error' : 'success');
  };

  const handleDelete = (id: string) => {
    if(confirm('Tem certeza que deseja excluir permanentemente este agendamento?')) {
        deleteAppointment(id);
        showToast('Agendamento excluído.', 'error');
    }
  };

  // Editing Logic
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

  // Invoicing Logic
  const openInvoiceModal = (appt: Appointment) => {
    setInvoicingId(appt.id);
    setCurrentAppt(appt);
    setInvoiceItems([]);
  };

  const addProductToInvoice = (product: Product) => {
    setInvoiceItems(prev => {
        const existing = prev.find(item => item.product.id === product.id);
        if(existing) {
            return prev.map(item => item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item);
        }
        return [...prev, { product, qty: 1 }];
    });
  };

  const removeProductFromInvoice = (productId: string) => {
    setInvoiceItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const finalizeInvoice = () => {
    if(!currentAppt) return;

    const productsTotal = invoiceItems.reduce((acc, item) => acc + (item.product.price * item.qty), 0);
    const finalPrice = (currentAppt.price || 0) + productsTotal;
    
    // Update appointment with completed status, final price, and consumed products
    updateAppointment(currentAppt.id, {
        status: 'completed',
        price: finalPrice,
        products: invoiceItems.map(i => ({ 
            id: i.product.id, 
            name: i.product.name, 
            price: i.product.price, 
            quantity: i.qty 
        }))
    });

    showToast(`Fatura finalizada: R$ ${finalPrice.toFixed(2)}`, 'success');
    setInvoicingId(null);
    setCurrentAppt(null);
    setInvoiceItems([]);
  };

  const calculateTotal = () => {
    if(!currentAppt) return 0;
    const productsTotal = invoiceItems.reduce((acc, item) => acc + (item.product.price * item.qty), 0);
    return (currentAppt.price || 0) + productsTotal;
  };

  return (
    <div className="relative pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
        <div>
            <h1 className="text-2xl md:text-3xl font-bold font-heading">Gerenciar Agendamentos</h1>
            <div className="text-gray-400 text-sm md:text-base">Total: {appointments.length}</div>
        </div>
        
        <button 
            onClick={() => setIsCreating(true)}
            className="w-full md:w-auto bg-white text-black px-6 py-3 md:py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors font-bold shadow-lg active:scale-95"
        >
            <Plus size={20}/>
            Novo Agendamento
        </button>
      </div>

      {isCreating && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#111] border border-white/10 w-full max-w-md rounded-2xl p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold font-heading">Novo Agendamento</h2>
                    <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-white p-2"><X size={24}/></button>
                </div>
                
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 ml-1">Cliente</label>
                        <input 
                            className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-[#d4af37] outline-none transition-colors"
                            placeholder="Nome Completo"
                            value={newAppt.clientName}
                            onChange={e => setNewAppt({...newAppt, clientName: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 ml-1">Contato</label>
                        <input 
                            className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-[#d4af37] outline-none transition-colors"
                            placeholder="Telefone (apenas números)"
                            value={newAppt.phone}
                            onChange={e => setNewAppt({...newAppt, phone: e.target.value})}
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 ml-1">Data</label>
                            <input 
                                type="date"
                                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-[#d4af37] outline-none transition-colors"
                                value={newAppt.date}
                                onChange={e => setNewAppt({...newAppt, date: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 ml-1">Hora</label>
                            <input 
                                type="time"
                                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-[#d4af37] outline-none transition-colors"
                                value={newAppt.time}
                                onChange={e => setNewAppt({...newAppt, time: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                         <label className="text-sm text-gray-400 ml-1">Serviço</label>
                         <select 
                            className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-[#d4af37] outline-none transition-colors appearance-none"
                            value={newAppt.serviceId}
                            onChange={e => {
                                const svc = services.find(s => s.id === e.target.value);
                                if(svc) setNewAppt({...newAppt, serviceId: svc.id, serviceName: svc.name, price: svc.price});
                            }}
                        >
                            <option value="">Selecione...</option>
                            {services.map(s => (
                                <option key={s.id} value={s.id}>{s.name} - R$ {s.price}</option>
                            ))}
                        </select>
                    </div>

                    <button 
                        onClick={handleCreate}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl mt-6 shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all"
                    >
                        Criar Agendamento
                    </button>
                </div>
            </div>
        </div>
      )}

      <div className="grid gap-4 z-0 relative">
        {appointments.length === 0 ? (
            <div className="text-center py-20 bg-[#111] rounded-2xl border border-white/5">
                <p className="text-gray-500 text-lg">Nenhum agendamento registrado ainda.</p>
            </div>
        ) : (
            appointments.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(appt => (
                <motion.div 
                    key={appt.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-[#111] border p-5 md:p-6 rounded-2xl flex flex-col gap-4 relative overflow-hidden transition-all shadow-lg ${
                        appt.status === 'confirmed' ? 'border-[#25D366]/30 shadow-[#25D366]/5' : 
                        appt.status === 'cancelled' ? 'border-red-900/30 opacity-70' : 
                        appt.status === 'completed' ? 'border-blue-500/30 opacity-90' :
                        appt.status === 'noshow' ? 'border-orange-500/30 opacity-70' :
                        'border-white/10'
                    }`}
                >
                    {/* Status Badge - Top Right */}
                    <div className="absolute top-4 right-4 z-10">
                         <span className={`text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-full border uppercase tracking-wider ${
                            appt.status === 'confirmed' ? 'border-green-500/50 text-green-400 bg-green-500/10' :
                            appt.status === 'cancelled' ? 'border-red-500/50 text-red-500 bg-red-500/10' :
                            appt.status === 'completed' ? 'border-blue-500/50 text-blue-400 bg-blue-500/10' :
                            appt.status === 'noshow' ? 'border-orange-500/50 text-orange-500 bg-orange-500/10' :
                            'border-yellow-500/50 text-yellow-500 bg-yellow-500/10'
                        }`}>
                            {appt.status === 'pending' ? 'Pendente' : 
                             appt.status === 'confirmed' ? 'Confirmado' : 
                             appt.status === 'completed' ? 'Finalizado' :
                             appt.status === 'noshow' ? 'Não Veio' :
                             'Cancelado'}
                        </span>
                    </div>

                    {/* Edit Mode */}
                    {editingId === appt.id ? (
                        <div className="grid grid-cols-1 gap-4 bg-black/50 p-4 rounded-xl border border-white/5 mt-8 md:mt-0">
                            <input 
                                className="bg-black border border-white/20 p-3 rounded-lg text-white w-full" 
                                value={editForm.clientName} 
                                onChange={e => setEditForm({...editForm, clientName: e.target.value})}
                                placeholder="Nome do Cliente"
                            />
                            <input 
                                className="bg-black border border-white/20 p-3 rounded-lg text-white w-full" 
                                value={editForm.phone} 
                                onChange={e => setEditForm({...editForm, phone: e.target.value})}
                                placeholder="Telefone"
                            />
                             <div className="grid grid-cols-2 gap-3">
                                <input 
                                    className="bg-black border border-white/20 p-3 rounded-lg text-white" 
                                    type="date"
                                    value={editForm.date} 
                                    onChange={e => setEditForm({...editForm, date: e.target.value})}
                                />
                                <input 
                                    className="bg-black border border-white/20 p-3 rounded-lg text-white" 
                                    type="time"
                                    value={editForm.time} 
                                    onChange={e => setEditForm({...editForm, time: e.target.value})}
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setEditingId(null)} className="flex-1 py-3 text-gray-400 hover:text-white bg-white/5 rounded-lg border border-white/10">Cancelar</button>
                                <button onClick={saveEdit} className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg">Salvar</button>
                            </div>
                        </div>
                    ) : (
                        /* Display Mode */
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pt-2">
                             <div className="flex-1 w-full">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-bold text-2xl text-white">{appt.clientName}</h3>
                                </div>
                                
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/5 w-full md:w-auto">
                                        <Clock size={20} className="text-[#d4af37]" /> 
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-400 uppercase tracking-widest">Data e Hora</span>
                                            <div className="text-white font-bold text-lg leading-none">
                                                {appt.date.split('-').reverse().join('/')} <span className="text-gray-500 mx-1">|</span> {appt.time}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-400">
                                        <span className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-white/30"></span>
                                            {appt.serviceName}
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-green-500/50"></span>
                                            R$ {appt.price?.toFixed(2)}
                                        </span>
                                         <span className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-blue-500/50"></span>
                                            {appt.phone}
                                        </span>
                                    </div>

                                    {appt.products && appt.products.length > 0 && (
                                        <div className="mt-2 text-xs text-gray-400 bg-white/5 p-3 rounded-lg border border-white/5">
                                            <strong className="text-white block mb-2">Consumo Extra:</strong>
                                            {appt.products.map((p, idx) => (
                                                <div key={idx} className="flex justify-between py-1 border-b border-white/5 last:border-0">
                                                    <span>{p.quantity}x {p.name}</span>
                                                    <span className="text-white">R$ {(p.price * p.quantity).toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions Bar */}
                            <div className="w-full md:w-auto flex flex-col gap-3">
                                <div className="grid grid-cols-2 md:grid-flow-col gap-3">
                                    {appt.status === 'pending' && (
                                        <>
                                            <button onClick={() => handleConfirm(appt.id, appt.phone, appt.clientName, appt.date, appt.time)} className="bg-green-600/90 hover:bg-green-600 text-white p-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-lg shadow-green-900/20" title="Confirmar">
                                                <Check size={20} /> <span className="font-bold">Confirmar</span>
                                            </button>
                                            <button onClick={() => handleChangeStatus(appt.id, 'cancelled')} className="bg-red-900/40 hover:bg-red-900/60 text-red-200 p-3 rounded-xl flex items-center justify-center gap-2 transition-all border border-red-500/20" title="Cancelar">
                                                <X size={20} /> <span className="font-medium">Cancelar</span>
                                            </button>
                                        </>
                                    )}

                                    {appt.status === 'confirmed' && (
                                        <>
                                            <button onClick={() => openInvoiceModal(appt)} className="col-span-2 bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-xl flex items-center justify-center gap-3 font-bold shadow-lg shadow-blue-900/20 transition-all hover:scale-[1.02]" title="Finalizar Venda">
                                                <DollarSign size={20} /> Finalizar Venda
                                            </button>
                                            <button onClick={() => handleChangeStatus(appt.id, 'noshow')} className="bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-500/20 p-3 rounded-xl flex items-center justify-center gap-2" title="Não Veio">
                                                <UserX size={18} /> <span className="font-medium">Não Veio</span>
                                            </button>
                                        </>
                                    )}
                                    
                                    {/* Action Secondary Buttons */}
                                    {(appt.status === 'confirmed' || appt.status === 'pending') && (
                                        <div className="col-span-2 md:col-span-1 flex gap-3">
                                             <button onClick={() => startEdit(appt)} className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 p-3 rounded-xl flex items-center justify-center">
                                                <Edit2 size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(appt.id)} className="flex-1 bg-red-900/10 hover:bg-red-900/20 text-red-500 border border-red-500/10 p-3 rounded-xl flex items-center justify-center">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    )}

                                    {/* Simplified View for Past/Cancelled */}
                                    {(appt.status === 'completed' || appt.status === 'cancelled' || appt.status === 'noshow') && (
                                         <button onClick={() => handleDelete(appt.id)} className="col-span-2 bg-white/5 hover:bg-red-900/20 text-gray-500 hover:text-red-500 border border-white/5 p-3 rounded-xl flex items-center justify-center gap-2 w-full transition-colors">
                                            <Trash2 size={18} /> Excluir Registro
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            ))
        )}
      </div>

      {/* INVOICE MODAL (Keep as is just ensuring z-index) */}
      <AnimatePresence>
        {invoicingId && currentAppt && (
            <div className="fixed inset-0 z-[60] flex items-center justify-end md:justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm">
                <motion.div 
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '100%', opacity: 0 }}
                    className="bg-[#111] border-t md:border border-white/10 w-full md:max-w-2xl h-[90vh] md:h-auto md:rounded-2xl rounded-t-3xl shadow-2xl p-6 flex flex-col"
                >
                    <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                        <h2 className="text-2xl font-bold font-heading">Faturar Atendimento</h2>
                        <button onClick={() => setInvoicingId(null)} className="text-gray-400 hover:text-white bg-white/10 p-2 rounded-full"><X size={20}/></button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {/* Summary Section */}
                        <div className="bg-white/5 p-5 rounded-2xl mb-6 border border-white/5">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Resumo do Serviço</h3>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-lg text-white">{currentAppt.serviceName}</span>
                                <span className="text-xl font-bold text-green-400">R$ {currentAppt.price?.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                                <UserX size={14}/> {currentAppt.clientName}
                            </div>
                        </div>

                        {/* Add Products Section */}
                        <div className="mb-6">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Adicionar Consumíveis / Produtos</h3>
                            
                            {/* Product List Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                {products.map(prod => (
                                    <button 
                                        key={prod.id}
                                        onClick={() => addProductToInvoice(prod)}
                                        className="bg-black border border-white/10 hover:border-[#d4af37] p-4 rounded-xl text-left transition-all active:scale-95 group relative overflow-hidden"
                                    >
                                        <div className="relative z-10">
                                            <div className="font-bold text-white group-hover:text-[#d4af37] transition-colors">{prod.name}</div>
                                            <div className="text-sm text-gray-500 mt-1">R$ {prod.price.toFixed(2)}</div>
                                        </div>
                                        <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity text-[#d4af37]">
                                            <Plus size={16} />
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Cart / Selected Items */}
                            {invoiceItems.length > 0 && (
                                <div className="space-y-3 mt-4 bg-[#1a1a1a] p-5 rounded-2xl border border-white/5">
                                    <h4 className="text-sm font-bold text-gray-300 mb-2">Itens Adicionados</h4>
                                    {invoiceItems.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-sm border-b border-white/5 last:border-0 pb-2 last:pb-0">
                                            <div className="flex items-center gap-4">
                                                <button onClick={() => removeProductFromInvoice(item.product.id)} className="text-red-500 bg-red-500/10 p-1.5 rounded-lg hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={14}/></button>
                                                <span className="text-white font-medium">{item.qty}x {item.product.name}</span>
                                            </div>
                                            <span className="text-gray-400 font-medium">R$ {(item.product.price * item.qty).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Total & Action Footer */}
                    <div className="pt-6 border-t border-white/10 mt-2 bg-[#111] pb-safe">
                        <div className="flex justify-between items-end mb-6">
                            <div className="flex flex-col">
                                <span className="text-gray-500 text-sm mb-1">Valor Total</span>
                                <span className="text-3xl font-bold text-white">R$ {calculateTotal().toFixed(2)}</span>
                            </div>
                        </div>
                        <button 
                            onClick={finalizeInvoice}
                            className="w-full bg-[#d4af37] hover:bg-[#b5952f] text-black font-bold py-4 rounded-xl flex items-center justify-center gap-3 text-lg shadow-lg shadow-yellow-900/20 transition-all hover:scale-[1.02] active:scale-95"
                        >
                            <Check size={24} strokeWidth={3} />
                            CONFIRMAR E FATURAR
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
}
