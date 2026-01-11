'use client';

import { useState } from 'react';
import { useApp, Expense, CustomRevenue } from '@/app/context/AppContext';
import { 
    DollarSign, 
    ArrowUpCircle, 
    ArrowDownCircle, 
    TrendingUp, 
    Wallet, 
    Calendar, 
    Plus, 
    Trash2, 
    PieChart,
    Filter,
    ArrowRight,
    MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FinancePage() {
  const { 
    appointments, 
    customRevenues, 
    expenses, 
    addExpense, 
    deleteExpense,
    addCustomRevenue,
    deleteCustomRevenue,
    team
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'revenues' | 'expenses' | 'commissions'>('overview');
  const [dateFilter, setDateFilter] = useState<'all' | 'month' | 'today'>('month');

  // Modal States
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  
  // Forms
  const [newExpense, setNewExpense] = useState({ description: '', value: '', category: 'contas', date: new Date().toISOString().split('T')[0] });
  const [newRevenue, setNewRevenue] = useState({ description: '', value: '', date: new Date().toISOString().split('T')[0] });

  // Date Logic
  const today = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  const filterDate = (itemDate: string) => {
    if (dateFilter === 'all') return true;
    if (dateFilter === 'today') return itemDate === today;
    if (dateFilter === 'month') return itemDate.startsWith(currentMonth);
    return true;
  };

  // Calculations
  const completedAppointments = appointments.filter(a => a.status === 'completed' && filterDate(a.date));
  const filteredRevenues = customRevenues.filter(r => filterDate(r.date));
  const filteredExpenses = expenses.filter(e => filterDate(e.date));

  const totalApptRevenue = completedAppointments.reduce((acc, curr) => acc + (curr.price || 0), 0);
  const totalCustomRevenue = filteredRevenues.reduce((acc, curr) => acc + curr.value, 0);
  const totalExpenses = filteredExpenses.reduce((acc, curr) => acc + curr.value, 0);

  const totalRevenue = totalApptRevenue + totalCustomRevenue;
  const netProfit = totalRevenue - totalExpenses;

  // Handler Functions
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.description || !newExpense.value) return;
    await addExpense({
        description: newExpense.description,
        value: parseFloat(newExpense.value),
        category: newExpense.category,
        date: newExpense.date
    });
    setShowExpenseModal(false);
    setNewExpense({ description: '', value: '', category: 'contas', date: today });
  };

  const handleAddRevenue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRevenue.description || !newRevenue.value) return;
    await addCustomRevenue({
        description: newRevenue.description,
        value: parseFloat(newRevenue.value),
        date: newRevenue.date
    });
    setShowRevenueModal(false);
    setNewRevenue({ description: '', value: '', date: today });
  };

  // Commission Calculation logic
  const getBarberStats = () => {
      const stats: Record<string, { id: string, name: string, total: number, count: number, commissionRate: number, phone?: string }> = {};
      
      completedAppointments.forEach(app => {
          const bId = app.barberId || 'unknown';
          
          if (!stats[bId]) {
              // Find barber details including commission rate
              const barber = team.find(t => t.id === bId);
              stats[bId] = { 
                  id: bId,
                  name: barber?.name || app.barberName || 'Desconhecido', 
                  total: 0, 
                  count: 0,
                  commissionRate: barber?.commissionRate || 50, // Default to 50% if not set
                  phone: barber?.phone
              };
          }
          stats[bId].total += (app.price || 0);
          stats[bId].count += 1;
      });

      return Object.values(stats);
  };

  const sendWhatsAppReport = (stat: any) => {
      const barberShare = (stat.total * (stat.commissionRate / 100));
      const shopShare = stat.total - barberShare;
      
      const message = `*Relatório de Fechamento - Mauro Barber* 💈%0A%0A` +
                      `Olá *${stat.name}*, confira seu desempenho:${dateFilter === 'month' ? ' (Este Mês)' : dateFilter === 'today' ? ' (Hoje)' : ''}%0A%0A` +
                      `✅ Atendimentos: *${stat.count}*%0A` +
                      `💵 Faturamento Total: *R$ ${stat.total.toFixed(2)}*%0A` +
                      `📊 Sua Comissão (${stat.commissionRate}%): *R$ ${barberShare.toFixed(2)}*%0A` +
                      `🏢 Repasse Barbearia: *R$ ${shopShare.toFixed(2)}*%0A%0A` +
                      `_Gerado automaticamente pelo sistema._`;
      
      const whatsappUrl = `https://wa.me/${stat.phone?.replace(/\D/g, '') || ''}?text=${message}`;
      window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-8 pb-20 md:pb-0">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold font-heading text-white mb-2">Controle Financeiro</h1>
                <p className="text-gray-400">Fluxo de caixa, receitas e despesas.</p>
            </div>
            
            {/* Filter Toggle */}
            <div className="flex bg-[#111] p-1 rounded-xl border border-white/10">
                {(['all', 'month', 'today'] as const).map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setDateFilter(filter)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                            dateFilter === filter ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        {filter === 'all' ? 'Tudo' : filter === 'month' ? 'Este Mês' : 'Hoje'}
                    </button>
                ))}
            </div>
        </div>

        {/* Financial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#111] p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-gray-400 text-sm font-medium mb-1">Receita Total</p>
                        <h3 className="text-3xl font-bold text-white flex items-baseline gap-1">
                            R$ <span className="text-4xl">{totalRevenue.toFixed(2)}</span>
                        </h3>
                    </div>
                    <div className="bg-green-500/10 p-3 rounded-xl text-green-500">
                        <ArrowUpCircle size={24} />
                    </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/5 py-2 px-3 rounded-lg w-fit">
                    <TrendingUp size={14} /> +{(totalCustomRevenue > 0 ? (totalCustomRevenue / totalRevenue * 100).toFixed(0) : 0)}% Extra
                </div>
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-green-500/10 transition-colors"></div>
            </div>

            <div className="bg-[#111] p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-gray-400 text-sm font-medium mb-1">Despesas</p>
                        <h3 className="text-3xl font-bold text-white flex items-baseline gap-1">
                            R$ <span className="text-4xl">{totalExpenses.toFixed(2)}</span>
                        </h3>
                    </div>
                    <div className="bg-red-500/10 p-3 rounded-xl text-red-500">
                        <ArrowDownCircle size={24} />
                    </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/5 py-2 px-3 rounded-lg w-fit">
                    {expenses.length} registros
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-red-500/10 transition-colors"></div>
            </div>

            <div className="bg-[#111] p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-gray-400 text-sm font-medium mb-1">Lucro Líquido</p>
                        <h3 className={`text-3xl font-bold flex items-baseline gap-1 ${netProfit >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                            R$ <span className="text-4xl">{netProfit.toFixed(2)}</span>
                        </h3>
                    </div>
                    <div className="bg-blue-500/10 p-3 rounded-xl text-blue-500">
                        <Wallet size={24} />
                    </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-blue-400 bg-blue-500/5 py-2 px-3 rounded-lg w-fit">
                    Caixa Atual
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-blue-500/10 transition-colors"></div>
            </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto pb-2 gap-2 border-b border-white/10">
            {[
                { id: 'overview', label: 'Visão Geral', icon: PieChart },
                { id: 'revenues', label: 'Receitas', icon: ArrowUpCircle },
                { id: 'expenses', label: 'Despesas', icon: ArrowDownCircle },
                { id: 'commissions', label: 'Repasses Profissionais', icon: DollarSign }
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-bold whitespace-nowrap transition-colors relative ${
                        activeTab === tab.id 
                        ? 'text-white bg-white/5 border-b-2 border-[#d4af37]' 
                        : 'text-gray-500 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <tab.icon size={18} />
                    {tab.label}
                </button>
            ))}
        </div>

        {/* Content Sections */}
        <div className="min-h-[400px]">
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Recent Transactions Feed */}
                    <div className="col-span-1 md:col-span-2 space-y-4">
                        <h3 className="text-xl font-bold text-white mb-4">Movimentações Recentes</h3>
                        {[...filteredRevenues, ...filteredExpenses, ...completedAppointments.map(a => ({
                            id: a.id,
                            description: `Serviço: ${a.serviceName} - ${a.clientName}`,
                            value: a.price,
                            date: a.date,
                            type: 'appt'
                        }))]
                        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 10)
                        .map((item: any) => (
                            <div key={item.id} className="flex items-center justify-between p-4 bg-[#111] border border-white/5 rounded-xl hover:border-white/10 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-full ${
                                        item.category ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
                                    }`}>
                                        {item.category ? <ArrowDownCircle size={20} /> : <ArrowUpCircle size={20} />}
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{item.description}</p>
                                        <p className="text-xs text-gray-500">{item.date.split('-').reverse().join('/')}</p>
                                    </div>
                                </div>
                                <span className={`font-bold ${item.category ? 'text-red-400' : 'text-green-400'}`}>
                                    {item.category ? '-' : '+'} R$ {Number(item.value).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'revenues' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-white">Receitas avulsas e serviços</h3>
                        <button onClick={() => setShowRevenueModal(true)} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-all">
                            <Plus size={20} /> Nova Receita Extra
                        </button>
                    </div>
                    {/* List of mixed revenues */}
                    <div className="space-y-3">
                        {completedAppointments.length === 0 && filteredRevenues.length === 0 && (
                            <div className="text-center py-10 text-gray-500">Nenhuma receita registrada neste período.</div>
                        )}
                        {/* Custom Revenues */}
                        {filteredRevenues.map(rev => (
                             <div key={rev.id} className="flex items-center justify-between p-4 bg-[#111] border border-green-500/20 rounded-xl relative group">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-green-500/10 text-green-500 rounded-full"><DollarSign size={20}/></div>
                                    <div>
                                        <p className="text-white font-bold">{rev.description}</p>
                                        <p className="text-xs text-gray-500">Receita Extra • {rev.date.split('-').reverse().join('/')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-green-400 font-bold text-lg">+ R$ {rev.value.toFixed(2)}</span>
                                    <button onClick={() => deleteCustomRevenue(rev.id)} className="text-gray-600 hover:text-red-500 p-2"><Trash2 size={18}/></button>
                                </div>
                             </div>
                        ))}
                        {/* Appt Revenues */}
                        {completedAppointments.map(appt => (
                            <div key={appt.id} className="flex items-center justify-between p-4 bg-[#111] border border-white/5 rounded-xl opacity-80">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-500/10 text-blue-500 rounded-full"><Calendar size={20}/></div>
                                    <div>
                                        <p className="text-white font-medium">{appt.serviceName} - {appt.clientName}</p>
                                        <p className="text-xs text-gray-500">Agendamento • {appt.date.split('-').reverse().join('/')} • {appt.barberName || 'Barbearia'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-blue-400 font-bold text-lg">+ R$ {appt.price?.toFixed(2)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'expenses' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-white">Despesas da Barbearia</h3>
                        <button onClick={() => setShowExpenseModal(true)} className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-all">
                            <Plus size={20} /> Nova Despesa
                        </button>
                    </div>
                    <div className="space-y-3">
                         {filteredExpenses.length === 0 && (
                            <div className="text-center py-10 text-gray-500">Nenhuma despesa registrada neste período.</div>
                        )}
                        {filteredExpenses.map(exp => (
                             <div key={exp.id} className="flex items-center justify-between p-4 bg-[#111] border border-red-900/20 rounded-xl group hover:border-red-500/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-red-500/10 text-red-500 rounded-full"><ArrowDownCircle size={20}/></div>
                                    <div>
                                        <p className="text-white font-bold">{exp.description}</p>
                                        <p className="text-xs text-gray-500 capitalize">{exp.category} • {exp.date.split('-').reverse().join('/')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-red-400 font-bold text-lg">- R$ {exp.value.toFixed(2)}</span>
                                    <button onClick={() => deleteExpense(exp.id)} className="text-gray-600 hover:text-red-500 p-2"><Trash2 size={18}/></button>
                                </div>
                             </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'commissions' && (
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-white mb-4">Produção e Repasse por Profissional</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {getBarberStats().map((stat, idx) => (
                            <div key={idx} className="bg-[#111] p-6 rounded-2xl border border-white/5 flex flex-col gap-4 relative overflow-hidden">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-[#d4af37]/10 rounded-full flex items-center justify-center text-[#d4af37] font-bold text-xl border border-[#d4af37]/20">
                                        {stat.name.substring(0,2).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-white">{stat.name}</h4>
                                        <div className="text-sm text-gray-400">{stat.count} atendimentos</div>
                                    </div>
                                    <div className="ml-auto bg-white/5 px-2 py-1 rounded text-xs font-mono">
                                        {stat.commissionRate}%
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                        <span className="text-gray-400 text-sm">Faturamento Total</span>
                                        <span className="text-white font-bold">R$ {stat.total.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-green-500/10 p-3 rounded-xl border border-green-500/20">
                                        <span className="text-gray-400 text-sm">Comissão ({stat.commissionRate}%)</span>
                                        <span className="text-green-400 font-bold">R$ {(stat.total * (stat.commissionRate / 100)).toFixed(2)}</span>
                                    </div>
                                     <div className="flex justify-between items-center bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
                                        <span className="text-gray-400 text-sm">Barbearia</span>
                                        <span className="text-blue-400 font-bold">R$ {(stat.total - (stat.total * (stat.commissionRate / 100))).toFixed(2)}</span>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => sendWhatsAppReport(stat)}
                                    className="mt-2 w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                                >
                                    <MessageCircle size={18} /> Relatório WhatsApp
                                </button>
                            </div>
                        ))}
                         {getBarberStats().length === 0 && (
                            <div className="col-span-3 text-center py-10 text-gray-500">Sem dados de produção para o período selecionado.</div>
                        )}
                    </div>
                </div>
            )}
        </div>

        {/* MODALS */}
        <AnimatePresence>
            {showExpenseModal && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-sm">
                        <h2 className="text-xl font-bold text-white mb-4">Adicionar Despesa</h2>
                        <form onSubmit={handleAddExpense} className="space-y-4">
                            <input className="w-full bg-black border border-white/20 p-3 rounded-xl text-white outline-none" placeholder="Descrição (ex: Conta de Luz)" value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} autoFocus required />
                            <input className="w-full bg-black border border-white/20 p-3 rounded-xl text-white outline-none" type="number" placeholder="Valor (R$)" value={newExpense.value} onChange={e => setNewExpense({...newExpense, value: e.target.value})} required />
                            <select className="w-full bg-black border border-white/20 p-3 rounded-xl text-white outline-none" value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})}>
                                <option value="contas">Contas / Fixas</option>
                                <option value="estoque">Estoque / Produtos</option>
                                <option value="manutencao">Manutenção</option>
                                <option value="marketing">Marketing</option>
                                <option value="pessoal">Pessoal / Salários</option>
                                <option value="outros">Outros</option>
                            </select>
                            <input className="w-full bg-black border border-white/20 p-3 rounded-xl text-white outline-none" type="date" value={newExpense.date} onChange={e => setNewExpense({...newExpense, date: e.target.value})} required />
                            <div className="flex gap-2 pt-2">
                                <button type="button" onClick={() => setShowExpenseModal(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl">Cancelar</button>
                                <button type="submit" className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl">Salvar</button>
                            </div>
                        </form>
                    </motion.div>
                 </div>
            )}

            {showRevenueModal && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-sm">
                        <h2 className="text-xl font-bold text-white mb-4">Adicionar Receita Extra</h2>
                        <form onSubmit={handleAddRevenue} className="space-y-4">
                            <input className="w-full bg-black border border-white/20 p-3 rounded-xl text-white outline-none" placeholder="Descrição (ex: Venda de Boné)" value={newRevenue.description} onChange={e => setNewRevenue({...newRevenue, description: e.target.value})} autoFocus required />
                            <input className="w-full bg-black border border-white/20 p-3 rounded-xl text-white outline-none" type="number" placeholder="Valor (R$)" value={newRevenue.value} onChange={e => setNewRevenue({...newRevenue, value: e.target.value})} required />
                            <input className="w-full bg-black border border-white/20 p-3 rounded-xl text-white outline-none" type="date" value={newRevenue.date} onChange={e => setNewRevenue({...newRevenue, date: e.target.value})} required />
                            <div className="flex gap-2 pt-2">
                                <button type="button" onClick={() => setShowRevenueModal(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl">Cancelar</button>
                                <button type="submit" className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl">Salvar</button>
                            </div>
                        </form>
                    </motion.div>
                 </div>
            )}
        </AnimatePresence>
    </div>
  );
}
