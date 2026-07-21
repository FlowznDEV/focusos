import React, { useState, useEffect } from 'react';
import { Sparkles, Lightbulb, X, Heart, RotateCw, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Quote {
  text: string;
  author: string;
}

interface DailyTipProps {
  userLevel?: number;
  streak?: number;
  totalTasksCompleted?: number;
}

const FALLBACK_QUOTES: Quote[] = [
  { text: "O segredo para progredir é simplesmente começar sem medo.", author: "Mark Twain" },
  { text: "Foco consiste em dizer não para centenas de boas distrações.", author: "Steve Jobs" },
  { text: "Sua mente serve para ter ideias brilhantes, não para guardá-las com peso.", author: "David Allen" },
  { text: "Pequenos progressos diários se acumulam em vitórias épicas no seu nível.", author: "Mentor FocusOS" },
  { text: "Não tente ser perfeito. Apenas busque ser 1% melhor no seu ritmo.", author: "James Clear" },
  { text: "Elimine o ruído ao redor antes que as distrações tomem seu tempo.", author: "Sêneca" }
];

export default function DailyTip({ userLevel = 1, streak = 1, totalTasksCompleted = 0 }: DailyTipProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [currentQuote, setCurrentQuote] = useState<Quote>(FALLBACK_QUOTES[0]);
  const [loading, setLoading] = useState(false);
  const [likedQuotes, setLikedQuotes] = useState<Quote[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);

  const fetchGeminiTip = async () => {
    setLoading(true);
    setShowFeedback(false);
    try {
      const response = await fetch('/api/daily-tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: userLevel,
          streak,
          totalTasksCompleted
        })
      });

      const data = await response.json();
      if (data && data.tip) {
        setCurrentQuote({
          text: data.tip,
          author: data.author || `Mentor FocusOS • Nível ${userLevel}`
        });
      } else {
        const randomIndex = Math.floor(Math.random() * FALLBACK_QUOTES.length);
        setCurrentQuote(FALLBACK_QUOTES[randomIndex]);
      }
    } catch (err) {
      console.error("Failed to fetch level-personalized tip from Gemini:", err);
      const randomIndex = Math.floor(Math.random() * FALLBACK_QUOTES.length);
      setCurrentQuote(FALLBACK_QUOTES[randomIndex]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGeminiTip();

    const saved = localStorage.getItem('focusos_liked_quotes');
    if (saved) {
      try {
        setLikedQuotes(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to parse liked quotes', err);
      }
    }
  }, [userLevel]);

  if (!isOpen) return null;

  const isLiked = likedQuotes.some(q => q.text === currentQuote.text);

  const handleToggleLike = () => {
    let updated: Quote[];
    if (isLiked) {
      updated = likedQuotes.filter(q => q.text !== currentQuote.text);
    } else {
      updated = [...likedQuotes, currentQuote];
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 3500);
    }
    setLikedQuotes(updated);
    localStorage.setItem('focusos_liked_quotes', JSON.stringify(updated));
    window.dispatchEvent(new Event('focusos_liked_quotes_changed'));
  };

  return (
    <div 
      id="daily-focus-tip-container" 
      className="w-full px-4 sm:px-6 md:px-8 mt-4 animate-slide-down"
    >
      <div className="relative overflow-hidden bg-zinc-950 border border-orange-500/30 rounded-2xl p-4 sm:p-5 shadow-[0_0_20px_rgba(249,115,22,0.1)] flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pop-in">
        {/* Cyber Bracket Deco */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-orange-500" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-orange-400" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-orange-400" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-orange-500" />

        {/* Scan lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,100,0,0.04),rgba(0,0,0,0.02),rgba(255,150,0,0.04))] bg-[size:100%_4px,6px_100%] pointer-events-none opacity-20" />

        {/* Content */}
        <div className="flex items-start space-x-3.5 flex-1 relative z-10">
          <div className="bg-orange-950/40 border border-orange-500/40 p-2.5 rounded-xl text-orange-400 shrink-0 mt-1 shadow-[0_0_12px_rgba(249,115,22,0.2)]">
            <Lightbulb className="w-4 h-4 animate-pulse text-orange-400" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="text-[9px] font-extrabold text-orange-400 uppercase tracking-widest font-mono bg-orange-950/50 px-2 py-0.5 rounded-md border border-orange-500/20">
                DICA DE FOCO // NÍVEL {userLevel}
              </span>
              <span className="flex items-center text-[9px] font-extrabold text-orange-300 uppercase tracking-widest font-mono bg-zinc-900 px-2 py-0.5 rounded-md border border-orange-500/20">
                <Sparkles className="w-3 h-3 text-orange-400 mr-1 animate-spin" style={{ animationDuration: '6s' }} />
                IA GEMINI PERSONALIZADA
              </span>
            </div>

            {/* Tip Text */}
            <div className="mt-2 min-h-[44px] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center space-x-2 text-orange-400 text-xs font-mono py-1"
                  >
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Gerando frase personalizada para o Nível {userLevel}...</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key={currentQuote.text}
                    initial={{ opacity: 0, x: -10, filter: 'blur(3px)' }}
                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, x: 10, filter: 'blur(3px)' }}
                    transition={{ duration: 0.25 }}
                    className="space-y-1"
                  >
                    <p className="text-sm text-zinc-100 leading-relaxed font-semibold font-sans">
                      "{currentQuote.text}"
                    </p>
                    <p className="text-[10px] text-orange-400/90 font-mono uppercase tracking-widest font-bold">
                      — {currentQuote.author}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="mt-2 text-[10px] text-orange-400 font-mono font-bold flex items-center space-x-1.5"
              >
                <Check className="w-3 h-3 text-orange-400" />
                <span>FRASE SALVA NAS SUA PREFERÊNCIAS!</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 self-end md:self-center relative z-10 shrink-0">
          <button
            type="button"
            onClick={handleToggleLike}
            className={`flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-300 active:scale-90 cursor-pointer ${
              isLiked 
                ? 'bg-orange-950/50 border-orange-500 text-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.3)]' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-orange-400 hover:border-orange-500/40'
            }`}
            title={isLiked ? "Remover curtida" : "Curtir frase"}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-orange-500 stroke-orange-500' : ''}`} />
          </button>

          <button
            type="button"
            onClick={fetchGeminiTip}
            disabled={loading}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-orange-400 hover:text-orange-300 hover:border-orange-500/40 transition-all duration-300 cursor-pointer shadow-sm disabled:opacity-50"
            title="Gerar Nova Frase Personalizada com IA"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            id="close-daily-tip-btn"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-850 transition-all duration-300 cursor-pointer shrink-0"
            title="Fechar painel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
