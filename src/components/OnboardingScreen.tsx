import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, CheckCircle, Clock, Trophy, Flame, Play, ShieldAlert } from 'lucide-react';
import { playTypeSound } from '../lib/sound';

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
    <div id="onboarding-root" className="relative min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center items-center p-4 selection:bg-orange-500/30 overflow-y-auto font-sans">
      {/* GLOWS & BACKGROUND ORANGE NEON ANIMATIONS */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-orange-500/10 rounded-full blur-[120px] animate-pulse pointer-events-none" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-orange-600/10 rounded-full blur-[140px] animate-pulse pointer-events-none" style={{ animationDuration: '12s' }} />

      {/* Cyber Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#141517_1px,transparent_1px),linear-gradient(to_bottom,#141517_1px,transparent_1px)] bg-[size:32px_32px] opacity-40 pointer-events-none" />

      {/* Falling star particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
        <div className="absolute w-[2px] h-[2px] bg-white rounded-full top-[10%] left-[15%] animate-ping" style={{ animationDuration: '4s' }} />
        <div className="absolute w-[2px] h-[2px] bg-orange-400 rounded-full top-[40%] left-[80%] animate-ping" style={{ animationDuration: '6s' }} />
        <div className="absolute w-[3px] h-[3px] bg-orange-500 rounded-full top-[75%] left-[25%] animate-ping" style={{ animationDuration: '5s' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl bg-zinc-950 border border-orange-500/30 rounded-3xl p-6 md:p-10 shadow-[0_0_50px_rgba(249,115,22,0.15)] relative z-10 my-8"
      >
        {/* Header Section */}
        <div className="text-center mb-8 md:mb-12">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="inline-flex bg-orange-950/40 border border-orange-500/40 p-3 rounded-2xl mb-4 text-orange-400"
          >
            <Sparkles className="w-8 h-8 animate-pulse text-orange-400" />
          </motion.div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-orange-400">
            FocusOS
          </h1>
          <p className="text-sm md:text-base text-zinc-400 mt-2 max-w-lg mx-auto">
            Sua rotina diária transformada em um RPG épico de produtividade. Domine o foco e suba de nível na vida real.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 md:mb-10">
          
          <div className="bg-zinc-900/50 border border-zinc-900 rounded-2xl p-5 flex items-start space-x-4">
            <div className="bg-orange-950/50 p-2.5 rounded-xl text-orange-400 shrink-0">
              <Flame className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Gamificação RPG</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Complete missões diárias para ganhar XP e moedas, desbloquear conquistas épicas e subir até o Nível 15.
              </p>
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-900 rounded-2xl p-5 flex items-start space-x-4">
            <div className="bg-orange-950/50 p-2.5 rounded-xl text-orange-400 shrink-0">
              <Clock className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-orange-400 uppercase tracking-wider mb-1">Temporizador de Foco</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Ciclos com trilhas sonoras binaurais imersivas, registros rápidos de sentimento e diário pós-foco integrado.
              </p>
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-900 rounded-2xl p-5 flex items-start space-x-4">
            <div className="bg-orange-950/50 p-2.5 rounded-xl text-orange-400 shrink-0">
              <CheckCircle className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-orange-400 uppercase tracking-wider mb-1">Missões e Submetas</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Divida grandes objetivos em tarefas de curto ou longo prazo, adaptadas com dificuldades e prioridades.
              </p>
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-900 rounded-2xl p-5 flex items-start space-x-4">
            <div className="bg-orange-950/50 p-2.5 rounded-xl text-orange-400 shrink-0">
              <Trophy className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-orange-400 uppercase tracking-wider mb-1">Conquistas Épicas</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Desbloqueie troféus e insígnias especiais à medida que consolida seus hábitos diários e evolui de nível.
              </p>
            </div>
          </div>

        </div>

        {/* Enter App Direct Action Button */}
        <div className="max-w-md mx-auto text-center">
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
            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black py-4 px-8 rounded-2xl flex items-center justify-center space-x-3 shadow-xl shadow-orange-600/25 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 cursor-pointer text-sm uppercase tracking-wider"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>ACESSAR O FOCUSOS</span>
                <Play className="w-4 h-4 fill-white" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
