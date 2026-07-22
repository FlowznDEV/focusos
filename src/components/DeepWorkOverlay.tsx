import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, X, Brain, Flame, Coffee, CheckCircle2, ShieldAlert, Volume2, VolumeX, Sparkles, ChevronDown, Radio } from 'lucide-react';
import { Task } from '../types';
import { playTypeSound, playLevelUpSound, playCancelSound } from '../lib/sound';

interface DeepWorkOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  activeTaskId: string | null;
  onSelectTask: (id: string) => void;
  onCompleteTask: (id: string) => void;
  onFocusComplete: (minutes: number) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export default function DeepWorkOverlay({
  isOpen,
  onClose,
  tasks,
  activeTaskId,
  onSelectTask,
  onCompleteTask,
  onFocusComplete,
  soundEnabled,
  onToggleSound,
}: DeepWorkOverlayProps) {
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [preset, setPreset] = useState<15 | 25 | 50 | 5>(25);
  const [ambientAudio, setAmbientAudio] = useState<boolean>(false);
  const [customGoal, setCustomGoal] = useState<string>('');
  const [showTaskDropdown, setShowTaskDropdown] = useState<boolean>(false);

  const initialSeconds = preset * 60;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  const pendingTasks = tasks.filter((t) => !t.completed);
  const activeTask = tasks.find((t) => t.id === activeTaskId) || pendingTasks[0];

  // Keypress listener for ESC to exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Timer interval
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

  // Sync timer when preset changes
  useEffect(() => {
    if (isActive) {
      playCancelSound();
    }
    setIsActive(false);
    setSecondsLeft(preset * 60);
  }, [preset]);

  // Ambient sound synthesis (Pink Noise / Soft Zen Waves)
  useEffect(() => {
    if (ambientAudio) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          audioCtxRef.current = ctx;

          // Generate soft pink noise buffer
          const bufferSize = ctx.sampleRate * 2;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const output = buffer.getChannelData(0);
          let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

          for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            output[i] *= 0.03; // Low soothing volume
            b6 = white * 0.115926;
          }

          const whiteNoise = ctx.createBufferSource();
          whiteNoise.buffer = buffer;
          whiteNoise.loop = true;

          // Low pass filter
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 400; // Soothing muffled rain / ocean feel

          whiteNoise.connect(filter);
          filter.connect(ctx.destination);
          whiteNoise.start();

          noiseNodeRef.current = whiteNoise as any;
        }
      } catch (err) {
        console.error("Ambient audio error:", err);
      }
    } else {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    }

    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, [ambientAudio]);

  if (!isOpen) return null;

  const handleTimerComplete = () => {
    setIsActive(false);
    if (soundEnabled) {
      playZenChime();
    }
    if (preset !== 5) {
      onFocusComplete(preset);
    }
  };

  const playZenChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.25, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };
      playTone(523.25, ctx.currentTime, 1.2);
      playTone(659.25, ctx.currentTime + 0.15, 1.2);
      playTone(783.99, ctx.currentTime + 0.3, 1.5);
      playTone(1046.50, ctx.currentTime + 0.45, 1.8);
    } catch (e) {
      console.error(e);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const progressPercent = ((initialSeconds - secondsLeft) / initialSeconds) * 100;

  return (
    <div className="fixed inset-0 z-[9999] bg-[#040509] text-zinc-100 flex flex-col justify-between p-4 sm:p-8 overflow-hidden select-none animate-fade-in">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/20 via-zinc-950/80 to-[#040509] pointer-events-none" />

      {/* TOP HEADER STATUS BAR */}
      <div className="relative z-10 flex items-center justify-between w-full max-w-4xl mx-auto border-b border-zinc-900 pb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-indigo-950/60 border border-indigo-500/40 text-indigo-400 px-3 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider animate-pulse">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span>MODO DEEP WORK ATIVO</span>
          </div>
          <div className="hidden sm:flex items-center space-x-1.5 text-xs text-zinc-500 font-mono">
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
            <span>Notificações bloqueadas</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Audio toggle button */}
          <button
            onClick={() => setAmbientAudio(!ambientAudio)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border transition-all cursor-pointer ${
              ambientAudio
                ? 'bg-indigo-900/40 border-indigo-500/50 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.2)]'
                : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:text-zinc-300'
            }`}
            title="Som ambiente de concentração (Ruído Rosa/Chuva Suave)"
          >
            <Radio className={`w-3.5 h-3.5 ${ambientAudio ? 'text-indigo-400 animate-spin' : ''}`} />
            <span className="hidden sm:inline">{ambientAudio ? 'Som Ambiente ON' : 'Som Ambiente OFF'}</span>
          </button>

          {/* Exit Button */}
          <button
            onClick={() => {
              playTypeSound();
              onClose();
            }}
            className="flex items-center space-x-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 px-3.5 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer shadow-md"
          >
            <span>Sair do Deep Work</span>
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        </div>
      </div>

      {/* CENTER WORKSPACE CORE */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-2xl w-full mx-auto text-center my-auto py-4">
        
        {/* ACTIVE TASK CONTAINER */}
        <div className="w-full mb-8 relative">
          <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest block mb-1">
            // OBJETIVO EM FOCO ABSOLUTO
          </span>

          {activeTask ? (
            <div className="bg-zinc-900/80 border border-indigo-500/30 p-4 rounded-2xl flex items-center justify-between shadow-[0_0_20px_rgba(99,102,241,0.1)] relative">
              <div className="text-left flex-1 mr-3">
                <div className="flex items-center space-x-2 mb-0.5">
                  <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-500/30">
                    +{activeTask.xpReward} XP
                  </span>
                  <span className="text-[9px] font-mono text-zinc-500 uppercase">
                    Dificuldade: {activeTask.difficulty}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  {activeTask.title}
                </h2>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => setShowTaskDropdown(!showTaskDropdown)}
                  className="p-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-400 rounded-xl transition-colors cursor-pointer"
                  title="Trocar tarefa ativa"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    playLevelUpSound();
                    onCompleteTask(activeTask.id);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white p-2.5 rounded-xl flex items-center space-x-1.5 text-xs font-bold font-mono transition-all shadow-md active:scale-95 cursor-pointer"
                  title="Concluir tarefa e receber XP"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Concluir</span>
                </button>
              </div>

              {/* Task selector dropdown */}
              {showTaskDropdown && pendingTasks.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-950 border border-zinc-800 rounded-2xl p-2 z-50 shadow-2xl text-left max-h-48 overflow-y-auto">
                  <span className="text-[9px] font-mono text-zinc-500 px-2 py-1 block uppercase">
                    Selecione outra tarefa pendente:
                  </span>
                  {pendingTasks.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        onSelectTask(t.id);
                        setShowTaskDropdown(false);
                        playTypeSound();
                      }}
                      className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        t.id === activeTask.id
                          ? 'bg-indigo-950/60 text-indigo-300 font-bold'
                          : 'hover:bg-zinc-900 text-zinc-300'
                      }`}
                    >
                      <span className="truncate mr-2">{t.title}</span>
                      <span className="text-[9px] font-mono text-indigo-400 shrink-0">
                        +{t.xpReward} XP
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-2xl">
              <input
                type="text"
                placeholder="Digite seu foco para esta sessão de Deep Work..."
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-mono transition-all"
              />
            </div>
          )}
        </div>

        {/* LARGE COUNTDOWN VISUAL TIMER */}
        <div className="relative flex items-center justify-center my-2">
          <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-full border-4 border-zinc-900 flex items-center justify-center relative shadow-[0_0_50px_rgba(99,102,241,0.15)]">
            <svg className="absolute -rotate-90 top-0 left-0 w-full h-full">
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                fill="transparent"
                stroke="url(#deepGlow)"
                strokeWidth="6"
                strokeDasharray="750"
                strokeDashoffset={750 - (750 * progressPercent) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="deepGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>

            <div className="text-center z-10">
              <span className="block text-5xl sm:text-6xl font-mono font-black text-white tracking-tight drop-shadow-md">
                {formatTime(secondsLeft)}
              </span>
              <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest mt-2 block">
                {preset === 5 ? 'PAUSA REGENERATIVA' : `SESSÃO +${preset * 3} XP`}
              </span>
            </div>
          </div>
        </div>

        {/* PRESET PICKERS */}
        <div className="flex space-x-2 p-1 bg-zinc-950/90 border border-zinc-800 rounded-2xl mt-8 w-full max-w-md">
          <button
            disabled={isActive}
            onClick={() => setPreset(15)}
            className={`flex-1 py-2 text-xs font-mono font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
              preset === 15 ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300 disabled:opacity-50'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>15 Min</span>
          </button>

          <button
            disabled={isActive}
            onClick={() => setPreset(25)}
            className={`flex-1 py-2 text-xs font-mono font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
              preset === 25 ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300 disabled:opacity-50'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>25 Min</span>
          </button>

          <button
            disabled={isActive}
            onClick={() => setPreset(50)}
            className={`flex-1 py-2 text-xs font-mono font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
              preset === 50 ? 'bg-purple-600 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300 disabled:opacity-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>50 Min</span>
          </button>

          <button
            disabled={isActive}
            onClick={() => setPreset(5)}
            className={`flex-1 py-2 text-xs font-mono font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
              preset === 5 ? 'bg-emerald-600 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300 disabled:opacity-50'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>5m Pausa</span>
          </button>
        </div>

        {/* TIMER CONTROLS */}
        <div className="flex items-center space-x-4 mt-6">
          <button
            onClick={() => {
              if (isActive) playCancelSound();
              setIsActive(false);
              setSecondsLeft(preset * 60);
            }}
            className="p-3.5 rounded-2xl border border-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-900 active:scale-95 transition-all cursor-pointer"
            title="Resetar tempo"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsActive(!isActive)}
            className={`py-3.5 px-10 rounded-2xl font-mono font-black text-sm uppercase tracking-wider transition-all duration-200 flex items-center space-x-2 shadow-lg cursor-pointer ${
              isActive
                ? 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'
                : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white shadow-indigo-500/25 active:scale-98'
            }`}
          >
            {isActive ? (
              <>
                <Pause className="w-5 h-5 fill-white" />
                <span>Pausar Foco</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                <span>Iniciar Deep Work</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* FOOTER NOTICE */}
      <div className="relative z-10 text-center text-[10px] font-mono text-zinc-600 uppercase tracking-widest pt-2 border-t border-zinc-900">
        Pressione [ESC] ou clique em 'Sair do Deep Work' para retornar ao painel principal do FocusOS.
      </div>
    </div>
  );
}
