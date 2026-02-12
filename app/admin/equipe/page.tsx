'use client';

import { useState } from 'react';
import { useApp, TeamMember } from '@/app/context/AppContext';
import { Plus, Search, Edit2, Trash2, X, User, Shield, UserCog, Mail, Phone, Lock, Percent } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/app/context/ToastContext';

export default function TeamPage() {
  const { team, addTeamMember, updateTeamMember, deleteTeamMember } = useApp();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    role: 'client', // Default role
    email: '',
    phone: '',
    password: '',
    commissionRate: '50' // Default commission 50%
  });

  const filteredTeam = team.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse commission
    const commission = formData.role === 'barber' ? parseFloat(formData.commissionRate) || 0 : undefined;

    try {
        if (editingId) {
          const success = await updateTeamMember(editingId, {
              name: formData.name,
              role: formData.role as any, 
              email: formData.email,
              phone: formData.phone,
              commissionRate: commission
          });
          if (success) showToast('Membro atualizado com sucesso!', 'success');
        } else {
          const success = await addTeamMember({
              name: formData.name,
              role: formData.role as any,
              email: formData.email,
              phone: formData.phone,
              avatar: '',
              commissionRate: commission
          }, formData.password);
          if (success) showToast('Membro cadastrado com sucesso!', 'success');
        }
        
        setShowModal(false);
        resetForm();
    } catch (error: any) {
        console.error("Erro ao salvar membro:", error);
        showToast(`Erro ao salvar: ${error.message || 'Verifique os dados'}`, 'error');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', role: 'client', email: '', phone: '', password: '', commissionRate: '50' });
    setEditingId(null);
  };

  const handleEdit = (member: TeamMember) => {
    setFormData({
        name: member.name,
        role: member.role,
        email: member.email || '',
        phone: member.phone || '',
        password: '', // Password not editable directly here
        commissionRate: member.commissionRate ? member.commissionRate.toString() : '50'
    });
    setEditingId(member.id);
    setShowModal(true);
  };

  const getRoleBadge = (role: string) => {
      switch(role) {
          case 'admin': return <span className="bg-red-500/20 text-red-500 px-2 py-1 rounded text-xs font-bold border border-red-500/30 flex items-center gap-1"><Shield size={12}/> Admin</span>;
          case 'barber': return <span className="bg-blue-500/20 text-blue-500 px-2 py-1 rounded text-xs font-bold border border-blue-500/30 flex items-center gap-1"><UserCog size={12}/> Barbeiro</span>;
          case 'receptionist': return <span className="bg-purple-500/20 text-purple-500 px-2 py-1 rounded text-xs font-bold border border-purple-500/30 flex items-center gap-1"><User size={12}/> Recepcionista</span>;
          default: return <span className="bg-gray-500/20 text-gray-500 px-2 py-1 rounded text-xs font-bold border border-gray-500/30 flex items-center gap-1"><User size={12}/> Cliente</span>;
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Equipe e Usuários</h1>
          <p className="text-gray-400">Gerencie barbeiros, admins e clientes cadastrados.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-xl font-medium hover:bg-gray-200 transition-colors"
        >
          <Plus size={20} />
          Novo Usuário
        </button>
      </div>

      <div className="bg-[#111] p-4 rounded-2xl border border-white/5 flex items-center gap-3">
        <Search className="text-gray-500" />
        <input 
          type="text" 
          placeholder="Buscar por nome, email ou função..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none outline-none text-white w-full placeholder-gray-600"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredTeam.map(member => (
                <motion.div 
                    key={member.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-[#111] border border-white/5 rounded-2xl p-4 group relative overflow-hidden"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-xl font-bold uppercase text-white/50">
                            {member.name.substring(0,2)}
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => handleEdit(member)}
                                className="p-2 hover:bg-white/10 rounded-lg text-blue-400"
                            >
                                <Edit2 size={16} />
                            </button>
                            <button 
                                onClick={() => confirm('Tem certeza que deseja excluir?') && deleteTeamMember(member.id)}
                                className="p-2 hover:bg-white/10 rounded-lg text-red-400"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                    
                    <h3 className="font-bold text-lg text-white mb-1">{member.name}</h3>
                    <div className="mb-3">{getRoleBadge(member.role)}</div>

                    <div className="space-y-2 text-sm text-gray-400">
                        {member.email && (
                            <div className="flex items-center gap-2 overflow-hidden text-ellipsis">
                                <Mail size={14} className="min-w-[14px]" />
                                <span className="truncate">{member.email}</span>
                            </div>
                        )}
                        {member.phone && (
                            <div className="flex items-center gap-2">
                                <Phone size={14} className="min-w-[14px]" />
                                <span>{member.phone}</span>
                            </div>
                        )}
                        {member.role === 'barber' && member.commissionRate !== undefined && (
                             <div className="flex items-center gap-2 text-[#d4af37]">
                                <Percent size={14} className="min-w-[14px]" />
                                <span>Comissão: {member.commissionRate}%</span>
                             </div>
                        )}
                    </div>
                </motion.div>
            ))}
          </AnimatePresence>
      </div>

      {filteredTeam.length === 0 && (
           <div className="text-center py-20 text-gray-500">
               <UserCog size={48} className="mx-auto mb-4 opacity-50" />
               <p>Nenhum usuário encontrado</p>
           </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    onClick={() => setShowModal(false)}
                />
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="relative bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md p-6 overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white">
                            {editingId ? 'Editar Usuário' : 'Novo Usuário'}
                        </h2>
                        <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Nome Completo</label>
                            <input 
                                type="text" 
                                required
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-white transition-colors outline-none"
                                placeholder="João Silva"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Função</label>
                            <select 
                                value={formData.role}
                                onChange={e => setFormData({...formData, role: e.target.value})}
                                className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-white transition-colors outline-none appearance-none cursor-pointer"
                            >
                                <option value="client">Cliente</option>
                                <option value="barber">Barbeiro</option>
                                <option value="receptionist">Recepcionista</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>

                         {/* Commission Field - Only for Barbers */}
                         {formData.role === 'barber' && (
                             <div>
                                <label className="block text-sm text-[#d4af37] mb-1 font-bold">Comissão (%)</label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number" 
                                        min="0"
                                        max="100"
                                        value={formData.commissionRate}
                                        onChange={e => setFormData({...formData, commissionRate: e.target.value})}
                                        className="w-full bg-black border border-[#d4af37]/50 rounded-lg p-3 text-white focus:border-[#d4af37] transition-colors outline-none"
                                        placeholder="Ex: 50"
                                    />
                                    <span className="text-[#d4af37] font-bold">%</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Porcentagem que o barbeiro recebe por serviço.</p>
                             </div>
                        )}

                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Email</label>
                            <input 
                                type="email" 
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-white transition-colors outline-none"
                                placeholder="joao@exemplo.com"
                                required={formData.role !== 'client' || !!formData.password}
                            />
                        </div>

                        {/* Password Field - Only for new users (for now) */}
                        {!editingId && (
                            <div>
                                <label className="block text-sm text-gray-400 mb-1 flex items-center gap-2">
                                    <Lock size={12} /> Senha de Acesso
                                </label>
                                <input 
                                    type="password"
                                    value={formData.password}
                                    onChange={e => setFormData({...formData, password: e.target.value})}
                                    className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-white transition-colors outline-none"
                                    placeholder="Mínimo 6 caracteres"
                                    minLength={6}
                                    required={formData.role !== 'client'} // Required for staff
                                />
                                <p className="text-xs text-gray-600 mt-1">Necessário para login de funcionários (Admin/Barbeiro).</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Telefone (Opcional)</label>
                            <input 
                                type="tel" 
                                value={formData.phone}
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                                className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-white transition-colors outline-none"
                                placeholder="(11) 99999-9999"
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-white/5">
                            <button 
                                type="button" 
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-gray-400 hover:text-white transition-colors font-medium"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit"
                                className="bg-white text-black px-6 py-2 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                            >
                                {editingId ? 'Salvar Alterações' : 'Cadastrar'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
}
