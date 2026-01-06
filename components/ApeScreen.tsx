
import React, { useState, useMemo, useEffect } from 'react';
import { 
  ChevronLeft, Building2, Pencil, Save, X, Plus, StickyNote, Trash2, Edit3, MessageSquare, CheckCircle2, AlertCircle, Clock
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { useData } from '../contexts/DataContext';
import { ApeNote, ConstructionPhase } from '../types';

interface ApeScreenProps {
  onBack: () => void;
}

export const ApeScreen: React.FC<ApeScreenProps> = ({ onBack }) => {
  const { apePhases, setApePhases, apeNotes, setApeNotes } = useData();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [editingNote, setEditingNote] = useState<ApeNote | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const mainPhase = useMemo(() => {
    return apePhases[0] || { id: 'total', name: 'Geral', progress: 0, status: 'pending' };
  }, [apePhases]);

  const [tempProgress, setTempProgress] = useState(mainPhase.progress);

  // Sincroniza o slider quando os dados carregam ou o modal abre
  useEffect(() => {
    if (isEditModalOpen) {
      setTempProgress(mainPhase.progress);
    }
  }, [isEditModalOpen, mainPhase.progress]);

  const handleUpdateProgress = () => {
    setIsUpdating(true);
    
    const newStatus = tempProgress === 100 ? 'completed' : tempProgress > 0 ? 'active' : 'pending';

    if (apePhases.length === 0) {
      // Cria o registro inicial se não existir nenhum
      setApePhases([{
        id: 'total',
        name: 'Geral',
        progress: tempProgress,
        status: newStatus
      }]);
    } else {
      // Atualiza o registro existente
      setApePhases(apePhases.map((p, i) => i === 0 ? {
          ...p,
          progress: tempProgress,
          status: newStatus
      } : p));
    }
    
    // Feedback visual e fechamento
    setTimeout(() => {
        setIsEditModalOpen(false);
        setTimeout(() => setIsUpdating(false), 1500);
    }, 300);
  };

  const handleSaveNote = () => {
    if (!noteTitle.trim()) return;
    if (editingNote) {
      setApeNotes(apeNotes.map(n => n.id === editingNote.id ? { ...n, title: noteTitle, content: noteContent } : n));
    } else {
      setApeNotes([{ id: Date.now().toString(), title: noteTitle, content: noteContent }, ...apeNotes]);
    }
    closeNoteModal();
  };

  const closeNoteModal = () => { setIsNoteModalOpen(false); setEditingNote(null); setNoteTitle(''); setNoteContent(''); };

  return (
    <div className="flex flex-col h-full w-full animate-in slide-in-from-right duration-700 pb-32">
      
      {/* Header */}
      <div className="flex items-center gap-6 mb-12 px-2">
        <button onClick={onBack} className="p-4 rounded-full bg-white/40 border border-white/50 text-slate-800 hover:scale-110 active:scale-90 transition-all">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">Meu Apê</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Relatório de Obra</p>
        </div>
      </div>

      <div className="flex-1 space-y-12 px-1">
          
          {/* Dashboard de Progresso */}
          <GlassCard 
            interactive 
            onClick={() => setIsEditModalOpen(true)}
            className={`w-full bg-white/50 border-white shadow-2xl shadow-slate-200/50 transition-all duration-700 ${isUpdating ? 'ring-4 ring-emerald-200' : ''}`} 
            padding="p-10"
          >
              <div className="flex justify-between items-start mb-10">
                  <div>
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.25em]">Status Atual</span>
                      <p className={`text-7xl font-black text-slate-900 tracking-tighter tabular-nums leading-none mt-4 transition-all duration-1000 ${isUpdating ? 'scale-110 text-emerald-600' : 'scale-100'}`}>
                        {mainPhase.progress}%
                      </p>
                  </div>
                  <div className={`w-14 h-14 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-100 shadow-sm transition-transform duration-500 ${isUpdating ? 'rotate-[360deg]' : ''}`}>
                    <Building2 size={24} />
                  </div>
              </div>

              <div className="relative pt-2">
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden relative">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full transition-all duration-[1.5s] cubic-bezier(0.34, 1.56, 0.64, 1) relative overflow-hidden" 
                        style={{ width: `${mainPhase.progress}%` }} 
                      >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full animate-shimmer" />
                      </div>
                  </div>
                  <div className="flex justify-between items-center mt-6">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        {mainPhase.status === 'completed' ? 'Obra Concluída' : 'Fase de Acabamento'}
                      </span>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-white text-cyan-600 shadow-sm hover:bg-cyan-50 transition-colors">
                        <Pencil size={10} />
                        <span className="text-[8px] font-black uppercase tracking-widest">Ajustar</span>
                      </div>
                  </div>
              </div>
          </GlassCard>

          {/* Notas */}
          <div className="space-y-8">
              <div className="flex justify-between items-end px-3">
                  <div>
                      <h3 className="text-lg font-black text-slate-800 tracking-tight">Histórico de Notas</h3>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Detalhes e anotações</p>
                  </div>
                  <button 
                    onClick={() => { setEditingNote(null); setIsNoteModalOpen(true); }}
                    className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all"
                  >
                    <Plus size={18} />
                  </button>
              </div>

              <div className="space-y-4 px-2">
                  {apeNotes.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-slate-300 border border-dashed border-slate-200 rounded-[3rem] bg-white/20">
                      <MessageSquare size={24} className="mb-4 opacity-20" />
                      <p className="text-[9px] font-black uppercase tracking-widest">Sem registros</p>
                    </div>
                  ) : (
                    apeNotes.map(note => (
                      <GlassCard key={note.id} className="border-white/40" padding="p-7">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-black text-slate-800 text-lg tracking-tight leading-tight">{note.title}</h4>
                          <div className="flex gap-1">
                            <button onClick={() => { setEditingNote(note); setNoteTitle(note.title); setNoteContent(note.content); setIsNoteModalOpen(true); }} className="p-2 text-slate-300 hover:text-cyan-500 transition-colors"><Edit3 size={14}/></button>
                            <button onClick={() => setApeNotes(apeNotes.filter(n => n.id !== note.id))} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={14}/></button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">{note.content}</p>
                      </GlassCard>
                    ))
                  )}
              </div>
          </div>
      </div>

      {/* Modal de Ajuste */}
      {isEditModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 bg-slate-900/30 backdrop-blur-2xl animate-in fade-in duration-500">
              <GlassCard className="w-full max-w-sm rounded-t-[3rem] sm:rounded-[3rem] shadow-[0_-10px_60px_rgba(0,0,0,0.15)] border-t border-white/60 bg-white" padding="p-8 pb-10">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase tracking-widest opacity-40">Progresso</h3>
                    <button onClick={() => setIsEditModalOpen(false)} className="p-3 rounded-full bg-slate-100/50 text-slate-400 hover:bg-slate-100 transition-colors"><X size={20} /></button>
                  </div>
                  
                  <div className="space-y-10">
                      <div className="text-center">
                          <span className="text-8xl font-black tracking-tighter text-slate-900 tabular-nums block drop-shadow-sm">
                            {tempProgress}%
                          </span>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2 block opacity-60">Sincronização em tempo real</span>
                      </div>

                      <div className="space-y-8">
                        <div className="relative py-2 px-4">
                            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-1 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-cyan-200" style={{ width: `${tempProgress}%` }} />
                            </div>
                            <input 
                              type="range" 
                              min="0" 
                              max="100" 
                              value={tempProgress}
                              onChange={e => setTempProgress(parseInt(e.target.value))}
                              className="relative z-10 w-full h-10 bg-transparent appearance-none cursor-pointer accent-slate-900"
                            />
                            <div className="flex justify-between mt-2">
                                {[0, 50, 100].map(val => (
                                    <span key={val} className={`text-[8px] font-black transition-all ${tempProgress === val ? 'text-slate-900 scale-125' : 'text-slate-300'}`}>
                                        {val}%
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-center items-center gap-8">
                            <button 
                                onClick={() => setTempProgress(Math.max(0, tempProgress - 1))}
                                className="w-14 h-14 rounded-full bg-white border border-slate-100 text-slate-900 flex items-center justify-center active:scale-90 transition-all font-light text-2xl shadow-sm hover:shadow-md"
                            >−</button>
                            <div className="flex flex-col items-center">
                              <span className="text-[10px] font-black text-slate-900 tracking-widest">{tempProgress}</span>
                              <div className="w-1 h-1 rounded-full bg-cyan-500 mt-1" />
                            </div>
                            <button 
                                onClick={() => setTempProgress(Math.min(100, tempProgress + 1))}
                                className="w-14 h-14 rounded-full bg-white border border-slate-100 text-slate-900 flex items-center justify-center active:scale-90 transition-all font-light text-2xl shadow-sm hover:shadow-md"
                            >+</button>
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                          <button 
                            onClick={() => setIsEditModalOpen(false)} 
                            className="flex-1 py-4 rounded-[1.8rem] bg-slate-50 text-slate-400 font-black uppercase tracking-widest text-[9px] active:scale-95 transition-all"
                          >
                            Cancelar
                          </button>
                          <button 
                            onClick={handleUpdateProgress} 
                            className="flex-1 py-4 rounded-[1.8rem] bg-slate-900 text-white font-black uppercase tracking-widest text-[9px] shadow-lg shadow-slate-200 active:scale-95 transition-all"
                          >
                            Salvar
                          </button>
                      </div>
                  </div>
              </GlassCard>
          </div>
      )}

      {/* Modal de Notas */}
      {isNoteModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/30 backdrop-blur-2xl animate-in fade-in">
              <GlassCard className="w-full max-w-sm border-white/60 shadow-2xl bg-white" padding="p-10">
                  <div className="flex justify-between items-center mb-10">
                    <h3 className="text-xl font-black text-slate-900 tracking-tighter">Anotação da Obra</h3>
                    <button onClick={closeNoteModal} className="p-2 text-slate-300 hover:text-slate-900 transition-colors"><X size={20}/></button>
                  </div>
                  <div className="space-y-6">
                      <input 
                        type="text" 
                        value={noteTitle}
                        onChange={e => setNoteTitle(e.target.value)}
                        placeholder="Título da anotação"
                        className="w-full py-4 border-b border-slate-100 font-black text-slate-900 outline-none placeholder:text-slate-200 text-lg"
                      />
                      <textarea 
                        value={noteContent}
                        onChange={e => setNoteContent(e.target.value)}
                        placeholder="Descreva detalhes técnicos ou lembretes..."
                        rows={5}
                        className="w-full py-4 font-medium text-slate-600 outline-none placeholder:text-slate-200 resize-none leading-relaxed text-sm"
                      />
                      <button 
                        onClick={handleSaveNote} 
                        className="w-full py-5 rounded-[2rem] bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] shadow-xl active:scale-95 transition-all mt-4"
                      >
                        Confirmar Nota
                      </button>
                  </div>
              </GlassCard>
          </div>
      )}
    </div>
  );
};
