import React from 'react';
import { 
  BookOpen, 
  CheckSquare, 
  BarChart2, 
  Trophy, 
  ShieldCheck, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  Check, 
  Award, 
  Flame, 
  Clock, 
  HelpCircle,
  Sparkles,
  Compass
} from 'lucide-react';

interface GuideTabProps {
  onGoToTasks: () => void;
}

export default function GuideTab({ onGoToTasks }: GuideTabProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-pink-950/60 via-zinc-950 to-rose-950/60 border border-pink-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_30px_rgba(244,114,182,0.12)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-pink-950/80 border border-pink-500/40 px-3 py-1 rounded-full text-pink-300 text-xs font-mono font-bold uppercase tracking-widest">
              <BookOpen className="w-3.5 h-3.5 text-pink-400" />
              <span>[ 侍 GUIA DE MAESTRIA SAMURAI ]</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight font-sans">
              Como Usar o FocusOS & Manual do Guerreiro
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
              Aprenda a dominar o sistema de foco, gerenciar suas missões diárias, acumular XP e evoluir seu nível no aplicativo.
            </p>
          </div>

          <button
            onClick={onGoToTasks}
            className="bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white font-black text-xs uppercase tracking-wider px-5 py-3 rounded-2xl border border-pink-400 transition-all shadow-lg shadow-pink-500/25 active:scale-95 cursor-pointer shrink-0 flex items-center space-x-2 font-mono"
          >
            <CheckSquare className="w-4 h-4" />
            <span>Ir para as Missões</span>
          </button>
        </div>
      </div>

      {/* Grid Section 1: Resumo do App */}
      <div className="bg-zinc-950 border border-pink-500/30 bg-gradient-to-b from-pink-950/20 via-zinc-950 to-zinc-950 p-6 rounded-3xl space-y-4 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-pink-950/60 border border-pink-500/40 text-pink-400">
            <Compass className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-tight">
              1. Visão Geral & Resumo do Aplicativo
            </h3>
            <p className="text-xs text-zinc-400">O que é o FocusOS Samurai Edition?</p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed pl-1 sm:pl-2">
          O <strong>FocusOS Samurai Edition</strong> é um sistema operacional de produtividade gamificado projetado para transformar suas tarefas diárias em uma jornada de evolução pessoal. Combinando a técnica Pomodoro de foco contínuo, contagem de sequências diárias (Streaks) e um sistema de RPG com ganho de Experiência (XP), o FocusOS ajuda você a manter a disciplina e o foco profundo no seu dia a dia.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="bg-zinc-900/60 border border-pink-500/20 p-4 rounded-2xl space-y-1.5">
            <div className="flex items-center space-x-2 text-pink-400 font-bold text-xs uppercase">
              <Clock className="w-4 h-4" />
              <span>Temporizador de Foco</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Sessões Pomodoro integradas com sons e alertas para manter seu fluxo de trabalho sem distrações.
            </p>
          </div>

          <div className="bg-zinc-900/60 border border-pink-500/20 p-4 rounded-2xl space-y-1.5">
            <div className="flex items-center space-x-2 text-pink-400 font-bold text-xs uppercase">
              <Award className="w-4 h-4" />
              <span>Sistema de RPG & XP</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Conclua missões para ganhar XP, subir do Nível 1 até o Nível 15 e desbloquear troféus exclusivos.
            </p>
          </div>

          <div className="bg-zinc-900/60 border border-pink-500/20 p-4 rounded-2xl space-y-1.5">
            <div className="flex items-center space-x-2 text-pink-400 font-bold text-xs uppercase">
              <Flame className="w-4 h-4" />
              <span>Sequência Diária (Streak)</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Mantenha o hábito ativo completando pelo menos uma missão todos os dias para não quebrar a sequência.
            </p>
          </div>
        </div>
      </div>

      {/* Grid Section 2: Como Gerenciar Tarefas (Adicionar, Editar, Remover) */}
      <div className="bg-zinc-950 border border-pink-500/30 bg-gradient-to-b from-pink-950/20 via-zinc-950 to-zinc-950 p-6 rounded-3xl space-y-5 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-pink-950/60 border border-pink-500/40 text-pink-400">
            <CheckSquare className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-tight">
              2. Como Gerenciar Missões (Adicionar, Editar e Remover)
            </h3>
            <p className="text-xs text-zinc-400">Instruções passo a passo para a aba de Missões</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Adicionar */}
          <div className="bg-zinc-900/80 border border-pink-500/20 p-4 rounded-2xl space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase">
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>Adicionar Tarefa</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              1. Na aba <strong>Missões</strong>, encontre o formulário superior.<br />
              2. Digite o nome da tarefa e selecione a categoria/área.<br />
              3. Defina o número estimado de sessões de foco (Pomodoros) e a prioridade.<br />
              4. Clique em <strong>"Adicionar Missão"</strong>.
            </p>
          </div>

          {/* Editar */}
          <div className="bg-zinc-900/80 border border-pink-500/20 p-4 rounded-2xl space-y-2">
            <div className="flex items-center space-x-2 text-pink-400 font-bold text-xs uppercase">
              <Edit3 className="w-4 h-4 text-pink-400" />
              <span>Editar Tarefa</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              1. Passe o cursor sobre a tarefa desejada na lista.<br />
              2. Clique no ícone de lápis <strong className="text-pink-300">✏️ Editar</strong>.<br />
              3. Altere o título, o tempo estimado de foco ou a categoria.<br />
              4. Salve as alterações para atualizar instantaneamente.
            </p>
          </div>

          {/* Remover */}
          <div className="bg-zinc-900/80 border border-pink-500/20 p-4 rounded-2xl space-y-2">
            <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs uppercase">
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>Remover Tarefa</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              1. Localize a missão que deseja excluir.<br />
              2. Clique no ícone de lixeira <strong className="text-rose-400">🗑️ Excluir</strong> no lado direito.<br />
              3. Confirme a remoção se a missão não for mais necessária.
            </p>
          </div>
        </div>

        {/* Concluir Tarefas */}
        <div className="bg-pink-950/30 border border-pink-500/30 p-4 rounded-2xl flex items-start space-x-3">
          <div className="p-2 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-400 shrink-0 mt-0.5">
            <Check className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase">Como Concluir uma Missão</h4>
            <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
              Para marcar uma tarefa como finalizada, basta clicar na caixa de seleção (checkbox) ao lado do título. O aplicativo reproduzirá um efeito sonoro de confirmação e adicionará instantaneamente os pontos de XP correspondentes à sua barra de nível!
            </p>
          </div>
        </div>
      </div>

      {/* Grid Section 3: Como Ganhar XP e Evoluir de Nível */}
      <div className="bg-zinc-950 border border-pink-500/30 bg-gradient-to-b from-pink-950/20 via-zinc-950 to-zinc-950 p-6 rounded-3xl space-y-4 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-pink-950/60 border border-pink-500/40 text-pink-400">
            <Sparkles className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-tight">
              3. Sistema de XP & Evolução de Nível
            </h3>
            <p className="text-xs text-zinc-400">Como acumular pontos de experiência e subir no ranking</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-zinc-900/60 border border-pink-500/20 p-4 rounded-2xl text-center space-y-1">
            <span className="text-lg font-black text-pink-400 font-mono">+10 a +100 XP</span>
            <h4 className="text-xs font-bold text-white uppercase">Concluir Missões</h4>
            <p className="text-[10px] text-zinc-400">Varia conforme o tempo e a prioridade da tarefa.</p>
          </div>

          <div className="bg-zinc-900/60 border border-pink-500/20 p-4 rounded-2xl text-center space-y-1">
            <span className="text-lg font-black text-pink-400 font-mono">+25 XP</span>
            <h4 className="text-xs font-bold text-white uppercase">Sessão de Foco</h4>
            <p className="text-[10px] text-zinc-400">A cada temporizador Pomodoro completado.</p>
          </div>

          <div className="bg-zinc-900/60 border border-pink-500/20 p-4 rounded-2xl text-center space-y-1">
            <span className="text-lg font-black text-rose-400 font-mono">+Bônus Streak</span>
            <h4 className="text-xs font-bold text-white uppercase">Manter Sequência</h4>
            <p className="text-[10px] text-zinc-400">Bônus acumulativo por dias consecutivos.</p>
          </div>

          <div className="bg-zinc-900/60 border border-pink-500/20 p-4 rounded-2xl text-center space-y-1">
            <span className="text-lg font-black text-emerald-400 font-mono">Níveis 1 a 15</span>
            <h4 className="text-xs font-bold text-white uppercase">Subir de 段位</h4>
            <p className="text-[10px] text-zinc-400">Avança do Nível 1 ao título de Mestre Samurai.</p>
          </div>
        </div>
      </div>

      {/* Grid Section 4: Navegação entre as Abas */}
      <div className="bg-zinc-950 border border-pink-500/30 bg-gradient-to-b from-pink-950/20 via-zinc-950 to-zinc-950 p-6 rounded-3xl space-y-4 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-pink-950/60 border border-pink-500/40 text-pink-400">
            <HelpCircle className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-tight">
              4. Como Navegar Entre as Abas do Aplicativo
            </h3>
            <p className="text-xs text-zinc-400">Guia de acesso rápido no menu inferior fixo</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-zinc-900/60 border border-pink-500/20 p-3.5 rounded-2xl flex items-start space-x-3">
            <div className="p-2 bg-pink-950/80 border border-pink-500/40 rounded-xl text-pink-400 shrink-0">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase">Missões (Tarefas)</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Central principal com o temporizador de foco, lista de tarefas e metas de longo prazo.
              </p>
            </div>
          </div>

          <div className="bg-zinc-900/60 border border-pink-500/20 p-3.5 rounded-2xl flex items-start space-x-3">
            <div className="p-2 bg-pink-950/80 border border-pink-500/40 rounded-xl text-pink-400 shrink-0">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase">Evolução (Estatísticas)</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Gráficos de desempenho semanal, horas acumuladas de foco e curva de ganho de XP.
              </p>
            </div>
          </div>

          <div className="bg-zinc-900/60 border border-pink-500/20 p-3.5 rounded-2xl flex items-start space-x-3">
            <div className="p-2 bg-pink-950/80 border border-pink-500/40 rounded-xl text-pink-400 shrink-0">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase">Troféus (Conquistas)</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Lista de insígnias e troféus desbloqueáveis conforme você atinge novos marcos.
              </p>
            </div>
          </div>

          <div className="bg-zinc-900/60 border border-pink-500/20 p-3.5 rounded-2xl flex items-start space-x-3">
            <div className="p-2 bg-pink-950/80 border border-pink-500/40 rounded-xl text-pink-400 shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase">Diário (Reflexões)</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Espaço para registrar aprendizados diários, reflexões de foco e notas pessoais.
              </p>
            </div>
          </div>

          <div className="bg-zinc-900/60 border border-pink-500/20 p-3.5 rounded-2xl flex items-start space-x-3">
            <div className="p-2 bg-pink-950/80 border border-pink-500/40 rounded-xl text-pink-400 shrink-0">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase">Manual (Como Usar)</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Este guia de instruções com todas as dicas para você tirar o máximo do FocusOS.
              </p>
            </div>
          </div>

          <div className="bg-zinc-900/60 border border-pink-500/20 p-3.5 rounded-2xl flex items-start space-x-3">
            <div className="p-2 bg-pink-950/80 border border-pink-500/40 rounded-xl text-pink-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase">Acesso Total</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Todas as funcionalidades, temas, áudios e sincronização estão 100% liberadas gratuitamente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
