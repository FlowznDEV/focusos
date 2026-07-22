import React, { useState } from 'react';
import { Target, Plus, Trash2, CheckSquare, Square, ChevronRight, Compass, Sparkles, FolderPlus, ListTodo, Calendar, Clock, CheckCircle } from 'lucide-react';
import { LongTermGoal } from '../types';

interface LongTermGoalsProps {
  goals: LongTermGoal[];
  onAddGoal: (title: string, description?: string, subtaskTitles?: string[], startDate?: string, endDate?: string) => void;
  onDeleteGoal: (id: string) => void;
  onToggleGoalCompletion?: (goalId: string) => void;
  onToggleSubtask: (goalId: string, subtaskId: string) => void;
  onAddSubtaskToGoal: (goalId: string, title: string) => void;
}

export default function LongTermGoals({
  goals,
  onAddGoal,
  onDeleteGoal,
  onToggleGoalCompletion,
  onToggleSubtask,
  onAddSubtaskToGoal
}: LongTermGoalsProps) {
  const [isCreating, setIsCreating] = useState(false);
  
  // Create Goal Form state
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDesc, setGoalDesc] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tempSubtask, setTempSubtask] = useState('');
  const [tempSubtasksList, setTempSubtasksList] = useState<string[]>([]);

  // Add inline subtask input state per goal ID
  const [inlineSubtaskText, setInlineSubtaskText] = useState<Record<string, string>>({});

  const formatDateDisplay = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const [year, month, day] = dateStr.split('-');
      if (year && month && day) {
        return `${day}/${month}/${year}`;
      }
      return new Date(dateStr).toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  const handleAddTempSubtask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = tempSubtask.trim();
    if (!trimmed) return;
    if (tempSubtasksList.includes(trimmed)) return;
    setTempSubtasksList([...tempSubtasksList, trimmed]);
    setTempSubtask('');
  };

  const handleRemoveTempSubtask = (index: number) => {
    setTempSubtasksList(tempSubtasksList.filter((_, i) => i !== index));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    onAddGoal(
      goalTitle.trim(),
      goalDesc.trim() || undefined,
      tempSubtasksList,
      startDate || undefined,
      endDate || undefined
    );

    // Reset states
    setGoalTitle('');
    setGoalDesc('');
    setStartDate('');
    setEndDate('');
    setTempSubtask('');
    setTempSubtasksList([]);
    setIsCreating(false);
  };

  const handleAddInlineSubtask = (goalId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = inlineSubtaskText[goalId]?.trim();
    if (!text) return;

    onAddSubtaskToGoal(goalId, text);
    
    // Clear input for this goal
    setInlineSubtaskText({
      ...inlineSubtaskText,
      [goalId]: ''
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-900/60 relative">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2 uppercase tracking-wider">
            <Target className="w-5 h-5 text-indigo-400" />
            <span>Objetivos de Longo Prazo</span>
            <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
          </h2>
          <p className="text-xs text-zinc-500 mt-1">Divida grandes sonhos em etapas claras, defina datas e conquiste recompensas de XP.</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {goals.some(g => g.completed || (g.subtasks.length > 0 && g.subtasks.every(s => s.completed))) && (
            <button
              onClick={() => {
                const completedGoals = goals.filter(g => g.completed || (g.subtasks.length > 0 && g.subtasks.every(s => s.completed)));
                completedGoals.forEach(g => onDeleteGoal(g.id));
              }}
              className="flex items-center justify-center space-x-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/50 text-rose-400 font-bold px-3 py-2.5 rounded-xl text-xs transition-all active:scale-95 cursor-pointer"
              title="Excluir metas de longo prazo concluídas"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar Concluídas ({goals.filter(g => g.completed || (g.subtasks.length > 0 && g.subtasks.every(s => s.completed))).length})</span>
            </button>
          )}

          <button
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center justify-center space-x-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 hover:border-indigo-500/60 text-indigo-400 font-extrabold px-4 py-2.5 rounded-xl text-xs transition-all active:scale-95 cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            <span>{isCreating ? 'Fechar Painel' : 'Definir Meta'}</span>
          </button>
        </div>
      </div>

      {/* Goal Creator Form Panel */}
      {isCreating && (
        <div className="bg-zinc-950 border border-indigo-500/30 p-5 rounded-3xl shadow-[0_0_20px_rgba(99,102,241,0.08)] relative animate-fade-in">
          <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 font-mono">// Nova Jornada de Longo Prazo</h3>
          
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Left Column: Details */}
              <div className="space-y-3">
                <div>
                  <label htmlFor="goal-title-input" className="text-[10px] text-zinc-400 font-mono block mb-1">Título da Grande Meta:</label>
                  <input
                    id="goal-title-input"
                    type="text"
                    required
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    placeholder="Ex: Aprender React, Escrever um Livro, Ficar em Forma"
                    className="w-full text-xs border border-zinc-900 hover:border-indigo-500/20 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden rounded-xl px-3 py-2.5 bg-zinc-900/30 text-white placeholder-zinc-600 transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="goal-desc-textarea" className="text-[10px] text-zinc-400 font-mono block mb-1">Descrição / Motivação Opcional:</label>
                  <textarea
                    id="goal-desc-textarea"
                    value={goalDesc}
                    onChange={(e) => setGoalDesc(e.target.value)}
                    placeholder="Ex: Dominar componentização e hooks para criar aplicativos incríveis do zero."
                    rows={2}
                    className="w-full text-xs border border-zinc-900 hover:border-indigo-500/20 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden rounded-xl px-3 py-2 bg-zinc-900/30 text-white placeholder-zinc-600 transition-all resize-none h-20"
                  />
                </div>

                {/* Dates selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label htmlFor="goal-start-date" className="text-[10px] text-zinc-400 font-mono block mb-1">📅 Data de Início:</label>
                    <input
                      id="goal-start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full text-xs border border-zinc-900 hover:border-indigo-500/20 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden rounded-xl px-3 py-1.5 bg-zinc-900/30 text-white transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="goal-end-date" className="text-[10px] text-zinc-400 font-mono block mb-1">🏁 Prazo / Término:</label>
                    <input
                      id="goal-end-date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full text-xs border border-zinc-900 hover:border-indigo-500/20 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden rounded-xl px-3 py-1.5 bg-zinc-900/30 text-white transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Subtasks Planning */}
              <div className="space-y-3 flex flex-col justify-between">
                <div>
                  <label htmlFor="subtask-add-input" className="text-[10px] text-zinc-400 font-mono block mb-1">Etapas Necessárias (Subtarefas):</label>
                  <div className="flex gap-2">
                    <input
                      id="subtask-add-input"
                      type="text"
                      value={tempSubtask}
                      onChange={(e) => setTempSubtask(e.target.value)}
                      placeholder="Ex: Fazer curso básico, Criar 3 projetos..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTempSubtask();
                        }
                      }}
                      className="flex-1 text-xs border border-zinc-900 hover:border-indigo-500/20 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden rounded-xl px-3 py-2 bg-zinc-900/30 text-white placeholder-zinc-600 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddTempSubtask()}
                      className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 px-3 rounded-xl text-zinc-300 hover:text-white transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subtasks List */}
                <div className="flex-1 min-h-[100px] max-h-[150px] overflow-y-auto border border-zinc-900/50 rounded-xl p-2 bg-zinc-950/40 space-y-1.5 mt-2">
                  {tempSubtasksList.length === 0 ? (
                    <p className="text-[10px] text-zinc-600 text-center py-6 italic font-mono">Adicione sub-tarefas para acompanhar seu progresso.</p>
                  ) : (
                    tempSubtasksList.map((st, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-2 bg-zinc-900/40 px-2 py-1 rounded-lg border border-zinc-900">
                        <span className="text-[11px] text-zinc-300 truncate">{idx + 1}. {st}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTempSubtask(idx)}
                          className="text-zinc-600 hover:text-red-400 p-0.5"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            <div className="flex justify-end pt-3 border-t border-zinc-900/50 gap-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-300 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!goalTitle.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all disabled:opacity-40 shadow-[0_0_15px_rgba(99,102,241,0.3)] cursor-pointer"
              >
                Iniciar Grande Objetivo (+50 XP)
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid of Goals */}
      {goals.length === 0 ? (
        <div className="border border-dashed border-zinc-900 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
          <div className="bg-zinc-950 border border-zinc-900 p-3.5 rounded-2xl text-zinc-600 mb-3">
            <Compass className="w-6 h-6 text-zinc-500" />
          </div>
          <h4 className="text-sm font-semibold text-zinc-400">Nenhum Objetivo Definido</h4>
          <p className="text-xs text-zinc-600 mt-1 max-w-sm">
            Defina uma meta de longo prazo de sua escolha. Crie um objetivo grande e divida em micro etapas com datas de início e término.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const totalSubtasks = goal.subtasks.length;
            const completedSubtasks = goal.subtasks.filter(s => s.completed).length;
            const percentage = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : (goal.completed ? 100 : 0);
            const isCompleted = goal.completed || (totalSubtasks > 0 && completedSubtasks === totalSubtasks);

            return (
              <div
                key={goal.id}
                className={`bg-zinc-950 border transition-all duration-300 p-5 rounded-2xl flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.15)] relative overflow-hidden group ${
                  isCompleted 
                    ? 'border-emerald-500/20 bg-emerald-950/5 shadow-[0_0_20px_rgba(16,185,129,0.02)]' 
                    : 'border-zinc-900 hover:border-indigo-500/20'
                }`}
              >
                {/* Decorative border line top for completion or pending */}
                <div className={`absolute top-0 left-0 w-full h-[2px] ${
                  isCompleted ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-indigo-500 to-pink-500/70'
                }`} />

                <div>
                  {/* Top Bar inside card */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className={`text-sm font-extrabold truncate ${isCompleted ? 'text-zinc-400' : 'text-white'}`}>
                          {goal.title}
                        </h4>
                        {isCompleted && (
                          <span className="text-[9px] font-mono font-bold bg-emerald-950 border border-emerald-500/30 text-emerald-400 px-1.5 py-0.5 rounded-md uppercase shrink-0 flex items-center space-x-1">
                            <span>Concluída</span>
                            <span>🏆</span>
                          </span>
                        )}
                      </div>
                      {goal.description && (
                        <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-2 leading-relaxed">
                          {goal.description}
                        </p>
                      )}

                      {/* Dates Display Badges */}
                      {(goal.startDate || goal.endDate) && (
                        <div className="flex items-center space-x-2 text-[10px] font-mono text-zinc-400 mt-2 bg-zinc-900/60 px-2.5 py-1 rounded-xl border border-zinc-850 w-fit flex-wrap gap-y-1">
                          {goal.startDate && (
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3 text-indigo-400" />
                              <span>Início: <strong className="text-zinc-200">{formatDateDisplay(goal.startDate)}</strong></span>
                            </span>
                          )}
                          {goal.startDate && goal.endDate && <span className="text-zinc-700">|</span>}
                          {goal.endDate && (
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-pink-400" />
                              <span>Prazo: <strong className="text-zinc-200">{formatDateDisplay(goal.endDate)}</strong></span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => onDeleteGoal(goal.id)}
                      className="text-zinc-400 hover:text-rose-400 p-2 rounded-xl border border-zinc-850 hover:border-rose-900/50 bg-zinc-900/60 hover:bg-rose-950/40 transition-all cursor-pointer shrink-0 flex items-center space-x-1"
                      title="Excluir Meta de Longo Prazo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold hidden sm:inline">Excluir</span>
                    </button>
                  </div>

                  {/* Progress Section */}
                  <div className="space-y-1.5 my-3">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-zinc-500">PROGRESSO DA META</span>
                      <span className={isCompleted ? 'text-emerald-400 font-bold' : 'text-indigo-400'}>
                        {completedSubtasks}/{totalSubtasks} ({percentage}%)
                      </span>
                    </div>

                    <div className="w-full bg-zinc-900/80 border border-zinc-900 rounded-full h-2 overflow-hidden">
                      <div
                        style={{ width: `${percentage}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted 
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                            : 'bg-gradient-to-r from-indigo-500 to-pink-500'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Subtasks Stack */}
                  <div className="space-y-1.5 mt-3 max-h-[160px] overflow-y-auto pr-1">
                    {goal.subtasks.map((sub) => (
                      <div
                        key={sub.id}
                        onClick={() => onToggleSubtask(goal.id, sub.id)}
                        className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-lg border text-[11px] transition-all cursor-pointer select-none ${
                          sub.completed
                            ? 'bg-zinc-950/40 border-zinc-900 text-zinc-500 line-through'
                            : 'bg-zinc-900/20 border-zinc-900/60 text-zinc-300 hover:border-zinc-800 hover:bg-zinc-900/40'
                        }`}
                      >
                        <div className="shrink-0 text-zinc-500">
                          {sub.completed ? (
                            <CheckSquare className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Square className="w-4 h-4 text-zinc-700" />
                          )}
                        </div>
                        <span className="truncate flex-1">{sub.title}</span>
                        {sub.completed && (
                          <span className="text-[8px] font-mono text-zinc-600 bg-zinc-900 px-1 rounded-sm">Concluído</span>
                        )}
                      </div>
                    ))}
                  </div>

                </div>

                {/* Bottom Actions: Inline Subtask + Goal Completion Toggle */}
                <div className="mt-4 pt-3 border-t border-zinc-900/80 space-y-2.5">
                  <form
                    onSubmit={(e) => handleAddInlineSubtask(goal.id, e)}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      required
                      placeholder="Adicionar subtarefa..."
                      value={inlineSubtaskText[goal.id] || ''}
                      onChange={(e) => setInlineSubtaskText({
                        ...inlineSubtaskText,
                        [goal.id]: e.target.value
                      })}
                      className="flex-1 text-[11px] border border-zinc-900 hover:border-indigo-500/20 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden rounded-lg px-2.5 py-1.5 bg-zinc-900/30 text-white placeholder-zinc-600 transition-all"
                    />
                    <button
                      type="submit"
                      className="bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-400 hover:text-indigo-300 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center shrink-0"
                      title="Adicionar Subtarefa"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </form>

                  {/* Manual Goal Completion Button */}
                  {onToggleGoalCompletion && (
                    <button
                      type="button"
                      onClick={() => onToggleGoalCompletion(goal.id)}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                        isCompleted
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-900/60'
                          : 'bg-indigo-950/40 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white shadow-[0_0_10px_rgba(99,102,241,0.1)]'
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{isCompleted ? 'Meta Concluída 🏆 (Clique para reabrir)' : 'Concluir Meta Completa (+150 XP)'}</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

