import React, { useState } from 'react';
import { Sparkles, Lightbulb, X } from 'lucide-react';

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

  // Derive daily quote based on the current calendar day
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  
  const quoteIndex = Math.abs(dayOfYear) % MOTIVATIONAL_QUOTES.length;
  const quote = MOTIVATIONAL_QUOTES[quoteIndex];

  if (!isOpen) return null;

  return (
    <div 
      id="daily-focus-tip-container" 
      className="max-w-7xl mx-auto px-4 mt-4 animate-slide-down"
    >
      <div className="bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-indigo-950/40 border border-indigo-500/20 rounded-2xl p-4 flex items-start justify-between relative overflow-hidden shadow-[0_0_15px_rgba(99,102,241,0.05)]">
        <div className="absolute -top-12 -left-12 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl"></div>
        
        <div className="flex items-start space-x-3.5 flex-1 pr-4 relative z-10">
          <div className="bg-indigo-500/20 border border-indigo-500/30 p-2 rounded-xl text-indigo-400 shrink-0 mt-0.5 shadow-[0_0_10px_rgba(99,102,241,0.15)]">
            <Lightbulb className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">Dica de Foco Diário</span>
              <Sparkles className="w-3 h-3 text-amber-400" />
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed font-medium mt-1">
              "{quote.text}"
            </p>
            <p className="text-[10px] text-zinc-500 font-semibold italic mt-0.5">
              — {quote.author}
            </p>
          </div>
        </div>

        <button
          id="close-daily-tip-btn"
          onClick={() => setIsOpen(false)}
          className="text-zinc-500 hover:text-white p-1 rounded-lg transition-colors shrink-0 relative z-10"
          title="Fechar dica"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
