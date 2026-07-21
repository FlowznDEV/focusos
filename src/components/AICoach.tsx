import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, Send, Volume2, ArrowRight, Loader2, Heart } from 'lucide-react';
import { AICoachResponse } from '../types';

interface AICoachProps {
  level: number;
  streak: number;
  totalTasksCompleted: number;
  currentTaskTitle?: string;
}

const FEELING_PRESETS = [
  { label: 'Muito Disperso 🌀', value: 'Estou me distraindo com tudo a cada minuto, com abas abertas e redes sociais.' },
  { label: 'Paralisado / Travado 🧊', value: 'Sei o que tenho que fazer, mas sinto um bloqueio enorme para começar a primeira tarefa.' },
  { label: 'Ansioso / Sufocado 📈', value: 'Sinto que tenho tarefas demais acumuladas e não sei por onde começar primeiro.' },
  { label: 'Sem Energia 💤', value: 'Estou cansado e quero uma micro-meta ridícula e boba de 1 minuto para quebrar a inércia.' }
];

const getIntelligenceTier = (lvl: number) => {
  if (lvl <= 3) {
    return {
      title: 'Nível I — Foco Primitivo',
      badge: 'Iniciante',
      color: 'border-amber-500/20 bg-amber-950/5 text-amber-400',
      desc: 'Minimiza a barreira de entrada sugerindo ações físicas ou mentais de até 1-2 minutos.',
      percent: 25
    };
  } else if (lvl <= 7) {
    return {
      title: 'Nível II — Fluxo Consciente',
      badge: 'Prático',
      color: 'border-cyan-500/20 bg-cyan-950/5 text-cyan-400',
      desc: 'Usa táticas ambientais personalizadas e sugere micro-blocos de foco práticos de 10-15 minutos.',
      percent: 50
    };
  } else if (lvl <= 11) {
    return {
      title: 'Nível III — Mentalidade Blindada',
      badge: 'Estratega',
      color: 'border-indigo-500/20 bg-indigo-950/5 text-indigo-400',
      desc: 'Sugere técnicas cognitivas avançadas, priorização rápida de energia e controle de estímulos.',
      percent: 75
    };
  } else {
    return {
      title: 'Nível IV — Foco Transcendental',
      badge: 'Soberano',
      color: 'border-pink-500/20 bg-pink-950/5 text-pink-400',
      desc: 'Gatilhos neurocognitivos de Estado de Flow, meditação expressa de foco e alta performance mental.',
      percent: 100
    };
  }
};

