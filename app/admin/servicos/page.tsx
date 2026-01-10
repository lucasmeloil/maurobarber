'use client';
import { useState } from 'react';
import { useApp, Service } from '@/app/context/AppContext';
import { useToast } from '@/app/context/ToastContext';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';

export default function ServicesAdminPage() {
  const { services, addService, updateService, deleteService } = useApp();
  const { showToast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', price: '0', duration: '' });

  const handleEdit = (svc: Service) => {
    setEditingId(svc.id);
    setFormData({ name: svc.name, price: svc.price.toString(), duration: svc.duration });
    setIsAdding(false);
  };

  const handeDelete = (id: string, name: string) => {
    if(confirm(`Excluir o serviço "${name}"?`)) {
        deleteService(id);
        showToast('Serviço excluído com sucesso!', 'success');
    }
  };

  const handleSave = () => {
    if(!formData.name || !formData.price || !formData.duration) {
        showToast('Preencha todos os campos!', 'error');
        return;
    }

    if (editingId) {
        updateService(editingId, {
            name: formData.name,
            price: parseFloat(formData.price),
            duration: formData.duration
        });
        showToast('Serviço atualizado com sucesso!', 'success');
        setEditingId(null);
    } else {
        addService({
            name: formData.name,
            price: parseFloat(formData.price),
            duration: formData.duration
        });
        showToast('Serviço criado com sucesso!', 'success');
        setIsAdding(false);
    }
    setFormData({ name: '', price: '0', duration: '' });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-heading">Gerenciar Serviços</h1>
        <button 
            onClick={() => { setIsAdding(true); setEditingId(null); setFormData({name:'', price:'', duration:''}); }}
            className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-bold hover:bg-gray-200 transition-colors"
        >
            <Plus size={18} /> Novo Serviço
        </button>
      </div>

      <div className="grid gap-4 max-w-4xl">
        {isAdding && (
            <div className="bg-[#1a1a1a] border border-white/20 p-6 rounded-xl mb-4 animate-in fade-in slide-in-from-top-4">
                <h3 className="font-bold mb-4">Novo Serviço</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <input className="bg-black border border-white/10 p-2 rounded text-white" placeholder="Nome" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    <input className="bg-black border border-white/10 p-2 rounded text-white" placeholder="Preço" type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                    <input className="bg-black border border-white/10 p-2 rounded text-white" placeholder="Duração (ex: 30 min)" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} />
                </div>
                <div className="flex justify-end gap-2">
                    <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancelar</button>
                    <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500">Salvar</button>
                </div>
            </div>
        )}

        {services.map(svc => (
           <div key={svc.id} className="bg-[#111] border border-white/10 p-6 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
              {editingId === svc.id ? (
                <>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                        <input className="bg-black border border-white/10 p-2 rounded text-white" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        <input className="bg-black border border-white/10 p-2 rounded text-white" type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                        <input className="bg-black border border-white/10 p-2 rounded text-white" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setEditingId(null)} className="p-2 text-gray-400 hover:text-white"><X size={20}/></button>
                        <button onClick={handleSave} className="p-2 text-green-500 hover:text-green-400"><Save size={20}/></button>
                    </div>
                </>
              ) : (
                <>
                    <div className="flex-1">
                        <h3 className="font-bold text-lg">{svc.name}</h3>
                        <p className="text-gray-400 text-sm">R$ {svc.price.toFixed(2)} • {svc.duration}</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => handleEdit(svc)} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"><Edit2 size={18} /></button>
                        <button onClick={() => handeDelete(svc.id, svc.name)} className="p-2 text-red-900 hover:text-red-500 hover:bg-red-900/10 rounded-lg transition-colors"><Trash2 size={18} /></button>
                    </div>
                </>
              )}
           </div> 
        ))}
      </div>
    </div>
  );
}
