'use client';

import { useApp } from '@/app/context/AppContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { BadgeDollarSign, CalendarCheck, Users, TrendingUp, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function DashboardPage() {
  const { appointments, customRevenues, addCustomRevenue, deleteCustomRevenue } = useApp();
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [revenueForm, setRevenueForm] = useState({ description: '', value: '', date: new Date().toISOString().split('T')[0] });

  // Calculate Metrics
  const metrics = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const completedAppts = appointments.filter(a => a.status === 'completed');

    const calculateTotalRevenue = (appts: typeof appointments, revenues: typeof customRevenues) => {
        const apptRevenue = appts.reduce((acc, curr) => acc + (curr.price || 0), 0);
        const customRev = revenues.reduce((acc, curr) => acc + curr.value, 0);
        return apptRevenue + customRev;
    };

    // Filter Custom Revenues by Date Range
    const getRevenuesByDate = (dateFilter: (d: Date) => boolean) => {
        return customRevenues.filter(r => dateFilter(new Date(r.date + 'T00:00:00')));
    };

    const dailyRevenue = calculateTotalRevenue(
        completedAppts.filter(a => new Date(a.date + 'T00:00:00') >= startOfDay),
        getRevenuesByDate(d => d >= startOfDay)
    );

    const weeklyRevenue = calculateTotalRevenue(
        completedAppts.filter(a => new Date(a.date + 'T00:00:00') >= startOfWeek),
        getRevenuesByDate(d => d >= startOfWeek)
    );

    const monthlyRevenue = calculateTotalRevenue(
        completedAppts.filter(a => new Date(a.date + 'T00:00:00') >= startOfMonth),
        getRevenuesByDate(d => d >= startOfMonth)
    );
    
    // Group by Day for Chart (Last 7 Days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    }).reverse();

    const chartData = last7Days.map(date => {
        const dayAppts = completedAppts.filter(a => a.date === date);
        const dayRevenues = customRevenues.filter(r => r.date === date);
        
        const dayTotal = calculateTotalRevenue(dayAppts, dayRevenues);

        return {
            name: new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }),
            faturamento: dayTotal,
            atendimentos: dayAppts.length
        };
    });

    return {
        dailyRevenue,
        weeklyRevenue,
        monthlyRevenue,
        totalAppointments: appointments.length,
        pendingAppointments: appointments.filter(a => a.status === 'pending').length,
        completedAppointments: completedAppts.length,
        chartData
    };
  }, [appointments, customRevenues]);

  const handleAddRevenue = (e: React.FormEvent) => {
      e.preventDefault();
      addCustomRevenue({
          description: revenueForm.description,
          value: Number(revenueForm.value),
          date: revenueForm.date
      });
      setShowRevenueModal(false);
      setRevenueForm({ description: '', value: '', date: new Date().toISOString().split('T')[0] });
  };

  return (
    <div className="space-y-8 relative">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-400">Visão geral financeira e operacional</p>
        </div>
        <button 
            onClick={() => setShowRevenueModal(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
            <Plus size={18} /> Novo Faturamento Manual
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#111] p-6 rounded-2xl border border-white/5 flex items-center justify-between">
            <div>
                <p className="text-gray-400 text-sm mb-1">Faturamento Diário</p>
                <h3 className="text-2xl font-bold text-white">R$ {metrics.dailyRevenue.toFixed(2)}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                <BadgeDollarSign />
            </div>
        </div>
        <div className="bg-[#111] p-6 rounded-2xl border border-white/5 flex items-center justify-between">
            <div>
                <p className="text-gray-400 text-sm mb-1">Faturamento Semanal</p>
                <h3 className="text-2xl font-bold text-white">R$ {metrics.weeklyRevenue.toFixed(2)}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                <TrendingUp />
            </div>
        </div>
        <div className="bg-[#111] p-6 rounded-2xl border border-white/5 flex items-center justify-between">
            <div>
                <p className="text-gray-400 text-sm mb-1">Faturamento Mensal</p>
                <h3 className="text-2xl font-bold text-white">R$ {metrics.monthlyRevenue.toFixed(2)}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500">
                <Users />
            </div>
        </div>
        <div className="bg-[#111] p-6 rounded-2xl border border-white/5 flex items-center justify-between">
            <div>
                <p className="text-gray-400 text-sm mb-1">Total Atendimentos</p>
                <h3 className="text-2xl font-bold text-white">{metrics.completedAppointments}</h3>
                <p className="text-xs text-orange-400 mt-1">{metrics.pendingAppointments} pendentes</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500">
                <CalendarCheck />
            </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <div className="bg-[#111] p-6 rounded-2xl border border-white/5">
            <h3 className="text-xl font-bold mb-6">Faturamento (Últimos 7 dias)</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics.chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis 
                            dataKey="name" 
                            stroke="#666" 
                            tick={{ fill: '#666' }} 
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis 
                            stroke="#666" 
                            tick={{ fill: '#666' }} 
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => `R$${value}`}
                        />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Faturamento']}
                        />
                        <Bar 
                            dataKey="faturamento" 
                            fill="#4ade80" 
                            radius={[4, 4, 0, 0]}
                            maxBarSize={50}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Appointments Chart */}
         <div className="bg-[#111] p-6 rounded-2xl border border-white/5">
            <h3 className="text-xl font-bold mb-6">Volume de Atendimentos</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metrics.chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis 
                            dataKey="name" 
                            stroke="#666" 
                            tick={{ fill: '#666' }} 
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis 
                            stroke="#666" 
                            tick={{ fill: '#666' }} 
                            axisLine={false}
                            tickLine={false}
                        />
                         <Tooltip 
                            contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="atendimentos" 
                            stroke="#2563eb" 
                            strokeWidth={3}
                            dot={{ fill: '#2563eb', r: 4 }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* Manual Revenue Modal */}
      {showRevenueModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
                  <h2 className="text-xl font-bold mb-4 text-white">Adicionar Faturamento Manual</h2>
                  <form onSubmit={handleAddRevenue} className="space-y-4">
                      <div>
                          <label className="block text-sm text-gray-400 mb-1">Descrição</label>
                          <input 
                              type="text" 
                              required
                              value={revenueForm.description}
                              onChange={e => setRevenueForm({...revenueForm, description: e.target.value})}
                              className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-white transition-colors"
                              placeholder="Ex: Venda de Pomada"
                          />
                      </div>
                      <div>
                          <label className="block text-sm text-gray-400 mb-1">Valor (R$)</label>
                          <input 
                              type="number" 
                              required
                              step="0.01"
                              value={revenueForm.value}
                              onChange={e => setRevenueForm({...revenueForm, value: e.target.value})}
                              className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-white transition-colors"
                              placeholder="0.00"
                          />
                      </div>
                      <div>
                          <label className="block text-sm text-gray-400 mb-1">Data</label>
                          <input 
                              type="date" 
                              required
                              value={revenueForm.date}
                              onChange={e => setRevenueForm({...revenueForm, date: e.target.value})}
                              className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-white transition-colors"
                          />
                      </div>
                      <div className="flex justify-end gap-3 mt-6">
                          <button 
                            type="button" 
                            onClick={() => setShowRevenueModal(false)}
                            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                          >
                            Cancelar
                          </button>
                          <button 
                            type="submit"
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold transition-colors"
                          >
                            Adicionar
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

       {/* Latest Manual Transactions List (Optional but good for visibility) */}
       {customRevenues.length > 0 && (
           <div className="bg-[#111] p-6 rounded-2xl border border-white/5">
                <h3 className="text-xl font-bold mb-4">Transações Manuais Recentes</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-gray-400 border-b border-gray-800">
                                <th className="pb-3 pl-4">Data</th>
                                <th className="pb-3">Descrição</th>
                                <th className="pb-3">Valor</th>
                                <th className="pb-3 pr-4">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-300">
                            {customRevenues.slice().reverse().slice(0, 5).map(rev => (
                                <tr key={rev.id} className="border-b border-gray-800/50 hover:bg-white/5">
                                    <td className="py-3 pl-4">{new Date(rev.date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                                    <td className="py-3">{rev.description}</td>
                                    <td className="py-3 text-green-400 font-bold">R$ {rev.value.toFixed(2)}</td>
                                    <td className="py-3 pr-4">
                                        <button 
                                            onClick={() => deleteCustomRevenue(rev.id)}
                                            className="text-red-500 hover:text-red-400 p-2"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
           </div>
       )}

    </div>
  );
}
