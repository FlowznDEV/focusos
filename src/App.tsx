import { useState } from 'react';
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
import { Brain, Flame, Award, Zap, SlidersHorizontal, RefreshCw, Sparkles, HelpCircle, X, Volume2, VolumeX, Share2 } from 'lucide-react';
import { isSoundEnabled, setSoundEnabled as setGlobalSoundEnabled } from './lib/sound';

export default function App() {
  const {
    tasks,
    achievements,
    stats,
    addTask,
    deleteTask,
    toggleTaskCompletion,
    addFocusSession,
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
  const [activeTab, setActiveTab] = useState<'stats' | 'achievements'>('stats');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(isSoundEnabled());

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

      {/* Primary Header - Highly Polished & Adaptive HUD */}
      <header className="bg-zinc-950/90 border-b border-zinc-900/80 backdrop-blur-md sticky top-0 z-40 shadow-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
          {/* Main top header flex container */}
          <div className="flex items-center justify-between gap-4">
            
            {/* Logo area */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.5)] transition-all shrink-0">
                <span className="font-black text-xl text-white">F</span>
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight flex items-center space-x-2">
                  <span>FOCUS.OS</span>
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping shrink-0" />
                </h1>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest leading-none mt-1">Offline-First RPG</p>
              </div>
            </div>

            {/* Quick Action buttons */}
            <div className="flex items-center space-x-2 shrink-0">
              {/* Sound Toggle (Large mobile touch target) */}
              <button
                onClick={handleToggleSound}
                className="flex items-center justify-center border border-zinc-850 hover:bg-zinc-850/50 text-zinc-400 hover:text-white w-11 h-11 sm:w-auto sm:h-auto sm:px-3 sm:py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
                title={soundEnabled ? "Desativar efeitos sonoros" : "Ativar efeitos sonoros"}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-400 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
                <span className="hidden sm:inline ml-1.5">{soundEnabled ? "Sons" : "Mudo"}</span>
              </button>

              {/* Help/Info Button (Large mobile touch target) */}
              <button
                onClick={() => setShowHelpModal(true)}
                className="flex items-center justify-center border border-zinc-850 hover:bg-zinc-850/50 text-zinc-400 hover:text-white w-11 h-11 sm:w-auto sm:h-auto sm:px-3 sm:py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
                title="Como funciona"
              >
                <HelpCircle className="w-4 h-4" />
                <span className="hidden sm:inline ml-1.5">Como funciona</span>
              </button>
            </div>
          </div>

          {/* Symmetrical mobile-first HUD stats bar */}
          <div className="mt-3.5 bg-zinc-900/30 border border-zinc-850/40 rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
            {/* Level & Streak metrics container */}
            <div className="flex items-center justify-between md:justify-start gap-4 w-full md:w-auto">
              <div className="flex items-center gap-3">
                {/* Level Badge with subtle background color */}
                <div className="flex items-center space-x-2.5 bg-indigo-950/40 border border-indigo-900/40 rounded-xl px-3 py-2">
                  <Award className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div className="leading-none">
                    <span className="block text-[8px] text-indigo-300 uppercase tracking-widest font-bold">Nível</span>
                    <span className="text-xs font-black text-white font-mono">{stats.level} <span className="text-[9px] text-zinc-600">/ 150</span></span>
                  </div>
                </div>

                {/* Day Streak Badge with heartbeat animation */}
                <div className="flex items-center space-x-2.5 bg-orange-950/40 border border-orange-900/40 rounded-xl px-3 py-2">
                  <Flame className="w-4 h-4 text-orange-400 shrink-0 animate-pulse" />
                  <div className="leading-none">
                    <span className="block text-[8px] text-orange-300 uppercase tracking-widest font-bold">Sequência</span>
                    <span className="text-xs font-black text-white font-mono">{stats.streak} {stats.streak === 1 ? 'DIA' : 'DIAS'}</span>
                  </div>
                </div>
              </div>

              {/* Symmetrical Share Button inside HUD container */}
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center justify-center space-x-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-400 font-extrabold px-3 py-2 rounded-xl text-xs transition-all active:scale-95 ml-auto md:ml-3 shrink-0 h-10 min-w-[40px] cursor-pointer"
                title="Compartilhar Progresso"
              >
                <Share2 className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline text-[10px] uppercase tracking-wider font-extrabold">Compartilhar</span>
              </button>
            </div>

            {/* XP progress metrics block */}
            <div className="flex-1 max-w-xl w-full flex flex-col justify-center">
              <div className="flex justify-between items-baseline text-[10px] font-bold text-zinc-400 mb-1.5 font-mono">
                <span className="uppercase tracking-wider">Progresso de Experiência</span>
                <span>{stats.xp} / {xpNeeded} XP</span>
              </div>
              <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden relative border border-zinc-850/30">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500 ease-out xp-bar-glow"
                  style={{ width: `${xpProgressPercent}%` }}
                />
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* Daily Focus Tip Message */}
      <DailyTip />

      {/* Main Content Workspace Grid */}
      <main className="max-w-7xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Gamified Tasks Panel (occupies 7 of 12 columns in desktop) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Direct Task List Workspace */}
            <div className="bg-zinc-900/20 border border-zinc-800/40 rounded-3xl p-5 sm:p-6 shadow-sm">
              <TaskList
                tasks={tasks}
                addTask={addTask}
                deleteTask={deleteTask}
                toggleTaskCompletion={toggleTaskCompletion}
                selectedTaskId={selectedTask?.id || null}
                onSelectTask={handleSelectTask}
              />
            </div>

            {/* Toggle tabs for Stats Dashboard & Achievements */}
            <div className="bg-zinc-900/20 border border-zinc-800/40 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
              
              <div className="flex border-b border-zinc-800/60 pb-1">
                <button
                  id="tab-stats-btn"
                  onClick={() => setActiveTab('stats')}
                  className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all duration-200 ${activeTab === 'stats' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                >
                  Métricas de Evolução
                </button>
                <button
                  id="tab-achievements-btn"
                  onClick={() => setActiveTab('achievements')}
                  className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all duration-200 ${activeTab === 'achievements' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                >
                  Conquistas Bloqueadas ({achievements.filter(a => a.unlocked).length})
                </button>
              </div>

              {activeTab === 'stats' ? (
                <StatsDashboard stats={stats} tasks={tasks} />
              ) : (
                <AchievementsList achievements={achievements} />
              )}
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

            {/* Smart IA Assistant Panel */}
            <AICoach
              level={stats.level}
              streak={stats.streak}
              totalTasksCompleted={stats.totalTasksCompleted}
              currentTaskTitle={activeTaskTitle}
            />

            {/* Restart settings block (minimalist footer option) */}
            <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-4 flex items-center justify-between text-[11px] text-zinc-500 shadow-xs">
              <span className="font-mono">FOCUS.OS v1.0 • offline-first</span>
              <button
                id="reset-all-data-btn"
                onClick={() => {
                  setShowResetConfirm(true);
                }}
                className="flex items-center space-x-1.5 text-zinc-500 hover:text-rose-400 transition-colors"
                title="Limpar progresso"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Resetar Jornada</span>
              </button>
            </div>

          </div>

        </div>
      </main>

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
      />

    </div>
  );
}
