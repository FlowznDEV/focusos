import React, { useState } from 'react';
import { BookOpen, Sparkles, Plus, Trash2, Calendar, Clock, Target, Smile, Frown, Meh, Compass, Search } from 'lucide-react';
import { JournalEntry } from '../types';

interface JournalTabProps {
  entries: JournalEntry[];
  onAddEntry: (note: string, mood: string, taskTitle?: string, focusMinutes?: number) => void;
  onDeleteEntry?: (id: string) => void; // We can implement deletion directly in state or App.tsx, but let's make it supported!
  currentFocusTaskTitle?: string;
}

const MOOD_PRESETS = [
  { label: 'Focado 🎯', value: 'Focado' },
  { label: 'Satisfeito 😊', value: 'Satisfeito' },
  { label: 'Disperso 🌀', value: 'Disperso' },
  { label: 'Ansioso 📈', value: 'Ansioso' },
  { label: 'Cansado 💤', value: 'Cansado' },
];

export default function JournalTab({ entries, onAddEntry, onDeleteEntry, currentFocusTaskTitle }: JournalTabProps) {
  const [noteText, setNoteText] = useState('');
  const [selectedMood, setSelectedMood] = useState('Focado');
  const [searchQuery, setSearchQuery] = useState('');
  const [isManualAdding, setIsManualAdding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    
    // Add entry
    onAddEntry(
      noteText.trim(),
      selectedMood,
      currentFocusTaskTitle || undefined,
      undefined // No automatic minutes unless completed via timer
    );

    // Clear state
    setNoteText('');
    setIsManualAdding(false);
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          entry.mood.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (entry.taskTitle && entry.taskTitle.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (_) {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header with laser glows */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-900/60 relative">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2 uppercase tracking-wider">
            <BookOpen className="w-5 h-5 text-pink-400" />
            <span>Diário de Calibração Mental</span>
            <Sparkles className="w-4 h-4 text-pink-500 animate-pulse" />
          </h2>
          <p className="text-xs text-zinc-500 mt-1">Registre suas sensações pós-foco para ajustar sua frequência cognitiva.</p>
        </div>
        
        <button
          onClick={() => setIsManualAdding(!isManualAdding)}
          className="flex items-center justify-center space-x-1.5 bg-pink-600/10 hover:bg-pink-600/20 border border-pink-500/30 hover:border-pink-500/60 text-pink-400 font-extrabold px-4 py-2.5 rounded-xl text-xs transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isManualAdding ? 'Fechar Painel' : 'Nova Reflexão'}</span>
        </button>
      </div>

      {/* Write reflection card */}
      {isManualAdding && (
        <div className="bg-zinc-950 border border-pink-500/30 p-5 rounded-3xl shadow-[0_0_20px_rgba(236,72,153,0.08)] relative animate-fade-in">
          <h3 className="text-xs font-bold text-pink-400 uppercase tracking-widest mb-3 font-mono">// Diagnóstico de Humor</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <span className="text-[10px] text-zinc-400 font-mono block mb-2">Selecione o estado que melhor descreve você agora:</span>
              <div className="flex flex-wrap gap-2">
                {MOOD_PRESETS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setSelectedMood(m.value)}
                    className={`px-3 py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                      selectedMood === m.value
                        ? 'border-pink-500 bg-pink-950/40 text-pink-400 shadow-[0_0_10px_rgba(236,72,153,0.15)]'
                        : 'border-zinc-900 bg-zinc-900/30 text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="reflection-textarea" className="text-[10px] text-zinc-400 font-mono block">O que passou pela sua mente? (1 a 2 linhas):</label>
              <textarea
                id="reflection-textarea"
                required
                maxLength={200}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Ex: Consegui focar muito bem no começo, mas me perdi no final pensando no almoço. Passo a passo estou melhorando..."
                rows={2}
                className="w-full text-xs border border-zinc-900 hover:border-pink-500/20 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-hidden rounded-xl px-3 py-2.5 bg-zinc-900/30 text-white placeholder-zinc-600 transition-all resize-none"
              />
            </div>

            {currentFocusTaskTitle && (
              <div className="bg-zinc-900/40 border border-zinc-900 px-3 py-2 rounded-xl flex items-center space-x-2 text-[11px] text-zinc-400">
                <Target className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Vinculado à missão atual: <strong className="text-zinc-200">"{currentFocusTaskTitle}"</strong></span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={!noteText.trim()}
                className="bg-pink-600 hover:bg-pink-500 active:scale-95 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all disabled:opacity-40 shadow-[0_0_15px_rgba(236,72,153,0.3)] cursor-pointer"
              >
                Registrar no Banco de Dados
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and entries counter */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between bg-zinc-950/40 border border-zinc-900 p-3 rounded-2xl">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-600 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="journal-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar notas ou humor..."
              className="w-full text-xs border border-zinc-900 hover:border-pink-500/20 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-hidden rounded-xl pl-9 pr-3 py-2 bg-zinc-900/20 text-white placeholder-zinc-600 transition-all"
            />
          </div>
        </div>

        <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider shrink-0 flex items-center space-x-2">
          <span>Total de Registros:</span>
          <span className="text-pink-400 font-bold bg-pink-950/20 border border-pink-500/20 px-2 py-0.5 rounded-md">
            {filteredEntries.length} / {entries.length}
          </span>
        </div>
      </div>

      {/* Journal entries stack */}
      {filteredEntries.length === 0 ? (
        <div className="border border-dashed border-zinc-900 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
          <div className="bg-zinc-950 border border-zinc-900 p-3.5 rounded-2xl text-zinc-600 mb-3">
            <Compass className="w-6 h-6 text-zinc-500" />
          </div>
          <h4 className="text-sm font-semibold text-zinc-400">Nenhum registro no Diário</h4>
          <p className="text-xs text-zinc-600 mt-1 max-w-sm">
            {searchQuery ? 'Tente ajustar sua busca ou limpar os filtros.' : 'Suas reflexões pós-foco aparecerão aqui. Clique em "Nova Reflexão" para criar uma manualmente ou complete um ciclo de foco!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="bg-zinc-950 border border-zinc-900 hover:border-pink-500/20 transition-all duration-300 p-5 rounded-2xl flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.15)] relative group overflow-hidden"
            >
              {/* Symmetrical subtle decorative corner indicator */}
              <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-gradient-to-bl from-pink-500/10 to-transparent" />
              
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-pink-950/30 border border-pink-500/20 text-pink-400">
                      {entry.mood}
                    </span>
                    {entry.focusMinutes && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/30 border border-cyan-500/10 text-cyan-400 flex items-center space-x-1">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{entry.focusMinutes} min</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[9px] text-zinc-500 font-mono flex items-center space-x-1 shrink-0">
                      <Calendar className="w-3 h-3 text-zinc-600" />
                      <span>{formatDate(entry.timestamp)}</span>
                    </span>
                    {onDeleteEntry && (
                      <button
                        onClick={() => onDeleteEntry(entry.id)}
                        className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 p-1 rounded-lg hover:bg-zinc-900/80 transition-all cursor-pointer"
                        title="Deletar registro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed font-medium break-words">
                  "{entry.note}"
                </p>
              </div>

              {entry.taskTitle && (
                <div className="mt-4 pt-3 border-t border-zinc-900/50 flex items-center space-x-1.5 text-[10px] text-zinc-500">
                  <Target className="w-3 h-3 text-cyan-500/50" />
                  <span className="truncate">Missão relacionada: <strong className="text-zinc-400 font-medium">"{entry.taskTitle}"</strong></span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
