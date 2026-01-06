
import React, { useState } from 'react';
import { ChevronLeft, Plus, TrendingUp, TrendingDown, Filter, Trash2, ArrowUpRight, ArrowDownLeft, DollarSign, Wallet, Pencil, X, Save, AlertCircle } from 'lucide-react';
import { Transaction } from '../types';
import { GlassCard } from './GlassCard';
import { useData } from '../contexts/DataContext';

interface FinanceScreenProps {
  onBack: () => void;
}

export const FinanceScreen: React.FC<FinanceScreenProps> = ({ onBack }) => {
  const { transactions, setTransactions } = useData();
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');

  // Delete Modal State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSave = () => {
    if (!amount || !desc) return;

    if (editingId) {
        // Edit Logic
        setTransactions(transactions.map(t => t.id === editingId ? {
            ...t,
            type,
            amount: parseFloat(amount),
            description: desc
        } : t));
        setEditingId(null);
    } else {
        // Add Logic
        const newTx: Transaction = {
            id: Date.now().toString(),
            type: type,
            amount: parseFloat(amount),
            description: desc,
            date: new Date().toISOString()
        };
        setTransactions([newTx, ...transactions]);
    }
    
    resetForm();
  };

  const startEdit = (tx: Transaction) => {
      setEditingId(tx.id);
      setAmount(tx.amount.toString());
      setDesc(tx.description);
      setType(tx.type);
      setIsFormOpen(true);
  };

  const requestDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
        setTransactions(transactions.filter(t => t.id !== deleteId));
        if (editingId === deleteId) resetForm();
        setDeleteId(null);
    }
  };

  const resetForm = () => {
      setIsFormOpen(false);
      setEditingId(null);
      setAmount('');
      setDesc('');
      setType('expense');
  };

  const totalBalance = transactions.reduce((acc, curr) => curr.type === 'income' ? acc + curr.amount : acc - curr.amount, 0);
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);

  const filteredTransactions = transactions.filter(t => filter === 'all' ? true : t.type === filter);
  const highestVal = Math.max(totalIncome, totalExpense) || 1;

  return (
    <div className="flex flex-col h-full w-full animate-in slide-in-from-right duration-500 relative">
      
      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
            <GlassCard className="w-full max-w-xs shadow-2xl animate-in zoom-in-95 duration-200" padding="p-6">
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mb-3">
                        <Trash2 size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Excluir Transação?</h3>
                    <p className="text-sm text-slate-500 mt-1 leading-snug">
                        Esta ação removerá o lançamento do seu histórico permanentemente.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setDeleteId(null)}
                        className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all active:scale-95"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={confirmDelete}
                        className="flex-1 py-3 rounded-xl bg-rose-500 text-white font-bold shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all active:scale-95"
                    >
                        Confirmar
                    </button>
                </div>
            </GlassCard>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={onBack}
          className="p-3 rounded-full bg-white/30 hover:bg-white/50 text-slate-800 transition-all active:scale-90"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Carteira</h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Gestão Financeira</p>
        </div>
      </div>

      {/* Main Card: Balance & Chart */}
      <GlassCard className="mb-6 relative overflow-hidden" padding="p-6">
        <div className="relative z-10">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Saldo Total</p>
            <h1 className="text-4xl font-black text-slate-800 mb-6">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalBalance)}
            </h1>

            <div className="space-y-3">
                {/* Income Bar */}
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <ArrowUpRight size={16} />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="text-slate-600">Entradas</span>
                            <span className="text-emerald-600">R$ {totalIncome.toFixed(2)}</span>
                        </div>
                        <div className="h-2 w-full bg-white/40 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-emerald-500 rounded-full" 
                                style={{ width: `${(totalIncome / highestVal) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Expense Bar */}
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                        <ArrowDownLeft size={16} />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="text-slate-600">Saídas</span>
                            <span className="text-rose-600">R$ {totalExpense.toFixed(2)}</span>
                        </div>
                        <div className="h-2 w-full bg-white/40 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-rose-500 rounded-full" 
                                style={{ width: `${(totalExpense / highestVal) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Decorative BG Icon */}
        <div className="absolute -right-6 -bottom-6 text-slate-900/5 rotate-12 pointer-events-none">
            <Wallet size={180} />
        </div>
      </GlassCard>

      {/* Action Bar */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2 p-1 bg-white/30 rounded-xl backdrop-blur-md">
            {(['all', 'income', 'expense'] as const).map((f) => (
                <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`
                        px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all
                        ${filter === f ? 'bg-slate-800 text-white shadow-md' : 'text-slate-600 hover:bg-white/40'}
                    `}
                >
                    {f === 'all' ? 'Tudo' : f === 'income' ? 'Entradas' : 'Saídas'}
                </button>
            ))}
        </div>
        <button 
            onClick={() => { resetForm(); setIsFormOpen(!isFormOpen); }}
            className={`p-3 rounded-xl transition-all shadow-lg active:scale-95 ${isFormOpen ? 'bg-rose-500 text-white' : 'bg-slate-800 text-white'}`}
        >
            {isFormOpen ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {/* Add/Edit Transaction Form */}
      {isFormOpen && (
        <div className="mb-4 animate-in slide-in-from-top-4 duration-300">
            <GlassCard padding="p-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800 tracking-tight">{editingId ? 'Editar Transação' : 'Nova Transação'}</h3>
                    {editingId && (
                        <button onClick={resetForm} className="text-xs font-bold text-slate-400 hover:text-rose-500 uppercase tracking-wider">Cancelar</button>
                    )}
                </div>

                <div className="flex gap-2 mb-3">
                    <button 
                        onClick={() => setType('income')} 
                        className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${type === 'income' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-white/40 text-slate-500'}`}
                    >
                        Entrada
                    </button>
                    <button 
                         onClick={() => setType('expense')} 
                         className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${type === 'expense' ? 'bg-rose-500 text-white shadow-lg shadow-rose-100' : 'bg-white/40 text-slate-500'}`}
                    >
                        Saída
                    </button>
                </div>
                <div className="space-y-3">
                    <input 
                        type="number" 
                        placeholder="Valor (R$)" 
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className="w-full p-3 rounded-xl bg-white/50 font-bold text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-slate-400/50"
                        autoFocus
                    />
                    <input 
                        type="text" 
                        placeholder="Descrição (ex: Mercado)" 
                        value={desc}
                        onChange={e => setDesc(e.target.value)}
                        className="w-full p-3 rounded-xl bg-white/50 font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-slate-400/50"
                    />
                    <button onClick={handleSave} className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold shadow-lg active:scale-[0.98] flex items-center justify-center gap-2">
                        {editingId ? <Save size={18} /> : <Plus size={18} />}
                        {editingId ? 'Salvar Alterações' : 'Adicionar'}
                    </button>
                </div>
            </GlassCard>
        </div>
      )}

      {/* Transactions List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 space-y-3">
        {filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 opacity-60">
                <Wallet size={48} className="mb-2" />
                <p className="text-xs font-bold uppercase tracking-widest">Nenhuma transação encontrada</p>
            </div>
        ) : (
            filteredTransactions.map((t) => (
                <div key={t.id} className="group flex items-center justify-between p-4 bg-white/40 backdrop-blur-sm border border-white/50 rounded-2xl hover:bg-white/60 transition-all">
                    <div className="flex items-center gap-4 overflow-hidden">
                        <div className={`
                            w-10 h-10 rounded-xl flex items-center justify-center shadow-sm shrink-0
                            ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}
                        `}>
                            {t.type === 'income' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-slate-800 text-sm truncate">{t.description}</p>
                            <p className="text-[10px] text-slate-500 font-medium">{new Date(t.date).toLocaleDateString()} • {new Date(t.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`font-black text-sm whitespace-nowrap ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {t.type === 'income' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                        </span>
                        
                        <div className="flex gap-1">
                            <button 
                                onClick={() => startEdit(t)}
                                className="p-2 rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-500 transition-all active:scale-90"
                                title="Editar"
                            >
                                <Pencil size={16} />
                            </button>
                            <button 
                                onClick={() => requestDelete(t.id)}
                                className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all active:scale-90"
                                title="Excluir"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            ))
        )}
      </div>

    </div>
  );
};
