import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGamifiedState, getXPForNextLevel } from './useGamifiedState';
import { Task } from './types';
import { motion, AnimatePresence } from 'motion/react';
import FocusTimer from './components/FocusTimer';
import AICoach from './components/AICoach';
import StatsDashboard from './components/StatsDashboard';
import AchievementsList from './components/AchievementsList';
import TaskList from './components/TaskList';
import XPConfetti from './components/XPConfetti';
import DailyTip from './components/DailyTip';
import ShareCardModal from './components/ShareCardModal';
import JournalTab from './components/JournalTab';
import LongTermGoals from './components/LongTermGoals';
import OnboardingScreen from './components/OnboardingScreen';
import PremiumModal from './components/PremiumModal';
import PremiumWelcome from './components/PremiumWelcome';
import { Brain, Flame, Award, Zap, SlidersHorizontal, RefreshCw, Sparkles, HelpCircle, X, Volume2, VolumeX, Share2, Trophy, BarChart2, CheckSquare, BookOpen, Lightbulb, Leaf, Cloud, ArrowDownCircle, ArrowUpCircle, Database, LogOut, Check, Sun, Moon } from 'lucide-react';
import { isSoundEnabled, setSoundEnabled as setGlobalSoundEnabled, playTypeSound } from './lib/sound';

const FOCUS_TIPS = [
  "A técnica Pomodoro (25 minutos de foco e 5 de descanso) ajuda a manter a mente fresca.",
  "Experimente a regra dos 5 minutos: comprometa-se a fazer uma tarefa difícil por apenas 5 minutos. Geralmente, depois de começar, você continua.",
  "Deixe seu celular em outro cômodo ou no modo 'Não Perturbe' antes de iniciar seu timer de foco.",
  "Divida tarefas grandes em micro-metas ridiculamente fáceis para reduzir a ansiedade de começar.",
  "Beba um copo de água antes de iniciar cada sessão de foco para manter o cérebro hidratado.",
  "Organize sua mesa de trabalho: o minimalismo visual ajuda na clareza mental e no foco profundo.",
  "Dizer 'não' para reuniões desnecessárias e distrações é a maior ferramenta de produtividade.",
  "A respiração diafragmática profunda por 1 minuto acalma o sistema nervoso e melhora a concentração.",
  "Não tente ser perfeito, foque no progresso consistente. Feito é melhor do que perfeito!",
  "Foco é uma habilidade treinável. Quanto mais você pratica focar sem interrupções, mais forte ela fica."
];

