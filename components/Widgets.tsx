
import React, { useState, useEffect, useMemo } from 'react';
import { GlassCard } from './GlassCard';
import { Sun, Building2, Pencil, Search, Loader2, CalendarDays, CloudRain, CloudSun, Coffee, Utensils, TreePine, Navigation, Music, Play, Pause, ExternalLink, Eye, EyeOff, Circle, CheckCircle2, Cloud, Thermometer, MapPin, Sparkles, Send, X } from 'lucide-react';
import { Transaction, Task, MusicTrack } from '../types';
import { useData } from '../contexts/DataContext';

export const WeatherWidget: React.FC = () => {
    const [weather, setWeather] = useState({ temp: '--', condition: 'Localizando...', loading: true });
    
    useEffect(() => {
        const fetchWeather = async (lat: number, lon: number) => {
            try {
                const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`);
                const data = await response.json();
                if (data.current_weather) {
                    const temp = Math.round(data.current_weather.temperature);
                    const code = data.current_weather.weathercode;
                    let cond = 'Céu Limpo';
                    if (code > 0 && code <= 3) cond = 'Parcialmente Nublado';
                    if (code >= 45 && code <= 48) cond = 'Neblina';
                    if (code >= 51 && code <= 67) cond = 'Chuva';
                    if (temp > 28) cond = 'Ensolarado';

                    setWeather({ 
                        temp: `${temp}°`, 
                        condition: cond, 
                        loading: false 
                    });
                }
            } catch (e) {
                setWeather({ temp: '22°', condition: 'Sincronizado', loading: false });
            }
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
                () => setWeather({ temp: '22°', condition: 'São Paulo', loading: false })
            );
        } else {
            setWeather({ temp: '22°', condition: 'Sincronizado', loading: false });
        }
    }, []);

    return (
        <GlassCard interactive className="h-full flex items-center justify-between !rounded-full bg-white/40 border-white/30" padding="px-8 py-2">
            <div className="flex items-center gap-4">
                {weather.loading ? <Loader2 size={18} className="animate-spin text-indigo-400" /> : <Sun size={20} className="text-amber-500 animate-soft-pulse" />}
                <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-800 tracking-tight leading-none">{weather.temp}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 truncate max-w-[80px]">{weather.condition}</span>
                </div>
            </div>
            <div className="h-4 w-[1px] bg-slate-200/50" />
            <div className="flex items-center gap-2">
                <Navigation size={10} className="text-indigo-500" />
                <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest">Agora</span>
            </div>
        </GlassCard>
    );
};

export const ApeWidget: React.FC<{ onClick: () => void }> = ({ onClick }) => {
    const { apePhases } = useData();
    const progress = apePhases[0]?.progress || 0;

    return (
        <GlassCard interactive onClick={onClick} className="h-full flex flex-col justify-between border-white/40" padding="p-6">
            <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                    <Building2 size={18} />
                </div>
                <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Meu Apê</p>
                    <p className="text-2xl font-black text-slate-800 tracking-tighter mt-1">{progress}%</p>
                </div>
            </div>
            
            <div className="mt-auto">
                <div className="h-[2px] w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-cyan-500 rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="flex justify-between mt-3">
                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Evolução</span>
                    <span className="text-[8px] font-black text-cyan-500 uppercase tracking-widest flex items-center gap-1"><Pencil size={8} /> Ajustar</span>
                </div>
            </div>
        </GlassCard>
    );
};

export const FinanceWidget: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
    const { transactions } = useData();
    const [isVisible, setIsVisible] = useState(false);
    const balance = transactions.reduce((acc, curr) => curr.type === 'income' ? acc + curr.amount : acc - curr.amount, 0);

    return (
        <GlassCard interactive={!!onClick} onClick={onClick} className="h-full flex flex-col justify-between border-white/40" padding="p-6">
            <div className="flex justify-between items-start mb-4">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Patrimônio</p>
                <button 
                    onClick={(e) => { e.stopPropagation(); setIsVisible(!isVisible); }} 
                    className="p-1 rounded-lg hover:bg-white/40 text-slate-400 text-slate-600 hover:text-slate-800 transition-all"
                >
                    {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
            </div>
            <h3 className={`text-2xl font-black text-slate-800 tracking-tighter tabular-nums mb-4 transition-all duration-700 ${!isVisible ? 'blur-md select-none opacity-40' : 'blur-0 opacity-100'}`}>
                R$ {balance.toLocaleString('pt-BR')}
            </h3>
            <div className="space-y-2 pt-2 border-t border-slate-100/50">
                {transactions.slice(0, 1).map(tx => (
                    <div key={tx.id} className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest">
                        <span className="text-slate-400 truncate pr-4">{tx.description}</span>
                        <span className={`${tx.type === 'income' ? 'text-emerald-500' : 'text-rose-400'} ${!isVisible ? 'blur-[3px]' : 'blur-0'}`}>
                            {tx.type === 'income' ? '+' : '-'} {tx.amount}
                        </span>
                    </div>
                ))}
            </div>
        </GlassCard>
    );
};

export const TaskWidget: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
    const { tasks, setTasks } = useData();
    const pending = tasks.filter(t => !t.completed).slice(0, 2);

    const toggleTask = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    return (
        <GlassCard interactive={!!onClick} onClick={onClick} className="h-full flex flex-col justify-between border-white/40" padding="p-6">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Foco do Dia</p>
            <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar">
                {pending.length > 0 ? pending.map(t => (
                    <div 
                        key={t.id} 
                        className="flex items-center gap-3 w-full group animate-in slide-in-from-left duration-300"
                    >
                        <button 
                            onClick={(e) => toggleTask(e, t.id)}
                            className="p-1 rounded-lg hover:bg-indigo-50 text-slate-300 hover:text-indigo-500 transition-all"
                        >
                            <Circle size={14} />
                        </button>
                        <span className="text-xs font-bold text-slate-700 truncate tracking-tight">{t.title}</span>
                    </div>
                )) : (
                    <div className="flex items-center gap-3 text-emerald-500 py-2">
                        <CheckCircle2 size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Tudo pronto!</span>
                    </div>
                )}
            </div>
            <button 
                onClick={(e) => { e.stopPropagation(); onClick?.(); }}
                className="mt-4 w-full py-3 bg-slate-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95 transition-all"
            >
                Ver Todas
            </button>
        </GlassCard>
    );
};

export const MusicWidget: React.FC = () => {
    const { tasks } = useData();
    const [userVibe, setUserVibe] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const pendingTasksCount = tasks.filter(t => !t.completed).length;

    const defaultVibe = useMemo(() => {
        const hour = new Date().getHours();
        if (pendingTasksCount > 3 && hour > 8 && hour < 19) return { title: 'Focus Flow', search: 'deep techno productivity' };
        if (hour >= 17 && hour < 21) return { title: 'Sunset Mood', search: 'bossa nova jazz sunset' };
        return { title: 'Midnight Textures', search: 'ambient sleep sounds' };
    }, [pendingTasksCount]);

    const handleOpenYTMusic = () => {
        const searchQuery = userVibe.trim() ? userVibe : defaultVibe.search;
        window.open(`https://music.youtube.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
    };

    return (
        <GlassCard className="h-full flex flex-col justify-between border-white/40 group overflow-hidden" padding="p-5">
            <div className="flex justify-between items-start">
                <div className="flex flex-col">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Vibe Aura</p>
                    <p className="text-[12px] font-black text-rose-500 tracking-tighter mt-1 truncate max-w-[110px]">
                        {userVibe.trim() ? userVibe : defaultVibe.title}
                    </p>
                </div>
                
                <button 
                    onClick={() => setIsSearching(!isSearching)}
                    className={`p-2.5 rounded-2xl transition-all active:scale-90 ${isSearching ? 'bg-rose-500 text-white' : 'bg-white/40 text-slate-400 hover:text-rose-500 shadow-sm'}`}
                >
                    {isSearching ? <X size={16} /> : <Search size={16} />}
                </button>
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
                {isSearching ? (
                    <input 
                        autoFocus
                        type="text"
                        value={userVibe}
                        onChange={(e) => setUserVibe(e.target.value)}
                        placeholder="O que ouvir?"
                        className="w-full bg-white/50 border border-white/40 rounded-2xl px-3 py-3 text-xs font-bold text-slate-800 placeholder:text-slate-300 outline-none animate-in fade-in slide-in-from-top-2 duration-300"
                    />
                ) : (
                    <div className="flex justify-center items-center h-10 animate-in fade-in zoom-in duration-500">
                        <div className="flex gap-1.5 items-end h-4">
                            <div className="w-1 h-2 bg-rose-400/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-1 h-4 bg-rose-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-1 h-3 bg-rose-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
            </div>
            
            <button 
                onClick={(e) => { e.stopPropagation(); handleOpenYTMusic(); }}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-3xl bg-rose-100 hover:bg-rose-200 text-rose-600 font-black text-[12px] tracking-[0.3em] shadow-sm shadow-rose-100 transition-all active:scale-[0.96]"
            >
                YT <ExternalLink size={10} />
            </button>
        </GlassCard>
    );
};

export const MapsExploreWidget: React.FC<{ onExplore: (query: string) => void }> = ({ onExplore }) => {
    const [query, setQuery] = useState('');
    return (
        <GlassCard className="h-full flex flex-col justify-between border-white/40 group" padding="p-6">
            <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm transition-transform group-hover:scale-110">
                    <MapPin size={18} />
                </div>
                <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Aura Mapas</p>
                    <p className="text-xs font-black text-slate-800 tracking-tight mt-1">Explorar Local</p>
                </div>
            </div>
            
            <div className="relative mt-4">
                <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onExplore(query)}
                    placeholder="O que procura?"
                    className="w-full bg-white/50 border border-white/40 rounded-xl px-3 py-3 text-xs font-bold text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-400/50 transition-all"
                />
                <button 
                    onClick={() => onExplore(query)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500 hover:text-indigo-700 transition-colors"
                >
                    <Search size={14} />
                </button>
            </div>

            <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar pb-1">
                {['Café', 'Restaurante', 'Parque'].map(q => (
                    <button 
                        key={q}
                        onClick={() => onExplore(q)}
                        className="px-3 py-1.5 rounded-lg bg-white/40 border border-white/40 text-[9px] font-black text-slate-600 uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all whitespace-nowrap"
                    >
                        {q}
                    </button>
                ))}
            </div>
        </GlassCard>
    );
};
