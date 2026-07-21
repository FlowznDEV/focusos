import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, CheckCircle, Clock, Trophy, Flame, Play, Keyboard, ShieldAlert } from 'lucide-react';
import { playTypeSound } from '../lib/sound';

interface OnboardingScreenProps {
  onJoin: (nickname: string, email: string, token: string) => void;
}

export default function OnboardingScreen({ onJoin }: OnboardingScreenProps) {
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value);
    playTypeSound();
  };

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setError("Por favor, digite um nome ou apelido de herói!");
      return;
    }

    setLoading(true);
    setError(null);
    playTypeSound();

    try {
      const response = await fetch('/api/auth/anonymous', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: nickname.trim() })
      });

      const text = await response.text();
      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error("Failed to parse onboarding response:", err);
      }

      if (!response.ok || !data || !data.success) {
        throw new Error(data?.error || "Não foi possível iniciar sua jornada.");
      }

      const { email, token } = data.user;
      
      // Save stats local nickname as well
      const savedStats = localStorage.getItem('focus_quest_stats');
      let statsObj = savedStats ? JSON.parse(savedStats) : { xp: 0, level: 1, streak: 1, totalTasksCompleted: 0, totalFocusMinutes: 0, xpLogs: [] };
      statsObj.nickname = nickname.trim();
      localStorage.setItem('focus_quest_stats', JSON.stringify(statsObj));

      onJoin(nickname.trim(), email, token);
    } catch (err: any) {
      setError(err.message || "Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="onboarding-root" className="relative min-h-screen bg-[#05060a] text-zinc-100 flex flex-col justify-center items-center p-4 selection:bg-indigo-500/30 overflow-y-auto font-sans">
      {/* GLOWS & BACKGROUND NEON ANIMATIONS */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse pointer-events-none" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[140px] animate-pulse pointer-events-none" style={{ animationDuration: '12s' }} />

      {/* Cyber Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#141517_1px,transparent_1px),linear-gradient(to_bottom,#141517_1px,transparent_1px)] bg-[size:32px_32px] opacity-40 pointer-events-none" />

      {/* Falling star particles or simple floating glow dots */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
        <div className="absolute w-[2px] h-[2px] bg-white rounded-full top-[10%] left-[15%] animate-ping" style={{ animationDuration: '4s' }} />
        <div className="absolute w-[2px] h-[2px] bg-emerald-400 rounded-full top-[40%] left-[80%] animate-ping" style={{ animationDuration: '6s' }} />
        <div className="absolute w-[3px] h-[3px] bg-indigo-400 rounded-full top-[75%] left-[25%] animate-ping" style={{ animationDuration: '5s' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl bg-zinc-950 border border-zinc-900 rounded-3xl p-6 md:p-10 shadow-2xl relative z-10 my-8"
      >
        {/* Header Section */}
        <div className="text-center mb-8 md:mb-12">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="inline-flex bg-indigo-950/40 border border-indigo-900/60 p-3 rounded-2xl mb-4 text-indigo-400"
          >
            <Sparkles className="w-8 h-8 animate-pulse" />
          </motion.div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-indigo-400">
            FocusOS
          </h1>
          <p className="text-sm md:text-base text-zinc-400 mt-2 max-w-lg mx-auto">
            Sua rotina diária transformada em um RPG épico de produtividade. Domine o foco e suba de nível na vida real.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 md:mb-12">
          
          <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-5 hover:border-indigo-500/20 transition-all duration-300 flex items-start space-x-4">
            <div className="bg-indigo-950/50 p-2.5 rounded-xl text-indigo-400 shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Gamificação RPG</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Complete missões diárias para ganhar XP e moedas, desbloquear conquistas épicas e subir até o Nível 15.
              </p>
            </div>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-5 hover:border-pink-500/20 transition-all duration-300 flex items-start space-x-4">
            <div className="bg-pink-950/50 p-2.5 rounded-xl text-pink-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-pink-400 uppercase tracking-wider mb-1">Temporizador de Foco</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Ciclos com trilhas sonoras binaurais imersivas, registros rápidos de sentimento e diário pós-foco integrado.
              </p>
            </div>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-5 hover:border-emerald-500/20 transition-all duration-300 flex items-start space-x-4">
            <div className="bg-emerald-950/50 p-2.5 rounded-xl text-emerald-400 shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-1">Missões e Submetas</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Divida grandes objetivos em tarefas de curto ou longo prazo, adaptadas com dificuldades e prioridades.
              </p>
            </div>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-5 hover:border-amber-500/20 transition-all duration-300 flex items-start space-x-4">
            <div className="bg-amber-950/50 p-2.5 rounded-xl text-amber-400 shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-1">Ranking Global</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Veja sua colocação e compare níveis e sequências de dias consecutivos no Leaderboard com outros guerreiros.
              </p>
            </div>
          </div>

        </div>

        {/* Enter Nickname & Join Section */}
        <div className="max-w-md mx-auto bg-zinc-900/20 border border-zinc-900 rounded-2xl p-6">
          <form onSubmit={handleStart} className="space-y-4">
            <div className="text-center md:text-left mb-2">
              <h4 className="text-sm font-bold text-white flex items-center justify-center md:justify-start space-x-1.5 uppercase tracking-wide">
                <Keyboard className="w-4 h-4 text-indigo-400" />
                <span>Escolha seu Nickname de Herói</span>
              </h4>
              <p className="text-[11px] text-zinc-500 mt-0.5">Sua alcunha para o ranking global de guerreiros produtivos</p>
            </div>

            <div>
              <input
                id="hero-nickname-input"
                type="text"
                maxLength={20}
                required
                value={nickname}
                onChange={handleInputChange}
                placeholder="Ex: GuerreiroMax, CyberFoco, Atenas..."
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 text-white rounded-xl px-4 py-3 text-sm font-medium placeholder-zinc-600 focus:ring-1 focus:ring-indigo-500/30 transition-all outline-none text-center md:text-left"
              />
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-2 text-red-400 text-xs bg-red-950/30 border border-red-900/40 p-3 rounded-xl"
              >
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <button
              id="start-onboarding-btn"
              type="submit"
              disabled={loading || !nickname.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:hover:bg-indigo-600 disabled:active:scale-100"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>INICIAR JORNADA</span>
                  <Play className="w-4 h-4 fill-white" />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
