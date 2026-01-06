
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Search, MapPin, Navigation, Loader2, ExternalLink, Map as MapIcon, Compass, Star, ArrowRight } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { GlassCard } from './GlassCard';

interface MapScreenProps {
  onBack: () => void;
  initialQuery?: string;
}

export const MapScreen: React.FC<MapScreenProps> = ({ onBack, initialQuery }) => {
  const [query, setQuery] = useState(initialQuery || '');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{title: string, uri: string, snippet?: string}[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    // Obter localização para melhorar a precisão da IA
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(coords);
        if (initialQuery) {
          handleSearch(initialQuery, coords);
        }
      },
      (err) => console.warn("GPS Access denied", err),
      { enableHighAccuracy: true }
    );
  }, []);

  const handleSearch = async (overrideQuery?: string, overrideLoc?: [number, number]) => {
    const activeQuery = overrideQuery || query;
    const activeLoc = overrideLoc || userLocation;
    
    if (!activeQuery.trim()) return;
    
    setIsLoading(true);
    setResults([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Encontre "${activeQuery}" perto de mim. Retorne locais reais com títulos e links.`,
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: activeLoc ? {
            retrievalConfig: {
              latLng: { latitude: activeLoc[0], longitude: activeLoc[1] }
            }
          } : undefined
        }
      });

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const places: {title: string, uri: string, snippet?: string}[] = [];
      
      if (chunks) {
        chunks.forEach((c: any) => {
          if (c.maps) {
            places.push({ 
              title: c.maps.title || "Local encontrado", 
              uri: c.maps.uri 
            });
          }
        });
      }
      
      setResults(places);

    } catch (e) {
      console.error("Search failed", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-slate-50 to-indigo-50/30 flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden">
      
      {/* Header Fixo */}
      <div className="p-6 pb-2">
        <div className="flex items-center gap-4 max-w-md mx-auto mb-8">
            <button 
                onClick={onBack}
                className="p-3.5 rounded-2xl bg-white/60 backdrop-blur-xl text-slate-800 shadow-sm border border-white/80 active:scale-90 transition-all"
            >
                <ChevronLeft size={24} />
            </button>
            <div className="flex-1">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none">Explorar</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5">Guia de Lugares Aura</p>
            </div>
        </div>

        {/* Search Bar Premium */}
        <div className="max-w-md mx-auto relative mb-6">
            <div className="absolute inset-0 bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-xl shadow-indigo-100/20" />
            <div className="relative flex items-center px-6 py-2 gap-3">
                <Search size={20} className="text-indigo-400" />
                <input 
                    type="text" 
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    placeholder="Cafés, parques, piscinas..."
                    className="flex-1 bg-transparent py-4 text-base font-bold text-slate-800 outline-none placeholder:text-slate-300"
                />
                {isLoading ? (
                    <Loader2 size={20} className="animate-spin text-indigo-500" />
                ) : (
                    <button 
                      onClick={() => handleSearch()} 
                      disabled={!query.trim()}
                      className="p-2.5 rounded-xl bg-slate-900 text-white shadow-lg active:scale-95 disabled:opacity-20 transition-all"
                    >
                        <Navigation size={18} />
                    </button>
                )}
            </div>
        </div>
      </div>

      {/* Lista de Resultados */}
      <div className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar">
          <div className="max-w-md mx-auto space-y-4">
              {results.length === 0 && !isLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
                      <div className="w-20 h-20 rounded-[2.5rem] bg-indigo-50 flex items-center justify-center text-indigo-300 mb-6">
                        <Compass size={40} />
                      </div>
                      <p className="text-sm font-black text-slate-800 uppercase tracking-widest">Aura está pronta</p>
                      <p className="text-xs text-slate-500 mt-2 font-medium">O que você deseja encontrar hoje?</p>
                  </div>
              ) : (
                  results.map((res, i) => (
                      <GlassCard 
                          key={i} 
                          className="animate-in slide-in-from-bottom-4 duration-500 fill-mode-backwards group"
                          padding="p-6"
                          interactive
                          onClick={() => window.open(res.uri, '_blank')}
                          style={{ animationDelay: `${i * 100}ms` }}
                      >
                          <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1.5">
                                      <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                          <MapPin size={16} />
                                      </div>
                                      <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.1em]">Local Próximo</span>
                                  </div>
                                  <h3 className="text-lg font-black text-slate-800 tracking-tight leading-snug group-hover:text-indigo-600 transition-colors">
                                      {res.title}
                                  </h3>
                                  <p className="text-xs text-slate-400 font-medium mt-1 truncate">Google Maps Grounding</p>
                              </div>
                              <div className="flex flex-col items-end gap-2 shrink-0">
                                  <div className="flex items-center gap-1 text-amber-500">
                                      <Star size={14} fill="currentColor" />
                                      <span className="text-xs font-black">4.5</span>
                                  </div>
                              </div>
                          </div>

                          <div className="mt-6 flex items-center justify-between">
                              <div className="flex -space-x-2">
                                  {[1,2,3].map(n => (
                                      <div key={n} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                                          <img src={`https://i.pravatar.cc/150?u=${res.title}${n}`} alt="avatar" />
                                      </div>
                                  ))}
                                  <div className="w-6 h-6 rounded-full border-2 border-white bg-indigo-50 flex items-center justify-center text-[8px] font-black text-indigo-600">
                                      +12
                                  </div>
                              </div>
                              
                              <button 
                                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95 transition-all group-hover:bg-indigo-600"
                              >
                                  Abrir no Maps
                                  <ArrowRight size={14} />
                              </button>
                          </div>
                      </GlassCard>
                  ))
              )}

              {isLoading && (
                  <div className="space-y-4">
                      {[1,2,3].map(n => (
                          <div key={n} className="h-44 w-full bg-white/20 rounded-[2.5rem] animate-pulse border border-white/40" />
                      ))}
                  </div>
              )}
          </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none opacity-20">
          <div className="flex items-center gap-2">
              <MapIcon size={14} />
              <span className="text-[9px] font-black uppercase tracking-[0.5em]">Aura Explorer</span>
          </div>
      </div>
    </div>
  );
};
