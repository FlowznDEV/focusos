import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, Send, Volume2, ArrowRight, Loader2 } from 'lucide-react';
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

export default function AICoach({ level, streak, totalTasksCompleted, currentTaskTitle }: AICoachProps) {
  const [feeling, setFeeling] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [coachResponse, setCoachResponse] = useState<AICoachResponse>({
    motivationalMessage: "Seja muito bem-vindo! Eu sou o seu Treinador de Foco Inteligente. Escolha acima como está se sentindo para receber um incentivo focado.",
    suggestedFocusGoal: "Olhe para a sua lista de hoje e escolha a tarefa que pareça mais rápida de resolver.",
    supportiveTagline: "O foco não é um superpoder, é apenas o próximo passo pequeno."
  });
  const [loading, setLoading] = useState(false);
  const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);

  // Auto-fetch a greeting on load
  useEffect(() => {
    // We can fetch initial welcome or use default
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
          currentTask: currentTaskTitle
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
    <div id="ai-coach-section" className="bg-zinc-900/40 border border-zinc-800/50 p-6 rounded-3xl flex flex-col justify-between shadow-[0_0_25px_rgba(0,0,0,0.4)] transition-all duration-300">
      <div>
        <div className="flex items-center justify-between border-b border-zinc-850 pb-4 mb-4">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-950/40 border border-indigo-900/30 p-2 rounded-xl">
              <Brain className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-1 uppercase tracking-tight">
                <span>Notificações Inteligentes IA</span>
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
              </h3>
              <p className="text-[11px] text-zinc-500">Incentivo direcionado sem sobrecarga mental</p>
            </div>
          </div>

          <button
            id="speak-coach-btn"
            onClick={handleSpeak}
            className={`p-1.5 rounded-lg border transition-all ${isPlayingSpeech ? 'bg-indigo-950 border-indigo-800 text-indigo-400 shadow-sm' : 'border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
            title="Ouvir conselho de foco"
          >
            <Volume2 className={`w-4 h-4 ${isPlayingSpeech ? 'animate-bounce' : ''}`} />
          </button>
        </div>

        {/* Coach Output Box */}
        <div className="bg-zinc-950/60 border border-zinc-850 rounded-xl p-4 mb-4 relative transition-all duration-300">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-6">
              <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
              <p className="text-xs text-indigo-400 mt-2 font-medium">Sincronizando foco com IA...</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                "{coachResponse.motivationalMessage}"
              </p>
              
              <div className="bg-zinc-900/60 border border-zinc-850 p-2.5 rounded-lg flex items-start space-x-2">
                <div className="bg-indigo-600 text-white rounded-md p-1 mt-0.5 shrink-0 shadow-sm">
                  <ArrowRight className="w-3 h-3" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Micro-Foco Recomendado</span>
                  <p className="text-[11px] text-zinc-200 font-semibold leading-tight mt-0.5">
                    {coachResponse.suggestedFocusGoal}
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <span className="text-[10px] font-medium text-indigo-400 font-mono italic">
                  — {coachResponse.supportiveTagline}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Presets */}
        <div className="space-y-2 mb-4">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Como está o seu foco agora?</span>
          <div className="grid grid-cols-2 gap-2">
            {FEELING_PRESETS.map((p, index) => (
              <button
                id={`preset-feeling-${index}`}
                key={p.value}
                disabled={loading}
                onClick={() => handleFetchMotivation(p.value)}
                className={`p-2.5 text-left text-[11px] font-medium rounded-xl border transition-all duration-200 disabled:opacity-50 ${feeling === p.value ? 'border-indigo-900 bg-indigo-950/50 text-indigo-400 shadow-sm' : 'border-zinc-850 bg-zinc-950/30 text-zinc-400 hover:bg-indigo-950/20 hover:border-indigo-900/40 hover:text-zinc-200'}`}
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
          className="flex-1 text-xs border border-zinc-800 hover:border-zinc-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden rounded-xl px-3 py-2.5 bg-zinc-900/60 text-white placeholder-zinc-600 disabled:opacity-50"
        />
        <button
          id="send-feeling-btn"
          type="submit"
          disabled={loading || !customInput.trim()}
          className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white p-2.5 rounded-xl transition-all disabled:opacity-40 shadow-[0_0_15px_rgba(79,70,229,0.3)] cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
