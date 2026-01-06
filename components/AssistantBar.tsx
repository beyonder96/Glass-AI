
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Send, ChevronLeft, Sparkles, StopCircle, Mic, MicOff, Volume2, ExternalLink, Waves, Pause, Play, Loader2, MapPin, MessageSquarePlus, Wallet, Calendar, ShoppingCart, Zap, Newspaper, Navigation, CheckCircle2, TrendingUp, Power, Circle, X, ArrowUpRight, ArrowDownLeft, Database } from 'lucide-react';
import { sendMessageStream, getAudioData, decode, decodeAudioData, LocationCoords, resetChatSession, getAssistantChat } from '../services/geminiService';
import { Message, GroundingSource, VoiceId, PersonaId, Task as TaskType, ShoppingItem, Transaction, Pet, AppMemory } from '../types';
import { GenerateContentResponse } from "@google/genai";
import { useData } from '../contexts/DataContext';

interface AudioState {
  msgId: number;
  status: 'idle' | 'loading' | 'playing' | 'paused';
  totalDuration: number;
  elapsedTime: number;
}

interface AssistantBarProps {
  isOpen: boolean;
  onToggle: (isOpen: boolean) => void;
  currentVoice: VoiceId;
  currentPersona: PersonaId;
}

// Pulse Visivo (ChatGPT Style)
const AuraPulse: React.FC<{ state: 'idle' | 'thinking' | 'speaking' }> = ({ state }) => {
    return (
        <div className="relative flex items-center justify-center w-48 h-48 mx-auto my-12">
            {state === 'speaking' && (
                <>
                    <div className="absolute inset-0 rounded-full border border-slate-400/30 animate-aura-waves" style={{ animationDelay: '0s' }} />
                    <div className="absolute inset-0 rounded-full border border-slate-400/20 animate-aura-waves" style={{ animationDelay: '0.5s' }} />
                </>
            )}
            <div className={`absolute inset-0 bg-slate-400 rounded-full blur-[60px] opacity-20 transition-all duration-1000 ${state === 'thinking' ? 'scale-125 opacity-40' : 'scale-100'}`} />
            <div className={`relative z-10 w-24 h-24 rounded-full aura-orb-mesh flex items-center justify-center transition-all duration-700 ${state === 'thinking' ? 'scale-110 animate-pulse-fast' : 'scale-100 animate-float'}`}>
                {state === 'thinking' ? <Sparkles size={24} className="text-white/80 animate-spin" /> : state === 'speaking' ? <Waves size={24} className="text-white/80 animate-pulse" /> : <Zap size={24} className="text-white/40" fill="currentColor" />}
            </div>
        </div>
    );
};

// --- SNIPPETS INTERATIVOS ---

