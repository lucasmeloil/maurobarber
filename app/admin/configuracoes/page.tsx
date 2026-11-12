'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { Settings, Bell, Shield, Smartphone, Key, CheckCircle, AlertTriangle, Send, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminSettingsPage() {
  const [serverKey, setServerKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [registeredTokens, setRegisteredTokens] = useState<any[]>([]);

  // Carrega configurações do Firestore
  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Busca chave FCM salva
      const fcmDoc = await getDoc(doc(db, 'settings', 'fcm'));
      if (fcmDoc.exists()) {
        setServerKey(fcmDoc.data()?.serverKey || '');
      }

      // 2. Busca dispositivos cadastrados
      const tokensSnap = await getDocs(collection(db, 'admin_fcm_tokens'));
      const tokensList: any[] = [];
      tokensSnap.forEach((d) => {
        tokensList.push({ id: d.id, ...d.data() });
      });
      setRegisteredTokens(tokensList);
    } catch (err: any) {
      console.error('Erro ao carregar configurações:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);
    try {
      await setDoc(doc(db, 'settings', 'fcm'), {
        serverKey: serverKey.trim(),
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      setStatusMessage({
        text: 'Chave salva com sucesso no banco de dados! O sistema de push agora está ativo.',
        type: 'success',
      });
    } catch (err: any) {
      setStatusMessage({
        text: `Erro ao salvar no banco: ${err.message}`,
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestNotification = async () => {
    setTestSending(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/notifications/notify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: 'Teste Mauro Barber',
          serviceName: 'Corte Degrade Premium',
          time: 'Agora',
          date: 'Hoje',
          barberName: 'Admin',
        }),
      });
      const data = await res.json();
      if (data.success && data.sent > 0) {
        setStatusMessage({
          text: `Notificação enviada com sucesso para ${data.sent} aparelho(s)! Verifique seu celular.`,
          type: 'success',
        });
      } else {
        setStatusMessage({
          text: data.message || 'Disparado, mas nenhum aparelho recebeu. Verifique a Server Key.',
          type: 'error',
        });
      }
    } catch (err: any) {
      setStatusMessage({
        text: `Erro ao enviar teste: ${err.message}`,
        type: 'error',
      });
    } finally {
      setTestSending(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-[#d4af37] text-sm font-semibold mb-1">
            <Settings className="w-4 h-4" />
            SISTEMA & NOTIFICAÇÕES
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-white">
            Configurações de Push e Dispositivos
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Gerencie o recebimento de notificações flutuantes em segundo plano para o celular do gestor.
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs transition-colors self-start cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Atualizar
        </button>
      </div>

      {statusMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl flex items-center gap-3 text-sm border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-red-950/40 border-red-500/30 text-red-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </motion.div>
      )}

      {/* Card 1: Chave de Servidor do Firebase (FCM) */}
      <div className="bg-[#111116] border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20">
            <Key className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">Chave do Servidor Firebase (Server Key)</h2>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Necessária para disparar notificações quando o app estiver minimizado ou com a tela apagada. Você pode salvar diretamente aqui no banco de dados ou adicionar a variável <code className="text-[#d4af37] bg-black/40 px-1 py-0.5 rounded">FIREBASE_SERVER_KEY</code> no painel do Netlify.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
              Server Key (Firebase Cloud Messaging)
            </label>
            <input
              type="text"
              value={serverKey}
              onChange={(e) => setServerKey(e.target.value)}
              placeholder="Cole aqui a Server Key (ex: AAAA...)"
              className="w-full bg-[#070709] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37] transition-colors"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa771c] hover:from-[#e5c055] hover:to-[#be8922] text-black font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Shield className="w-4 h-4" />
              {saving ? 'Gravando no Banco...' : 'Gravar Diretamente no Banco'}
            </button>

            <button
              type="button"
              onClick={handleTestNotification}
              disabled={testSending}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4 text-[#d4af37]" />
              {testSending ? 'Disparando...' : 'Testar Notificação no Celular'}
            </button>
          </div>
        </form>
      </div>

      {/* Card 2: Aparelhos Cadastrados */}
      <div className="bg-[#111116] border border-white/10 rounded-3xl p-6 md:p-8 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/5 text-zinc-300 border border-white/5">
              <Smartphone className="w-6 h-6 text-[#d4af37]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Dispositivos Conectados</h2>
              <p className="text-xs text-zinc-400">
                Aparelhos que concederam permissão e receberão os alertas em tempo real.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30">
            {registeredTokens.length} dispositivo(s)
          </span>
        </div>

        <div className="divide-y divide-white/5 pt-2">
          {registeredTokens.length === 0 ? (
            <div className="py-6 text-center text-xs text-zinc-500">
              Nenhum celular conectado ainda. Abra o app no seu telefone pela rota de login e clique em "Permitir Notificações".
            </div>
          ) : (
            registeredTokens.map((t, idx) => (
              <div key={t.id || idx} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="min-w-0">
                  <div className="font-semibold text-white truncate">
                    {t.userEmail || t.userId || 'Administrador Mauro Barber'}
                  </div>
                  <div className="text-zinc-500 truncate text-[11px] mt-0.5">
                    Atualizado em: {t.updatedAt ? new Date(t.updatedAt).toLocaleString('pt-BR') : 'Recentemente'}
                  </div>
                </div>
                <span className="text-[10px] text-emerald-400 font-medium px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  Ativo
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

