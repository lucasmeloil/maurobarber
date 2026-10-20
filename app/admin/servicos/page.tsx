'use client';
import { useState } from 'react';
import { useApp, Service } from '@/app/context/AppContext';
import { useToast } from '@/app/context/ToastContext';
import { Plus, Trash2, Edit2, Save, X, Clock } from 'lucide-react';

const COMMON_DURATIONS = [
  '15 min',
  '20 min',
  '30 min',
  '40 min',
  '45 min',
  '50 min',
  '60 min',
  '1h 15min',
  '1h 30min'
];

export const formatDurationDisplay = (val: string | number): string => {
  if (!val) return '30 min';
  const str = String(val).trim();
  if (/^\d+$/.test(str)) {
    return `${str} min`;
  }
  return str;
};

export const normalizeDuration = (val: string): string => {
  if (!val) return '30 min';
  const clean = val.trim();
  if (/^\d+$/.test(clean)) {
    return `${clean} min`;
  }
  return clean;
};

export default function ServicesAdminPage() {
  const { services, addService, updateService, deleteService } = useApp();
  const { showToast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', price: '0', duration: '' });

  const handleEdit = (svc: Service) => {
    setEditingId(svc.id);
    setFormData({ 
      name: svc.name, 
      price: svc.price.toString(), 
      duration: formatDurationDisplay(svc.duration) 
    });
    setIsAdding(false);
  };

  const handeDelete = async (id: string, name: string) => {
    if (confirm(`Excluir o serviço "${name}"?`)) {
      const success = await deleteService(id);
      if (success) showToast('Serviço excluído com sucesso!', 'success');
      else showToast('Erro ao excluir serviço.', 'error');
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price || !formData.duration) {
      showToast('Preencha todos os campos!', 'error');
      return;
    }

    const durationToSave = normalizeDuration(formData.duration);

    let success = false;
    if (editingId) {
      success = await updateService(editingId, {
        name: formData.name,
        price: parseFloat(formData.price),
        duration: durationToSave
      });
      if (success) {
        showToast('Serviço atualizado com sucesso!', 'success');
        setEditingId(null);
      }
    } else {
      success = await addService({
        name: formData.name,
        price: parseFloat(formData.price),
        duration: durationToSave
      });
      if (success) {
        showToast('Serviço criado com sucesso!', 'success');
        setIsAdding(false);
      }
    }

    if (!success) {
      showToast('Erro ao salvar serviço.', 'error');
    } else {
      setFormData({ name: '', price: '0', duration: '' });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-heading">Gerenciar Serviços</h1>
          <p className="text-gray-400 text-sm mt-1">
            Cadastre os serviços e o tempo estimado em minutos de cada um para sincronizar a agenda.
          </p>
        </div>
        <button
          onClick={() => {
            setIsAdding(true);
            setEditingId(null);
            setFormData({ name: '', price: '', duration: '30 min' });
          }}
          className="flex items-center gap-2 bg-white text-black px-4 py-2.5 rounded-lg font-bold hover:bg-gray-200 transition-colors shadow-lg"
        >
          <Plus size={18} /> Novo Serviço
        </button>
      </div>

      <div className="grid gap-4 max-w-4xl">
        {/* Formulário de Adição */}
        {isAdding && (
          <div className="bg-[#1a1a1a] border border-white/20 p-6 rounded-xl mb-4 animate-in fade-in slide-in-from-top-4">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-white">
              <Plus size={18} className="text-green-400" /> Novo Serviço
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Nome do Serviço</label>
                <input
                  className="w-full bg-black border border-white/10 p-2.5 rounded-lg text-white focus:outline-none focus:border-white transition-colors"
                  placeholder="Ex: Corte Degradê"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Preço (R$)</label>
                <input
                  className="w-full bg-black border border-white/10 p-2.5 rounded-lg text-white focus:outline-none focus:border-white transition-colors"
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Duração do Atendimento</label>
                <input
                  className="w-full bg-black border border-white/10 p-2.5 rounded-lg text-white focus:outline-none focus:border-white transition-colors"
                  placeholder="Ex: 40 min ou 40"
                  value={formData.duration}
                  onChange={e => setFormData({ ...formData, duration: e.target.value })}
                />
              </div>
            </div>

            {/* Chips de Duração Rápida */}
            <div className="mb-5">
              <span className="text-xs text-gray-400 block mb-2">Sugestões de tempo rápido:</span>
              <div className="flex flex-wrap gap-2">
                {COMMON_DURATIONS.map(dur => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setFormData({ ...formData, duration: dur })}
                    className={`text-xs px-2.5 py-1 rounded-md border transition-all ${
                      formData.duration === dur || formData.duration === dur.replace(' min', '')
                        ? 'bg-white text-black border-white font-bold'
                        : 'bg-black/60 border-white/10 text-gray-300 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    {dur}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-green-500 transition-colors shadow-lg"
              >
                Salvar Serviço
              </button>
            </div>
          </div>
        )}

        {/* Lista de Serviços Cadastrados */}
        {services.map(svc => (
          <div
            key={svc.id}
            className="bg-[#111] border border-white/10 p-5 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 transition-all hover:border-white/20"
          >
            {editingId === svc.id ? (
              <div className="w-full space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Nome</label>
                    <input
                      className="w-full bg-black border border-white/20 p-2.5 rounded-lg text-white focus:outline-none focus:border-white"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Preço (R$)</label>
                    <input
                      className="w-full bg-black border border-white/20 p-2.5 rounded-lg text-white focus:outline-none focus:border-white"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Duração</label>
                    <input
                      className="w-full bg-black border border-white/20 p-2.5 rounded-lg text-white focus:outline-none focus:border-white"
                      value={formData.duration}
                      placeholder="Ex: 40 min"
                      onChange={e => setFormData({ ...formData, duration: e.target.value })}
                    />
                  </div>
                </div>

                {/* Chips na Edição */}
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-[11px] text-gray-500 mr-1">Tempo rápido:</span>
                  {COMMON_DURATIONS.map(dur => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setFormData({ ...formData, duration: dur })}
                      className={`text-[11px] px-2 py-0.5 rounded border transition-all ${
                        formData.duration === dur || formData.duration === dur.replace(' min', '')
                          ? 'bg-white text-black border-white font-bold'
                          : 'bg-black border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      {dur}
                    </button>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-2 text-gray-400 hover:text-white flex items-center gap-1 text-xs"
                  >
                    <X size={16} /> Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    className="bg-green-600 text-white px-4 py-1.5 rounded-lg font-bold hover:bg-green-500 flex items-center gap-1.5 text-xs shadow-md"
                  >
                    <Save size={16} /> Salvar Alterações
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-white">{svc.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-gray-300 text-sm font-semibold">
                      R$ {svc.price.toFixed(2)}
                    </span>
                    <span className="text-gray-600">•</span>
                    <span className="inline-flex items-center gap-1 text-yellow-400/90 bg-yellow-400/10 px-2 py-0.5 rounded text-xs border border-yellow-400/20 font-medium">
                      <Clock size={12} /> {formatDurationDisplay(svc.duration)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(svc)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    title="Editar Serviço"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handeDelete(svc.id, svc.name)}
                    className="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Excluir Serviço"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
