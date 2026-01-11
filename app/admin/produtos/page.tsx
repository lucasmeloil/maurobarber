'use client';
import { useState } from 'react';
import { useApp } from '@/app/context/AppContext';
import { Plus, Edit, Trash2, Save, X, Package } from 'lucide-react';
import { useToast } from '@/app/hooks/use-toast';

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-heading">Produtos</h1>
        <button 
            onClick={() => {
                setEditingId(null);
                setFormData({ name: '', price: '0', stock: '0' });
                setIsAdding(!isAdding);
            }}
            className="bg-white text-black px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition-colors"
        >
            {isAdding ? <X size={20}/> : <Plus size={20}/>}
            {isAdding ? 'Cancelar' : 'Novo Produto'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-[#111] p-6 rounded-2xl border border-white/10 animate-in fade-in slide-in-from-top-4">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Editar Produto' : 'Novo Produto'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                    <label className="text-sm text-gray-400">Nome do Produto</label>
                    <input 
                        className="w-full bg-black/50 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-white/30"
                        placeholder="Ex: Cerveja Heineken"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm text-gray-400">Preço (R$)</label>
                    <input 
                        type="number"
                        className="w-full bg-black/50 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-white/30"
                        placeholder="0.00"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm text-gray-400">Estoque</label>
                    <input 
                        type="number"
                        className="w-full bg-black/50 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-white/30"
                        placeholder="0"
                        value={formData.stock}
                        onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    />
                </div>
            </div>
            <button 
                onClick={handleSave}
                className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
                <Save size={20} />
                Salvar Produto
            </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
            <div key={product.id} className="bg-[#111] p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all group">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                        <Package size={24} />
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(product)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                            <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(product.id, product.name)} className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors">
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
                <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-2xl font-bold text-green-400">R$ {product.price.toFixed(2)}</span>
                    <span className="bg-white/5 px-2 py-1 rounded text-gray-400">
                        Estoque: {product.stock}
                    </span>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}
