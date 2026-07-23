import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Plus, 
  CheckCircle2, 
  RotateCcw, 
  Sunrise, 
  Zap, 
  HeartPulse, 
  Moon, 
  Target, 
  TrendingUp, 
  Flame, 
  Check, 
  Compass,
  ArrowRight
} from 'lucide-react';
import { Task } from '../types';

interface HabitSuggestionsTabProps {
  tasks: Task[];
  onAddTask: (
    title: string,
    category: string,
    estimatedFocusPomodoros: number,
    priority?: 'low' | 'medium' | 'high'
  ) => void;
  playTypeSound?: () => void;
}

export interface SuggestedHabit {
  id: string;
  title: string;
  description: string;
  category: string;
  pomodoros: number;
  priority: 'low' | 'medium' | 'high';
  timeOfDay: 'morning' | 'focus' | 'health' | 'evening';
  icon: React.ReactNode;
  benefits: string;
}

const PRESET_HABITS: SuggestedHabit[] = [
  {
    id: 'habit-water-morning',
    title: 'Hidratação Matinal (500ml de Água)',
    description: 'Ative seu metabolismo e hidrate o cérebro logo nos primeiros minutos do dia.',
    category: 'Saúde',
    pomodoros: 1,
    priority: 'high',
    timeOfDay: 'morning',
    icon: <Sunrise className="w-5 h-5 text-amber-400" />,
    benefits: 'Aumenta o estado de alerta e energia matinal.'
  },
  {
    id: 'habit-plan-day',
    title: 'Planejar as 3 Principais Metas do Dia',
    description: 'Defina com clareza as missões essenciais para não perder tempo com distrações.',
    category: 'Organização',
    pomodoros: 1,
    priority: 'high',
    timeOfDay: 'morning',
    icon: <Target className="w-5 h-5 text-orange-400" />,
    benefits: 'Garante foco estratégico e clareza mental.'
  },
  {
    id: 'habit-deepwork-25',
    title: 'Sessão Deep Work de 25m Sem Notificações',
    description: 'Desligue todas as abas e notificações para trabalhar em uma única tarefa crítica.',
    category: 'Foco',
    pomodoros: 1,
    priority: 'high',
    timeOfDay: 'focus',
    icon: <Zap className="w-5 h-5 text-orange-400" />,
    benefits: 'Multiplica a produtividade eliminando a alternância de contexto.'
  },
  {
    id: 'habit-clean-inbox',
    title: 'Limpeza e Organização da Área de Trabalho',
    description: 'Deixe o ambiente digital limpo e sem distrações visuais.',
    category: 'Organização',
    pomodoros: 1,
    priority: 'medium',
    timeOfDay: 'focus',
    icon: <RotateCcw className="w-5 h-5 text-cyan-400" />,
    benefits: 'Reduz a sobrecarga cognitiva e ansiedade.'
  },
  {
    id: 'habit-stretch',
    title: 'Pausa para Alongamento e Respiração de 5 min',
    description: 'Levante da cadeira, se espreguice e faça 5 respirações profundas.',
    category: 'Saúde',
    pomodoros: 1,
    priority: 'medium',
    timeOfDay: 'health',
    icon: <HeartPulse className="w-5 h-5 text-emerald-400" />,
    benefits: 'Alivia tensão muscular e renova a oxigenação cerebral.'
  },
  {
    id: 'habit-reading',
    title: 'Leitura Focada de 15 Páginas',
    description: 'Desenvolva conhecimento consistente lendo um livro de desenvolvimento ou estudo.',
    category: 'Leitura',
    pomodoros: 1,
    priority: 'medium',
    timeOfDay: 'focus',
    icon: <Compass className="w-5 h-5 text-purple-400" />,
    benefits: 'Expande o vocabulário e estimula o raciocínio profundo.'
  },
  {
    id: 'habit-journal-night',
    title: 'Reflexão Noturna e Registro no Diário',
    description: 'Anote as vitórias do dia e o que pode ser melhorado amanhã.',
    category: 'Reflexão',
    pomodoros: 1,
    priority: 'medium',
    timeOfDay: 'evening',
    icon: <Moon className="w-5 h-5 text-indigo-400" />,
    benefits: 'Melhora a qualidade do sono e a autoconsciência.'
  },
  {
    id: 'habit-disconnect-screens',
    title: 'Desconexão de Telas 30 min Antes de Dormir',
    description: 'Evite a luz azul no final da noite para produção natural de melatonina.',
    category: 'Saúde',
    pomodoros: 1,
    priority: 'high',
    timeOfDay: 'evening',
    icon: <Moon className="w-5 h-5 text-purple-400" />,
    benefits: 'Garante um sono reparador de alta qualidade.'
  }
];

