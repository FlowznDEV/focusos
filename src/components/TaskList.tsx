import React, { useState } from 'react';
import { Plus, Trash, Folder, AlertCircle, Play, CheckCircle2, Circle, Sparkles, Filter, Check } from 'lucide-react';
import { Task, Difficulty, TaskCategory } from '../types';

interface TaskListProps {
  tasks: Task[];
  addTask: (title: string, description: string, difficulty: Difficulty, category: TaskCategory, estimatedFocusPomodoros: number) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  selectedTaskId: string | null;
  onSelectTask: (task: Task | null) => void;
}

const CATEGORIES: { value: TaskCategory; label: string; icon: string; color: string; bg: string }[] = [
  { value: 'work', label: 'Trabalho', icon: '💼', color: 'text-indigo-400 border-indigo-900/40', bg: 'bg-indigo-950/60 border-indigo-900/50 text-indigo-300' },
  { value: 'study', label: 'Estudo', icon: '📚', color: 'text-pink-400 border-pink-900/40', bg: 'bg-pink-950/60 border-pink-900/50 text-pink-300' },
  { value: 'health', label: 'Saúde', icon: '🍏', color: 'text-emerald-400 border-emerald-900/40', bg: 'bg-emerald-950/60 border-emerald-900/50 text-emerald-300' },
  { value: 'organization', label: 'Rotina', icon: '🧹', color: 'text-amber-400 border-amber-900/40', bg: 'bg-amber-950/60 border-amber-900/50 text-amber-300' },
  { value: 'creative', label: 'Criativo', icon: '🎨', color: 'text-cyan-400 border-cyan-900/40', bg: 'bg-cyan-950/60 border-cyan-900/50 text-cyan-300' }
];

const DIFFICULTY_MAP: Record<Difficulty, { label: string; xp: number; color: string; bg: string }> = {
  easy: { label: 'Fácil', xp: 40, color: 'text-emerald-400', bg: 'bg-emerald-950/60 border border-emerald-900/40' },
  medium: { label: 'Médio', xp: 80, color: 'text-indigo-400', bg: 'bg-indigo-950/60 border border-indigo-900/40' },
  hard: { label: 'Difícil', xp: 150, color: 'text-pink-400', bg: 'bg-pink-950/60 border border-pink-900/40' }
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

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [category, setCategory] = useState<TaskCategory>('study');
  const [pomodoros, setPomodoros] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask(title, description, difficulty, category, pomodoros);
    
    // Reset Form
    setTitle('');
    setDescription('');
    setDifficulty('easy');
    setCategory('study');
    setPomodoros(1);
    setIsAdding(false);
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  return (
    <div id="task-list-section-container" className="space-y-4">
      
      {/* Controls & Headers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-zinc-850 gap-3">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight uppercase">Daily Quests</h3>
          <p className="text-xs text-zinc-500">Transforme tarefas assustadoras em pequenas vitórias que rendem XP</p>
        </div>

        <button
          id="toggle-add-task-btn"
          onClick={() => setIsAdding(!isAdding)}
          className={`px-4 py-2 text-xs font-semibold rounded-xl text-white transition-all duration-200 flex items-center space-x-1.5 shrink-0 self-start sm:self-center shadow-md ${isAdding ? 'bg-zinc-800 hover:bg-zinc-700 border border-zinc-700' : 'bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.4)]'}`}
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
                      className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all flex items-center space-x-1 ${category === cat.value ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-zinc-900 hover:bg-zinc-850 border-zinc-800 text-zinc-400'}`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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

      {/* Filters bar */}
      <div className="flex items-center space-x-1 bg-zinc-900/80 border border-zinc-800 p-1 rounded-xl w-fit self-start">
        <button
          id="filter-all-btn"
          onClick={() => setFilter('all')}
          className={`py-1 px-3.5 text-xs font-semibold rounded-lg transition-all ${filter === 'all' ? 'bg-zinc-800 text-white border border-zinc-700/50 shadow-xs' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          Todas
        </button>
        <button
          id="filter-pending-btn"
          onClick={() => setFilter('pending')}
          className={`py-1 px-3.5 text-xs font-semibold rounded-lg transition-all ${filter === 'pending' ? 'bg-zinc-800 text-white border border-zinc-700/50 shadow-xs' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          Pendentes
        </button>
        <button
          id="filter-completed-btn"
          onClick={() => setFilter('completed')}
          className={`py-1 px-3.5 text-xs font-semibold rounded-lg transition-all ${filter === 'completed' ? 'bg-zinc-800 text-white border border-zinc-700/50 shadow-xs' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          Concluídas
        </button>
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
            const diffInfo = DIFFICULTY_MAP[task.difficulty];
            const catInfo = CATEGORIES.find(c => c.value === task.category);
            
            return (
              <div
                id={`task-item-${task.id}`}
                key={task.id}
                className={`p-4 rounded-2xl flex items-center justify-between border transition-all duration-200 group ${
                  task.completed 
                    ? 'opacity-50 border-zinc-900 bg-zinc-950/40 text-zinc-500' 
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
                    onClick={() => toggleTaskCompletion(task.id)}
                    className="p-1 text-zinc-500 hover:text-indigo-400 transition-colors shrink-0 outline-hidden"
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
                      <h4 className={`text-xs sm:text-sm font-bold truncate ${task.completed ? 'line-through text-zinc-600' : 'text-white'}`}>
                        {task.title}
                      </h4>
                      
                      {/* Reward Badge */}
                      <span className={`inline-block font-mono font-bold text-[9px] px-1.5 py-0.5 rounded-md ${task.completed ? 'bg-zinc-800 text-zinc-500' : 'bg-indigo-950 text-indigo-400 border border-indigo-900/50'}`}>
                        +{task.xpReward} XP
                      </span>
                    </div>

                    {task.description && (
                      <p className={`text-[11px] mt-0.5 line-clamp-1 ${task.completed ? 'line-through text-zinc-600' : 'text-zinc-400'}`}>
                        {task.description}
                      </p>
                    )}

                    {/* Metadata tags (Category + Difficulty) */}
                    <div className="flex items-center space-x-2 mt-1.5 flex-wrap gap-y-1">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${catInfo?.bg || 'bg-zinc-900 text-zinc-400 border border-zinc-800'}`}>
                        {catInfo?.label || 'Geral'}
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${diffInfo.bg} ${diffInfo.color}`}>
                        {diffInfo.label}
                      </span>
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
                    className="p-2 rounded-xl border border-zinc-800 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 hover:border-rose-900/40 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
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
