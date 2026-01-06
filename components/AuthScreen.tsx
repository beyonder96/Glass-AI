import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import { Chrome, User, ArrowRight, Zap, ShieldCheck, Loader2 } from 'lucide-react';
import { signInWithRedirect, getRedirectResult, onAuthStateChanged } from 'firebase/auth'; 
import { auth, googleProvider } from '../services/firebase';

interface AuthScreenProps {
  onLogin: (type: 'google' | 'guest') => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState<'google' | 'guest' | 'checking' | null>('checking');

  useEffect(() => {
    console.log("Iniciando monitor de autenticação...");

    // 1. MONITOR DE SESSÃO: Verifica se você já está logado
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Usuário detectado:", user.email);
        // Usamos toLowerCase() para evitar erro de letras maiúsculas
        if (user.email?.toLowerCase() === "kennedoliveiratm@gmail.com") {
          console.log("Login autorizado via sessão ativa!");
          onLogin('google');
        } else {
          console.warn("E-mail não autorizado:", user.email);
          auth.signOut();
          setLoading(null);
        }
      } else {
        console.log("Nenhum usuário logado no momento.");
        setLoading(null);
      }
    });

    // 2. CAPTURA DE RETORNO: Processa o resultado do redirecionamento
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          console.log("Resultado do redirect recebido para:", result.user.email);
          if (result.user.email?.toLowerCase() === "kennedoliveiratm@gmail.com") {
            onLogin('google');
          }
        }
      } catch (error) {
        console.error("Erro no processamento do redirect:", error);
      }
    };

    checkRedirect();
    return () => unsubscribe();
  }, [onLogin]);

  const handleAuth = async (type: 'google' | 'guest') => {
    setLoading(type);
    
    if (type === 'google') {
      try {
        console.log("Iniciando redirecionamento Google...");
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

  // Tela de carregamento inicial enquanto verifica a sessão
  if (loading === 'checking') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-slate-400" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
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
                    className="w-full group relative flex items-center justify-center gap-3 p-4 rounded-2xl bg-white/60 hover:bg-white/80 border border-white/60 transition-all duration-300 shadow-sm disabled:opacity-70"
                >
                    {loading === 'google' ? <Loader2 className="animate-spin" size={20} /> : (
                        <><Chrome size={20} className="text-slate-800" /><span className="font-bold text-slate-800">Entrar com Google</span></>
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
                    className="w-full group relative flex items-center justify-between p-4 rounded-2xl bg-slate-800 text-white transition-all duration-300 shadow-xl"
                >
                    <div className="flex items-center gap-3">
                        <User size={18} className="p-1 rounded-lg bg-white/20" />
                        <div className="text-left">
                            <p className="font-bold text-sm leading-none">Modo Convidado</p>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Acesso instantâneo</p>
                        </div>
                    </div>
                    {loading === 'guest' ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                </button>
            </div>
            <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <ShieldCheck size={12} /><span>Ambiente Seguro</span>
            </div>
        </GlassCard>
      </div>
    </div>
  );
};