export default function HabitSuggestionsTab({
  tasks,
  onAddTask,
  playTypeSound
}: HabitSuggestionsTabProps) {
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [customTitle, setCustomTitle] = useState('');
  const [customCategory, setCustomCategory] = useState('Foco');
  const [customFrequency, setCustomFrequency] = useState('Diário');
  const [showCustomSuccess, setShowCustomSuccess] = useState(false);

  // Analysis of user habit history
  const habitAnalysis = useMemo(() => {
    const completedTasks = tasks.filter(t => t.completed);
    const totalCount = tasks.length;
    const completedCount = completedTasks.length;
    const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // Category frequency counter
    const categoryCounts: Record<string, number> = {};
    completedTasks.forEach(t => {
      const cat = t.category || 'Geral';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    // Find top category
    let topCategory = 'Foco';
    let maxCount = 0;
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topCategory = cat;
      }
    });

    return {
      totalCount,
      completedCount,
      completionRate,
      topCategory,
      categoryCounts
    };
  }, [tasks]);

  const handleAddHabit = (habit: SuggestedHabit) => {
    if (playTypeSound) playTypeSound();
    onAddTask(habit.title, habit.category, habit.pomodoros, habit.priority);
    setAddedIds(prev => ({ ...prev, [habit.id]: true }));

    // Reset indicator after 3 seconds
    setTimeout(() => {
      setAddedIds(prev => ({ ...prev, [habit.id]: false }));
    }, 3000);
  };

  const handleAddCustomHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;
    if (playTypeSound) playTypeSound();

    const formattedTitle = `[Hábito ${customFrequency}] ${customTitle.trim()}`;
    onAddTask(formattedTitle, customCategory, 1, 'medium');

    setCustomTitle('');
    setShowCustomSuccess(true);
    setTimeout(() => setShowCustomSuccess(false), 3000);
  };

  const filteredHabits = PRESET_HABITS.filter(h => {
    if (filterCategory === 'all') return true;
    return h.timeOfDay === filterCategory;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner Analysis Header */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-orange-500/10 border border-orange-500/30 px-3 py-1 rounded-full text-orange-400 text-[10px] font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Análise de Hábitos e Desempenho</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-sans">
              Sugestão de Hábitos Personalizados
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Baseado no seu histórico de <strong className="text-orange-400">{habitAnalysis.completedCount} missões concluídas</strong>, 
              selecionamos hábitos estratégicos para fortalecer sua disciplina e manter seu fluxo diário.
            </p>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 gap-3 shrink-0 w-full md:w-auto">
            <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl flex flex-col justify-center min-w-[130px]">
              <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block mb-1">
                Taxa de Conclusão
              </span>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-black text-white font-mono">{habitAnalysis.completionRate}%</span>
                <TrendingUp className="w-4 h-4 text-emerald-400 ml-1" />
              </div>
            </div>

            <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl flex flex-col justify-center min-w-[130px]">
              <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block mb-1">
                Categoria Forte
              </span>
              <div className="flex items-center space-x-1.5">
                <Flame className="w-4 h-4 text-orange-400 shrink-0" />
                <span className="text-sm font-black text-white uppercase truncate font-mono">
                  {habitAnalysis.topCategory}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Habit Selection Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-zinc-850 pb-3">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-orange-400" />
            <h3 className="text-base font-extrabold text-white uppercase tracking-tight">
              Hábitos Recomendados para Você
            </h3>
          </div>

          {/* Category Filter Buttons */}
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'morning', label: '🌅 Matinal' },
              { id: 'focus', label: '⚡ Foco' },
              { id: 'health', label: '🧘 Saúde' },
              { id: 'evening', label: '🌙 Noturno' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterCategory(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filterCategory === tab.id
                    ? 'bg-orange-500 text-zinc-950 shadow-md font-extrabold'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHabits.map((habit) => {
            const isAdded = addedIds[habit.id];
            return (
              <div
                key={habit.id}
                className="bg-zinc-950/70 border border-zinc-850 hover:border-zinc-700 p-5 rounded-2xl transition-all duration-200 flex flex-col justify-between space-y-4 relative group hover:shadow-lg"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 shrink-0">
                        {habit.icon}
                      </div>
                      <div>
                        <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-500 block">
                          {habit.category}
                        </span>
                        <h4 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors">
                          {habit.title}
                        </h4>
                      </div>
                    </div>

                    <span className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0">
                      1 Pomodoro
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {habit.description}
                  </p>

                  <div className="bg-zinc-900/50 border border-zinc-850 p-2.5 rounded-xl text-[11px] text-zinc-300 flex items-center space-x-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span><strong>Benefício:</strong> {habit.benefits}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleAddHabit(habit)}
                  disabled={isAdded}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-98 ${
                    isAdded
                      ? 'bg-emerald-600 text-white border border-emerald-500'
                      : 'bg-zinc-900 hover:bg-orange-500 hover:text-zinc-950 text-white border border-zinc-800 hover:border-orange-400 shadow-sm'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4 text-white stroke-[3]" />
                      <span>Adicionado às Suas Missões!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 text-orange-400 group-hover:text-zinc-950" />
                      <span>Adicionar ao Meu Dia</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Custom Habit Creation Section */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <Plus className="w-5 h-5 text-orange-400" />
          <div>
            <h3 className="text-base font-extrabold text-white uppercase tracking-tight">
              Criar Novo Hábito Personalizado
            </h3>
            <p className="text-xs text-zinc-400">
              Transforme qualquer rotina em uma missão rastreável na sua lista do FocusOS.
            </p>
          </div>
        </div>

        <form onSubmit={handleAddCustomHabit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-5 space-y-1">
            <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">
              Nome do Hábito
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Ex: Ler 10 páginas, Fazer 20 flexões..."
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="sm:col-span-3 space-y-1">
            <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">
              Categoria
            </label>
            <select
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-orange-500 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none transition-colors cursor-pointer"
            >
              <option value="Foco">⚡ Foco</option>
              <option value="Saúde">🧘 Saúde</option>
              <option value="Estudo">📚 Estudo</option>
              <option value="Leitura">📖 Leitura</option>
              <option value="Organização">🎯 Organização</option>
            </select>
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">
              Frequência
            </label>
            <select
              value={customFrequency}
              onChange={(e) => setCustomFrequency(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-orange-500 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none transition-colors cursor-pointer"
            >
              <option value="Diário">Diário</option>
              <option value="Dias Úteis">Dias Úteis</option>
              <option value="Semanal">Semanal</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-400 text-zinc-950 font-black py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-1 cursor-pointer shadow-md active:scale-95"
            >
              <span>Criar</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </form>

        {showCustomSuccess && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs flex items-center space-x-2 animate-pop-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Novo hábito adicionado com sucesso às suas missões do dia!</span>
          </div>
        )}
      </div>
    </div>
  );
}
