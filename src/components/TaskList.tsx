import React, { useState } from 'react';
import { Plus, Trash, Folder, AlertCircle, Play, CheckCircle2, Circle, Sparkles, Filter, Check, Search, X, Tag } from 'lucide-react';
import { Task, Difficulty, TaskCategory, Priority } from '../types';
import { playTypeSound } from '../lib/sound';

interface TaskListProps {
  tasks: Task[];
  addTask: (title: string, description: string, difficulty: Difficulty, category: TaskCategory, estimatedFocusPomodoros: number, priority?: Priority) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  selectedTaskId: string | null;
  onSelectTask: (task: Task | null) => void;
}

const CATEGORIES: { value: TaskCategory; label: string; icon: string; color: string; bg: string; activeBg: string }[] = [
  { value: 'work', label: 'Trabalho', icon: '💼', color: 'text-indigo-400', bg: 'bg-indigo-950/70 border border-indigo-500/40 text-indigo-300', activeBg: 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_12px_rgba(79,70,229,0.3)]' },
  { value: 'personal', label: 'Pessoal', icon: '🏠', color: 'text-purple-400', bg: 'bg-purple-950/70 border border-purple-500/40 text-purple-300', activeBg: 'bg-purple-600 border-purple-500 text-white shadow-[0_0_12px_rgba(147,51,234,0.3)]' },
  { value: 'study', label: 'Estudo', icon: '📚', color: 'text-pink-400', bg: 'bg-pink-950/70 border border-pink-500/40 text-pink-300', activeBg: 'bg-pink-600 border-pink-500 text-white shadow-[0_0_12px_rgba(219,39,119,0.3)]' },
  { value: 'health', label: 'Saúde', icon: '🍏', color: 'text-emerald-400', bg: 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-300', activeBg: 'bg-emerald-600 border-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]' },
  { value: 'organization', label: 'Rotina', icon: '🧹', color: 'text-amber-400', bg: 'bg-amber-950/70 border border-amber-500/40 text-amber-300', activeBg: 'bg-amber-600 border-amber-500 text-white shadow-[0_0_12px_rgba(217,119,6,0.3)]' },
  { value: 'creative', label: 'Criativo', icon: '🎨', color: 'text-cyan-400', bg: 'bg-cyan-950/70 border border-cyan-500/40 text-cyan-300', activeBg: 'bg-cyan-600 border-cyan-500 text-white shadow-[0_0_12px_rgba(8,145,178,0.3)]' }
];

const DIFFICULTY_MAP: Record<Difficulty, { label: string; xp: number; color: string; bg: string }> = {
  easy: { label: 'Fácil', xp: 40, color: 'text-emerald-400', bg: 'bg-emerald-950/60 border border-emerald-900/40' },
  medium: { label: 'Médio', xp: 80, color: 'text-indigo-400', bg: 'bg-indigo-950/60 border border-indigo-900/40' },
  hard: { label: 'Difícil', xp: 150, color: 'text-pink-400', bg: 'bg-pink-950/60 border border-pink-900/40' }
};

const PRIORITY_MAP: Record<Priority, { label: string; color: string; bg: string }> = {
  low: { label: 'Baixa', color: 'text-zinc-400', bg: 'bg-zinc-900 border border-zinc-800' },
  medium: { label: 'Média', color: 'text-amber-400', bg: 'bg-amber-950/60 border border-amber-900/40' },
  high: { label: 'Alta', color: 'text-rose-400', bg: 'bg-rose-950/60 border border-rose-900/40' }
};