const TaskSnippet = ({ tasks }: { tasks: TaskType[] }) => {
    const { setTasks, tasks: allTasks } = useData();
    const toggleTask = (id: string) => setTasks(allTasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    return (
        <div className="mt-4 p-5 bg-white/40 backdrop-blur-xl border border-white/50 rounded-[2rem] shadow-sm space-y-3">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Foco do Dia</p>
            {tasks.map(task => (
                <button key={task.id} onClick={() => toggleTask(task.id)} className="flex items-center gap-3 w-full p-2.5 hover:bg-white/40 rounded-2xl transition-all group text-left">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 text-transparent group-hover:border-indigo-400'}`}>
                        {task.completed && <CheckCircle2 size={12} />}
                    </div>
                    <span className={`text-xs font-bold truncate flex-1 ${task.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{task.title}</span>
                </button>
            ))}
        </div>
    );
};

const ShoppingSnippet = ({ items }: { items: ShoppingItem[] }) => {
    const { setShoppingList, shoppingList: allItems } = useData();
    const toggleItem = (id: string) => setShoppingList(allItems.map(i => i.id === id ? { ...i, completed: !i.completed } : i));
    return (
        <div className="mt-4 p-5 bg-amber-50/40 backdrop-blur-xl border border-amber-100/50 rounded-[2rem] shadow-sm space-y-3">
            <div className="flex justify-between items-center">
                <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Lista de Compras</p>
                <ShoppingCart size={12} className="text-amber-400" />
            </div>
            {items.map(item => (
                <button key={item.id} onClick={() => toggleItem(item.id)} className="flex items-center gap-3 w-full p-2.5 hover:bg-white/40 rounded-2xl transition-all group text-left">
                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center border-2 transition-all ${item.completed ? 'bg-amber-500 border-amber-500 text-white' : 'border-amber-200 text-transparent'}`}>
                        {item.completed && <CheckCircle2 size={12} />}
                    </div>
                    <span className={`text-xs font-bold truncate flex-1 ${item.completed ? 'text-amber-800/40 line-through' : 'text-slate-800'}`}>{item.name}</span>
                </button>
            ))}
        </div>
    );
};

const FinanceSnippet = ({ transactions }: { transactions: Transaction[] }) => {
    const balance = transactions.reduce((acc, curr) => curr.type === 'income' ? acc + curr.amount : acc - curr.amount, 0);
    return (
        <div className="mt-4 p-5 bg-emerald-50/40 backdrop-blur-xl border border-emerald-100/50 rounded-[2rem] shadow-sm">
            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-3">Resumo Financeiro</p>
            <div className="flex items-end justify-between">
                <div>
                    <h4 className="text-2xl font-black text-slate-800 tracking-tighter tabular-nums">R$ {balance.toLocaleString('pt-BR')}</h4>
                    <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">SALDO DISPONÍVEL <Wallet size={10}/></p>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500"><ArrowUpRight size={10}/> R$ 3.5k</div>
                    <div className="flex items-center gap-1 text-[10px] font-black text-rose-400"><ArrowDownLeft size={10}/> R$ 1.2k</div>
                </div>
            </div>
        </div>
    );
};

const ApeSnippet = ({ progress }: { progress: number }) => {
    return (
        <div className="mt-4 p-6 bg-cyan-50/40 backdrop-blur-xl border border-cyan-100/50 rounded-[2.5rem] shadow-sm">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <p className="text-[9px] font-black text-cyan-600 uppercase tracking-widest">Evolução da Obra</p>
                    <h4 className="text-4xl font-black text-slate-800 tracking-tighter tabular-nums mt-1">{progress}%</h4>
                </div>
                <div className="p-3 bg-white/60 rounded-2xl shadow-sm text-cyan-600"><TrendingUp size={18} /></div>
            </div>
            <div className="h-2 w-full bg-white/50 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-4 text-center">Fase de Acabamento • Sincronizado</p>
        </div>
    );
};

// --- COMPONENTES PRINCIPAIS ---

const MessageItem = React.memo(({ 
  msg, 
  idx, 
  audioState, 
  onToggleTTS 
}: { 
  msg: Message, 
  idx: number, 
  audioState: any, 
  onToggleTTS: (text: string, id: number) => void 
}) => {
  const isModel = msg.role === 'model';
  const isPlaying = audioState.msgId === idx && audioState.status !== 'idle';
  const { tasks, shoppingList, transactions, apePhases } = useData();

  // Heurísticas de detecção MULTI-CONTEXTO
  const lowerText = msg.text.toLowerCase();
  const activeContexts = useMemo(() => {
      if (!isModel) return [];
      const contexts: string[] = [];
      
      // Checagem independente para cada widget (permite múltiplos)
      if (lowerText.includes('tarefa') || lowerText.includes('pendente')) contexts.push('task');
      if (lowerText.includes('mercado') || lowerText.includes('compra') || lowerText.includes('lista')) contexts.push('shopping');
      if (lowerText.includes('saldo') || lowerText.includes('financeiro') || lowerText.includes('carteira') || lowerText.includes('r$')) contexts.push('finance');
      if (lowerText.includes('obra') || lowerText.includes('apê') || lowerText.includes('apartamento')) contexts.push('ape');
      
      return contexts;
  }, [msg.text, isModel, lowerText]);

  if (!msg.text && isModel) return null;

  return (
    <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300 gap-2 w-full`}>
      <div className={`
        relative max-w-[94%] p-6 rounded-[2.5rem] text-[1.05rem] leading-relaxed backdrop-blur-md border border-white/40 shadow-sm
        ${msg.role === 'user' ? 'bg-slate-800 text-white rounded-br-none shadow-slate-200' : 'bg-white/90 text-slate-800 rounded-bl-none'}
      `}>
        {msg.text.split('\n').map((line, i) => <p key={i} className="mb-2 last:mb-0">{line}</p>)}
        
        {isModel && msg.text && (
          <div className="flex justify-end mt-4 -mr-2 -mb-2">
            <button 
              onClick={() => onToggleTTS(msg.text, idx)} 
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition-all shadow-lg border border-white/40 ${isPlaying ? 'bg-slate-800 text-white' : 'bg-white/60 text-slate-600'}`}
            >
              {audioState.msgId === idx ? <span className="text-[9px] font-black uppercase tracking-widest">PARAR</span> : <><Volume2 size={12} /><span className="text-[9px] font-black uppercase tracking-widest">OUVIR</span></>}
            </button>
          </div>
        )}

        {/* Renderização em Pilha de Snippets Interativos */}
        <div className="space-y-4">
            {activeContexts.includes('finance') && <FinanceSnippet transactions={transactions} />}
            {activeContexts.includes('task') && <TaskSnippet tasks={tasks.filter(t => !t.completed).slice(0, 3)} />}
            {activeContexts.includes('shopping') && <ShoppingSnippet items={shoppingList.filter(i => !i.completed).slice(0, 3)} />}
            {activeContexts.includes('ape') && <ApeSnippet progress={apePhases[0]?.progress || 0} />}
        </div>
      </div>

      {isModel && msg.groundingSources && msg.groundingSources.length > 0 && (
        <div className="flex flex-wrap gap-2 px-2 max-w-full">
          {msg.groundingSources.map((source, sIdx) => (
            <a key={sIdx} href={source.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-md rounded-xl border border-white/60 text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all shadow-sm group">
              <Navigation size={10} className="group-hover:rotate-12 transition-transform" />
              <span className="truncate max-w-[120px]">{source.title}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
});

export const AssistantBar: React.FC<AssistantBarProps> = ({ isOpen, onToggle, currentVoice }) => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [audioState, setAudioState] = useState<AudioState>({ msgId: -1, status: 'idle', totalDuration: 0, elapsedTime: 0 });
  const { apePhases, transactions, tasks, shoppingList, pets, memory } = useData();
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const ttsAudioCtxRef = useRef<AudioContext | null>(null);
  const ttsSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const auraCurrentState = useMemo(() => {
    if (isLoading) return 'thinking';
    if (audioState.status === 'playing') return 'speaking';
    return 'idle';
  }, [isLoading, audioState.status]);

  const compileUserDataContext = useCallback(() => {
    const mainApe = apePhases[0] || { progress: 0 };
    const balance = transactions.reduce((acc, curr) => curr.type === 'income' ? acc + curr.amount : acc - curr.amount, 0);
    const petList = pets.map(p => `${p.name} (${p.type})`).join(', ');
    const pendingTasks = tasks.filter(t => !t.completed).map(t => t.title).join(', ');
    const itemsNeeded = shoppingList.filter(s => !s.completed).map(s => s.name).join(', ');
    const facts = memory.map(m => m.fact).join('. ');

    return `
      MEMÓRIA PERMANENTE DO USUÁRIO: ${facts || 'Nenhuma memória específica ainda.'}
      
      DADOS ATUAIS DO APP (O QUE VOCÊ LEMBRA):
      - MEU APÊ: Está em ${mainApe.progress}% de construção.
      - FINANÇAS: Saldo atual é R$ ${balance.toLocaleString('pt-BR')}.
      - TAREFAS PENDENTES: ${pendingTasks || 'Nenhuma pendente.'}
      - LISTA DE MERCADO: ${itemsNeeded || 'Nenhum item faltando.'}
      - MEUS PETS: ${petList || 'Nenhum pet cadastrado.'}
      
      IMPORTANTE: Use esses dados para responder de forma pessoal. Se ele perguntar "Como está o [Nome do Pet]?", você já sabe quem é.
    `.trim();
  }, [apePhases, transactions, tasks, shoppingList, pets, memory]);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isLoading, isOpen]);

  const handleSend = async (text?: string) => {
    const activeText = text || inputValue;
    if (!activeText.trim() || isLoading) return;
    onToggle(true);
    setMessages(prev => [...prev, { role: 'user', text: activeText, timestamp: new Date() }]);
    setInputValue('');
    setIsLoading(true);

    try {
        let location: LocationCoords | undefined;
        try {
          const pos = await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 3000 }));
          location = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        } catch(e) {}

        const streamResult = await sendMessageStream(activeText, "Aura Interactive Context V3", location, compileUserDataContext());
        let fullText = '', messageAdded = false, groundingSources: GroundingSource[] = [];

        for await (const chunk of streamResult) {
            const c = chunk as GenerateContentResponse;
            if (c.candidates?.[0]?.groundingMetadata?.groundingChunks) {
                c.candidates[0].groundingMetadata.groundingChunks.forEach((chunk: any) => {
                    if (chunk.maps) groundingSources.push({ title: chunk.maps.title, uri: chunk.maps.uri });
                    else if (chunk.web) groundingSources.push({ title: chunk.web.title, uri: chunk.web.uri });
                });
            }
            if (c.text) {
                if (!messageAdded) { setMessages(prev => [...prev, { role: 'model', text: '', timestamp: new Date(), groundingSources: [] }]); messageAdded = true; }
                fullText += c.text;
                setMessages(prev => {
                    const next = [...prev];
                    const lastMsg = next[next.length - 1];
                    next[next.length - 1] = { ...lastMsg, text: fullText, groundingSources: [...(lastMsg.groundingSources || []), ...groundingSources] };
                    return next;
                });
                groundingSources = [];
            }
        }
    } catch (e) {
        setMessages(prev => [...prev, { role: 'model', text: 'Ops, tive um problema na conexão.', timestamp: new Date() }]);
    } finally { setIsLoading(false); }
  };

  const handleToggleTTS = async (text: string, msgId: number) => {
    if (audioState.msgId === msgId && audioState.status === 'playing') { ttsSourceRef.current?.stop(); setAudioState(prev => ({ ...prev, status: 'idle', msgId: -1 })); return; }
    setAudioState({ msgId, status: 'loading', totalDuration: 0, elapsedTime: 0 });
    const base64 = await getAudioData(text, currentVoice);
    if (base64) {
      if (!ttsAudioCtxRef.current) ttsAudioCtxRef.current = new AudioContext({ sampleRate: 24000 });
      const buffer = await decodeAudioData(decode(base64), ttsAudioCtxRef.current, 24000, 1);
      const source = ttsAudioCtxRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(ttsAudioCtxRef.current.destination);
      ttsSourceRef.current = source;
      source.start();
      setAudioState({ msgId, status: 'playing', totalDuration: buffer.duration, elapsedTime: 0 });
      source.onended = () => setAudioState({ msgId: -1, status: 'idle', totalDuration: 0, elapsedTime: 0 });
    }
  };

  return (
    <>
        <div className={`fixed inset-0 z-[60] flex flex-col max-w-md mx-auto px-4 pt-4 pb-24 transition-all duration-700 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
            <div className="flex items-center justify-between mb-4 py-2">
                <button onClick={() => onToggle(false)} className="p-3 -ml-2 rounded-full text-slate-800"><ChevronLeft size={28} /></button>
                <div className="flex items-center gap-2">
                    <Database size={12} className="text-emerald-500 animate-pulse" />
                    <span className="font-black text-slate-800 uppercase tracking-tighter text-sm">Aura Sincronizada</span>
                </div>
                <button onClick={() => { setMessages([]); resetChatSession(); }} className="p-3 rounded-full bg-white/40 text-slate-600"><MessageSquarePlus size={20} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar px-1 pb-48">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col animate-in fade-in duration-1000 items-center justify-center pt-8">
                        <AuraPulse state={auraCurrentState} />
                        <div className="text-center mb-10">
                            <p className="text-sm font-black text-slate-800 uppercase tracking-[0.3em]">Cérebro Glass</p>
                            <p className="text-xs mt-2 text-slate-400 italic">Memória de longa duração ativa.</p>
                        </div>
                        <div className="w-full grid grid-cols-2 gap-3 px-2">
                             <button onClick={() => handleSend("Meu saldo atual")} className="p-4 bg-white/40 border border-white/50 rounded-3xl flex flex-col items-center gap-2">
                                <Wallet size={18} className="text-emerald-500" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Saldo</span>
                             </button>
                             <button onClick={() => handleSend("Como está a obra?")} className="p-4 bg-white/40 border border-white/50 rounded-3xl flex flex-col items-center gap-2">
                                <TrendingUp size={18} className="text-cyan-500" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Obra</span>
                             </button>
                             <button onClick={() => handleSend("O que tenho pra fazer?")} className="p-4 bg-white/40 border border-white/50 rounded-3xl flex flex-col items-center gap-2">
                                <CheckCircle2 size={18} className="text-indigo-500" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Foco</span>
                             </button>
                             <button onClick={() => handleSend("O que falta no mercado?")} className="p-4 bg-white/40 border border-white/50 rounded-3xl flex flex-col items-center gap-2">
                                <ShoppingCart size={18} className="text-amber-500" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Mercado</span>
                             </button>
                        </div>
                    </div>
                )}
                {messages.map((msg, idx) => (
                    <MessageItem key={idx} msg={msg} idx={idx} audioState={audioState} onToggleTTS={handleToggleTTS} />
                ))}
                <div ref={messagesEndRef} />
            </div>
        </div>
        
        <div className={`fixed bottom-0 left-0 right-0 z-[70] p-4 transition-all duration-500 ${isOpen ? 'translate-y-[-10px]' : ''}`}>
            <div className="max-w-md mx-auto relative">
                <div className="absolute inset-0 bg-white/90 backdrop-blur-[50px] rounded-[3.5rem] border border-white/60 shadow-2xl" />
                <div className="relative flex items-center p-3 gap-2">
                    <button 
                        onClick={() => {
                            if (audioState.status === 'playing') { ttsSourceRef.current?.stop(); setAudioState(prev => ({ ...prev, status: 'idle', msgId: -1 })); }
                            else { onToggle(true); }
                        }}
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white shrink-0 ml-1 shadow-lg transition-all ${auraCurrentState === 'speaking' ? 'bg-rose-500' : 'bg-slate-900'}`}
                    >
                        {auraCurrentState === 'speaking' ? <Power size={20} /> : <Sparkles size={20} />}
                    </button>
                    <input type="text" value={inputValue} onFocus={() => onToggle(true)} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} disabled={isLoading} placeholder="Como posso te ajudar?" className="flex-1 bg-transparent border-none outline-none px-2 py-4 text-slate-900 font-bold placeholder:text-slate-300" />
                    <button onClick={() => handleSend()} disabled={!inputValue.trim() || isLoading} className="w-12 h-12 rounded-full flex items-center justify-center bg-slate-800 text-white shadow-xl disabled:opacity-30 transition-all">
                        {isLoading ? <Loader2 size={22} className="animate-spin" /> : <Send size={22} />}
                    </button>
                </div>
            </div>
        </div>
    </>
  );
};
