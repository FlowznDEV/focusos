import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend, PieChart, Pie, Cell, LabelList } from 'recharts';
import { Award, Zap, Clock, CheckSquare, Sparkles, TrendingUp, PieChart as LucidePieChart, Trophy, Shield, Flame, Star, Download, FileText } from 'lucide-react';
import { UserStats, Task } from '../types';
import { getXPForNextLevel } from '../useGamifiedState';
import RpgProgressionMap from './RpgProgressionMap';
import { playTypeSound } from '../lib/sound';

interface StatsDashboardProps {
  stats: UserStats;
  tasks: Task[];
}

export default function StatsDashboard({ stats, tasks }: StatsDashboardProps) {
  // 1. Process tasks categories
  const categories = ['work', 'study', 'health', 'organization', 'creative'];
  const categoryLabels: Record<string, string> = {
    work: 'Trabalho',
    study: 'Estudo',
    health: 'Saúde',
    organization: 'Rotina',
    creative: 'Criativo'
  };

  const categoryColor: Record<string, string> = {
    work: '#6366f1', // Indigo
    study: '#ec4899', // Pink
    health: '#10b981', // Emerald
    organization: '#f59e0b', // Amber
    creative: '#06b6d4' // Cyan
  };

  const categoryData = categories.map(cat => {
    const total = tasks.filter(t => t.category === cat).length;
    const completed = tasks.filter(t => t.category === cat && t.completed).length;
    return {
      name: categoryLabels[cat],
      'Pendentes': total - completed,
      'Concluídas': completed,
    };
  });

  // Focus distribution based on tags of completed tasks
  const completedTasks = tasks.filter(t => t.completed);
  const completedByCategory = completedTasks.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieChartData = Object.entries(categoryLabels).map(([key, label]) => ({
    name: label,
    value: completedByCategory[key] || 0,
  })).filter(item => item.value > 0);

  const PIE_COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#06b6d4'];

  // 2. Process XP Logs for Area Chart
  // We reverse the logs so chronological order is left to right, and show cumulative or immediate values
  const xpLogsChronological = [...stats.xpLogs].reverse();
  let cumulativeXP = 0;
  const xpTrendData = xpLogsChronological.map((log, index) => {
    cumulativeXP += log.amount;
    return {
      index: index + 1,
      reason: log.reason.length > 25 ? log.reason.substring(0, 22) + '...' : log.reason,
      'Ganho': log.amount,
      'Acumulado': cumulativeXP,
    };
  });

  // Take last 15 actions to avoid cluttered chart
  const recentXPTrend = xpTrendData.slice(-15);

  // 3. Process 7-Day Performance Data (Completed Tasks, XP, & Focus Minutes)
  const extractMinutes = (reason: string): number => {
    const match = reason.match(/Completou (\d+) minutos de sessão de Foco/);
    if (match) {
      return parseInt(match[1], 10);
    }
    return 0;
  };

  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const last7DaysData: Array<{
    dateStr: string;
    label: string;
    completedCount: number;
    xpEarned: number;
    focusedMinutes: number;
  }> = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    
    const weekday = weekdays[d.getDay()];
    const label = `${weekday} ${dd}/${mm}`;
    
    last7DaysData.push({
      dateStr,
      label,
      completedCount: 0,
      xpEarned: 0,
      focusedMinutes: 0,
    });
  }

  // Aggregate completed tasks
  tasks.forEach(task => {
    if (task.completed) {
      const dateToUse = task.completedAt || task.createdAt;
      if (dateToUse) {
        const dComp = new Date(dateToUse);
        const yStr = dComp.getFullYear();
        const mStr = String(dComp.getMonth() + 1).padStart(2, '0');
        const dStr = String(dComp.getDate()).padStart(2, '0');
        const compDateStr = `${yStr}-${mStr}-${dStr}`;
        
        const dayObj = last7DaysData.find(item => item.dateStr === compDateStr);
        if (dayObj) {
          dayObj.completedCount += 1;
        }
      }
    }
  });

  const totalWeeklyCompletedTasks = last7DaysData.reduce((acc, curr) => acc + curr.completedCount, 0);
  const avgWeeklyCompletedTasks = (totalWeeklyCompletedTasks / 7).toFixed(1);

  // Aggregate XP earned and focus minutes from stats.xpLogs
  stats.xpLogs.forEach(log => {
    if (log.timestamp) {
      const dLog = new Date(log.timestamp);
      const yStr = dLog.getFullYear();
      const mStr = String(dLog.getMonth() + 1).padStart(2, '0');
      const dStr = String(dLog.getDate()).padStart(2, '0');
      const logDateStr = `${yStr}-${mStr}-${dStr}`;
      
      const dayObj = last7DaysData.find(item => item.dateStr === logDateStr);
      if (dayObj) {
        dayObj.xpEarned += log.amount;
        dayObj.focusedMinutes += extractMinutes(log.reason);
      }
    }
  });

  const xpNeeded = getXPForNextLevel(stats.level);
  const xpProgressPercent = xpNeeded > 0 ? (stats.xp / xpNeeded) * 100 : 100;

  // Function to generate and download monthly JSON report
  const handleDownloadMonthlyReport = () => {
    playTypeSound();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthName = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    // Completed tasks in current month
    const tasksCompletedThisMonth = tasks.filter(t => {
      if (!t.completed) return false;
      if (!t.completedAt) return true;
      const d = new Date(t.completedAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    // Aggregate focus minutes and XP in current month from xpLogs
    let focusMinutesThisMonth = 0;
    let xpEarnedThisMonth = 0;

    stats.xpLogs.forEach(log => {
      if (!log.timestamp) return;
      const d = new Date(log.timestamp);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        xpEarnedThisMonth += log.amount;
        const match = log.reason.match(/Completou (\d+) minutos de sessão de Foco/);
        if (match) {
          focusMinutesThisMonth += parseInt(match[1], 10);
        }
      }
    });

    // Task distribution by category for current month
    const tasksByCategoryThisMonth: Record<string, number> = {};
    tasksCompletedThisMonth.forEach(t => {
      const catName = categoryLabels[t.category] || t.category;
      tasksByCategoryThisMonth[catName] = (tasksByCategoryThisMonth[catName] || 0) + 1;
    });

    const reportData = {
      titulo: "Relatório Mensal de Produtividade - FocusOS",
      usuario: stats.nickname || 'Guerreiro',
      mesAno: monthName,
      geradoEm: now.toISOString(),
      resumo: {
        nivelAtual: stats.level,
        sequenciaDiasStreak: stats.streak,
        horasFocoMes: parseFloat((focusMinutesThisMonth / 60).toFixed(2)),
        minutosFocoMes: focusMinutesThisMonth,
        totalTarefasConcluidasMes: tasksCompletedThisMonth.length,
        totalXpGanhoMes: xpEarnedThisMonth,
        distribuicaoTarefasPorCategoria: tasksByCategoryThisMonth
      },
      tarefasConcluidasNoMes: tasksCompletedThisMonth.map(t => ({
        id: t.id,
        titulo: t.title,
        categoria: categoryLabels[t.category] || t.category,
        dificuldade: t.difficulty,
        prioridade: t.priority,
        dataConclusao: t.completedAt ? new Date(t.completedAt).toISOString() : null
      }))
    };

    const jsonString = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filenameMonth = String(currentMonth + 1).padStart(2, '0');
    link.download = `relatorio_focusos_${currentYear}_${filenameMonth}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="stats-dashboard-container" className="space-y-6">
      
      {/* Top Header Action Bar with Report Download */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950 border border-pink-500/30 bg-gradient-to-r from-pink-950/30 via-zinc-950 to-pink-950/30 p-4 sm:p-5 rounded-3xl animate-slide-up">
        <div className="flex items-center space-x-3.5">
          <div className="bg-pink-500/10 border border-pink-500/30 p-2.5 rounded-2xl text-pink-400 shrink-0">
            <FileText className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-tight">Painel de Desempenho</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Visão consolidada de produtividade, foco e nível RPG</p>
          </div>
        </div>

        <button
          id="download-monthly-report-btn"
          onClick={handleDownloadMonthlyReport}
          className="flex items-center justify-center space-x-2 bg-pink-600 hover:bg-pink-500 text-white text-xs font-black px-4 py-2.5 rounded-2xl transition-all shadow-lg shadow-pink-600/20 active:scale-95 cursor-pointer shrink-0 uppercase tracking-wider font-mono animate-pop-in"
          title="Baixar resumo em JSON com horas de foco e tarefas do mês"
        >
          <Download className="w-4 h-4" />
          <span>Exportar Relatório Mensal (JSON)</span>
        </button>
      </div>

      {/* RPG Progression Map */}
      <div className="animate-pop-in">
        <RpgProgressionMap currentLevel={stats.level} />
      </div>
      
      {/* 4 Key Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up-delay-1">
        
        {/* Metric 1: Nível */}
        <div id="metric-level-card" className="bg-zinc-950 border border-pink-500/30 bg-gradient-to-b from-pink-950/20 via-zinc-950 to-zinc-950 p-5 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-pink-500/50 transition-all duration-300 shadow-sm min-h-[140px]">
          <div className="bg-pink-950/40 border border-pink-500/30 text-pink-400 p-2.5 rounded-xl mb-2 shrink-0">
            <Award className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Nível Atual</span>
            <div className="flex items-baseline justify-center space-x-1">
              <span className="text-2xl font-bold font-mono text-white">{stats.level}</span>
              <span className="text-xs text-zinc-500">/ 15</span>
            </div>
          </div>
          <div className="absolute top-2 right-2 bg-pink-950/80 border border-pink-500/30 text-[10px] font-bold text-pink-300 px-1.5 py-0.5 rounded-sm">
            {Math.round(xpProgressPercent)}%
          </div>
        </div>

        {/* Metric 2: Sequência */}
        <div id="metric-streak-card" className="bg-zinc-950 border border-pink-500/30 bg-gradient-to-b from-pink-950/20 via-zinc-950 to-zinc-950 p-5 rounded-2xl flex flex-col items-center justify-center text-center hover:border-pink-500/50 transition-all duration-300 shadow-sm min-h-[140px]">
          <div className="bg-rose-950/40 border border-rose-900/40 text-rose-400 p-2.5 rounded-xl mb-2 shrink-0">
            <Zap className="w-5 h-5 animate-bounce" />
          </div>
          <div className="flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Foco Consecutivo</span>
            <span className="text-2xl font-bold font-mono text-white">{stats.streak} {stats.streak === 1 ? 'Dia' : 'Dias'}</span>
          </div>
        </div>

        {/* Metric 3: Tarefas Concluídas */}
        <div id="metric-tasks-card" className="bg-zinc-950 border border-pink-500/30 bg-gradient-to-b from-pink-950/20 via-zinc-950 to-zinc-950 p-5 rounded-2xl flex flex-col items-center justify-center text-center hover:border-emerald-500/40 transition-all duration-300 shadow-sm min-h-[140px]">
          <div className="bg-emerald-950/40 border border-emerald-900/40 text-emerald-400 p-2.5 rounded-xl mb-2 shrink-0">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div className="flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Total Concluídas</span>
            <span className="text-2xl font-bold font-mono text-white">{stats.totalTasksCompleted}</span>
          </div>
        </div>

        {/* Metric 4: Horas de Foco */}
        <div id="metric-focus-card" className="bg-zinc-950 border border-pink-500/30 bg-gradient-to-b from-pink-950/20 via-zinc-950 to-zinc-950 p-5 rounded-2xl flex flex-col items-center justify-center text-center hover:border-pink-500/50 transition-all duration-300 shadow-sm min-h-[140px]">
          <div className="bg-pink-950/40 border border-pink-900/40 text-pink-400 p-2.5 rounded-xl mb-2 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Tempo de Foco</span>
            <span className="text-2xl font-bold font-mono text-white">{stats.totalFocusMinutes}m</span>
          </div>
        </div>
      </div>

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart: Quantidade de Tarefas Concluídas nos Últimos 7 Dias */}
        <div id="weekly-completed-tasks-bar-chart-card" className="bg-zinc-950 border border-pink-500/30 bg-gradient-to-b from-pink-950/20 via-zinc-950 to-zinc-950 p-5 rounded-3xl flex flex-col justify-between shadow-xs lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center space-x-1.5 uppercase tracking-tight">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <span>Tarefas Concluídas (Últimos 7 Dias)</span>
              </h4>
              <p className="text-[11px] text-zinc-500 mt-0.5">Quantidade de missões diárias finalizadas ao longo da última semana</p>
            </div>
            <div className="flex items-center space-x-2 text-[10px] font-mono shrink-0">
              <span className="bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded-xl">
                Total na semana: <strong className="text-white">{totalWeeklyCompletedTasks}</strong>
              </span>
              <span className="bg-zinc-850 border border-zinc-750 text-zinc-300 px-2.5 py-1 rounded-xl">
                Média: <strong className="text-white">{avgWeeklyCompletedTasks}/dia</strong>
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7DaysData} margin={{ top: 20, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCompletedTasksBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.4}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#71717a' }} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#71717a' }} />
                <Tooltip
                  contentStyle={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '12px', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', color: '#fff' }}
                  formatter={(value: any) => [`${value} tarefas`, 'Concluídas']}
                  labelFormatter={(label) => `Dia: ${label}`}
                />
                <Bar 
                  dataKey="completedCount" 
                  fill="url(#colorCompletedTasksBar)" 
                  stroke="#10b981" 
                  strokeWidth={1} 
                  radius={[6, 6, 0, 0]} 
                  name="Tarefas Concluídas"
                >
                  <LabelList dataKey="completedCount" position="top" fill="#10b981" fontSize={11} fontWeight="bold" formatter={(val: any) => Number(val) > 0 ? val : ''} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Chart 1: Histórico de Evolução de XP (Trajetória Recente de XP) */}
        <div id="xp-trend-chart-card" className="bg-zinc-950 border border-pink-500/30 bg-gradient-to-b from-pink-950/20 via-zinc-950 to-zinc-950 p-5 rounded-3xl flex flex-col justify-between shadow-xs lg:col-span-2">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-white flex items-center space-x-1.5 uppercase tracking-tight">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span>Trajetória Recente de XP</span>
            </h4>
            <p className="text-[11px] text-zinc-500 mt-0.5">Pontos de experiência acumulados ao longo das últimas ações de foco</p>
          </div>

          <div className="h-64 w-full">
            {recentXPTrend.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-zinc-500">
                Ainda não há XP acumulado. Complete uma tarefa ou inicie o foco para preencher o gráfico!
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={recentXPTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorXP" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                  <XAxis dataKey="index" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#71717a' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#71717a' }} />
                  <Tooltip
                    contentStyle={{ background: '#09090b', border: '1px solid #ec4899', borderRadius: '12px', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', color: '#fff' }}
                    labelFormatter={(label) => `Ação #${label}`}
                  />
                  <Area type="monotone" dataKey="Acumulado" stroke="#ec4899" strokeWidth={2} fillOpacity={1} fill="url(#colorXP)" name="XP Acumulado" />
                  <Area type="monotone" dataKey="Ganho" stroke="#f43f5e" strokeWidth={1.5} fillOpacity={0} name="Ganho na Ação" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 3: Distribuição de Foco por Tags/Categorias (Gráfico de Pizza) */}
        <div id="focus-distribution-pie-chart" className="bg-zinc-950 border border-pink-500/30 bg-gradient-to-b from-pink-950/20 via-zinc-950 to-zinc-950 p-5 rounded-3xl flex flex-col justify-between shadow-xs lg:col-span-2">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-white flex items-center space-x-1.5 uppercase tracking-tight">
              <LucidePieChart className="w-4 h-4 text-pink-400" />
              <span>Distribuição de Foco</span>
            </h4>
            <p className="text-[11px] text-zinc-500 mt-0.5">Foco investido por tipo de missão/tag das tarefas concluídas</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {pieChartData.length === 0 ? (
              <div className="text-center p-4">
                <p className="text-xs text-zinc-500">Nenhuma missão foi concluída ainda.</p>
                <p className="text-[10px] text-zinc-600 mt-1">Conclua tarefas de Trabalho, Estudo ou outras categorias para preencher o gráfico!</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                    formatter={(value: any) => [`${value} tarefas`, 'Volume']}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    wrapperStyle={{ fontSize: '10px', bottom: 10 }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 3: Desempenho dos Últimos 7 Dias (Tarefas Concluídas e XP Ganho) */}
        <div id="weekly-performance-chart-card" className="bg-zinc-950 border border-pink-500/30 bg-gradient-to-b from-pink-950/20 via-zinc-950 to-zinc-950 p-5 rounded-3xl flex flex-col justify-between shadow-xs lg:col-span-2">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-white flex items-center space-x-1.5 uppercase tracking-tight">
              <TrendingUp className="w-4 h-4 text-pink-400" />
              <span>Desempenho Semanal (Últimos 7 Dias)</span>
            </h4>
            <p className="text-[11px] text-zinc-500 mt-0.5">Visão unificada das missões diárias concluídas (eixo esquerdo) e XP acumulado por dia (eixo direito)</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7DaysData} margin={{ top: 10, right: -5, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#71717a' }} />
                <YAxis yAxisId="left" orientation="left" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#10b981' }} />
                <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#ec4899' }} />
                <Tooltip
                  contentStyle={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '12px', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', color: '#fff' }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} />
                <Bar yAxisId="left" dataKey="completedCount" fill="#10b981" radius={[4, 4, 0, 0]} name="Tarefas Concluídas" />
                <Bar yAxisId="right" dataKey="xpEarned" fill="#ec4899" radius={[4, 4, 0, 0]} name="XP Ganho" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Tempo de Foco (Últimos 7 Dias) */}
        <div id="weekly-focus-minutes-chart-card" className="bg-zinc-950 border border-pink-500/30 bg-gradient-to-b from-pink-950/20 via-zinc-950 to-zinc-950 p-5 rounded-3xl flex flex-col justify-between shadow-xs lg:col-span-2">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-white flex items-center space-x-1.5 uppercase tracking-tight">
              <Clock className="w-4 h-4 text-pink-400" />
              <span>Tempo de Foco (Últimos 7 Dias)</span>
            </h4>
            <p className="text-[11px] text-zinc-500 mt-0.5">Minutos dedicados ao foco profundo dia a dia</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7DaysData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#71717a' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#71717a' }} unit="m" />
                <Tooltip
                  contentStyle={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '12px', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', color: '#fff' }}
                  formatter={(value) => [`${value} minutos`, 'Tempo de Foco']}
                />
                <Bar dataKey="focusedMinutes" fill="url(#colorFocus)" stroke="#ec4899" strokeWidth={1} radius={[4, 4, 0, 0]} name="Minutos de Foco" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent XP Activity Logs (Sleek minimalist timeline) */}
      <div id="xp-timeline-panel" className="bg-zinc-950 border border-pink-500/30 bg-gradient-to-b from-pink-950/20 via-zinc-950 to-zinc-950 p-5 rounded-3xl shadow-xs">
        <h4 className="text-sm font-bold text-white mb-4 flex items-center space-x-1.5 uppercase tracking-tight">
          <Sparkles className="w-4 h-4 text-pink-400" />
          <span>Atividades de Ganho de XP Recentes</span>
        </h4>
        <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
          {stats.xpLogs.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-2">Nenhum histórico disponível ainda.</p>
          ) : (
            stats.xpLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between py-2 border-b border-zinc-850 last:border-b-0 text-xs">
                <div className="flex items-center space-x-3 pr-2">
                  <div className="bg-pink-950/50 border border-pink-900/40 text-pink-400 font-mono font-bold px-2 py-1 rounded-lg shrink-0">
                    +{log.amount} XP
                  </div>
                  <span className="text-zinc-300 font-medium line-clamp-1">{log.reason}</span>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
