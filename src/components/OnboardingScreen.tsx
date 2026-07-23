import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, CheckCircle, Clock, Trophy, Flame, Play, ShieldAlert } from 'lucide-react';
import { playTypeSound } from '../lib/sound';
import { FallingSakuraPetals, SakuraTreeBranch, ToriiGateIcon } from './SakuraDecorations';

interface OnboardingScreenProps {
  onJoin: (nickname: string, email: string, token: string) => void;
}

export default function OnboardingScreen({ onJoin }: OnboardingScreenProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    playTypeSound();

    const defaultNickname = 'Guerreiro';

    try {
      const response = await fetch('/api/auth/anonymous', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: defaultNickname })
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
      
      // Save stats local nickname
      const savedStats = localStorage.getItem('focus_quest_stats');
      let statsObj = savedStats ? JSON.parse(savedStats) : { xp: 0, level: 1, streak: 1, totalTasksCompleted: 0, totalFocusMinutes: 0, xpLogs: [] };
      statsObj.nickname = defaultNickname;
      localStorage.setItem('focus_quest_stats', JSON.stringify(statsObj));

      onJoin(defaultNickname, email, token);
    } catch (err: any) {
      console.warn("API Auth error, proceeding with local save checkpoint:", err);
      const fallbackEmail = 'guerreiro@focusos.app';
      const fallbackToken = 'local_token_' + Date.now();
      
      const savedStats = localStorage.getItem('focus_quest_stats');
      let statsObj = savedStats ? JSON.parse(savedStats) : { xp: 0, level: 1, streak: 1, totalTasksCompleted: 0, totalFocusMinutes: 0, xpLogs: [] };
      statsObj.nickname = defaultNickname;
      localStorage.setItem('focus_quest_stats', JSON.stringify(statsObj));

      onJoin(defaultNickname, fallbackEmail, fallbackToken);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="onboarding-root" className="relative min-h-screen w-screen bg-[#0d0d12] text-zinc-100 flex flex-col justify-center items-center p-4 selection:bg-pink-500/30 overflow-y-auto font-sans">
      {/* Falling Sakura Petals Background Animation */}
      <FallingSakuraPetals />

      {/* GLOWS & BACKGROUND JAPANESE NEON ANIMATIONS */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-rose-500/10 rounded-full blur-[130px] animate-pulse pointer-events-none" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-pink-600/10 rounded-full blur-[140px] animate-pulse pointer-events-none" style={{ animationDuration: '12s' }} />

      {/* Cyber Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1b1924_1px,transparent_1px),linear-gradient(to_bottom,#1b1924_1px,transparent_1px)] bg-[size:32px_32px] opacity-35 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl bg-zinc-950/90 backdrop-blur-md border border-rose-500/30 rounded-3xl p-6 md:p-10 shadow-[0_0_50px_rgba(244,114,182,0.12)] relative z-10 my-8 overflow-hidden"
      >
        {/* Sakura Decorative Branch overlay on top right corner */}
        <div className="absolute top-0 right-0 w-64 md:w-80 opacity-75 pointer-events-none">
          <SakuraTreeBranch />
        </div>

        {/* Header Section */}
        <div className="text-center mb-8 md:mb-12 relative z-10">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="inline-flex items-center space-x-2 bg-pink-950/40 border border-pink-500/40 px-4 py-2 rounded-2xl mb-4 text-pink-400"
          >
            <ToriiGateIcon className="w-5 h-5 text-pink-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-pink-300">
              桜 集中 • FocusOS Zen
            </span>
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-pink-200 to-rose-400 font-sans">
            FocusOS <span className="text-pink-400 text-2xl md:text-4xl font-normal font-mono">[ 禅 ]</span>
          </h1>
          <p className="text-sm md:text-base text-zinc-300 mt-2 max-w-lg mx-auto leading-relaxed">
            Sua jornada de produtividade elevada à arte dos Samurais. Foco absoluto, hábitos diários e evolução constante sob as flores de cerejeira.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 md:mb-10 relative z-10">
          
          <div className="bg-zinc-900/60 border border-pink-500/20 hover:border-pink-500/40 transition-all rounded-2xl p-5 flex items-start space-x-4">
            <div className="bg-pink-950/60 p-2.5 rounded-xl text-pink-400 shrink-0 border border-pink-500/30">
              <Flame className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-[10px] font-mono text-pink-400 font-bold uppercase">精神 • RPG</span>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Gamificação Samurai</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Complete missões diárias para ganhar XP e honra, evoluindo do Nível 1 ao status de Mestre Samurai (Nível 15).
              </p>
            </div>
          </div>

          <div className="bg-zinc-900/60 border border-pink-500/20 hover:border-pink-500/40 transition-all rounded-2xl p-5 flex items-start space-x-4">
            <div className="bg-pink-950/60 p-2.5 rounded-xl text-pink-400 shrink-0 border border-pink-500/30">
              <Clock className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-[10px] font-mono text-pink-400 font-bold uppercase">集中 • FOCO</span>
                <h3 className="text-sm font-extrabold text-rose-400 uppercase tracking-wider">Temporizador Zen</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Ciclos Pomodoro de imersão profunda com trilhas binaurais, estado de fluxo e diário de reflexão pós-foco.
              </p>
            </div>
          </div>

          <div className="bg-zinc-900/60 border border-pink-500/20 hover:border-pink-500/40 transition-all rounded-2xl p-5 flex items-start space-x-4">
            <div className="bg-pink-950/60 p-2.5 rounded-xl text-pink-400 shrink-0 border border-pink-500/30">
              <CheckCircle className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-[10px] font-mono text-pink-400 font-bold uppercase">任務 • MISSÕES</span>
                <h3 className="text-sm font-extrabold text-rose-400 uppercase tracking-wider">Gestão de Hábitos & Tarefas</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Recomendações inteligentes baseadas no seu histórico para criar rotinas consistentes e sustentáveis.
              </p>
            </div>
          </div>

          <div className="bg-zinc-900/60 border border-pink-500/20 hover:border-pink-500/40 transition-all rounded-2xl p-5 flex items-start space-x-4">
            <div className="bg-pink-950/60 p-2.5 rounded-xl text-pink-400 shrink-0 border border-pink-500/30">
              <Trophy className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-[10px] font-mono text-pink-400 font-bold uppercase">成就 • TROFÉUS</span>
                <h3 className="text-sm font-extrabold text-rose-400 uppercase tracking-wider">Conquistas & Honra</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Desbloqueie troféus e insígnias especiais à medida que consolida seus hábitos diários e evolui de nível.
              </p>
            </div>
          </div>

        </div>

        {/* Enter App Direct Action Button */}
        <div className="max-w-md mx-auto text-center relative z-10">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 text-red-400 text-xs bg-red-950/30 border border-red-900/40 p-3 rounded-xl mb-4"
            >
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <button
            id="start-onboarding-btn"
            type="button"
            onClick={handleStart}
            disabled={loading}
            className="w-full bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 hover:from-rose-500 hover:to-pink-500 text-white font-black py-4 px-8 rounded-2xl flex items-center justify-center space-x-3 shadow-xl shadow-rose-600/25 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 cursor-pointer text-sm uppercase tracking-wider border border-pink-400/30"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ToriiGateIcon className="w-5 h-5 text-white" />
                <span>INICIAR JORNADA SAMURAI</span>
                <Play className="w-4 h-4 fill-white" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