export default function AICoach({ level, streak, totalTasksCompleted, currentTaskTitle }: AICoachProps) {
  const [feeling, setFeeling] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [likedQuotes, setLikedQuotes] = useState<any[]>([]);
  const [coachResponse, setCoachResponse] = useState<AICoachResponse>({
    motivationalMessage: "Seja muito bem-vindo! Eu sou o seu Treinador de Foco Inteligente Cyberpunk. Escolha acima como está se sentindo para receber um incentivo focado de alta calibração.",
    suggestedFocusGoal: "Olhe para a sua lista de hoje e escolha a tarefa que pareça mais rápida de resolver.",
    supportiveTagline: "O foco não é um superpoder, é apenas o próximo passo pequeno."
  });
  const [loading, setLoading] = useState(false);
  const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);

  const tierInfo = getIntelligenceTier(level);

  // Load liked quotes to dynamically feed the AI coach model
  const loadLikedQuotes = () => {
    const saved = localStorage.getItem('focusos_liked_quotes');
    if (saved) {
      try {
        setLikedQuotes(JSON.parse(saved));
      } catch (_) {}
    }
  };

  useEffect(() => {
    loadLikedQuotes();
    
    // Listen for real-time changes
    window.addEventListener('focusos_liked_quotes_changed', loadLikedQuotes);
    return () => {
      window.removeEventListener('focusos_liked_quotes_changed', loadLikedQuotes);
    };
  }, []);

  const handleFetchMotivation = async (feelingText: string) => {
    setLoading(true);
    setFeeling(feelingText);
    try {
      const response = await fetch('/api/motivate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          level,
          streak,
          totalTasksCompleted,
          feeling: feelingText,
          currentTask: currentTaskTitle,
          likedQuotes: likedQuotes.map(q => q.text)
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCoachResponse(data);
      } else {
        throw new Error('Erro na requisição');
      }
    } catch (e) {
      console.error(e);
      setCoachResponse({
        motivationalMessage: "Ei, sem pressão! Não se cobre tanto hoje. Às vezes o melhor é fazer apenas um ajuste mínimo de postura e começar de leve.",
        suggestedFocusGoal: "Apenas beba um copo de água e relaxe os ombros por 20 segundos.",
        supportiveTagline: "Sua saúde mental vem antes de qualquer lista."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    handleFetchMotivation(customInput);
    setCustomInput('');
  };

  const handleSpeak = () => {
    if (!window.speechSynthesis) return;

    if (isPlayingSpeech) {
      window.speechSynthesis.cancel();
      setIsPlayingSpeech(false);
      return;
    }

    const textToSpeak = `${coachResponse.motivationalMessage}. Meta sugerida para agora: ${coachResponse.suggestedFocusGoal}. Lembre-se: ${coachResponse.supportiveTagline}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.05;

    utterance.onend = () => {
      setIsPlayingSpeech(false);
    };

    utterance.onerror = () => {
      setIsPlayingSpeech(false);
    };

    setIsPlayingSpeech(true);
    window.speechSynthesis.speak(utterance);
  };

  // Cleanup speech if component unmounts
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div id="ai-coach-section" className="bg-zinc-950 border border-pink-500/30 p-6 rounded-3xl flex flex-col justify-between shadow-[0_0_25px_rgba(236,72,153,0.12)] transition-all duration-300 relative">
      {/* Laser cyber glow highlights */}
      <div className="absolute top-0 right-10 w-24 h-[1px] bg-gradient-to-r from-transparent via-pink-500 to-transparent" />
      <div className="absolute bottom-0 left-10 w-24 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

      <div>
        <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-4">
          <div className="flex items-center space-x-2">
            <div className="bg-pink-950/40 border border-pink-500/30 p-2 rounded-xl">
              <Brain className="w-5 h-5 text-pink-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-1.5 uppercase tracking-tight">
                <span>Notificações Inteligentes IA</span>
                <Sparkles className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
              </h3>
              <p className="text-[11px] text-zinc-500">Incentivos calibrados e direcionados por suas curtidas</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {likedQuotes.length > 0 && (
              <div className="flex items-center space-x-1 bg-pink-950/30 border border-pink-500/20 px-2 py-1 rounded-lg text-[9px] font-mono text-pink-400">
                <Heart className="w-3 h-3 fill-pink-500 stroke-pink-500" />
                <span>{likedQuotes.length} CALIB.</span>
              </div>
            )}
            <button
              id="speak-coach-btn"
              onClick={handleSpeak}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${isPlayingSpeech ? 'bg-pink-950 border-pink-800 text-pink-400 shadow-sm' : 'border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 hover:border-pink-500/30'}`}
              title="Ouvir conselho de foco"
            >
              <Volume2 className={`w-4 h-4 ${isPlayingSpeech ? 'animate-bounce' : ''}`} />
            </button>
          </div>
        </div>

        {/* Intelligence Tier HUD Indicator */}
        <div className={`mb-4 p-3 rounded-2xl border ${tierInfo.color} flex flex-col gap-1.5 transition-all duration-300`}>
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-widest font-mono opacity-80">// Nível de Inteligência IA</span>
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-zinc-950 border border-white/5 uppercase tracking-wider">
              {tierInfo.badge}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5 animate-pulse text-pink-400" />
            <h4 className="text-xs font-bold text-white tracking-tight">{tierInfo.title}</h4>
          </div>
          <p className="text-[10px] opacity-80 leading-relaxed">{tierInfo.desc}</p>
          <div className="w-full bg-zinc-950/80 h-1.5 rounded-full overflow-hidden mt-1 border border-zinc-900">
            <div 
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 h-full transition-all duration-500 rounded-full" 
              style={{ width: `${tierInfo.percent}%` }}
            />
          </div>
        </div>

        {/* Coach Output Box */}
        <div className="bg-zinc-950/85 border border-zinc-900 rounded-xl p-4 mb-4 relative transition-all duration-300">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-6">
              <Loader2 className="w-6 h-6 text-pink-400 animate-spin" />
              <p className="text-xs text-pink-400 mt-2 font-medium">Sincronizando foco com IA...</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                "{coachResponse.motivationalMessage}"
              </p>
              
              <div className="bg-zinc-900/60 border border-zinc-850 p-2.5 rounded-lg flex items-start space-x-2">
                <div className="bg-pink-600 text-white rounded-md p-1 mt-0.5 shrink-0 shadow-sm">
                  <ArrowRight className="w-3 h-3" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest block">Micro-Foco Recomendado</span>
                  <p className="text-[11px] text-zinc-200 font-semibold leading-tight mt-0.5">
                    {coachResponse.suggestedFocusGoal}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-1 flex-wrap gap-1">
                {likedQuotes.length > 0 ? (
                  <span className="text-[8px] font-mono uppercase text-pink-400/80 bg-pink-950/10 px-1.5 py-0.5 rounded border border-pink-500/10">
                    // Tom adaptado por curtidas
                  </span>
                ) : <span />}
                <span className="text-[10px] font-medium text-pink-400 font-mono italic">
                  — {coachResponse.supportiveTagline}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Presets */}
        <div className="space-y-2 mb-4">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block font-mono">// Como está o seu foco agora?</span>
          <div className="grid grid-cols-2 gap-2">
            {FEELING_PRESETS.map((p, index) => (
              <button
                id={`preset-feeling-${index}`}
                key={p.value}
                disabled={loading}
                onClick={() => handleFetchMotivation(p.value)}
                className={`p-2.5 text-left text-[11px] font-medium rounded-xl border transition-all duration-200 disabled:opacity-50 cursor-pointer ${feeling === p.value ? 'border-pink-500 bg-pink-950/50 text-pink-400 shadow-sm' : 'border-zinc-900 bg-zinc-900/30 text-zinc-400 hover:bg-pink-950/20 hover:border-pink-500/40 hover:text-zinc-200'}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Input */}
      <form onSubmit={handleCustomSubmit} className="flex items-center space-x-2 mt-2">
        <input
          id="custom-feeling-input"
          type="text"
          disabled={loading}
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder="Descreva seu sentimento atual... (ex: me distraí de novo)"
          className="flex-1 text-xs border border-zinc-800 hover:border-pink-500/40 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-hidden rounded-xl px-3 py-2.5 bg-zinc-900/60 text-white placeholder-zinc-600 disabled:opacity-50"
        />
        <button
          id="send-feeling-btn"
          type="submit"
          disabled={loading || !customInput.trim()}
          className="bg-pink-600 hover:bg-pink-500 active:scale-95 text-white p-2.5 rounded-xl transition-all disabled:opacity-40 shadow-[0_0_15px_rgba(236,72,153,0.3)] cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
