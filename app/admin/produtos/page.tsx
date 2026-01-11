'use client';
import { useState } from 'react';
import { useApp } from '@/app/context/AppContext';
import { useToast } from '@/app/context/ToastContext';
import { Plus, Edit, Trash2, Save, X, Package } from 'lucide-react';

export default function ProductsAdminPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useApp();
  const { showToast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', price: '0', stock: '0' });

  const handleEdit = (product: any) => {
    setEditingId(product.id);
    setFormData({ 
        name: product.name, 
        price: product.price.toString(),
        stock: product.stock.toString()
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if(confirm(`Excluir o produto "${name}"?`)) {
        const success = await deleteProduct(id);
        if(success) showToast('Produto excluído com sucesso!', 'success');
        else showToast('Erro ao excluir produto.', 'error');
    }
  };

  const handleSave = async () => {
    if(!formData.name || !formData.price || !formData.stock) {
        showToast('Preencha todos os campos!', 'error');
        return;
    }

    let success = false;
    const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock)
    };

    if (editingId) {
        success = await updateProduct(editingId, productData);
        if(success) {
            showToast('Produto atualizado com sucesso!', 'success');
            setEditingId(null);
        }
    } else {
        success = await addProduct(productData);
        if(success) {
            showToast('Produto criado com sucesso!', 'success');
            setIsAdding(false);
        }
    }
    
    if(!success) {
        showToast('Erro ao salvar produto.', 'error');
    } else {
        setFormData({ name: '', price: '0', stock: '0' });
        setIsAdding(false); // Close form on success
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-2xl md:text-3xl font-bold font-heading">Produtos</h1>
            <div className="text-gray-400 text-sm md:text-base">Gerencie seu estoque</div>
        </div>
        
        <button 
            onClick={() => {
                setEditingId(null);
                setFormData({ name: '', price: '0', stock: '0' });
                setIsAdding(!isAdding);
            }}
            className="w-full md:w-auto bg-white text-black px-6 py-3 md:py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors font-bold shadow-lg active:scale-95"
        >
            {isAdding ? <X size={20}/> : <Plus size={20}/>}
            {isAdding ? 'Cancelar' : 'Novo Produto'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-[#111] p-6 rounded-2xl border border-white/10 animate-in fade-in slide-in-from-top-4 shadow-2xl">
            <h2 className="text-xl font-bold mb-4 font-heading">{editingId ? 'Editar Produto' : 'Novo Produto'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                    <label className="text-sm text-gray-400 ml-1">Nome do Produto</label>
                    <input 
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-[#d4af37] outline-none transition-colors"
                        placeholder="Ex: Cerveja Heineken"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm text-gray-400 ml-1">Preço (R$)</label>
                    <input 
                        type="number"
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-[#d4af37] outline-none transition-colors"
                        placeholder="0.00"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm text-gray-400 ml-1">Estoque</label>
                    <input 
                        type="number"
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-[#d4af37] outline-none transition-colors"
                        placeholder="0"
                        value={formData.stock}
                        onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    />
                </div>
            </div>
            <button 
                onClick={handleSave}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:scale-[1.01]"
            >
                <Save size={20} />
                Salvar Produto
            </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
            <div key={product.id} className="bg-[#111] p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all group shadow-lg">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                        <Package size={24} />
                    </div>
                    <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(product)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                            <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(product.id, product.name)} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-500 hover:text-red-400 transition-colors">
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
                <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-2xl font-bold text-green-400">R$ {product.price.toFixed(2)}</span>
                    <span className="bg-white/5 px-2 py-1 rounded text-gray-400 border border-white/5">
                        Estoque: {product.stock}
                    </span>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}
