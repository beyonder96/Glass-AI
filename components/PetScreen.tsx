import React, { useState, useMemo } from 'react';
import { ChevronLeft, Plus, Trash2, PawPrint, Dog, Cat, Bird, Save, X, Heart, Pencil, Syringe, Scale, Calendar, QrCode, ArrowRight, Activity, CalendarDays, TrendingUp } from 'lucide-react';
import { Pet, Vaccine, WeightEntry } from '../types';
import { GlassCard } from './GlassCard';
import { useData } from '../contexts/DataContext';

// Componente de Gráfico de Peso SVG
const WeightChart: React.FC<{ history: WeightEntry[] }> = ({ history }) => {
  const data = useMemo(() => {
    return [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [history]);

  if (data.length < 2) {
    return (
      <div className="h-32 flex flex-col items-center justify-center bg-white/20 rounded-3xl border border-dashed border-white/40">
        <TrendingUp size={24} className="text-slate-300 mb-2" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center px-4">
          Registre mais pesos para ver a tendência de saúde
        </p>
      </div>
    );
  }

  const padding = 20;
  const width = 300;
  const height = 120;
  
  const weights = data.map(d => d.weight);
  const minW = Math.min(...weights) * 0.95;
  const maxW = Math.max(...weights) * 1.05;
  const range = maxW - minW || 1;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((d.weight - minW) / range) * (height - padding * 2);
    return { x, y, weight: d.weight };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <div className="relative bg-white/30 backdrop-blur-md rounded-[2rem] border border-white/50 p-4 shadow-inner overflow-hidden">
      <div className="flex justify-between items-center mb-4 px-2">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Evolução de Peso</span>
        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
          <TrendingUp size={10} /> Ativo
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24 overflow-visible">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>
        
        {/* Área preenchida */}
        <path d={areaPath} fill="url(#areaGradient)" />
        
        {/* Linha de tendência */}
        <path 
          d={linePath} 
          fill="none" 
          stroke="url(#lineGradient)" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="drop-shadow-sm"
        />

        {/* Pontos de dados */}
        {points.map((p, i) => (
          <circle 
            key={i} 
            cx={p.x} 
            cy={p.y} 
            r="4" 
            fill="white" 
            stroke="#10b981" 
            strokeWidth="2" 
            className="hover:scale-150 transition-transform cursor-pointer"
          />
        ))}
      </svg>
      <div className="flex justify-between mt-2 px-1">
         <span className="text-[8px] font-bold text-slate-400 uppercase">{new Date(data[0].date).toLocaleDateString()}</span>
         <span className="text-[8px] font-bold text-slate-400 uppercase">{new Date(data[data.length-1].date).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

// FIX: Added missing interface definition for PetScreenProps
interface PetScreenProps {
  onBack: () => void;
}

export const PetScreen: React.FC<PetScreenProps> = ({ onBack }) => {
  const { pets, setPets } = useData();
  const [view, setView] = useState<'list' | 'form' | 'details'>('list');
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [type, setType] = useState<Pet['type']>('dog');
  const [breed, setBreed] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [microchip, setMicrochip] = useState('');

  const [isVaccineModalOpen, setIsVaccineModalOpen] = useState(false);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);

  const [vacName, setVacName] = useState('');
  const [vacDate, setVacDate] = useState('');
  const [vacNext, setVacNext] = useState('');

  const [weightVal, setWeightVal] = useState('');
  const [weightDate, setWeightDate] = useState('');

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const getSelectedPet = () => pets.find(p => p.id === selectedPetId);

  const calculateAge = (dateString?: string) => {
    if (!dateString) return 'Idade desconhecida';
    const today = new Date();
    const birth = new Date(dateString);
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
        years--;
        months += 12;
    }
    if (years === 0) return `${months} meses`;
    if (months === 0) return `${years} anos`;
    return `${years}a ${months}m`;
  };

  const resetForm = () => {
    setSelectedPetId(null);
    setName('');
    setType('dog');
    setBreed('');
    setBirthDate('');
    setMicrochip('');
    setView('list');
  };

  const startEdit = (pet: Pet) => {
    setSelectedPetId(pet.id);
    setName(pet.name);
    setType(pet.type);
    setBreed(pet.breed || '');
    setBirthDate(pet.birthDate || '');
    setMicrochip(pet.microchip || '');
    setView('form');
  };

  const openDetails = (pet: Pet) => {
      setSelectedPetId(pet.id);
      setView('details');
  };

  const handleSavePet = () => {
    if (!name.trim()) return;
    if (view === 'form' && selectedPetId) {
        setPets(pets.map(p => p.id === selectedPetId ? { ...p, name, type, breed, birthDate, microchip } : p));
        setView('list'); 
    } else {
        const newPet: Pet = {
            id: Date.now().toString(),
            name,
            type,
            breed,
            birthDate,
            microchip,
            weightHistory: [],
            vaccines: []
        };
        setPets([...pets, newPet]);
        setView('list');
    }
  };

  const confirmDelete = () => {
      if (deleteId) {
          setPets(pets.filter(p => p.id !== deleteId));
          setDeleteId(null);
          if (selectedPetId === deleteId) resetForm();
      }
  };

  const handleAddWeight = () => {
      if (!selectedPetId || !weightVal) return;
      const wEntry: WeightEntry = {
          id: Date.now().toString(),
          weight: parseFloat(weightVal),
          date: weightDate || new Date().toISOString().split('T')[0]
      };
      setPets(pets.map(p => {
          if (p.id === selectedPetId) {
              const history = p.weightHistory ? [...p.weightHistory, wEntry] : [wEntry];
              history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
              return { ...p, weightHistory: history };
          }
          return p;
      }));
      setWeightVal('');
      setWeightDate('');
      setIsWeightModalOpen(false);
  };

  const handleDeleteWeight = (wId: string) => {
      if(!selectedPetId) return;
      setPets(pets.map(p => {
          if (p.id === selectedPetId && p.weightHistory) {
              return { ...p, weightHistory: p.weightHistory.filter(w => w.id !== wId) };
          }
          return p;
      }));
  };

  const handleAddVaccine = () => {
      if (!selectedPetId || !vacName) return;
      const vEntry: Vaccine = {
          id: Date.now().toString(),
          name: vacName,
          dateAdministered: vacDate || new Date().toISOString().split('T')[0],
          nextDueDate: vacNext
      };
      setPets(pets.map(p => {
          if (p.id === selectedPetId) {
              const vacs = p.vaccines ? [...p.vaccines, vEntry] : [vEntry];
              vacs.sort((a, b) => {
                  const dateA = a.nextDueDate || '9999-12-31';
                  const dateB = b.nextDueDate || '9999-12-31';
                  return new Date(dateA).getTime() - new Date(dateB).getTime();
              });
              return { ...p, vaccines: vacs };
          }
          return p;
      }));
      setVacName('');
      setVacDate('');
      setVacNext('');
      setIsVaccineModalOpen(false);
  };

  const handleDeleteVaccine = (vId: string) => {
    if(!selectedPetId) return;
    setPets(pets.map(p => {
        if (p.id === selectedPetId && p.vaccines) {
            return { ...p, vaccines: p.vaccines.filter(v => v.id !== vId) };
        }
        return p;
    }));
  };

  const getIcon = (type: string) => {
      switch(type) {
          case 'dog': return <Dog size={24} />;
          case 'cat': return <Cat size={24} />;
          case 'bird': return <Bird size={24} />;
          default: return <PawPrint size={24} />;
      }
  };

  const getTypeLabel = (type: string) => {
      switch(type) {
          case 'dog': return 'Cachorro';
          case 'cat': return 'Gato';
          case 'bird': return 'Ave';
          default: return 'Outro';
      }
  };

  const renderDeleteModal = () => (
    deleteId && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
            <GlassCard className="w-full max-w-xs shadow-2xl animate-in zoom-in-95 duration-200" padding="p-6">
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mb-3">
                        <Trash2 size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Remover?</h3>
                    <p className="text-sm text-slate-500 mt-1 leading-snug">Essa ação é irreversível.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setDeleteId(null)} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all">Cancelar</button>
                    <button onClick={confirmDelete} className="flex-1 py-3 rounded-xl bg-rose-500 text-white font-bold shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all">Confirmar</button>
                </div>
            </GlassCard>
        </div>
    )
  );

  if (view === 'details' && selectedPetId) {
      const pet = getSelectedPet()!;
      const lastWeight = pet.weightHistory?.[0]?.weight;
      
      return (
          <div className="flex flex-col h-full w-full animate-in slide-in-from-right duration-500 relative">
              {renderDeleteModal()}
              
              {isVaccineModalOpen && (
                 <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm animate-in fade-in">
                    <GlassCard className="w-full max-w-sm animate-in zoom-in-95" padding="p-5">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Syringe size={20} className="text-indigo-500"/> Nova Vacina</h3>
                        <div className="space-y-3">
                            <input type="text" placeholder="Nome da Vacina" value={vacName} onChange={e => setVacName(e.target.value)} className="w-full p-3 rounded-xl bg-white/50 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-400/50"/>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Data Aplicação</label>
                                <input type="date" value={vacDate} onChange={e => setVacDate(e.target.value)} className="w-full p-3 rounded-xl bg-white/50 font-medium text-slate-800 outline-none focus:ring-2 focus:ring-indigo-400/50"/>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Próxima Dose</label>
                                <input type="date" value={vacNext} onChange={e => setVacNext(e.target.value)} className="w-full p-3 rounded-xl bg-white/50 font-medium text-slate-800 outline-none focus:ring-2 focus:ring-indigo-400/50"/>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button onClick={() => setIsVaccineModalOpen(false)} className="flex-1 py-3 rounded-xl bg-slate-200 text-slate-600 font-bold">Cancelar</button>
                                <button onClick={handleAddVaccine} className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold shadow-lg">Salvar</button>
                            </div>
                        </div>
                    </GlassCard>
                 </div>
              )}

              {isWeightModalOpen && (
                 <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm animate-in fade-in">
                    <GlassCard className="w-full max-w-sm animate-in zoom-in-95" padding="p-5">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Scale size={20} className="text-emerald-500"/> Registrar Peso</h3>
                        <div className="space-y-3">
                            <div className="relative">
                                <input type="number" placeholder="Peso (kg)" value={weightVal} onChange={e => setWeightVal(e.target.value)} className="w-full p-3 rounded-xl bg-white/50 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-400/50" step="0.1"/>
                                <span className="absolute right-4 top-3.5 text-slate-400 font-bold text-sm">kg</span>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Data Pesagem</label>
                                <input type="date" value={weightDate} onChange={e => setWeightDate(e.target.value)} className="w-full p-3 rounded-xl bg-white/50 font-medium text-slate-800 outline-none focus:ring-2 focus:ring-emerald-400/50"/>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button onClick={() => setIsWeightModalOpen(false)} className="flex-1 py-3 rounded-xl bg-slate-200 text-slate-600 font-bold">Cancelar</button>
                                <button onClick={handleAddWeight} className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold shadow-lg">Salvar</button>
                            </div>
                        </div>
                    </GlassCard>
                 </div>
              )}

              <div className="flex items-center gap-4 mb-4">
                <button onClick={() => setView('list')} className="p-3 rounded-full bg-white/30 hover:bg-white/50 text-slate-800 transition-all active:scale-90">
                  <ChevronLeft size={24} />
                </button>
                <div className="flex-1">
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none">{pet.name}</h2>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1 flex items-center gap-1">
                      {pet.breed || getTypeLabel(pet.type)} • {calculateAge(pet.birthDate)}
                  </p>
                </div>
                <button onClick={() => startEdit(pet)} className="p-3 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all"><Pencil size={20} /></button>
              </div>

              <div className="flex gap-2 mb-4">
                 <GlassCard className="flex-1 bg-white/40" padding="p-4">
                     <div className="flex items-center gap-3 mb-1">
                         <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600"><Scale size={16} /></div>
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Peso Atual</span>
                     </div>
                     <p className="text-2xl font-black text-slate-800">{lastWeight ? `${lastWeight} kg` : '--'}</p>
                 </GlassCard>
                 {pet.microchip && (
                    <GlassCard className="flex-1 bg-white/40" padding="p-4">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 rounded-lg bg-blue-100 text-blue-600"><QrCode size={16} /></div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Microchip</span>
                        </div>
                        <p className="text-sm font-bold text-slate-800 break-all">{pet.microchip}</p>
                    </GlassCard>
                 )}
              </div>

              {/* Gráfico de Tendência de Peso */}
              <div className="mb-6">
                <WeightChart history={pet.weightHistory || []} />
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 space-y-6">
                  <div>
                      <div className="flex items-center justify-between mb-3 px-1">
                          <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                              <Syringe size={16} className="text-indigo-500"/> Vacinas
                          </h3>
                          <button onClick={() => { setVacName(''); setVacDate(''); setVacNext(''); setIsVaccineModalOpen(true); }} className="text-[10px] font-bold bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-200 transition-colors">+ ADICIONAR</button>
                      </div>
                      <div className="space-y-2">
                          {(!pet.vaccines || pet.vaccines.length === 0) ? (
                              <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-slate-400 text-xs font-medium">Nenhuma vacina registrada</div>
                          ) : (
                              pet.vaccines.map(vac => {
                                  const isLate = vac.nextDueDate && new Date(vac.nextDueDate) < new Date();
                                  return (
                                    <div key={vac.id} className="flex items-center justify-between p-3 bg-white/40 border border-white/50 rounded-xl relative overflow-hidden group">
                                        {isLate && <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500" />}
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-800 text-sm">{vac.name}</p>
                                            <div className="flex gap-3 mt-1">
                                                <p className="text-[10px] text-slate-500 font-medium">Aplicada: {new Date(vac.dateAdministered).toLocaleDateString()}</p>
                                                {vac.nextDueDate && <p className={`text-[10px] font-bold ${isLate ? 'text-rose-500' : 'text-emerald-600'}`}>Vence: {new Date(vac.nextDueDate).toLocaleDateString()}</p>}
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeleteVaccine(vac.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><X size={16}/></button>
                                    </div>
                                  );
                              })
                          )}
                      </div>
                  </div>

                  <div>
                      <div className="flex items-center justify-between mb-3 px-1">
                          <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                              <Activity size={16} className="text-emerald-500"/> Histórico Peso
                          </h3>
                          <button onClick={() => { setWeightVal(''); setWeightDate(''); setIsWeightModalOpen(true); }} className="text-[10px] font-bold bg-emerald-100 text-emerald-600 px-3 py-1.5 rounded-lg hover:bg-emerald-200 transition-colors">+ REGISTRAR</button>
                      </div>
                      <div className="space-y-2">
                           {(!pet.weightHistory || pet.weightHistory.length === 0) ? (
                              <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-slate-400 text-xs font-medium">Nenhum peso registrado</div>
                          ) : (
                              pet.weightHistory.map(w => (
                                  <div key={w.id} className="flex items-center justify-between p-3 bg-white/40 border border-white/50 rounded-xl group">
                                      <div className="flex items-center gap-3">
                                          <div className="p-1.5 bg-white/50 rounded-lg text-slate-500"><CalendarDays size={14}/></div>
                                          <span className="text-xs font-bold text-slate-600">{new Date(w.date).toLocaleDateString()}</span>
                                      </div>
                                      <div className="flex items-center gap-4">
                                          <span className="font-black text-slate-800 text-sm">{w.weight} kg</span>
                                          <button onClick={() => handleDeleteWeight(w.id)} className="text-slate-300 hover:text-rose-500 transition-colors"><X size={14}/></button>
                                      </div>
                                  </div>
                              ))
                          )}
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  if (view === 'form') {
      return (
        <div className="flex flex-col h-full w-full animate-in slide-in-from-right duration-500 relative">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => setView('list')} className="p-3 rounded-full bg-white/30 hover:bg-white/50 text-slate-800 transition-all active:scale-90"><ChevronLeft size={24} /></button>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">{selectedPetId ? 'Editar Pet' : 'Novo Pet'}</h2>
            </div>
            <GlassCard padding="p-5">
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2 custom-scrollbar">
                    {(['dog', 'cat', 'bird', 'other'] as const).map(t => (
                        <button key={t} onClick={() => setType(t)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${type === t ? 'bg-indigo-500 text-white shadow-md' : 'bg-white/40 text-slate-500 hover:bg-white/60'}`}>
                            {t === 'dog' && <Dog size={14} />}
                            {t === 'cat' && <Cat size={14} />}
                            {t === 'bird' && <Bird size={14} />}
                            {getTypeLabel(t)}
                        </button>
                    ))}
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 mb-1 block">Nome</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 rounded-xl bg-white/50 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-400/50"/>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 mb-1 block">Raça</label>
                        <input type="text" value={breed} onChange={e => setBreed(e.target.value)} className="w-full p-3 rounded-xl bg-white/50 font-medium text-slate-800 outline-none focus:ring-2 focus:ring-indigo-400/50"/>
                    </div>
                    <div className="flex gap-3">
                         <div className="flex-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 mb-1 block">Nascimento</label>
                            <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="w-full p-3 rounded-xl bg-white/50 font-medium text-slate-800 outline-none focus:ring-2 focus:ring-indigo-400/50"/>
                         </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 mb-1 block flex items-center gap-1"><QrCode size={12}/> Microchip (Opcional)</label>
                        <input type="text" value={microchip} onChange={e => setMicrochip(e.target.value)} className="w-full p-3 rounded-xl bg-white/50 font-medium text-slate-800 outline-none focus:ring-2 focus:ring-indigo-400/50 font-mono"/>
                    </div>
                    <button onClick={handleSavePet} className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 mt-2"><Save size={18} /> Salvar Informações</button>
                </div>
            </GlassCard>
        </div>
      );
  }

  return (
    <div className="flex flex-col h-full w-full animate-in slide-in-from-right duration-500 relative">
      {renderDeleteModal()}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-3 rounded-full bg-white/30 hover:bg-white/50 text-slate-800 transition-all active:scale-90"><ChevronLeft size={24} /></button>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Meus Pets</h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Saúde & Bem-estar</p>
        </div>
      </div>
      <GlassCard className="mb-6 bg-gradient-to-br from-indigo-50 to-purple-50" padding="p-6">
          <div className="flex justify-between items-center">
              <div>
                  <p className="text-3xl font-black text-indigo-600">{pets.length}</p>
                  <p className="text-xs font-bold text-indigo-800/60 uppercase tracking-wider">Animais Cadastrados</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm"><Heart size={24} fill="currentColor" className="text-indigo-400" /></div>
          </div>
      </GlassCard>
      <div className="flex justify-end mb-4">
        <button onClick={() => { resetForm(); setView('form'); }} className="flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg active:scale-95 font-bold text-sm bg-slate-800 text-white"><Plus size={18} /> Novo Pet</button>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 space-y-3">
        {pets.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-12 text-slate-400 opacity-60"><PawPrint size={48} className="mb-2" /><p className="text-xs font-bold uppercase tracking-widest">Nenhum pet cadastrado</p></div>
        ) : (
            pets.map(pet => (
                <div key={pet.id} onClick={() => openDetails(pet)} className="group flex items-center justify-between p-4 bg-white/40 backdrop-blur-sm border border-white/50 rounded-2xl hover:bg-white/60 transition-all cursor-pointer relative">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm text-white shrink-0 ${pet.type === 'dog' ? 'bg-orange-400' : pet.type === 'cat' ? 'bg-purple-400' : pet.type === 'bird' ? 'bg-sky-400' : 'bg-slate-400'}`}>{getIcon(pet.type)}</div>
                        <div className="min-w-0">
                            <p className="font-bold text-slate-800 text-lg leading-tight truncate">{pet.name}</p>
                            <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5 whitespace-nowrap overflow-hidden">
                              {pet.breed || getTypeLabel(pet.type)}
                              <span className="w-1 h-1 rounded-full bg-slate-300 mx-1 shrink-0" />
                              {calculateAge(pet.birthDate)}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 shrink-0 ml-2">
                        {/* Ações agrupadas de forma segura à direita */}
                        <div className="flex flex-col items-end gap-1">
                            <button 
                                onClick={(e) => { e.stopPropagation(); setDeleteId(pet.id); }} 
                                className="p-2 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-white/50 transition-all opacity-0 group-hover:opacity-100 active:scale-90"
                            >
                                <Trash2 size={16} />
                            </button>
                            <div className="flex items-center gap-2">
                                {(pet.vaccines && pet.vaccines.length > 0) && <div className="w-2 h-2 rounded-full bg-emerald-500" title="Vacinas registradas" />}
                                <ArrowRight size={20} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                            </div>
                        </div>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
};