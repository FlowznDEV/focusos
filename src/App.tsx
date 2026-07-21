import { useState, useEffect, useRef } from 'react';
import { useGamifiedState, getXPForNextLevel } from './useGamifiedState';
import { Task } from './types';
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
import { Brain, Flame, Award, Zap, SlidersHorizontal, RefreshCw, Sparkles, HelpCircle, X, Volume2, VolumeX, Share2, Trophy, BarChart2, CheckSquare, BookOpen } from 'lucide-react';
import { isSoundEnabled, setSoundEnabled as setGlobalSoundEnabled } from './lib/sound';

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

  const [showResetConfirm, setShowResetConfirm] = useState(false);

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
      // 30 seconds threshold for a quick, responsive experience
      const THRESHOLD = 30000; 

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

  return (
    <div className="min-h-screen bg-[#05060a] text-zinc-100 pb-16 relative font-sans">
      
      {/* Confetti canvas animation container */}
      <XPConfetti trigger={triggerConfetti} />

      {/* Floating Smart Dynamic Notifications Toast */}
      {activeNotification && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-zinc-950 text-zinc-100 rounded-2xl p-4 shadow-xl border border-zinc-800 flex items-start space-x-3 transition-all duration-300 animate-slide-up">
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
        <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-zinc-950 border border-amber-500/30 rounded-2xl p-4 shadow-[0_0_20px_rgba(245,158,11,0.08)] flex items-start space-x-3.5 transition-all duration-300 animate-slide-up">
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

      {/* Decorative neon top laser edge inside header */}
      <div className="h-[2px] w-full bg-gradient-to-r from-cyan-400 via-pink-500 to-cyan-400 animate-pulse absolute top-0 left-0 z-50" />

      {/* Primary Header - Highly Polished & Adaptive HUD */}
      <header className="bg-zinc-950/95 border-b border-zinc-900/80 backdrop-blur-md sticky top-0 z-40 shadow-xl transition-all duration-500">
        <div className="w-full px-4 sm:px-6 md:px-8 py-3 sm:py-4">
          {/* Main top header flex container */}
          <div className="flex items-center justify-between gap-4">
            
            {/* Logo area with rotating glowing elements */}
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)] group-hover:shadow-[0_0_25px_rgba(6,182,212,0.85)] group-hover:rotate-6 transition-all duration-300 shrink-0">
                <span className="font-black text-xl text-zinc-950 group-hover:scale-110 transition-transform">F</span>
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight flex items-center space-x-2">
                  <span className="group-hover:text-cyan-400 transition-colors font-mono">FOCUS.OS_v1.2</span>
                  <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-ping shrink-0" />
                </h1>
              </div>
            </div>

            {/* Quick Action buttons */}
            <div className="flex items-center space-x-2 shrink-0">
              {/* Sound Toggle (Large mobile touch target) */}
              <button
                onClick={handleToggleSound}
                className="flex items-center justify-center border border-zinc-850 hover:bg-cyan-950/20 hover:border-cyan-500/30 text-zinc-400 hover:text-cyan-400 w-11 h-11 sm:w-auto sm:h-auto sm:px-3 sm:py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 cursor-pointer"
                title={soundEnabled ? "Desativar efeitos sonoros" : "Ativar efeitos sonoros"}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
                <span className="hidden sm:inline ml-1.5">{soundEnabled ? "Sons" : "Mudo"}</span>
              </button>

              {/* Help/Info Button (Large mobile touch target) */}
              <button
                onClick={() => setShowHelpModal(true)}
                className="flex items-center justify-center border border-zinc-850 hover:bg-pink-950/20 hover:border-pink-500/30 text-zinc-400 hover:text-pink-400 w-11 h-11 sm:w-auto sm:h-auto sm:px-3 sm:py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 cursor-pointer"
                title="Como funciona"
              >
                <HelpCircle className="w-4 h-4 text-zinc-400 hover:text-pink-400 transition-colors" />
                <span className="hidden sm:inline ml-1.5">Como funciona</span>
              </button>
            </div>
          </div>

          {/* Symmetrical mobile-first HUD stats bar */}
          <div className="mt-3.5 bg-zinc-950/50 border border-zinc-900 rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in shadow-inner relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
            {/* Level & Streak metrics container */}
            <div className="flex items-center justify-between md:justify-start gap-4 w-full md:w-auto">
              <div className="flex items-center gap-3">
                {/* Level Badge with subtle background color */}
                <div className="flex items-center space-x-2.5 bg-cyan-950/30 border border-cyan-500/20 rounded-xl px-3 py-2 hover:border-cyan-500/50 transition-colors shadow-[0_0_10px_rgba(6,182,212,0.05)]">
                  <Award className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div className="leading-none">
                    <span className="block text-[8px] text-cyan-300 uppercase tracking-widest font-bold font-mono">Nível</span>
                    <span className="text-xs font-black text-white font-mono">{stats.level} <span className="text-[9px] text-zinc-600">/ 150</span></span>
                  </div>
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

          {/* Premium Navigation Tabs on Desktop/Tablet */}
          <div className="hidden md:flex items-center space-x-2 mt-4 pt-3.5 border-t border-zinc-900/60">
            <button
              onClick={() => setActiveMainTab('tasks')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeMainTab === 'tasks'
                  ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                  : 'text-zinc-500 hover:text-cyan-300/85 border border-transparent'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Missões & Foco</span>
            </button>

            <button
              onClick={() => setActiveMainTab('stats')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeMainTab === 'stats'
                  ? 'bg-pink-950/40 text-pink-400 border border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.15)]'
                  : 'text-zinc-500 hover:text-pink-300/85 border border-transparent'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Evolução & Gráficos</span>
            </button>

            <button
              onClick={() => setActiveMainTab('coach')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeMainTab === 'coach'
                  ? 'bg-fuchsia-950/40 text-fuchsia-400 border border-fuchsia-500/30 shadow-[0_0_15px_rgba(217,70,239,0.15)]'
                  : 'text-zinc-500 hover:text-fuchsia-300/85 border border-transparent'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Treinador Mental IA</span>
            </button>

            <button
              onClick={() => setActiveMainTab('achievements')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeMainTab === 'achievements'
                  ? 'bg-amber-950/40 text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                  : 'text-zinc-500 hover:text-amber-300/85 border border-transparent'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Conquistas ({achievements.filter(a => a.unlocked).length})</span>
            </button>

            <button
              onClick={() => setActiveMainTab('journal')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeMainTab === 'journal'
                  ? 'bg-pink-950/40 text-pink-400 border border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.15)]'
                  : 'text-zinc-500 hover:text-pink-300/85 border border-transparent'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Diário</span>
            </button>
          </div>

        </div>
      </header>

      {/* Daily Focus Tip Message */}
      <DailyTip />

      {/* Mobile Sticky Bottom HUD Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 border-t border-zinc-900 backdrop-blur-md px-2 py-2 flex justify-around items-center shadow-[0_-10px_30px_rgba(0,0,0,0.8)] pb-safe">
        <button
          onClick={() => setActiveMainTab('tasks')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-300 cursor-pointer ${
            activeMainTab === 'tasks' ? 'text-cyan-400 bg-cyan-950/40 font-bold border border-cyan-500/20' : 'text-zinc-500 font-medium'
          }`}
        >
          <CheckSquare className="w-5 h-5 mb-1" />
          <span className="text-[9px] uppercase tracking-wider">Missões</span>
        </button>

        <button
          onClick={() => setActiveMainTab('stats')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-300 cursor-pointer ${
            activeMainTab === 'stats' ? 'text-pink-400 bg-pink-950/40 font-bold border border-pink-500/20' : 'text-zinc-500 font-medium'
          }`}
        >
          <BarChart2 className="w-5 h-5 mb-1" />
          <span className="text-[9px] uppercase tracking-wider font-bold font-mono">Gráficos</span>
        </button>

        <button
          onClick={() => setActiveMainTab('coach')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-300 cursor-pointer ${
            activeMainTab === 'coach' ? 'text-fuchsia-400 bg-fuchsia-950/40 font-bold border border-fuchsia-500/20' : 'text-zinc-500 font-medium'
          }`}
        >
          <Brain className="w-5 h-5 mb-1" />
          <span className="text-[9px] uppercase tracking-wider">Mente IA</span>
        </button>

        <button
          onClick={() => setActiveMainTab('achievements')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-300 cursor-pointer ${
            activeMainTab === 'achievements' ? 'text-amber-400 bg-amber-950/40 font-bold border border-amber-500/20' : 'text-zinc-500 font-medium'
          }`}
        >
          <Trophy className="w-5 h-5 mb-1" />
          <span className="text-[9px] uppercase tracking-wider">Troféus</span>
        </button>

        <button
          onClick={() => setActiveMainTab('journal')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-300 cursor-pointer ${
            activeMainTab === 'journal' ? 'text-pink-400 bg-pink-950/40 font-bold border border-pink-500/20' : 'text-zinc-500 font-medium'
          }`}
        >
          <BookOpen className="w-5 h-5 mb-1" />
          <span className="text-[9px] uppercase tracking-wider">Diário</span>
        </button>
      </div>

      {/* Main Content Workspace Grid */}
      <main className="w-full px-4 sm:px-6 md:px-8 lg:px-10 mt-6 pb-24 md:pb-6">
        
        {activeMainTab === 'tasks' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
            {/* LEFT COLUMN: Gamified Tasks Panel (occupies 7 of 12 columns in desktop) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Direct Task List Workspace */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 sm:p-6 shadow-[0_0_15px_rgba(0,0,0,0.3)]">
                <TaskList
                  tasks={tasks}
                  addTask={addTask}
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

            {/* RIGHT COLUMN: Interactive Focus Companion (occupies 5 of 12 columns) */}
            <div className="lg:col-span-5 space-y-6">
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
          <div className="bg-zinc-950 border border-pink-500/20 rounded-3xl p-5 sm:p-6 shadow-[0_0_20px_rgba(236,72,153,0.05)] animate-fade-in">
            <StatsDashboard stats={stats} tasks={tasks} />
          </div>
        )}

        {activeMainTab === 'coach' && (
          <div className="w-full max-w-4xl mx-auto animate-fade-in">
            <AICoach
              level={stats.level}
              streak={stats.streak}
              totalTasksCompleted={stats.totalTasksCompleted}
              currentTaskTitle={activeTaskTitle}
            />
          </div>
        )}

        {activeMainTab === 'achievements' && (
          <div className="bg-zinc-950 border border-amber-500/20 rounded-3xl p-5 sm:p-6 shadow-[0_0_20px_rgba(245,158,11,0.05)] animate-fade-in">
            <AchievementsList achievements={achievements} />
          </div>
        )}

        {activeMainTab === 'journal' && (
          <div className="bg-zinc-950 border border-pink-500/20 rounded-3xl p-5 sm:p-6 shadow-[0_0_20px_rgba(236,72,153,0.05)] animate-fade-in">
            <JournalTab
              entries={journalEntries}
              onAddEntry={addJournalEntry}
              onDeleteEntry={deleteJournalEntry}
              currentFocusTaskTitle={activeTaskTitle}
            />
          </div>
        )}

      </main>

      {/* Symmetrical footer */}
      <footer className="w-full px-4 sm:px-6 md:px-8 lg:px-10 mt-12 pb-24 md:pb-12 text-center flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500 border-t border-zinc-900/60 pt-4">
        <span className="font-mono">FOCUS.OS v1.2 • Premium Cyberpunk HUD Interface</span>
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
                <p>Navegue por até <strong>150 níveis</strong> de prestígio. A XP necessária aumenta gradativamente de forma suave para manter o desafio recompensador.</p>
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

    </div>
  );
}
