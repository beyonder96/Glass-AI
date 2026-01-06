import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import { Chrome, User, ArrowRight, Zap, ShieldCheck } from 'lucide-react';
import { signInWithRedirect, getRedirectResult, onAuthStateChanged } from 'firebase/auth'; 
import { auth, googleProvider } from '../services/firebase';

interface AuthScreenProps {
  onLogin: (type: 'google' | 'guest') => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState<'google' | 'guest' | null>(null);

  useEffect(() => {
    // 1. MONITOR DE SESSÃO ATIVA: Se você já estiver logado no navegador, ele entra direto
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email === "kennedoliveiratm@gmail.com") {
        onLogin('google');
      }
    });

    // 2. CAPTURA DE RETORNO: Processa o login após o redirecionamento do Google
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          if (result.user.email === "kennedoliveiratm@gmail.com") {
            onLogin('google');
          } else {
            alert("Acesso negado. Apenas o administrador tem permissão.");
            await auth.signOut();
          }
        }
      } catch (error) {
        console.error("Erro no retorno da autenticação:", error);
      } finally {
        setLoading(null);
      }
    };

    checkRedirect();
    
    // Limpeza ao desmontar o componente
    return () => unsubscribe();
  }, [onLogin]);

  const handleAuth = async (type: 'google' | 'guest') => {
    setLoading(type);
    
    if (type === 'google') {
      try {
        // Usa Redirect em vez de Popup para compatibilidade total com Vercel/Browsers
        await signInWithRedirect(auth, googleProvider);
      } catch (error) {
        console.error("Erro ao iniciar login:", error);
        setLoading(null);
      }
    } else {
      // Modo Convidado
      setTimeout(() => {
        onLogin('guest');
        setLoading(null);
      }, 800);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Animado */}
      <div className="absolute inset-0 z-[-1] bg-gradient-to-br from-[#E0EAFC] via-[#CFDEF3] to-[#F3E7E9] animate-gradient-x">
         <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-300/30 rounded-full blur-[100px] animate-float" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-300/30 rounded-full blur-[120px] animate-float" style={{ animationDelay: '-2s' }} />
      </div>

      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-700">
        <GlassCard className="text-center relative overflow-hidden" padding="p-8 py-12">
            
            <div className="mb-8 relative">
                <div className="w-20 h-20 mx-auto bg-slate-800 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-slate-400/50 mb-6 relative z-10">
                    <Zap size={40} fill="currentColor" className="animate-pulse" />
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-400/20 rounded-full blur-xl animate-pulse" />
                
                <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">Glass.</h1>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Assistente Pessoal Inteligente</p>
            </div>

            <div className="space-y-4">
                <button
                    onClick={() => handleAuth('google')}
                    disabled={!!loading}
                    className="w-full group relative flex items-center justify-center gap-3 p-4 rounded-2xl bg-white/60 hover:bg-white/80 border border-white/60 transition-all duration-300 shadow-sm hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading === 'google' ? (
                        <div className="w-6 h-6 border-2 border-slate-800 border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <>
                            <Chrome size={20} className="text-slate-800" />
                            <span className="font-bold text-slate-800">Entrar com Google</span>
                        </>
                    )}
                </button>

                <div className="flex items-center gap-4 my-2">
                    <div className="h-px bg-slate-300/50 flex-1" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ou</span>
                    <div className="h-px bg-slate-300/50 flex-1" />
                </div>

                <button
                    onClick={() => handleAuth('guest')}
                    disabled={!!loading}
                    className="w-full group relative flex items-center justify-between p-4 rounded-2xl bg-slate-800 text-white transition-all duration-300 shadow-xl shadow-slate-200 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-white/20">
                            <User size={18} />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-sm leading-none">Modo Convidado</p>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Acesso instantâneo sem login</p>
                        </div>
                    </div>
                    {loading === 'guest' ? (
                         <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                    ) : (
                        <ArrowRight size={20} className="text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    )}
                </button>
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <ShieldCheck size={12} />
                <span>Ambiente Seguro & Privado</span>
            </div>
        </GlassCard>
      </div>
    </div>
  );
};