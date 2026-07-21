import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Brain, Coffee, Flame, Volume2, VolumeX } from 'lucide-react';
import { playCancelSound } from '../lib/sound';

interface FocusTimerProps {
  onFocusComplete: (minutes: number) => void;
  currentTaskTitle?: string;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export default function FocusTimer({ onFocusComplete, currentTaskTitle, soundEnabled, onToggleSound }: FocusTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(15 * 60); // default to 15 min micro-focus
  const [isActive, setIsActive] = useState(false);
  const [preset, setPreset] = useState<15 | 25 | 5>(15);
  const initialSeconds = preset * 60;
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  // Adjust timer when preset changes
  useEffect(() => {
    if (isActive) {
      playCancelSound();
    }
    setIsActive(false);
    setSecondsLeft(preset * 60);
  }, [preset]);

  const handleTimerComplete = () => {
    setIsActive(false);
    
    // Play synthetic chime using Web Audio API
    if (soundEnabled) {
      playZenChime();
    }

    // Award XP
    // For 5 min break, maybe no XP or minor. Let's award XP for focus presets (15 and 25 mins)
    if (preset !== 5) {
      onFocusComplete(preset);
    }
  };

  // Web Audio API custom synthesizer - gentle, professional chime
  const playZenChime = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const playTone = (freq: number, start: number, duration: number, type: 'sine' | 'triangle') => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, start);
        
        gainNode.gain.setValueAtTime(0.3, start);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.start(start);
        osc.stop(start + duration);
      };

      // Play a beautiful, soothing 3-chord major progress chime
      playTone(523.25, ctx.currentTime, 1.2, 'sine'); // C5
      playTone(659.25, ctx.currentTime + 0.15, 1.2, 'sine'); // E5
      playTone(783.99, ctx.currentTime + 0.3, 1.5, 'sine'); // G5
      playTone(1046.50, ctx.currentTime + 0.45, 1.8, 'sine'); // C6
    } catch (e) {
      console.error("Web Audio API failed or blocked:", e);
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    if (isActive) {
      playCancelSound();
    }
    setIsActive(false);
    setSecondsLeft(preset * 60);
  };

  // Formatting minutes/seconds
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Progress circle percentage
  const progressPercent = ((initialSeconds - secondsLeft) / initialSeconds) * 100;

  return (
    <div id="focus-timer-section" className="bg-zinc-900/40 border border-zinc-800/50 p-6 rounded-3xl flex flex-col items-center justify-between relative overflow-hidden transition-all duration-300 shadow-[0_0_25px_rgba(0,0,0,0.4)]">
      
      {/* Gentle floating status bubble */}
      <div className="absolute top-3 left-4 flex items-center space-x-1.5 text-xs font-medium text-zinc-500">
        <span className={`inline-block w-2 h-2 rounded-full ${isActive ? 'bg-indigo-500 pulse-focus' : 'bg-zinc-800'}`}></span>
        <span>{isActive ? 'Focando...' : 'Timer pronto'}</span>
      </div>

      <button
        id="toggle-sound-btn"
        onClick={onToggleSound}
        className="absolute top-3 right-4 text-zinc-500 hover:text-zinc-300 transition-colors p-1"
        title={soundEnabled ? "Desativar som de conclusão" : "Ativar som de conclusão"}
      >
        {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
      </button>

      <div className="w-full text-center mt-4">
        <h3 className="text-sm font-semibold text-white tracking-tight flex items-center justify-center space-x-1 uppercase">
          <Brain className="w-4 h-4 text-indigo-400" />
          <span>Timer de Foco Auxiliar</span>
        </h3>
        <p className="text-xs text-zinc-500 mt-0.5 max-w-xs mx-auto truncate">
          {currentTaskTitle ? `Foco em: "${currentTaskTitle}"` : 'Foque na sua mente, sem distrações'}
        </p>
      </div>

      {/* Countdown Visual Core */}
      <div className="my-6 relative flex items-center justify-center">
        {/* Symmetrical simple circular visual representation */}
        <div className="w-48 h-48 rounded-full border-4 border-zinc-900 flex items-center justify-center relative shadow-inner">
          <svg className="absolute -rotate-90 top-0 left-0 w-full h-full">
            <circle
              cx="96"
              cy="96"
              r="92"
              fill="transparent"
              stroke="url(#timerGlow)"
              strokeWidth="4"
              strokeDasharray="578"
              strokeDashoffset={578 - (578 * progressPercent) / 100}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="timerGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>
            </defs>
          </svg>

          <div className="text-center z-10">
            <span className="block text-4xl font-mono font-bold text-zinc-100 tracking-tight">
              {formatTime(secondsLeft)}
            </span>
            <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest mt-0.5 block">
              {preset === 5 ? 'Pausa' : `+${preset * 3} XP`}
            </span>
          </div>
        </div>
      </div>

      {/* Preset Pickers */}
      <div className="flex space-x-1.5 p-1 bg-zinc-950/80 border border-zinc-800/80 rounded-xl mb-6 w-full max-w-sm">
        <button
          id="preset-15-btn"
          disabled={isActive}
          onClick={() => setPreset(15)}
          className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 ${preset === 15 ? 'bg-zinc-800 border border-zinc-700/50 text-white shadow-xs' : 'text-zinc-500 hover:text-zinc-300 disabled:opacity-50'}`}
        >
          <Flame className="w-3.5 h-3.5 text-indigo-400" />
          <span>15m Foco</span>
        </button>
        <button
          id="preset-25-btn"
          disabled={isActive}
          onClick={() => setPreset(25)}
          className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 ${preset === 25 ? 'bg-zinc-800 border border-zinc-700/50 text-white shadow-xs' : 'text-zinc-500 hover:text-zinc-300 disabled:opacity-50'}`}
        >
          <Brain className="w-3.5 h-3.5 text-pink-400" />
          <span>25m Foco</span>
        </button>
        <button
          id="preset-5-btn"
          disabled={isActive}
          onClick={() => setPreset(5)}
          className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 ${preset === 5 ? 'bg-zinc-800 border border-zinc-700/50 text-white shadow-xs' : 'text-zinc-500 hover:text-zinc-300 disabled:opacity-50'}`}
        >
          <Coffee className="w-3.5 h-3.5 text-emerald-400" />
          <span>5m Pausa</span>
        </button>
      </div>

      {/* Primary Action Controls */}
      <div className="flex items-center space-x-4">
        <button
          id="timer-reset-btn"
          onClick={resetTimer}
          className="p-2.5 rounded-xl border border-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-800 active:scale-95 transition-all duration-150"
          title="Resetar"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          id="timer-toggle-btn"
          onClick={toggleTimer}
          className={`py-3 px-8 rounded-xl font-medium shadow-sm active:scale-98 text-white transition-all duration-200 flex items-center space-x-2 ${isActive ? 'bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/60 shadow-md' : 'bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.4)]'}`}
        >
          {isActive ? (
            <>
              <Pause className="w-4 h-4 fill-white" />
              <span>Pausar</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Iniciar</span>
            </>
          )}
        </button>
      </div>

      <p className="text-[10px] text-zinc-500 text-center mt-5 uppercase tracking-wide font-mono">
        Ganhe 3 XP por minuto focado. O som de conclusão tocará ao fim!
      </p>
    </div>
  );
}
