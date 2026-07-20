import React, { useState, useEffect } from 'react';
import { Sparkles, Lightbulb, X, Heart, RotateCw, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Quote {
  text: string;
  author: string;
}

const MOTIVATIONAL_QUOTES: Quote[] = [
  { text: "O segredo para progredir é simplesmente começar.", author: "Mark Twain" },
  { text: "Foco consiste em dizer não para centenas de outras boas ideias.", author: "Steve Jobs" },
  { text: "Sua mente serve para ter ideias, não para guardá-las.", author: "David Allen" },
  { text: "Pequenos progressos diários se acumulam em grandes conquistas.", author: "Provérbio" },
  { text: "Não tente ser perfeito. Apenas busque ser 1% melhor do que ontem.", author: "James Clear" },
  { text: "Foco absoluto em uma tarefa curta supera horas de distração ativa.", author: "Cal Newport" },
  { text: "Elimine os ruídos antes que as distrações consumam o seu progresso diário.", author: "Sêneca" },
  { text: "Respire fundo. Escolha uma única missão agora e entregue-se a ela por inteiro.", author: "Zen" },
  { text: "A disciplina é a ponte entre as suas metas e as suas realizações.", author: "Jim Rohn" },
  { text: "Produtividade é entregar o que importa, não apenas se manter ocupado.", author: "Tim Ferriss" },
  { text: "Comece de onde você está. Use o que você tem. Faça o que você pode.", author: "Arthur Ashe" },
  { text: "A clareza precede a ação rápida. Escolha o seu próximo micro-passo.", author: "Robin Sharma" }
];

export default function DailyTip() {
  const [isOpen, setIsOpen] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedQuotes, setLikedQuotes] = useState<Quote[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);

  // Initialize with daily index
  useEffect(() => {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
    );
    const initialIndex = Math.abs(dayOfYear) % MOTIVATIONAL_QUOTES.length;
    setCurrentIndex(initialIndex);

    // Load liked quotes from localStorage
    const saved = localStorage.getItem('focusos_liked_quotes');
    if (saved) {
      try {
        setLikedQuotes(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to parse liked quotes', err);
      }
    }
  }, []);

  if (!isOpen) return null;

  const currentQuote = MOTIVATIONAL_QUOTES[currentIndex];
  const isLiked = likedQuotes.some(q => q.text === currentQuote.text);

  const handleNextTip = () => {
    let nextIdx = (currentIndex + 1) % MOTIVATIONAL_QUOTES.length;
    setCurrentIndex(nextIdx);
    setShowFeedback(false);
  };

  const handleToggleLike = () => {
    let updated: Quote[];
    if (isLiked) {
      updated = likedQuotes.filter(q => q.text !== currentQuote.text);
    } else {
      updated = [...likedQuotes, currentQuote];
      setShowFeedback(true);
      // Automatically hide feedback after 3.5 seconds
      setTimeout(() => setShowFeedback(false), 3500);
    }
    setLikedQuotes(updated);
    localStorage.setItem('focusos_liked_quotes', JSON.stringify(updated));

    // Dispatch custom event to let AICoach or other components know
    window.dispatchEvent(new Event('focusos_liked_quotes_changed'));
  };

  return (
    <div 
      id="daily-focus-tip-container" 
      className="w-full px-4 sm:px-6 md:px-8 mt-4 animate-slide-down"
    >
      <div className="relative overflow-hidden bg-zinc-950 border border-cyan-500/30 rounded-2xl p-4 sm:p-5 shadow-[0_0_20px_rgba(6,182,212,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Futuristic Cyber Bracket Deco */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-pink-500" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-pink-500" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />

        {/* Scan lines & radial overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,6px_100%] pointer-events-none opacity-20" />
        <div className="absolute top-0 right-1/4 w-32 h-32 bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Core content with AnimatePresence */}
        <div className="flex items-start space-x-3.5 flex-1 relative z-10">
          <div className="bg-cyan-950/40 border border-cyan-500/40 p-2.5 rounded-xl text-cyan-400 shrink-0 mt-1 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
            <Lightbulb className="w-4 h-4 animate-pulse" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="text-[9px] font-extrabold text-cyan-400 uppercase tracking-widest font-mono bg-cyan-950/50 px-2 py-0.5 rounded-md border border-cyan-500/20">
                DAILY.TIPS_//_SYSTEM_INJECT
              </span>
              <span className="flex items-center text-[9px] font-extrabold text-pink-400 uppercase tracking-widest font-mono bg-pink-950/30 px-2 py-0.5 rounded-md border border-pink-500/20">
                <Sparkles className="w-3 h-3 text-pink-400 mr-1 animate-spin" style={{ animationDuration: '6s' }} />
                ESTILO_CYBER
              </span>
            </div>

            {/* Transitioning Tip Text */}
            <div className="mt-2 min-h-[44px] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: -15, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, x: 15, filter: 'blur(4px)' }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="space-y-1"
                >
                  <p className="text-sm text-zinc-100 leading-relaxed font-semibold tracking-wide font-sans">
                    "{currentQuote.text}"
                  </p>
                  <p className="text-[10px] text-cyan-400/80 font-mono uppercase tracking-widest font-bold">
                    — {currentQuote.author}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Personalized feedback message */}
            <AnimatePresence>
              {showFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="mt-2 text-[10px] text-pink-400 font-mono font-bold flex items-center space-x-1.5"
                >
                  <Check className="w-3 h-3 text-pink-400" />
                  <span>SISTEMA ATUALIZADO: IA ADAPTOU O ALGORITMO COM BASE NAS SUAS PREFERÊNCIAS!</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 self-end md:self-center relative z-10 shrink-0">
          {/* Like Quote Button */}
          <button
            onClick={handleToggleLike}
            className={`flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-300 active:scale-90 cursor-pointer ${
              isLiked 
                ? 'bg-pink-950/50 border-pink-500 text-pink-400 shadow-[0_0_12px_rgba(236,72,153,0.3)]' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-pink-400 hover:border-pink-500/40'
            }`}
            title={isLiked ? "Remover curtida" : "Curtir dica para calibrar a IA"}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-pink-500 stroke-pink-500 animate-bounce' : ''}`} />
          </button>

          {/* New Quote Button */}
          <button
            onClick={handleNextTip}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-850 text-cyan-400 hover:text-cyan-300 hover:border-cyan-500/40 transition-all duration-300 active:rotate-45 cursor-pointer shadow-sm"
            title="Próxima Dica"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Close Panel Button */}
          <button
            id="close-daily-tip-btn"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-850 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-850 transition-all duration-300 cursor-pointer shrink-0"
            title="Fechar painel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
