import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Mail, Lock, LogIn, UserPlus, ArrowRight, ShieldCheck, Database, HelpCircle, Eye, EyeOff, Globe } from 'lucide-react';
import { playTypeSound } from '../lib/sound';

interface LoginScreenProps {
  onLoginSuccess: (email: string, token: string, premium?: boolean, planType?: string | null) => void;
  onPlayOffline: () => void;
}

export default function LoginScreen({ onLoginSuccess, onPlayOffline }: LoginScreenProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleToggleMode = () => {
    playTypeSound();
    setIsRegister(!isRegister);
    setError(null);
    setMessage(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    setter(e.target.value);
    playTypeSound();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);
    playTypeSound();

    const endpoint = isRegister ? '/api/auth/signup' : '/api/auth/login';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ocorreu um erro ao processar sua solicitação.');
      }

      if (isRegister) {
        setMessage(data.message || 'Cadastro realizado com sucesso! Agora você pode fazer o login.');
        setIsRegister(false);
        setPassword('');
      } else {
        if (data.success && data.user) {
          onLoginSuccess(data.user.email, data.user.token, data.user.premium, data.user.planType);
        } else {
          throw new Error('Formato de resposta do servidor inválido.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#05060a] text-zinc-100 flex items-center justify-center p-4 overflow-hidden select-none font-sans">
      {/* GLOWS & BACKGROUND NEON ANIMATIONS */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse pointer-events-none" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[140px] animate-pulse pointer-events-none" style={{ animationDuration: '12s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Cyber Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#141517_1px,transparent_1px),linear-gradient(to_bottom,#141517_1px,transparent_1px)] bg-[size:32px_32px] opacity-40 pointer-events-none" />

      {/* Falling star particles or simple floating glow dots */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
        <div className="absolute w-[2px] h-[2px] bg-white rounded-full top-[10%] left-[15%] animate-ping" style={{ animationDuration: '4s' }} />
        <div className="absolute w-[2px] h-[2px] bg-emerald-400 rounded-full top-[40%] left-[80%] animate-ping" style={{ animationDuration: '6s' }} />
        <div className="absolute w-[3px] h-[3px] bg-indigo-400 rounded-full top-[75%] left-[25%] animate-ping" style={{ animationDuration: '5s' }} />
        <div className="absolute w-[2px] h-[2px] bg-pink-400 rounded-full top-[85%] left-[70%] animate-ping" style={{ animationDuration: '8s' }} />
        <div className="absolute w-[4px] h-[4px] bg-white/20 rounded-full top-[25%] left-[60%] animate-pulse" />
        <div className="absolute w-[4px] h-[4px] bg-white/10 rounded-full top-[60%] left-[45%] animate-pulse" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* APP BRAND / LOGO */}
        <div className="text-center mb-8 space-y-2">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-3xl items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.15)] group hover:border-zinc-700 transition-all cursor-pointer mb-2"
          >
            <Sparkles className="w-8 h-8 text-emerald-400 animate-pulse" />
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="text-[10px] font-mono font-black tracking-[0.25em] text-emerald-400 uppercase bg-emerald-950/40 border border-emerald-900/30 px-3 py-1 rounded-full">
              JORNADA MENTAL RPG
            </span>
            <h1 className="text-3xl font-black tracking-tighter text-white mt-3 uppercase">
              FocusOS
            </h1>
            <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto leading-relaxed">
              Enfrente a procrastinação, ganhe XP de verdade e suba de nível com a sua conta integrada.
            </p>
          </motion.div>
        </div>

        {/* MAIN AUTH CONTAINER */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-zinc-950/80 border border-zinc-900 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] relative overflow-hidden"
        >
          {/* Neon Top Line Decoration */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-indigo-500 to-emerald-500" />

          {/* Alert messages */}
          {error && (
            <div className="mb-4 bg-rose-950/40 border border-rose-900/50 p-3.5 rounded-2xl text-rose-400 text-xs font-semibold leading-relaxed animate-fade-in flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0 animate-ping" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="mb-4 bg-emerald-950/40 border border-emerald-900/50 p-3.5 rounded-2xl text-emerald-400 text-xs font-semibold leading-relaxed animate-fade-in flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0 animate-pulse" />
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* EMAIL FIELD */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold font-mono tracking-wider text-zinc-400 uppercase block" htmlFor="login-email">
                Endereço de E-mail
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-emerald-400 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  required
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => handleInputChange(e, setEmail)}
                  className="w-full text-xs pl-10 pr-4 py-3 bg-zinc-900/50 border border-zinc-900 hover:border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-hidden rounded-2xl text-white placeholder-zinc-600 transition-all font-medium"
                />
              </div>
            </div>

            {/* PASSWORD FIELD */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold font-mono tracking-wider text-zinc-400 uppercase block" htmlFor="login-password">
                  Sua Senha Segura
                </label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-emerald-400 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => handleInputChange(e, setPassword)}
                  className="w-full text-xs pl-10 pr-10 py-3 bg-zinc-900/50 border border-zinc-900 hover:border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-hidden rounded-2xl text-white placeholder-zinc-600 transition-all font-medium font-mono"
                />
                <button
                  type="button"
                  onClick={() => { playTypeSound(); setShowPassword(!showPassword); }}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* ACTION BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full relative mt-2 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-2xl text-xs transition-all flex items-center justify-center space-x-2 shadow-[0_4px_20px_rgba(16,185,129,0.2)] hover:shadow-[0_4px_25px_rgba(16,185,129,0.35)] active:scale-95 cursor-pointer overflow-hidden ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isRegister ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                  <span className="uppercase tracking-wider">{isRegister ? 'Criar Conta de Herói' : 'Entrar no Jogo'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* TOGGLE AUTH MODE LINK */}
          <div className="mt-6 pt-5 border-t border-zinc-900 text-center">
            <button
              onClick={handleToggleMode}
              className="text-xs text-zinc-400 hover:text-emerald-400 transition-colors font-medium cursor-pointer"
            >
              {isRegister 
                ? 'Já tem uma conta de foco? Faça Login' 
                : 'Novo por aqui? Crie sua conta grátis'}
            </button>
          </div>
        </motion.div>

        {/* INFO FOOTER */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-6"
        >
          <div className="flex items-center justify-center gap-4 text-[10px] text-zinc-600 font-medium">
            <span className="flex items-center gap-1">
              <Database className="w-3 h-3 text-emerald-500/60" /> Banco de dados Integrado
            </span>
            <span className="w-1 h-1 bg-zinc-800 rounded-full" />
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-indigo-500/60" /> Criptografia Segura
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
