'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, X, Send } from 'lucide-react';

export default function WhatsAppFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ nome: '', servico: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = `Olá, sou ${formData.nome}. Gostaria de agendar um ${formData.servico || 'horário'}.`;
    const url = `https://wa.me/557999914079?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setIsOpen(false);
    setFormData({ nome: '', servico: '' });
  };

  return (
    <>
      {/* Pulsing Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 md:bottom-8 md:right-8 bg-[#25D366] text-white p-4 rounded-full shadow-2xl z-50 flex items-center justify-center hover:bg-[#128C7E] transition-colors"
        whileHover={{ scale: 1.1 }}
        animate={{
            boxShadow: [
                "0 0 0 0 rgba(37, 211, 102, 0.7)",
                "0 0 0 10px rgba(37, 211, 102, 0)",
            ],
        }}
        transition={{
            boxShadow: {
                duration: 1.5,
                repeat: Infinity,
            }
        }}
      >
        <Phone size={28} />
      </motion.button>

      {/* Modal Form */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-40 right-4 md:bottom-24 md:right-8 w-80 bg-[#111] border border-white/10 p-6 rounded-2xl shadow-2xl z-50"
          >
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-bold text-lg">Agendamento Rápido</h3>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                    <X size={20} />
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <input 
                        type="text" 
                        placeholder="Seu nome"
                        value={formData.nome}
                        onChange={(e) => setFormData({...formData, nome: e.target.value})}
                        className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#25D366]"
                        required
                    />
                </div>
                <div>
                    <select
                        value={formData.servico}
                        onChange={(e) => setFormData({...formData, servico: e.target.value})}
                        className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#25D366] appearance-none"
                    >
                        <option value="">Selecione o serviço (opcional)</option>
                        <option value="Corte">Corte</option>
                        <option value="Barba">Barba</option>
                        <option value="Completo">Completo</option>
                    </select>
                </div>
                <button 
                    type="submit" 
                    className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                    <Send size={16} /> Enviar WhatsApp
                </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