export default function TaskList({
  tasks,
  addTask,
  deleteTask,
  toggleTaskCompletion,
  selectedTaskId,
  onSelectTask
}: TaskListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [category, setCategory] = useState<TaskCategory>('study');
  const [priority, setPriority] = useState<Priority>('medium');
  const [pomodoros, setPomodoros] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask(title, description, difficulty, category, pomodoros, priority);
    
    // Reset Form
    setTitle('');
    setDescription('');
    setDifficulty('easy');
    setCategory('study');
    setPriority('medium');
    setPomodoros(1);
    setIsAdding(false);
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filter === 'pending' && t.completed) return false;
    if (filter === 'completed' && !t.completed) return false;

    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;

    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;

    return true;
  });

  return (
    <div id="task-list-section-container" className="space-y-4">
      
      {/* Controls & Headers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-pink-500/20 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-pink-400 font-bold font-mono text-sm">⛩️ 任務</span>
            <h3 className="text-base font-black text-white tracking-tight uppercase font-sans">Daily Quests</h3>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">Transforme grandes objetivos em missões diárias com honra e recompensa de XP</p>
        </div>

        <button
          id="toggle-add-task-btn"
          onClick={() => setIsAdding(!isAdding)}
          className={`px-4 py-2 text-xs font-bold rounded-xl text-white transition-all duration-200 flex items-center space-x-1.5 shrink-0 self-start sm:self-center shadow-md cursor-pointer ${isAdding ? 'bg-zinc-800 hover:bg-zinc-700 border border-zinc-700' : 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 border border-pink-400/30 shadow-[0_0_15px_rgba(244,114,182,0.3)]'}`}
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? 'Fechar' : 'Nova Missão'}</span>
        </button>
      </div>

      {/* Task Creation Drawer Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} id="create-task-form" className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.5)] space-y-4 transition-all duration-300 animate-slide-down">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Title & Desc */}
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Título da Tarefa</label>
                <input
                  id="task-title-input"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Analisar dados de performance, Ler 10 páginas"
                  className="w-full text-xs border border-zinc-800 hover:border-zinc-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden rounded-xl px-3 py-2.5 bg-zinc-900/60 text-white placeholder-zinc-600"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Notas Opcionais</label>
                <textarea
                  id="task-desc-input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalhamento curto da missão..."
                  className="w-full text-xs border border-zinc-800 hover:border-zinc-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden rounded-xl px-3 py-2 bg-zinc-900/60 text-white placeholder-zinc-600 h-20 resize-none"
                />
              </div>
            </div>

            {/* Config details */}
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">Área / Categoria</span>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      id={`btn-cat-${cat.value}`}
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all flex items-center space-x-1 cursor-pointer ${category === cat.value ? cat.activeBg : 'bg-zinc-900/80 hover:bg-zinc-800 border-zinc-800 text-zinc-400'}`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">Dificuldade</span>
                  <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-lg">
                    {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
                      <button
                        id={`btn-diff-${diff}`}
                        key={diff}
                        type="button"
                        onClick={() => setDifficulty(diff)}
                        className={`flex-1 py-1 px-1 text-center text-[10px] font-bold rounded-md uppercase transition-all ${difficulty === diff ? 'bg-zinc-800 text-white shadow-xs border border-zinc-700/50' : 'text-zinc-500 hover:text-zinc-300'}`}
                      >
                        {diff === 'easy' ? 'Fácil' : diff === 'medium' ? 'Médio' : 'Difícil'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">Prioridade</span>
                  <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-lg">
                    {(['low', 'medium', 'high'] as Priority[]).map((prio) => (
                      <button
                        id={`btn-priority-${prio}`}
                        key={prio}
                        type="button"
                        onClick={() => setPriority(prio)}
                        className={`flex-1 py-1 px-1 text-center text-[10px] font-bold rounded-md uppercase transition-all ${priority === prio ? 'bg-zinc-800 text-white shadow-xs border border-zinc-700/50' : 'text-zinc-500 hover:text-zinc-300'}`}
                      >
                        {prio === 'low' ? 'Baixa' : prio === 'medium' ? 'Média' : 'Alta'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">Estimativa (Pomodoros)</label>
                  <select
                    id="task-pomodoros-select"
                    value={pomodoros}
                    onChange={(e) => setPomodoros(Number(e.target.value))}
                    className="w-full text-xs border border-zinc-800 focus:border-indigo-500 outline-hidden rounded-lg px-2.5 py-1.5 bg-zinc-900/60 text-white"
                  >
                    <option value={1} className="bg-zinc-950">1 (Micro focus)</option>
                    <option value={2} className="bg-zinc-950">2 (Médio focus)</option>
                    <option value={3} className="bg-zinc-950">3+ (Alto focus)</option>
                  </select>
                </div>
              </div>
            </div>

          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-zinc-850">
            <button
              id="cancel-add-task-btn"
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-300"
            >
              Cancelar
            </button>
            <button
              id="confirm-add-task-btn"
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 shadow-[0_0_15px_rgba(79,70,229,0.3)]"
            >
              <Sparkles className="w-3.5 h-3.5 fill-white" />
              <span>Salvar na Jornada (+{difficulty === 'easy' ? 40 : difficulty === 'medium' ? 80 : 150} XP)</span>
            </button>
          </div>
        </form>
      )}

      {/* Filters & Search bar */}
      <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter chips */}
          <div className="flex items-center space-x-1 bg-zinc-900/80 border border-zinc-800 p-1 rounded-xl w-fit shrink-0">
            <button
              id="filter-all-btn"
              type="button"
              onClick={() => setFilter('all')}
              className={`py-1 px-3 text-[11px] font-semibold rounded-lg transition-all ${filter === 'all' ? 'bg-zinc-800 text-white border border-zinc-700/50 shadow-xs' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Todas
            </button>
            <button
              id="filter-pending-btn"
              type="button"
              onClick={() => setFilter('pending')}
              className={`py-1 px-3 text-[11px] font-semibold rounded-lg transition-all ${filter === 'pending' ? 'bg-zinc-800 text-white border border-zinc-700/50 shadow-xs' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Pendentes
            </button>
            <button
              id="filter-completed-btn"
              type="button"
              onClick={() => setFilter('completed')}
              className={`py-1 px-3 text-[11px] font-semibold rounded-lg transition-all ${filter === 'completed' ? 'bg-zinc-800 text-white border border-zinc-700/50 shadow-xs' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Concluídas
            </button>
          </div>

          {/* Clear completed daily quests button */}
          {tasks.some(t => t.completed) && (
            <button
              id="clear-completed-tasks-btn"
              type="button"
              onClick={() => {
                const completedList = tasks.filter(t => t.completed);
                completedList.forEach(t => deleteTask(t.id));
                playTypeSound();
              }}
              className="py-1 px-3 text-[11px] font-bold rounded-xl text-rose-400 bg-rose-950/40 border border-rose-900/50 hover:bg-rose-900/60 hover:text-white transition-all flex items-center space-x-1.5 cursor-pointer shrink-0"
              title="Excluir todas as Daily Quests concluídas"
            >
              <Trash className="w-3.5 h-3.5" />
              <span>Limpar Concluídas ({tasks.filter(t => t.completed).length})</span>
            </button>
          )}

          {/* Priority filter chips */}
          <div className="flex items-center space-x-1 bg-zinc-900/80 border border-zinc-800 p-1 rounded-xl w-fit shrink-0">
            <span className="text-[10px] text-zinc-500 font-bold px-2 uppercase tracking-wider font-mono">Prioridade:</span>
            <button
              id="prio-filter-all-btn"
              type="button"
              onClick={() => setPriorityFilter('all')}
              className={`py-1 px-2.5 text-[10px] font-semibold rounded-lg transition-all cursor-pointer ${priorityFilter === 'all' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Tudo
            </button>
            <button
              id="prio-filter-low-btn"
              type="button"
              onClick={() => setPriorityFilter('low')}
              className={`py-1 px-2.5 text-[10px] font-semibold rounded-lg transition-all cursor-pointer ${priorityFilter === 'low' ? 'bg-zinc-800/40 text-zinc-300 border border-zinc-750' : 'text-zinc-500 hover:text-zinc-400'}`}
            >
              Baixa
            </button>
            <button
              id="prio-filter-medium-btn"
              type="button"
              onClick={() => setPriorityFilter('medium')}
              className={`py-1 px-2.5 text-[10px] font-semibold rounded-lg transition-all cursor-pointer ${priorityFilter === 'medium' ? 'bg-amber-950/40 text-amber-400 border border-amber-900/40' : 'text-zinc-500 hover:text-amber-500/70'}`}
            >
              Média
            </button>
            <button
              id="prio-filter-high-btn"
              type="button"
              onClick={() => setPriorityFilter('high')}
              className={`py-1 px-2.5 text-[10px] font-semibold rounded-lg transition-all cursor-pointer ${priorityFilter === 'high' ? 'bg-rose-950/40 text-rose-400 border border-rose-900/40' : 'text-zinc-500 hover:text-rose-500/70'}`}
            >
              Alta
            </button>
          </div>

          {/* Category Tag filter chips */}
          <div className="flex items-center space-x-1 bg-zinc-900/80 border border-zinc-800 p-1 rounded-xl w-fit shrink-0 flex-wrap gap-y-1">
            <span className="text-[10px] text-zinc-500 font-bold px-2 uppercase tracking-wider font-mono flex items-center space-x-1">
              <Tag className="w-3 h-3 text-indigo-400" />
              <span>Tag:</span>
            </span>
            <button
              id="cat-filter-all-btn"
              type="button"
              onClick={() => {
                setCategoryFilter('all');
                playTypeSound();
              }}
              className={`py-1 px-2.5 text-[10px] font-semibold rounded-lg transition-all cursor-pointer ${categoryFilter === 'all' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Todas
            </button>
            {CATEGORIES.map((cat) => {
              const isSelected = categoryFilter === cat.value;
              return (
                <button
                  id={`cat-filter-${cat.value}-btn`}
                  key={cat.value}
                  type="button"
                  onClick={() => {
                    setCategoryFilter(isSelected ? 'all' : cat.value);
                    playTypeSound();
                  }}
                  className={`py-1 px-2 text-[10px] font-semibold rounded-lg transition-all cursor-pointer flex items-center space-x-1 border ${
                    isSelected
                      ? cat.activeBg
                      : 'border-transparent text-zinc-400 hover:text-white hover:bg-zinc-850/60'
                  }`}
                >
                  <span className="text-[10px]">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search input with clear button & sound feedback */}
        <div className="relative w-full lg:w-64">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="task-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              playTypeSound();
            }}
            placeholder="Pesquisar tarefas..."
            className="w-full text-xs border border-zinc-800 hover:border-zinc-700/50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden rounded-xl pl-9 pr-8 py-1.5 bg-zinc-900/60 text-white placeholder-zinc-600 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                playTypeSound();
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors p-1 cursor-pointer"
              title="Limpar pesquisa"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Task List Grid/List */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
        {filteredTasks.length === 0 ? (
          <div className="border border-dashed border-zinc-800 rounded-2xl p-8 text-center text-zinc-500 text-xs bg-zinc-950/30">
            {filter === 'completed' ? 'Nenhuma missão diária concluída ainda. Comece por missões curtas!' : 'Nenhuma missão pendente encontrada. Crie novas missões acima!'}
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isSelected = selectedTaskId === task.id;
            const diffInfo = DIFFICULTY_MAP[task.difficulty] || DIFFICULTY_MAP.easy;
            const catInfo = CATEGORIES.find(c => c.value === task.category);
            
            return (
              <div
                id={`task-item-${task.id}`}
                key={task.id}
                className={`p-4 rounded-2xl flex items-center justify-between border transition-all duration-200 group ${
                  task.completed 
                    ? 'task-completed-fade text-zinc-500' 
                    : isSelected 
                      ? 'border-indigo-500/40 bg-indigo-600/10 shadow-[0_0_15px_rgba(79,70,229,0.15)] scale-[1.01]' 
                      : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/50 text-zinc-200'
                }`}
              >
                
                {/* Checkbox & Texts */}
                <div className="flex items-center space-x-3.5 flex-1 min-w-0 pr-3">
                  
                  {/* Task completion toggle target */}
                  <button
                    id={`toggle-complete-btn-${task.id}`}
                    type="button"
                    onClick={() => toggleTaskCompletion(task.id)}
                    className="p-1 text-zinc-500 hover:text-indigo-400 transition-colors shrink-0 outline-hidden animate-fade-in"
                    title={task.completed ? "Desmarcar tarefa" : "Concluir tarefa"}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5.5 h-5.5 text-emerald-500 fill-emerald-950/20" />
                    ) : (
                      <Circle className="w-5.5 h-5.5 text-zinc-700 hover:text-indigo-400 transition-colors" />
                    )}
                  </button>
 
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="text-sm shrink-0 select-none">
                        {catInfo?.icon || '⭐'}
                      </span>
                      <h4 className={`text-xs sm:text-sm font-bold truncate ${task.completed ? 'animate-strike text-zinc-500' : 'text-white'}`}>
                        {task.title}
                      </h4>
                      
                      {/* Reward Badge */}
                      <span className={`inline-block font-mono font-bold text-[9px] px-1.5 py-0.5 rounded-md ${task.completed ? 'bg-zinc-800 text-zinc-500' : 'bg-indigo-950 text-indigo-400 border border-indigo-900/50'}`}>
                        +{task.xpReward} XP
                      </span>
                    </div>
 
                    {task.description && (
                      <p className={`text-[11px] mt-0.5 line-clamp-1 ${task.completed ? 'animate-strike text-zinc-600' : 'text-zinc-400'}`}>
                        {task.description}
                      </p>
                    )}

                    {/* Metadata tags (Category + Difficulty) */}
                    <div className="flex items-center space-x-2 mt-1.5 flex-wrap gap-y-1">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 ${catInfo?.bg || 'bg-zinc-900 text-zinc-400 border border-zinc-800'}`}>
                        <span>{catInfo?.icon}</span>
                        <span>{catInfo?.label || 'Geral'}</span>
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${diffInfo.bg} ${diffInfo.color}`}>
                        {diffInfo.label}
                      </span>
                      {(() => {
                        const prio = task.priority || 'medium';
                        const prioInfo = PRIORITY_MAP[prio];
                        return (
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${prioInfo.bg} ${prioInfo.color}`}>
                            Prioridade: {prioInfo.label}
                          </span>
                        );
                      })()}
                      {task.estimatedFocusPomodoros > 0 && (
                        <span className="text-[9px] text-zinc-500 font-medium">
                          ⏱️ Estimativa: {task.estimatedFocusPomodoros} focus
                        </span>
                      )}
                    </div>
                  </div>

                </div>

                {/* Action buttons */}
                <div className="flex items-center space-x-2 shrink-0">
                  
                  {!task.completed && (
                    <button
                      id={`select-focus-task-btn-${task.id}`}
                      onClick={() => onSelectTask(isSelected ? null : task)}
                      className={`p-2 rounded-xl border transition-all ${isSelected ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.4)]' : 'bg-zinc-900 border-zinc-800 text-indigo-400 hover:bg-zinc-800 hover:text-white'}`}
                      title={isSelected ? "Desmarcar como ativo" : "Focar nesta missão"}
                    >
                      {isSelected ? <Check className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    </button>
                  )}

                  <button
                    id={`delete-task-btn-${task.id}`}
                    onClick={() => deleteTask(task.id)}
                    className="p-2 rounded-xl border border-zinc-800 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40 hover:border-rose-900/50 transition-all cursor-pointer"
                    title="Excluir missão"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
