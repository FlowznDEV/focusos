import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Play, Award, Brain, BarChart3, ShieldCheck, Trophy } from 'lucide-react';
import { playLevelUpSound, playTypeSound } from '../lib/sound';

interface PremiumWelcomeProps {
  planType: string | null;
  onEnterApp: () => void;
}

export default function PremiumWelcome({ planType, onEnterApp }: PremiumWelcomeProps) {
  // Trigger sound effect when welcome screen is mounted
  React.useEffect(() => {
    playLevelUpSound();
  }, []);

  const handleStart = () => {
    playTypeSound();
    onEnterApp();
  };

  const getPlanName = () => {
    return planType === 'lifetime' ? 'Plano Vitalício' : 'Plano Mensal';
  };

  return (
    <div className="relative min-h-screen bg-[#040407] text-zinc-100 flex items-center justify-center p-6 overflow-hidden select-none font-sans">
      {/* Golden Magic Glows & Floating Particles */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Cyber Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#141416_1px,transparent_1px),linear-gradient(to_bottom,#141416_1px,transparent_1px)] bg-[size:32px_32px] opacity-40 pointer-events-none" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-60">
        <div className="absolute w-1 h-1 bg-amber-400 rounded-full top-[15%] left-[20%] animate-ping" style={{ animationDuration: '4s' }} />
        <div className="absolute w-[2px] h-[2px] bg-yellow-300 rounded-full top-[35%] left-[75%] animate-ping" style={{ animationDuration: '6s' }} />
        <div className="absolute w-1 h-1 bg-indigo-400 rounded-full top-[80%] left-[30%] animate-ping" style={{ animationDuration: '5s' }} />
        <div className="absolute w-[3px] h-[3px] bg-amber-500 rounded-full top-[65%] left-[85%] animate-pulse" />
      </div>

      <div className="relative z-10 w-full max-w-lg text-center space-y-8">
        
        {/* GOLD ACCENT LOGO */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative inline-block"
        >
          {/* Pulsing ring */}
          <div className="absolute -inset-4 rounded-3xl bg-amber-500/10 border border-amber-500/30 blur-md animate-pulse pointer-events-none" />
          
          <div className="w-20 h-20 bg-gradient-to-br from-amber-950/60 to-zinc-950/80 border-2 border-amber-400/60 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.25)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
            <Sparkles className="w-10 h-10 text-amber-400" />
          </div>
        </motion.div>

        {/* HERO TITLE */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold font-mono tracking-[0.2em] text-amber-400 uppercase bg-amber-950/40 px-3.5 py-1 rounded-full border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.08)]">
            🛡️ COMPRA CONFIRMADA: {getPlanName()}
          </span>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-tight pt-1">
            Boas-vindas ao aplicativo!
          </h2>
        </div>

        {/* RPG INSPIRED PHRASE IN CARD */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-zinc-950 border border-amber-500/35 p-6 rounded-3xl relative overflow-hidden shadow-[0_0_40px_rgba(245,158,11,0.06)]"
        >
          {/* Gold side strips */}
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-amber-500 to-yellow-400" />
          
          <p className="text-zinc-100 font-serif italic text-sm md:text-base leading-relaxed">
            "O pacto do foco foi selado! Sua alma de aventureiro agora possui poder ilimitado contra a névoa da procrastinação. Bem-vindo à guilda lendária dos mestres do foco!"
          </p>
          
          <div className="mt-4 border-t border-zinc-900/60 pt-4 flex items-center justify-center space-x-2 text-zinc-500 font-mono text-[10px]">
            <span>⚔️ CLASSE: MESTRE DO FOCO</span>
            <span className="text-zinc-700">•</span>
            <span>🔮 STATUS: ILIMITADO</span>
          </div>
        </motion.div>

        {/* COMPACT POWERS LIST */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="space-y-2.5 max-w-sm mx-auto"
        >
          <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">// SEUS PODERES PREMIUM</h4>
          
          <div className="grid grid-cols-2 gap-2 text-left">
            <div className="flex items-center space-x-2 bg-zinc-900/40 border border-zinc-900 p-2.5 rounded-xl">
              <Brain className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-[10px] font-bold text-zinc-300">Treinador Mente IA</span>
            </div>
            <div className="flex items-center space-x-2 bg-zinc-900/40 border border-zinc-900 p-2.5 rounded-xl">
              <BarChart3 className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-[10px] font-bold text-zinc-300">Gráficos de XP</span>
            </div>
            <div className="flex items-center space-x-2 bg-zinc-900/40 border border-zinc-900 p-2.5 rounded-xl">
              <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-[10px] font-bold text-zinc-300">Efeitos de RPG</span>
            </div>
            <div className="flex items-center space-x-2 bg-zinc-900/40 border border-zinc-900 p-2.5 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-[10px] font-bold text-zinc-300">Sincronização Total</span>
            </div>
          </div>
        </motion.div>

        {/* INITIATE BUTTON */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <button
            onClick={handleStart}
            className="relative bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-600 hover:from-amber-500 hover:to-yellow-500 text-white font-extrabold py-4 px-10 rounded-2xl text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2.5 shadow-[0_4px_25px_rgba(245,158,11,0.25)] hover:shadow-[0_4px_30px_rgba(245,158,11,0.4)] active:scale-95 mx-auto cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white shrink-0" />
            <span>Iniciar minha Jornada Lendária</span>
          </button>
        </motion.div>

      </div>
    </div>
  );
}