export default function App() {
  const {
    tasks,
    achievements,
    journalEntries,
    longTermGoals,
    stats,
    addTask,
    deleteTask,
    toggleTaskCompletion,
    addFocusSession,
    addJournalEntry,
    deleteJournalEntry,
    addLongTermGoal,
    deleteLongTermGoal,
    toggleSubTaskCompletion,
    addSubTaskToGoal,
    activeNotification,
    clearNotification,
    triggerConfetti,
    resetAllData
  } = useGamifiedState();

  // Session & Authentication states
  const [session, setSession] = useState<{ email: string; token: string } | null>(() => {
    const saved = localStorage.getItem('focus_quest_user_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing user session:", e);
        localStorage.removeItem('focus_quest_user_session');
      }
    }
    return null;
  });
  const [isOfflineMode, setIsOfflineMode] = useState(() => {
    return localStorage.getItem('focus_quest_offline_mode') === 'true';
  });

  // Premium & Purchase states
  const [premium, setPremium] = useState<boolean>(() => {
    return localStorage.getItem('focus_quest_premium') === 'true';
  });
  const [planType, setPlanType] = useState<string | null>(() => {
    return localStorage.getItem('focus_quest_plan_type');
  });
  const [showWelcomeScreen, setShowWelcomeScreen] = useState<boolean>(() => {
    return localStorage.getItem('focus_quest_show_welcome') === 'true';
  });
  const [showPremiumModal, setShowPremiumModal] = useState<boolean>(false);
  const [showPremiumPrompt, setShowPremiumPrompt] = useState<boolean>(() => {
    return localStorage.getItem('focus_quest_premium_prompt_dismissed') !== 'true';
  });

  // App functions tracked for premium eligibility
  const [usedFunctions, setUsedFunctions] = useState<string[]>(() => {
    const saved = localStorage.getItem('focus_quest_used_functions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing used functions:", e);
        localStorage.removeItem('focus_quest_used_functions');
      }
    }
    return [];
  });

  const trackFunctionUsed = useCallback((func: string) => {
    setUsedFunctions(prev => {
      if (prev.includes(func)) return prev;
      const updated = [...prev, func];
      localStorage.setItem('focus_quest_used_functions', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Account creation/usage date
  const [firstUsedAt] = useState<string>(() => {
    let saved = localStorage.getItem('focus_quest_first_used_at');
    if (!saved) {
      saved = new Date().toISOString();
      localStorage.setItem('focus_quest_first_used_at', saved);
    }
    return saved;
  });

  const [simulatedDays, setSimulatedDays] = useState<number>(() => {
    const saved = localStorage.getItem('focus_quest_simulated_days');
    return saved ? parseInt(saved, 10) : 0;
  });

  const getDaysOfUse = () => {
    const firstUsedDate = new Date(firstUsedAt);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - firstUsedDate.getTime());
    const realDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return realDays + simulatedDays;
  };

  // Listen to Stripe payment success redirect URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('payment_success');
    const type = params.get('plan_type');
    const paramEmail = params.get('email');

    if (success === 'true') {
      const activeEmail = paramEmail || session?.email || 'usuario.teste@focusquest.com';
      const targetPlan = type || 'monthly';
      
      setPremium(true);
      setPlanType(targetPlan);
      setShowWelcomeScreen(true);
      
      localStorage.setItem('focus_quest_premium', 'true');
      localStorage.setItem('focus_quest_plan_type', targetPlan);
      localStorage.setItem('focus_quest_show_welcome', 'true');

      // Update backend premium status
      fetch('/api/user/premium-success', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: activeEmail, planType: targetPlan })
      }).catch(err => console.error("Error updating backend premium status:", err));

      // Clean parameters in window location
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [session]);

  // Cloud Sync Status states
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [cloudConflict, setCloudConflict] = useState<{
    tasks: any;
    stats: any;
    achievements: any;
    updated_at: string;
  } | null>(null);

  // Auto-sync local state to Supabase on changes
  useEffect(() => {
    if (!session) return;
    if (cloudConflict) return;

    let active = true;
    const syncData = async () => {
      try {
        setSyncStatus('syncing');
        const res = await fetch(`/api/supabase/sync/${session.email}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.token}`
          },
          body: JSON.stringify({
            tasks,
            stats,
            achievements
          })
        });
        if (!res.ok) {
          if (res.status === 401) {
            setSession(null);
            localStorage.removeItem('focus_quest_user_session');
          }
          throw new Error('Sync failed');
        }
        if (active) setSyncStatus('synced');
      } catch (e) {
        console.error("Auto-sync error:", e);
        if (active) setSyncStatus('error');
      }
    };

    const timer = setTimeout(() => {
      syncData();
    }, 4000);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [tasks, stats, achievements, session, cloudConflict]);

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [prevLevel, setPrevLevel] = useState<number | null>(null);
  const [showLevelParticles, setShowLevelParticles] = useState(false);

  // Monitor level-up to trigger particles
  useEffect(() => {
    if (stats && stats.level) {
      if (prevLevel !== null && stats.level > prevLevel) {
        setShowLevelParticles(true);
        const timer = setTimeout(() => {
          setShowLevelParticles(false);
        }, 4000);
        return () => clearTimeout(timer);
      }
      setPrevLevel(stats.level);
    }
  }, [stats.level, prevLevel]);

  // Automatic Theme (Day/Night) detection based on system hour
  const [isNight, setIsNight] = useState(() => {
    const hour = new Date().getHours();
    return hour >= 18 || hour < 6;
  });

  useEffect(() => {
    const checkHour = () => {
      const hour = new Date().getHours();
      setIsNight(hour >= 18 || hour < 6);
    };
    checkHour();
    const interval = setInterval(checkHour, 60000); // Check every 60s
    return () => clearInterval(interval);
  }, []);

  const executeReset = () => {
    setShowResetConfirm(false);
    resetAllData();
    setSelectedTask(null);
  };

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeMainTab, setActiveMainTab] = useState<'tasks' | 'stats' | 'coach' | 'achievements' | 'journal'>('tasks');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(isSoundEnabled());

  // Daily Focus Tip Modal State
  const [showDailyTipModal, setShowDailyTipModal] = useState(false);
  const [currentTip, setCurrentTip] = useState('');
  const [zenMode, setZenMode] = useState(false);

  const handleOpenTipModal = () => {
    const randomIndex = Math.floor(Math.random() * FOCUS_TIPS.length);
    setCurrentTip(FOCUS_TIPS[randomIndex]);
    setShowDailyTipModal(true);
    trackFunctionUsed('tip');
  };

  // Lock active tab to 'tasks' when in Zen Mode
  useEffect(() => {
    if (zenMode) {
      setActiveMainTab('tasks');
    }
  }, [zenMode]);

  // Lock body scroll and set viewport styling when Cloud Conflict Resolver Modal is active
  useEffect(() => {
    if (cloudConflict) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [cloudConflict]);



  // Idle Notification State
  const [idleNotification, setIdleNotification] = useState<{
    title: string;
    message: string;
    suggestedTask: Task | null;
  } | null>(null);

  // Keep track of idle timer
  useEffect(() => {
    let lastInteraction = Date.now();
    
    const handleInteraction = () => {
      lastInteraction = Date.now();
    };

    // Listen to mouse movement, clicks, keypresses, and touches
    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('mousedown', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    window.addEventListener('scroll', handleInteraction);

    // Check periodically for idleness
    const interval = setInterval(() => {
      const idleTime = Date.now() - lastInteraction;
      // 15 minutes threshold for a better, more balanced user experience
      const THRESHOLD = 900000; 

      if (idleTime >= THRESHOLD) {
        setIdleNotification(prev => {
          if (prev) return prev; // already showing

          const pendingTasks = tasks.filter(t => !t.completed);
          let suggestedTask: Task | null = null;
          let title = 'Foco Interrompido? 🎯';
          let message = 'Que tal retomar o ritmo com uma pequena sessão de foco agora?';

          if (pendingTasks.length > 0) {
            suggestedTask = pendingTasks[0];
            title = 'Retomar Missão Diária? ⚔️';
            message = `Que tal focar na missão "${suggestedTask.title}" para ganhar +${suggestedTask.xpReward} XP?`;
          } else {
            title = 'Retomar Ritmo de Foco? 🧘';
            message = 'Nenhuma missão pendente encontrada. Que tal focar em respirar fundo ou organizar seu espaço?';
          }

          return {
            title,
            message,
            suggestedTask
          };
        });
      }
    }, 5000); // check every 5s

    return () => {
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('mousedown', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('scroll', handleInteraction);
      clearInterval(interval);
    };
  }, [tasks]);

  const handleRetakeFocus = (suggestedTask: Task | null) => {
    if (suggestedTask) {
      setSelectedTask(suggestedTask);
      setActiveMainTab('tasks');
    }
    setIdleNotification(null);
  };

  const handleCloseIdleNotification = () => {
    setIdleNotification(null);
  };

  // Post-focus session journal entry state
  const [completedSessionInfo, setCompletedSessionInfo] = useState<{
    minutes: number;
    taskTitle?: string;
  } | null>(null);
  const [modalMood, setModalMood] = useState('Focado');
  const [modalNote, setModalNote] = useState('');

  const handleToggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    setGlobalSoundEnabled(nextVal);
    trackFunctionUsed('sound');
  };

  const handleAddTaskWrapper = (
    title: string,
    description: string,
    difficulty: any,
    category: any,
    estimatedFocusPomodoros: number,
    priority?: any
  ) => {
    trackFunctionUsed('task');
    return addTask(title, description, difficulty, category, priority, estimatedFocusPomodoros);
  };

  const handleAddJournalEntryWrapper = (mood: string, notes: string) => {
    trackFunctionUsed('journal');
    return addJournalEntry(mood, notes);
  };

  const handleSimulateTasks = () => {
    for (let i = 1; i <= 5; i++) {
      const t = addTask(`Missão Simulada #${i}`, 'Simulação de Upgrade Premium', 'easy', 'work', 'medium', 1);
      if (t && t.id) {
        toggleTaskCompletion(t.id);
      }
    }
  };

  const handleSimulateFunctions = () => {
    const allFuncs = ['sound', 'filter', 'zen', 'task', 'journal'];
    setUsedFunctions(allFuncs);
    localStorage.setItem('focus_quest_used_functions', JSON.stringify(allFuncs));
  };

  const handleSimulateDays = () => {
    setSimulatedDays(1);
    localStorage.setItem('focus_quest_simulated_days', '1');
    localStorage.removeItem('focus_quest_premium_prompt_dismissed');
    setShowPremiumPrompt(true);
  };

  const xpNeeded = getXPForNextLevel(stats.level);
  const xpProgressPercent = xpNeeded > 0 ? (stats.xp / xpNeeded) * 100 : 100;

  const handleSelectTask = (task: Task | null) => {
    setSelectedTask(task);
  };

  const handleFocusComplete = (minutes: number) => {
    addFocusSession(minutes);
    setCompletedSessionInfo({
      minutes,
      taskTitle: activeTaskTitle
    });
  };

  const activeTaskTitle = selectedTask && !selectedTask.completed ? selectedTask.title : undefined;

  // Welcome screen gating for premium customers
  if (showWelcomeScreen) {
    return (
      <PremiumWelcome
        planType={planType}
        onEnterApp={() => {
          setShowWelcomeScreen(false);
          localStorage.setItem('focus_quest_show_welcome', 'false');
        }}
      />
    );
  }

  // If the user has not logged in / onboarded, show Onboarding Welcome Screen
  if (!session) {
    return (
      <OnboardingScreen
        onJoin={async (nickname, email, token) => {
          const newSession = { email, token };
          setSession(newSession);
          localStorage.setItem('focus_quest_user_session', JSON.stringify(newSession));
          localStorage.setItem('focus_quest_offline_mode', 'false');
          setIsOfflineMode(false);
          
          setPremium(false);
          localStorage.removeItem('focus_quest_premium');
          localStorage.removeItem('focus_quest_plan_type');
          
          try {
            setSyncStatus('syncing');
            const res = await fetch(`/api/supabase/sync/${email}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                tasks,
                stats: {
                  ...stats,
                  nickname
                },
                achievements
              })
            });
            if (res.ok) {
              setSyncStatus('synced');
            } else {
              setSyncStatus('error');
            }
          } catch (e) {
            console.error("Initial onboarding sync failed:", e);
            setSyncStatus('error');
          }
        }}
      />
    );
  }

  return (
    <div className={`min-h-screen bg-[#05060a] text-zinc-100 pb-16 relative font-sans transition-all duration-[1200ms] ease-in-out ${
      isNight 
        ? 'brightness-[0.93] contrast-[0.96] saturate-[0.92] [color-scheme:dark] sepia-[0.04]' 
        : 'brightness-100 contrast-100 saturate-100'
    }`}>
      
      <style>{`
        @keyframes levelParticle {
          0% {
            transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0) scale(1);
            opacity: 1;
            filter: drop-shadow(0 0 4px #22d3ee);
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-40px) scale(0);
            opacity: 0;
            filter: drop-shadow(0 0 8px #818cf8);
          }
        }
      `}</style>

      {/* Confetti canvas animation container */}
          {/* Floating Smart Dynamic Notifications Toast */}
      {activeNotification && (
        <div className="fixed bottom-20 md:bottom-5 left-4 right-4 md:left-auto md:right-5 z-50 max-w-[calc(100%-2rem)] md:max-w-sm w-full bg-zinc-950 text-zinc-100 rounded-2xl p-4 shadow-xl border border-zinc-800 flex items-start space-x-3 transition-all duration-300 animate-slide-up">
          <div className="bg-indigo-500/20 p-2 rounded-xl text-indigo-400 shrink-0 border border-indigo-500/30">
            {activeNotification.type === 'level_up' ? (
              <Award className="w-5 h-5 text-indigo-400" />
            ) : activeNotification.type === 'achievement' ? (
              <Sparkles className="w-5 h-5 text-amber-400" />
            ) : (
              <Zap className="w-5 h-5 text-emerald-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="text-xs font-bold tracking-tight text-white">{activeNotification.title}</h5>
            <p className="text-[11px] text-zinc-400 leading-normal mt-0.5">{activeNotification.message}</p>
          </div>
          <button
            onClick={clearNotification}
            className="text-zinc-500 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Gentle Idle Attention Reminder Notification Toast */}
      {idleNotification && (
        <div className="fixed bottom-20 md:bottom-5 left-4 right-4 md:left-auto md:right-5 z-50 max-w-[calc(100%-2rem)] md:max-w-sm w-full bg-zinc-950 border border-amber-500/30 rounded-2xl p-4 shadow-[0_0_20px_rgba(245,158,11,0.08)] flex items-start space-x-3.5 transition-all duration-300 animate-slide-up">
          <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl text-amber-400 shrink-0">
            <Brain className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="text-[10px] font-mono font-bold tracking-widest text-amber-500 uppercase">// LEMBRETE DE FOCO</h5>
            <h4 className="text-sm font-bold text-white mt-1 leading-tight">{idleNotification.title}</h4>
            <p className="text-[11px] text-zinc-400 leading-normal mt-1">{idleNotification.message}</p>
            
            <div className="flex items-center space-x-2 mt-3">
              <button
                onClick={() => handleRetakeFocus(idleNotification.suggestedTask)}
                className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/60 text-amber-400 font-extrabold px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
              >
                {idleNotification.suggestedTask ? 'Retomar Foco' : 'Praticar Foco'}
              </button>
              <button
                onClick={handleCloseIdleNotification}
                className="text-zinc-500 hover:text-zinc-300 px-2 py-1.5 text-[10px] font-bold"
              >
                Ignorar
              </button>
            </div>
          </div>
          <button
            onClick={handleCloseIdleNotification}
            className="text-zinc-500 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Decorative ultra-minimalist subtle accent line instead of neon */}
      <div className="h-[1px] w-full bg-zinc-850 absolute top-0 left-0 z-50" />

      {/* Primary Header - Fixed Minimalist & Elegant HUD */}
      <header className="bg-zinc-950 border-b border-zinc-900 sticky top-0 z-40 backdrop-blur-md">
        <div className="w-full px-4 sm:px-6 md:px-8 py-3">
          {/* Main top header flex container */}
          <div className="flex items-center justify-between gap-2 md:gap-4">
            
            {/* Logo area - Sleek & Ultra Minimalist with Supabase Integration */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              <div className="flex items-center space-x-1.5 sm:space-x-2 group cursor-pointer" onClick={() => { setActiveMainTab('tasks'); playTypeSound(); }}>
                <div className="w-8 h-8 bg-zinc-950 border border-emerald-500/30 rounded-lg flex items-center justify-center transition-all duration-300 hover:border-emerald-400 shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
                  <Sparkles className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                </div>
                <span className="text-sm font-black tracking-wider text-white uppercase font-sans group-hover:text-emerald-300 transition-colors">FocusOS</span>
              </div>

              {/* Session Pill */}
              {session ? (
                <div className="flex items-center space-x-1 bg-emerald-950/20 border border-emerald-950/40 rounded-xl px-2 py-1 sm:px-3 sm:py-1 text-[10px] text-emerald-400 font-mono font-bold max-w-[110px] xs:max-w-[140px] sm:max-w-xs shrink-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shrink-0" />
                  <span className="truncate max-w-[45px] xs:max-w-[70px] sm:max-w-[120px]">{session.email}</span>
                  {syncStatus === 'syncing' ? (
                    <span className="text-[9px] text-zinc-500 italic animate-pulse shrink-0 hidden sm:inline">...</span>
                  ) : syncStatus === 'synced' ? (
                    <span className="text-[9px] text-emerald-500 font-bold tracking-wider shrink-0 hidden sm:inline">// SALVO</span>
                  ) : syncStatus === 'error' ? (
                    <span className="text-[9px] text-rose-500 font-bold shrink-0 hidden sm:inline">// ERRO</span>
                  ) : null}
                  <button
                    onClick={() => {
                      playTypeSound();
                      localStorage.removeItem('focus_quest_user_session');
                      setSession(null);
                      window.location.reload();
                    }}
                    className="ml-1 text-zinc-500 hover:text-white font-black text-[9px] uppercase border-l border-emerald-950/50 pl-1.5 cursor-pointer shrink-0"
                  >
                    Sair
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-1 bg-zinc-900 border border-zinc-850 rounded-xl px-2 py-1 text-[9px] font-mono font-bold text-zinc-400">
                  <span className="hidden md:inline">Offline Local</span>
                  <button
                    onClick={() => {
                      playTypeSound();
                      localStorage.removeItem('focus_quest_offline_mode');
                      setIsOfflineMode(false);
                    }}
                    className="text-amber-400 hover:text-amber-300 underline cursor-pointer"
                  >
                    Nuvem
                  </button>
                </div>
              )}

              {/* Day/Night Theme pill */}
              <button 
                onClick={() => { playTypeSound(); setIsNight(!isNight); trackFunctionUsed('filter'); }}
                className={`flex items-center justify-center border rounded-xl w-9 h-9 sm:w-auto sm:h-auto sm:px-2.5 sm:py-2 text-[9px] font-mono font-bold transition-all duration-500 shrink-0 cursor-pointer ${
                  isNight 
                    ? 'bg-indigo-950/20 border-indigo-500/20 text-indigo-400 hover:border-indigo-500/50' 
                    : 'bg-amber-950/20 border-amber-500/20 text-amber-400 hover:border-amber-500/50'
                }`}
                title={isNight ? "Filtro Noturno Ativo: Clique para mudar" : "Filtro Diurno Ativo: Clique para mudar"}
              >
                {isNight ? <Moon className="w-3.5 h-3.5 text-indigo-400 animate-pulse" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
                <span className="hidden md:inline ml-1.5 uppercase tracking-widest">{isNight ? "Filtro Noturno" : "Filtro Diurno"}</span>
              </button>
            </div>

            {/* Quick Action buttons */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
              {/* Sound Toggle */}
              <button
                onClick={handleToggleSound}
                className="flex items-center justify-center border border-zinc-850 hover:bg-zinc-900 hover:border-zinc-700 text-zinc-400 hover:text-zinc-100 w-9 h-9 sm:w-auto sm:h-auto sm:px-3 sm:py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 cursor-pointer"
                title={soundEnabled ? "Desativar efeitos sonoros" : "Ativar efeitos sonoros"}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-zinc-300" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
                <span className="hidden sm:inline ml-1.5 font-medium">{soundEnabled ? "Sons" : "Mudo"}</span>
              </button>

              {/* Zen Mode Button */}
              <button
                id="toggle-zen-mode-btn"
                onClick={() => { setZenMode(!zenMode); playTypeSound(); trackFunctionUsed('zen'); }}
                className={`flex items-center justify-center border w-9 h-9 sm:w-auto sm:h-auto sm:px-3 sm:py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-sm ${
                  zenMode 
                    ? 'bg-zinc-850 border-zinc-700 text-white' 
                    : 'border-zinc-850 hover:bg-zinc-900 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                }`}
                title={zenMode ? "Desativar Modo Zen" : "Ativar Modo Zen"}
              >
                <Leaf className={`w-4 h-4 ${zenMode ? 'text-zinc-100' : 'text-zinc-400'}`} />
                <span className="hidden sm:inline ml-1.5 font-medium">{zenMode ? "Modo Zen" : "Modo Zen"}</span>
              </button>

              {/* Premium RPG Upgrade Button / Active Status crown */}
              {!premium ? (
                <button
                  id="upgrade-premium-rpg-btn"
                  onClick={() => { playTypeSound(); setShowPremiumModal(true); }}
                  className="relative flex items-center justify-center bg-gradient-to-r from-amber-600/20 via-yellow-600/20 to-amber-600/20 hover:from-amber-600/30 hover:to-yellow-500/30 border border-amber-500/30 hover:border-amber-400/50 text-amber-400 w-9 h-9 sm:w-auto sm:h-auto sm:px-3 sm:py-2 rounded-xl text-xs font-black tracking-wider uppercase transition-all active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.05)]"
                  title="Upgrade Premium RPG"
                >
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                  <span className="hidden sm:inline ml-1.5 font-bold font-mono">Premium RPG</span>
                  {/* Glowing eligibility indicator dot if 1 day of use is met */}
                  {getDaysOfUse() >= 1 && (
                    <>
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping pointer-events-none" />
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border border-zinc-950 pointer-events-none" />
                    </>
                  )}
                </button>
              ) : (
                <div 
                  className="flex items-center justify-center bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 text-amber-400 px-3 py-2 rounded-xl text-xs font-bold font-mono tracking-widest uppercase shadow-[0_0_10px_rgba(245,158,11,0.03)]"
                  title="Status Premium: Ativo"
                >
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="hidden sm:inline ml-1.5 text-[9px] font-black font-mono tracking-wider">// PREMIUM</span>
                </div>
              )}
            </div>
          </div>

          {/* Symmetrical mobile-first HUD stats bar */}
          {!zenMode && (
            <div className="mt-3.5 bg-zinc-950/50 border border-zinc-900 rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in shadow-inner relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
              {/* Level & Streak metrics container */}
              <div className="flex items-center justify-between md:justify-start gap-4 w-full md:w-auto">
                <div className="flex items-center gap-3">
                  {/* Level Badge with subtle background color */}
                  <div className="relative overflow-visible flex items-center space-x-2.5 bg-cyan-950/30 border border-cyan-500/20 rounded-xl px-3 py-2 hover:border-cyan-500/50 transition-colors shadow-[0_0_10px_rgba(6,182,212,0.05)]">
                    <Award className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div className="leading-none">
                      <span className="block text-[8px] text-cyan-300 uppercase tracking-widest font-bold font-mono">Nível</span>
                      <span className="text-xs font-black text-white font-mono">{stats.level} <span className="text-[9px] text-zinc-600">/ 15</span></span>
                    </div>

                    {showLevelParticles && (
                      <>
                        {/* Pulsing glow rings around badge */}
                        <span className="absolute inset-0 rounded-xl border border-cyan-400 animate-ping opacity-75 pointer-events-none" />
                        <span className="absolute -inset-1 rounded-xl bg-cyan-500/10 blur-sm animate-pulse pointer-events-none" />
                        
                        {/* 12 energy particles radiating outward */}
                        {[...Array(12)].map((_, i) => {
                          const angle = (i * 360) / 12;
                          const delay = (i % 3) * 0.15;
                          return (
                            <span
                              key={i}
                              className="absolute w-1.5 h-1.5 bg-gradient-to-r from-cyan-400 to-indigo-400 rounded-full pointer-events-none"
                              style={{
                                left: '50%',
                                top: '50%',
                                '--angle': `${angle}deg`,
                                animation: `levelParticle 1.8s cubic-bezier(0.1, 0.8, 0.3, 1) infinite`,
                                animationDelay: `${delay}s`
                              } as React.CSSProperties}
                            />
                          );
                        })}
                      </>
                    )}
                  </div>

                  {/* Day Streak Badge with heartbeat animation */}
                  <div className="flex items-center space-x-2.5 bg-pink-950/30 border border-pink-500/20 rounded-xl px-3 py-2 hover:border-pink-500/50 transition-colors shadow-[0_0_10px_rgba(236,72,153,0.05)]">
                    <Flame className="w-4 h-4 text-pink-400 shrink-0 animate-pulse" />
                    <div className="leading-none">
                      <span className="block text-[8px] text-pink-300 uppercase tracking-widest font-bold font-mono">Sequência</span>
                      <span className="text-xs font-black text-white font-mono">{stats.streak} {stats.streak === 1 ? 'DIA' : 'DIAS'}</span>
                    </div>
                  </div>
                </div>

                {/* Symmetrical Share Button inside HUD container */}
                <button
                  onClick={() => setShowShareModal(true)}
                  className="flex items-center justify-center space-x-1.5 bg-pink-600/10 hover:bg-pink-600/20 border border-pink-500/20 text-pink-400 font-extrabold px-3 py-2 rounded-xl text-xs transition-all active:scale-95 ml-auto md:ml-3 shrink-0 h-10 min-w-[40px] cursor-pointer"
                  title="Compartilhar Progresso"
                >
                  <Share2 className="w-4 h-4 text-pink-400" />
                  <span className="hidden sm:inline text-[10px] uppercase tracking-wider font-extrabold">Compartilhar</span>
                </button>
              </div>

              {/* XP progress metrics block */}
              <div className="flex-1 max-w-xl w-full flex flex-col justify-center">
                <div className="flex justify-between items-baseline text-[10px] font-bold text-zinc-400 mb-1.5 font-mono">
                  <span className="uppercase tracking-wider">Progresso de Experiência</span>
                  <span className="text-cyan-400">{stats.xp} / {xpNeeded} XP</span>
                </div>
                <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden relative border border-zinc-900">
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                    style={{ width: `${xpProgressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Premium Navigation Tabs on Desktop/Tablet */}
          {!zenMode && (
            <div className="hidden md:flex items-center space-x-2 mt-4 pt-3.5 border-t border-zinc-900/60">
              <button
                onClick={() => { setActiveMainTab('tasks'); playTypeSound(); }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  activeMainTab === 'tasks'
                    ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.12)] font-extrabold'
                    : 'text-zinc-500 hover:text-emerald-300 hover:bg-zinc-900/30 border border-transparent'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Missões & Foco</span>
              </button>

              <button
                onClick={() => { setActiveMainTab('stats'); playTypeSound(); }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  activeMainTab === 'stats'
                    ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.12)] font-extrabold'
                    : 'text-zinc-500 hover:text-emerald-300 hover:bg-zinc-900/30 border border-transparent'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Evolução & Gráficos</span>
              </button>

              <button
                onClick={() => { setActiveMainTab('coach'); playTypeSound(); }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  activeMainTab === 'coach'
                    ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.12)] font-extrabold'
                    : 'text-zinc-500 hover:text-emerald-300 hover:bg-zinc-900/30 border border-transparent'
                }`}
              >
                <Brain className="w-3.5 h-3.5" />
                <span>Treinador Mental IA</span>
              </button>

              <button
                onClick={() => { setActiveMainTab('achievements'); playTypeSound(); }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  activeMainTab === 'achievements'
                    ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.12)] font-extrabold'
                    : 'text-zinc-500 hover:text-emerald-300 hover:bg-zinc-900/30 border border-transparent'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Conquistas ({achievements.filter(a => a.unlocked).length})</span>
              </button>

              <button
                onClick={() => { setActiveMainTab('journal'); playTypeSound(); }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  activeMainTab === 'journal'
                    ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.12)] font-extrabold'
                    : 'text-zinc-500 hover:text-emerald-300 hover:bg-zinc-900/30 border border-transparent'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Diário</span>
              </button>
            </div>
          )}

        </div>
      </header>

      {/* Daily Focus Tip Message */}
      {!zenMode && <DailyTip />}

      {/* Mobile Sticky Bottom HUD Navigation */}
      {!zenMode && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 border-t border-zinc-900 backdrop-blur-md px-2 py-2 flex justify-around items-center shadow-[0_-10px_30px_rgba(0,0,0,0.8)] pb-safe">
          <button
            onClick={() => { setActiveMainTab('tasks'); playTypeSound(); }}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-300 cursor-pointer ${
              activeMainTab === 'tasks' ? 'text-emerald-400 bg-emerald-950/30 border border-emerald-500/30 font-bold' : 'text-zinc-500 font-medium hover:text-zinc-300'
            }`}
          >
            <CheckSquare className="w-5 h-5 mb-1" />
            <span className="text-[9px] uppercase tracking-wider">Missões</span>
          </button>

          <button
            onClick={() => { setActiveMainTab('stats'); playTypeSound(); }}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-300 cursor-pointer ${
              activeMainTab === 'stats' ? 'text-emerald-400 bg-emerald-950/30 border border-emerald-500/30 font-bold' : 'text-zinc-500 font-medium hover:text-zinc-300'
            }`}
          >
            <BarChart2 className="w-5 h-5 mb-1" />
            <span className="text-[9px] uppercase tracking-wider">Gráficos</span>
          </button>

          <button
            onClick={() => { setActiveMainTab('coach'); playTypeSound(); }}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-300 cursor-pointer ${
              activeMainTab === 'coach' ? 'text-emerald-400 bg-emerald-950/30 border border-emerald-500/30 font-bold' : 'text-zinc-500 font-medium hover:text-zinc-300'
            }`}
          >
            <Brain className="w-5 h-5 mb-1" />
            <span className="text-[9px] uppercase tracking-wider">Mente IA</span>
          </button>

          <button
            onClick={() => { setActiveMainTab('achievements'); playTypeSound(); }}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-300 cursor-pointer ${
              activeMainTab === 'achievements' ? 'text-emerald-400 bg-emerald-950/30 border border-emerald-500/30 font-bold' : 'text-zinc-500 font-medium hover:text-zinc-300'
            }`}
          >
            <Trophy className="w-5 h-5 mb-1" />
            <span className="text-[9px] uppercase tracking-wider">Troféus</span>
          </button>

          <button
            onClick={() => { setActiveMainTab('journal'); playTypeSound(); }}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-300 cursor-pointer ${
              activeMainTab === 'journal' ? 'text-emerald-400 bg-emerald-950/30 border border-emerald-500/30 font-bold' : 'text-zinc-500 font-medium hover:text-zinc-300'
            }`}
          >
            <BookOpen className="w-5 h-5 mb-1" />
            <span className="text-[9px] uppercase tracking-wider">Diário</span>
          </button>
        </div>
      )}

      {/* Main Content Workspace Grid */}
      <main className="w-full px-4 sm:px-6 md:px-8 lg:px-10 mt-6 pb-24 md:pb-6 overflow-x-hidden">
        {/* Active Premium purchase notification banner */}
        {!premium && getDaysOfUse() >= 1 && showPremiumPrompt && (
          <div id="premium-purchase-notification" className="mb-6 bg-gradient-to-r from-amber-950/80 via-yellow-950/80 to-amber-950/80 border border-amber-500/30 text-white p-5 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_0_20px_rgba(245,158,11,0.1)] relative overflow-hidden group animate-fade-in">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent animate-pulse" />
            <div className="flex items-center space-x-3.5 text-left">
              <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-2xl text-amber-400 shrink-0">
                <Sparkles className="w-5 h-5 animate-pulse text-amber-400" />
              </div>
              <div>
                <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-widest block">// NOTIFICAÇÃO DE CHEFIA PREMIUM</span>
                <h4 className="text-sm font-black text-white uppercase tracking-tight mt-0.5">Heroísmo Premium Liberado!</h4>
                <p className="text-xs text-zinc-400 mt-1">Você completou <strong>1 dia de uso ativo</strong> na sua jornada FocusOS! Desbloqueie o Treinador IA, gráficos avançados e trilha RPG premium.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
              <button
                onClick={() => {
                  playTypeSound();
                  setShowPremiumModal(true);
                }}
                className="flex-1 md:flex-initial bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 font-black px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-lg shadow-amber-500/10"
              >
                Liberar Agora
              </button>
              <button
                onClick={() => {
                  playTypeSound();
                  setShowPremiumPrompt(false);
                  localStorage.setItem('focus_quest_premium_prompt_dismissed', 'true');
                }}
                className="p-2.5 text-zinc-500 hover:text-white transition-colors rounded-xl cursor-pointer"
                title="Fechar notificação"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={activeMainTab}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full animate-fade-in"
          >
            {activeMainTab === 'tasks' && (
              <div className={zenMode ? 'max-w-xl mx-auto w-full' : 'grid grid-cols-1 lg:grid-cols-12 gap-6'}>
                {/* LEFT COLUMN: Gamified Tasks Panel (occupies 7 of 12 columns in desktop) */}
                {!zenMode && (
                  <div className="lg:col-span-7 space-y-6">
                    {/* Direct Task List Workspace */}
                    <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 sm:p-6 shadow-[0_0_15px_rgba(0,0,0,0.3)]">
                      <TaskList
                        tasks={tasks}
                        addTask={handleAddTaskWrapper}
                        deleteTask={deleteTask}
                        toggleTaskCompletion={toggleTaskCompletion}
                        selectedTaskId={selectedTask?.id || null}
                        onSelectTask={handleSelectTask}
                      />
                    </div>

                    {/* Long-Term Goals Panel */}
                    <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 sm:p-6 shadow-[0_0_15px_rgba(0,0,0,0.3)]">
                      <LongTermGoals
                        goals={longTermGoals}
                        onAddGoal={addLongTermGoal}
                        onDeleteGoal={deleteLongTermGoal}
                        onToggleSubtask={toggleSubTaskCompletion}
                        onAddSubtaskToGoal={addSubTaskToGoal}
                      />
                    </div>
                  </div>
                )}

                {/* RIGHT COLUMN: Interactive Focus Companion (occupies 5 of 12 columns) */}
                <div className={`${zenMode ? 'w-full' : 'lg:col-span-5'} space-y-6`}>
                  {zenMode && (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center space-y-1.5 animate-pulse">
                      <div className="flex items-center justify-center space-x-2 text-zinc-400">
                        <Leaf className="w-4 h-4 text-zinc-300 animate-spin" style={{ animationDuration: '8s' }} />
                        <span className="text-[10px] font-extrabold uppercase tracking-widest font-mono">MODO_ZEN_ATIVO</span>
                      </div>
                      <p className="text-xs text-zinc-400">Todas as distrações, abas e barras laterais foram ocultadas para manter seu foco puro.</p>
                    </div>
                  )}
                  {/* Companion Timer Panel */}
                  <FocusTimer
                    onFocusComplete={handleFocusComplete}
                    currentTaskTitle={activeTaskTitle}
                    soundEnabled={soundEnabled}
                    onToggleSound={handleToggleSound}
                  />
                </div>
              </div>
            )}

            {activeMainTab === 'stats' && (
              <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 sm:p-6 shadow-[0_0_20px_rgba(0,0,0,0.3)]">
                <StatsDashboard stats={stats} tasks={tasks} />
              </div>
            )}

            {activeMainTab === 'coach' && (
              <div className="w-full max-w-4xl mx-auto">
                <AICoach
                  level={stats.level}
                  streak={stats.streak}
                  totalTasksCompleted={stats.totalTasksCompleted}
                  currentTaskTitle={activeTaskTitle}
                />
              </div>
            )}

            {activeMainTab === 'achievements' && (
              <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 sm:p-6 shadow-[0_0_20px_rgba(0,0,0,0.3)]">
                <AchievementsList achievements={achievements} />
              </div>
            )}

            {activeMainTab === 'journal' && (
              <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 sm:p-6 shadow-[0_0_20px_rgba(0,0,0,0.3)]">
                <JournalTab
                  entries={journalEntries}
                  onAddEntry={handleAddJournalEntryWrapper}
                  onDeleteEntry={deleteJournalEntry}
                  currentFocusTaskTitle={activeTaskTitle}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Symmetrical footer */}
      <footer className="w-full px-4 sm:px-6 md:px-8 lg:px-10 mt-12 pb-24 md:pb-12 text-center flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500 border-t border-zinc-900/60 pt-4">
        <span className="font-mono">Todos os direitos reservados</span>
        <button
          id="reset-all-data-btn"
          onClick={() => setShowResetConfirm(true)}
          className="flex items-center space-x-1.5 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
          title="Limpar progresso"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Resetar Jornada</span>
        </button>
      </footer>

      {/* Info Help Modal Overlay */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative flex flex-col max-h-[85vh] sm:max-h-[90vh] overflow-hidden animate-scale-up">
            <button
              onClick={() => setShowHelpModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white p-1 transition-colors z-10"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-2 border-b border-zinc-800/50 pb-3 mb-4 shrink-0">
              <div className="bg-indigo-950/80 p-1.5 rounded-lg text-indigo-400">
                <Brain className="w-5 h-5 animate-pulse" />
              </div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Como funciona a jornada?</h4>
            </div>

            <div className="space-y-4 text-xs text-zinc-400 leading-relaxed overflow-y-auto pr-1">
              <p>
                O <strong>Foco Gamificado</strong> foi desenvolvido sob medida para pessoas que sofrem com distração ou procrastinação constante, transformando a rotina estressante em um RPG de conquistas leves.
              </p>

              <div className="space-y-2">
                <h5 className="font-bold text-white uppercase tracking-wider text-[10px] text-indigo-400">🛡️ Ganho de Experiência (XP):</h5>
                <ul className="list-disc pl-4 space-y-1.5">
                  <li><strong>Missões Fáceis:</strong> completá-las rende <strong className="text-indigo-400">+40 XP</strong>.</li>
                  <li><strong>Missões Médias:</strong> completá-las rende <strong className="text-indigo-400">+80 XP</strong>.</li>
                  <li><strong>Missões Difíceis:</strong> completá-las rende <strong className="text-indigo-400">+150 XP</strong>.</li>
                  <li><strong>Sessões de Foco:</strong> ganhe <strong className="text-indigo-400">+3 XP por minuto</strong> concluído (até +75 XP por Pomodoro).</li>
                </ul>
              </div>

              <div className="space-y-1">
                <h5 className="font-bold text-white uppercase tracking-wider text-[10px] text-indigo-400">👑 Progressão de Nível:</h5>
                <p>Navegue por até <strong>15 níveis</strong> de prestígio. A XP necessária aumenta de forma desafiadora para valorizar cada subida de nível.</p>
              </div>

              <div className="space-y-1">
                <h5 className="font-bold text-white uppercase tracking-wider text-[10px] text-indigo-400">✨ Notificações Inteligentes IA:</h5>
                <p>Se você se sentir disperso ou travado, clique nos estados mentais ou faça uma pergunta rápida. O assistente de IA gerará uma <strong>micro-meta física ridiculamente fácil de 1 minuto</strong> para quebrar sua paralisia.</p>
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 sm:py-3 rounded-xl text-xs mt-6 transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] shrink-0 min-h-[44px] active:scale-95"
            >
              Entendido, vamos focar!
            </button>
          </div>
        </div>
      )}

      {/* Daily Focus Tip Modal Overlay */}
      {showDailyTipModal && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-amber-500/30 rounded-3xl p-6 max-w-sm w-full shadow-[0_0_30px_rgba(245,158,11,0.15)] relative flex flex-col overflow-hidden animate-scale-up">
            <button
              onClick={() => setShowDailyTipModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white p-1 transition-colors z-10 cursor-pointer"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-2 border-b border-zinc-800/50 pb-3 mb-4 shrink-0">
              <div className="bg-amber-950/80 p-1.5 rounded-lg text-amber-400">
                <Lightbulb className="w-5 h-5 animate-pulse text-amber-400" />
              </div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Dica de Foco do Dia</h4>
            </div>

            <div className="space-y-4 text-center py-4">
              <span className="text-[9px] font-extrabold text-amber-400 uppercase tracking-widest font-mono bg-amber-950/50 px-2 py-1 rounded-md border border-amber-500/20">
                // SYSTEM_INJECT_TIP
              </span>
              <p className="text-sm text-zinc-100 leading-relaxed font-semibold italic">
                "{currentTip}"
              </p>
            </div>

            <button
              onClick={() => {
                const randomIndex = Math.floor(Math.random() * FOCUS_TIPS.length);
                setCurrentTip(FOCUS_TIPS[randomIndex]);
              }}
              className="w-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold py-2 sm:py-2.5 rounded-xl text-xs mt-4 transition-all hover:border-amber-500/60 active:scale-95"
            >
              Próxima Dica 💡
            </button>

            <button
              onClick={() => setShowDailyTipModal(false)}
              className="w-full bg-zinc-900 hover:bg-zinc-850 text-zinc-300 font-bold py-2 sm:py-2.5 rounded-xl text-xs mt-2 transition-all active:scale-95"
            >
              Fechar
            </button>
          </div>
        </div>
      )}



      {/* Reset Journey Confirmation Modal Overlay */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative flex flex-col max-h-[85vh] overflow-hidden animate-scale-up">
            <button
              onClick={() => setShowResetConfirm(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white p-1 transition-colors z-10"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-2.5 border-b border-zinc-800/50 pb-3 mb-4 shrink-0">
              <div className="bg-rose-950/60 border border-rose-900/40 p-2 rounded-xl text-rose-400">
                <RefreshCw className="w-5 h-5 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Resetar Jornada?</h4>
            </div>

            <div className="overflow-y-auto text-xs text-zinc-400 leading-relaxed mb-6 space-y-3 pr-1">
              <p>
                Deseja realmente <strong>apagar toda a sua jornada atual</strong> e começar do zero?
              </p>
              <p className="font-semibold text-rose-400 bg-rose-950/20 border border-rose-900/30 p-2.5 rounded-xl">
                ⚠️ Seu nível voltará ao 1, e todas as suas tarefas, XP e conquistas locais serão limpados de forma definitiva!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white font-bold py-2.5 sm:py-3 rounded-xl text-xs transition-all active:scale-95 flex items-center justify-center min-h-[44px]"
              >
                Voltar ao Foco
              </button>
              <button
                onClick={executeReset}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 sm:py-3 rounded-xl text-xs transition-all active:scale-95 shadow-[0_0_15px_rgba(225,29,72,0.25)] flex items-center justify-center min-h-[44px]"
              >
                Apagar Progresso
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Card Modal Overlay */}
      <ShareCardModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        stats={stats}
        xpNeeded={xpNeeded}
        achievements={achievements}
      />

      {/* Post-focus Mood Diary reflection popup modal */}
      {completedSessionInfo && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-zinc-950 border border-pink-500/40 p-6 rounded-3xl max-w-md w-full shadow-[0_0_50px_rgba(236,72,153,0.2)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-400 via-pink-500 to-cyan-400" />
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-pink-950/40 border border-pink-500/30 rounded-2xl flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(236,72,153,0.25)]">
                <Brain className="w-8 h-8 text-pink-400 animate-pulse" />
              </div>
              
              <div>
                <span className="text-[9px] font-mono font-bold text-pink-400 uppercase tracking-widest block">// Ciclo de Foco Concluído</span>
                <h3 className="text-lg font-black text-white mt-1 uppercase tracking-tight">Excelente Calibração!</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Parabéns por concluir <strong className="text-cyan-400">{completedSessionInfo.minutes} minutos</strong> de foco.
                  {completedSessionInfo.taskTitle && (
                    <span> Missão: <strong className="text-pink-400">"{completedSessionInfo.taskTitle}"</strong></span>
                  )}
                </p>
              </div>

              <div className="bg-zinc-900/40 border border-zinc-900 p-4 rounded-2xl text-left space-y-3">
                <div>
                  <span className="text-[9px] font-mono text-zinc-400 block mb-1.5 uppercase tracking-wider">Como você se sentiu nesse ciclo?</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['Focado', 'Satisfeito', 'Disperso', 'Ansioso', 'Cansado'].map((m) => {
                      const emojiMap: any = {
                        Focado: '🎯',
                        Disperso: '🌀',
                        Ansioso: '📈',
                        Satisfeito: '😊',
                        Cansado: '💤'
                      };
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setModalMood(m)}
                          className={`py-1.5 px-2 text-[10px] font-bold rounded-xl border transition-all cursor-pointer flex items-center justify-center space-x-1 ${
                            modalMood === m
                              ? 'border-pink-500 bg-pink-950/30 text-pink-400'
                              : 'border-zinc-800 bg-zinc-900/10 text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          <span>{emojiMap[m]}</span>
                          <span>{m}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="modal-reflection" className="text-[9px] font-mono text-zinc-400 block uppercase tracking-wider">Nota Rápida (1-2 linhas):</label>
                  <textarea
                    id="modal-reflection"
                    maxLength={200}
                    value={modalNote}
                    onChange={(e) => setModalNote(e.target.value)}
                    placeholder="Ex: Consegui manter um bom ritmo, me senti calmo e produtivo..."
                    rows={2}
                    className="w-full text-xs border border-zinc-850 hover:border-pink-500/20 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-hidden rounded-xl px-3 py-2 bg-zinc-900/60 text-white placeholder-zinc-600 transition-all resize-none"
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setCompletedSessionInfo(null);
                    setModalNote('');
                  }}
                  className="flex-1 border border-zinc-850 hover:bg-zinc-900 hover:text-white text-zinc-400 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Pular por Enquanto
                </button>
                <button
                  disabled={!modalNote.trim()}
                  onClick={() => {
                    addJournalEntry(
                      modalNote.trim(),
                      modalMood,
                      completedSessionInfo.taskTitle,
                      completedSessionInfo.minutes
                    );
                    setCompletedSessionInfo(null);
                    setModalNote('');
                    setActiveMainTab('journal');
                  }}
                  className="flex-1 bg-pink-600 hover:bg-pink-500 disabled:opacity-45 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(236,72,153,0.3)] cursor-pointer"
                >
                  Salvar Reflexão
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cloud Conflict Resolver Modal */}
      {cloudConflict && (
        <div className="fixed inset-0 bg-[#030305]/95 backdrop-blur-md z-[9999] flex items-start justify-center p-4 overflow-hidden">
          <div className="bg-zinc-950 border border-emerald-500/30 p-6 sm:p-8 rounded-3xl max-w-md w-full shadow-[0_0_50px_rgba(16,185,129,0.15)] relative overflow-hidden flex flex-col text-center mt-12 sm:mt-24">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-indigo-500 to-emerald-500" />
            
            <div className="w-16 h-16 bg-emerald-950/40 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-400">
              <Database className="w-8 h-8 animate-pulse" />
            </div>

            <h3 className="text-sm font-black text-white uppercase tracking-tight">Sincronização de Progresso</h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Encontramos dados salvos na nuvem! Escolha o que fazer com seu progresso:
            </p>

            <div className="mt-6 space-y-3">
              {/* Option A: Restore Cloud */}
              <button
                onClick={() => {
                  playTypeSound();
                  // Overwrite local progress with cloud progress
                  localStorage.setItem('focus_quest_tasks', JSON.stringify(cloudConflict.tasks || []));
                  localStorage.setItem('focus_quest_stats', JSON.stringify(cloudConflict.stats || {}));
                  localStorage.setItem('focus_quest_achievements', JSON.stringify(cloudConflict.achievements || []));
                  setCloudConflict(null);
                  window.location.reload();
                }}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all active:scale-95 shadow-[0_4px_15px_rgba(16,185,129,0.25)] flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowDownCircle className="w-4 h-4" />
                <span>Baixar progresso da nuvem</span>
              </button>

              {/* Option B: Upload Local */}
              <button
                onClick={async () => {
                  playTypeSound();
                  if (session) {
                    try {
                      setSyncStatus('syncing');
                      await fetch(`/api/supabase/sync/${session.email}`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${session.token}`
                        },
                        body: JSON.stringify({
                          tasks,
                          stats,
                          achievements
                        })
                      });
                      setSyncStatus('synced');
                    } catch (e) {
                      console.error("Failed to upload local progress:", e);
                      setSyncStatus('error');
                    }
                  }
                  setCloudConflict(null);
                }}
                className="w-full bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowUpCircle className="w-4 h-4" />
                <span>Sobrescrever Nuvem com meu Progresso Local</span>
              </button>
            </div>

            <p className="text-[10px] text-zinc-500 mt-4 font-mono">
              Última sincronização na nuvem: {new Date(cloudConflict.updated_at).toLocaleString('pt-BR')}
            </p>
          </div>
        </div>
      )}

      {/* Premium presentation & checkout dialog modal */}
      <PremiumModal
        isOpen={showPremiumModal || (!premium && getDaysOfUse() >= 1)}
        onClose={() => setShowPremiumModal(false)}
        email={session?.email || 'usuario.teste@focusquest.com'}
        stats={{
          totalTasksCompleted: stats.totalTasksCompleted,
          level: stats.level,
          streak: stats.streak
        }}
        usedFunctionsCount={usedFunctions.filter(f => ['sound', 'filter', 'zen', 'task', 'journal'].includes(f)).length}
        totalFunctionsCount={5} // Total active functions: sound, filter, zen, task, journal
        daysOfUse={getDaysOfUse()}
        canClose={!(getDaysOfUse() >= 1 && !premium)}
        onPaymentSuccess={(type) => {
          setPremium(true);
          setPlanType(type);
          setShowPremiumModal(false);
          setShowWelcomeScreen(true);
          localStorage.setItem('focus_quest_premium', 'true');
          localStorage.setItem('focus_quest_plan_type', type);
          localStorage.setItem('focus_quest_show_welcome', 'true');
        }}
        onSimulateTasks={handleSimulateTasks}
        onSimulateFunctions={handleSimulateFunctions}
        onSimulateDays={handleSimulateDays}
      />

    </div>
  );
}
