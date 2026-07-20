import { useState, useEffect, useCallback } from 'react';
import { Task, Achievement, UserStats, XPLog, Difficulty, TaskCategory, JournalEntry, LongTermGoal } from './types';
import { playTaskCompleteSound, playLevelUpSound, playAchievementSound } from './lib/sound';

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_step', title: 'Primeiro Passo', description: 'Conclua sua primeira tarefa diária', xpReward: 100, unlocked: false, icon: 'CheckCircle', conditionType: 'tasks', conditionValue: 1 },
  { id: 'task_trio', title: 'Trindade de Foco', description: 'Conclua 3 tarefas em um único dia', xpReward: 200, unlocked: false, icon: 'Zap', conditionType: 'tasks', conditionValue: 3 },
  { id: 'productivity_master', title: 'Mestre da Produtividade', description: 'Conclua 25 tarefas no total', xpReward: 500, unlocked: false, icon: 'Award', conditionType: 'tasks', conditionValue: 25 },
  { id: 'first_focus', title: 'Foco Inicial', description: 'Complete sua primeira sessão de foco de no mínimo 5 minutos', xpReward: 150, unlocked: false, icon: 'Clock', conditionType: 'focus', conditionValue: 1 },
  { id: 'focus_iron', title: 'Mente Blindada', description: 'Complete 10 sessões de foco no total', xpReward: 400, unlocked: false, icon: 'Shield', conditionType: 'focus', conditionValue: 10 },
  { id: 'level_5', title: 'Iniciante Dedicado', description: 'Alcance o nível 5', xpReward: 150, unlocked: false, icon: 'Star', conditionType: 'level', conditionValue: 5 },
  { id: 'level_25', title: 'Foco Avançado', description: 'Alcance o nível 25', xpReward: 350, unlocked: false, icon: 'Sparkles', conditionType: 'level', conditionValue: 25 },
  { id: 'level_75', title: 'Guerreiro da Atenção', description: 'Alcance o nível 75', xpReward: 750, unlocked: false, icon: 'Flame', conditionType: 'level', conditionValue: 75 },
  { id: 'level_150', title: 'Lenda do Foco', description: 'Alcance o nível máximo 150', xpReward: 2000, unlocked: false, icon: 'Crown', conditionType: 'level', conditionValue: 150 },
  { id: 'streak_3', title: 'Hábito de Ferro', description: 'Alcance uma sequência de 3 dias ativos', xpReward: 250, unlocked: false, icon: 'CalendarDays', conditionType: 'streak', conditionValue: 3 },
];

export function getXPForNextLevel(level: number): number {
  if (level >= 150) return 0;
  return level * 45 + 80; // Level 1 needs 125xp, Level 10 needs 530xp, Level 149 needs ~6785xp
}

export function useGamifiedState() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [longTermGoals, setLongTermGoals] = useState<LongTermGoal[]>([]);
  const [stats, setStats] = useState<UserStats>({
    xp: 0,
    level: 1,
    streak: 1,
    totalTasksCompleted: 0,
    totalFocusMinutes: 0,
    xpLogs: [],
  });

  // State trigger events for notifications
  const [activeNotification, setActiveNotification] = useState<{
    id: string;
    type: 'level_up' | 'achievement' | 'xp_gain';
    title: string;
    message: string;
    value?: number;
  } | null>(null);

  const [triggerConfetti, setTriggerConfetti] = useState<number>(0);

  // Load from localstorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('focus_quest_tasks');
    const savedAchievements = localStorage.getItem('focus_quest_achievements');
    const savedStats = localStorage.getItem('focus_quest_stats');
    const savedJournal = localStorage.getItem('focus_quest_journal');
    const savedGoals = localStorage.getItem('focus_quest_long_term_goals');

    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedJournal) setJournalEntries(JSON.parse(savedJournal));
    if (savedGoals) setLongTermGoals(JSON.parse(savedGoals));
    
    if (savedAchievements) {
      setAchievements(JSON.parse(savedAchievements));
    } else {
      setAchievements(DEFAULT_ACHIEVEMENTS);
    }

    const todayStr = new Date().toISOString().split('T')[0];

    if (savedStats) {
      const parsedStats: UserStats = JSON.parse(savedStats);
      
      // Streak logic
      let currentStreak = parsedStats.streak || 1;
      const lastActive = parsedStats.lastActiveDate;

      if (lastActive && lastActive !== todayStr) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastActive === yesterdayStr) {
          currentStreak += 1;
          // Trigger notification for daily streak increase!
          setActiveNotification({
            id: 'streak_' + Date.now(),
            type: 'xp_gain',
            title: `Sequência de ${currentStreak} Dias!`,
            message: 'Você entrou mais um dia consecutivo para manter o controle.',
          });
        } else {
          currentStreak = 1; // reset streak
        }
      }

      setStats({
        ...parsedStats,
        streak: currentStreak,
        lastActiveDate: todayStr,
      });
    } else {
      setStats({
        xp: 0,
        level: 1,
        streak: 1,
        lastActiveDate: todayStr,
        totalTasksCompleted: 0,
        totalFocusMinutes: 0,
        xpLogs: [{
          id: 'welcome',
          amount: 50,
          reason: 'Início da jornada Foco Gamificado!',
          timestamp: new Date().toISOString()
        }],
      });
      // Gift 50 start XP
      addXPDirectly(50, 'Início da jornada!');
    }
  }, []);

  // Save changes
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('focus_quest_tasks', JSON.stringify(tasks));
    } else {
      localStorage.removeItem('focus_quest_tasks');
    }
  }, [tasks]);

  useEffect(() => {
    if (achievements.length > 0) {
      localStorage.setItem('focus_quest_achievements', JSON.stringify(achievements));
    }
  }, [achievements]);

  useEffect(() => {
    if (stats.lastActiveDate) {
      localStorage.setItem('focus_quest_stats', JSON.stringify(stats));
    }
  }, [stats]);

  useEffect(() => {
    if (journalEntries.length > 0) {
      localStorage.setItem('focus_quest_journal', JSON.stringify(journalEntries));
    } else {
      localStorage.removeItem('focus_quest_journal');
    }
  }, [journalEntries]);

  useEffect(() => {
    if (longTermGoals.length > 0) {
      localStorage.setItem('focus_quest_long_term_goals', JSON.stringify(longTermGoals));
    } else {
      localStorage.removeItem('focus_quest_long_term_goals');
    }
  }, [longTermGoals]);

  // Helper helper to add XP directly in local memory
  const addXPDirectly = (amount: number, reason: string) => {
    setStats(prev => {
      let currentXP = prev.xp + amount;
      let currentLevel = prev.level;
      let levelUpOccurred = false;

      while (currentLevel < 150 && currentXP >= getXPForNextLevel(currentLevel)) {
        currentXP -= getXPForNextLevel(currentLevel);
        currentLevel += 1;
        levelUpOccurred = true;
      }

      const log: XPLog = {
        id: Math.random().toString(36).substring(2, 9),
        amount,
        reason,
        timestamp: new Date().toISOString()
      };

      if (levelUpOccurred) {
        setActiveNotification({
          id: 'lvl_up_' + Date.now(),
          type: 'level_up',
          title: `Subiu de Nível!`,
          message: `Parabéns! Você alcançou o Nível ${currentLevel}. Continue firme!`,
          value: currentLevel
        });
        setTriggerConfetti(c => c + 1);
        playLevelUpSound();
      }

      return {
        ...prev,
        xp: currentXP,
        level: currentLevel,
        xpLogs: [log, ...prev.xpLogs].slice(0, 50) // keep last 50 logs
      };
    });
  };

  // Add a task
  const addTask = useCallback((title: string, description: string, difficulty: Difficulty, category: TaskCategory, estimatedFocusPomodoros: number) => {
    const xpRewardMap: Record<Difficulty, number> = {
      easy: 40,
      medium: 80,
      hard: 150
    };

    const newTask: Task = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      description: description || undefined,
      difficulty,
      category,
      xpReward: xpRewardMap[difficulty],
      completed: false,
      createdAt: new Date().toISOString(),
      estimatedFocusPomodoros: estimatedFocusPomodoros || 1,
    };

    setTasks(prev => [newTask, ...prev]);
    return newTask;
  }, []);

  // Delete a task
  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  // Toggle task complete status and award XP
  const toggleTaskCompletion = useCallback((id: string) => {
    let completedTask: Task | null = null;
    
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const completed = !t.completed;
        completedTask = {
          ...t,
          completed,
          completedAt: completed ? new Date().toISOString() : undefined
        };
        return completedTask;
      }
      return t;
    }));

    // If completedTask was completed, award XP
    setTimeout(() => {
      if (completedTask && completedTask.completed) {
        const reward = completedTask.xpReward;
        playTaskCompleteSound();
        addXPDirectly(reward, `Concluiu a tarefa: "${completedTask.title}"`);
        
        // Celebrate completion
        setTriggerConfetti(c => c + 1);

        // Update statistics
        setStats(prev => {
          const totalTasks = prev.totalTasksCompleted + 1;
          
          // Check achievements dynamically based on task completion
          checkTaskAchievements(totalTasks);

          return {
            ...prev,
            totalTasksCompleted: totalTasks
          };
        });
      }
    }, 100);
  }, []);

  // Check achievements related to tasks
  const checkTaskAchievements = (totalTasks: number) => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Calculate tasks completed today
    setTasks(currentTasks => {
      const completedToday = currentTasks.filter(t => {
        if (!t.completed || !t.completedAt) return false;
        return t.completedAt.startsWith(todayStr);
      }).length + 1; // plus the one we are completing now

      setAchievements(prevAchievements => {
        return prevAchievements.map(ach => {
          if (ach.unlocked) return ach;

          let shouldUnlock = false;
          if (ach.conditionType === 'tasks') {
            if (ach.id === 'first_step' && totalTasks >= 1) shouldUnlock = true;
            if (ach.id === 'task_trio' && completedToday >= 3) shouldUnlock = true;
            if (ach.id === 'productivity_master' && totalTasks >= 25) shouldUnlock = true;
          }

          if (shouldUnlock) {
            // Award XP reward of achievement
            setTimeout(() => {
              addXPDirectly(ach.xpReward, `Conquista desbloqueada: "${ach.title}"`);
            }, 50);

            setActiveNotification({
              id: ach.id + '_' + Date.now(),
              type: 'achievement',
              title: `Conquista: ${ach.title}!`,
              message: ach.description,
            });

            playAchievementSound();

            return {
              ...ach,
              unlocked: true,
              unlockedAt: new Date().toISOString(),
            };
          }

          return ach;
        });
      });

      return currentTasks;
    });
  };

  // Add focus session minutes and check achievements
  const addJournalEntry = useCallback((note: string, mood: string, taskTitle?: string, focusMinutes?: number) => {
    const newEntry: JournalEntry = {
      id: Math.random().toString(36).substring(2, 9),
      note,
      mood,
      timestamp: new Date().toISOString(),
      taskTitle,
      focusMinutes
    };
    setJournalEntries(prev => [newEntry, ...prev]);
    return newEntry;
  }, []);

  const addFocusSession = useCallback((minutes: number) => {
    const xpReward = Math.round(minutes * 3); // 3 XP per focus minute

    addXPDirectly(xpReward, `Completou ${minutes} minutos de sessão de Foco`);

    setStats(prev => {
      const newFocusMinutes = prev.totalFocusMinutes + minutes;
      
      // Increment total count of focus sessions in localstorage or check achievements
      const totalSessions = parseInt(localStorage.getItem('focus_sessions_total_count') || '0', 10) + 1;
      localStorage.setItem('focus_sessions_total_count', totalSessions.toString());

      setAchievements(prevAchievements => {
        return prevAchievements.map(ach => {
          if (ach.unlocked) return ach;

          let shouldUnlock = false;
          if (ach.conditionType === 'focus') {
            if (ach.id === 'first_focus' && totalSessions >= 1) shouldUnlock = true;
            if (ach.id === 'focus_iron' && totalSessions >= 10) shouldUnlock = true;
          }

          if (shouldUnlock) {
            setTimeout(() => {
              addXPDirectly(ach.xpReward, `Conquista desbloqueada: "${ach.title}"`);
            }, 50);

            setActiveNotification({
              id: ach.id + '_' + Date.now(),
              type: 'achievement',
              title: `Conquista: ${ach.title}!`,
              message: ach.description,
            });

            playAchievementSound();

            return {
              ...ach,
              unlocked: true,
              unlockedAt: new Date().toISOString(),
            };
          }

          return ach;
        });
      });

      return {
        ...prev,
        totalFocusMinutes: newFocusMinutes,
      };
    });
  }, []);

  // Level listener to unlock achievements
  useEffect(() => {
    if (stats.level > 1) {
      setAchievements(prevAchievements => {
        return prevAchievements.map(ach => {
          if (ach.unlocked) return ach;

          let shouldUnlock = false;
          if (ach.conditionType === 'level') {
            if (stats.level >= ach.conditionValue) shouldUnlock = true;
          }
          if (ach.conditionType === 'streak') {
            if (stats.streak >= ach.conditionValue) shouldUnlock = true;
          }

          if (shouldUnlock) {
            setTimeout(() => {
              addXPDirectly(ach.xpReward, `Conquista desbloqueada: "${ach.title}"`);
            }, 50);

            setActiveNotification({
              id: ach.id + '_' + Date.now(),
              type: 'achievement',
              title: `Conquista: ${ach.title}!`,
              message: ach.description,
            });

            playAchievementSound();

            return {
              ...ach,
              unlocked: true,
              unlockedAt: new Date().toISOString(),
            };
          }

          return ach;
        });
      });
    }
  }, [stats.level, stats.streak]);

  const clearNotification = useCallback(() => {
    setActiveNotification(null);
  }, []);

  const deleteJournalEntry = useCallback((id: string) => {
    setJournalEntries(prev => prev.filter(entry => entry.id !== id));
  }, []);

  const addLongTermGoal = useCallback((title: string, description?: string, subtaskTitles: string[] = []) => {
    const newGoal: LongTermGoal = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      description,
      createdAt: new Date().toISOString(),
      completed: false,
      subtasks: subtaskTitles.map(t => ({
        id: Math.random().toString(36).substring(2, 9),
        title: t,
        completed: false
      }))
    };
    setLongTermGoals(prev => [newGoal, ...prev]);
    addXPDirectly(50, `Novo Objetivo: ${title}`);
  }, []);

  const addSubTaskToGoal = useCallback((goalId: string, title: string) => {
    setLongTermGoals(prev => prev.map(goal => {
      if (goal.id !== goalId) return goal;
      const newSub = {
        id: Math.random().toString(36).substring(2, 9),
        title,
        completed: false
      };
      const updatedSubtasks = [...goal.subtasks, newSub];
      return {
        ...goal,
        subtasks: updatedSubtasks,
        completed: false // adding a new subtask resets overall completion if it was true
      };
    }));
  }, []);

  const deleteLongTermGoal = useCallback((id: string) => {
    setLongTermGoals(prev => prev.filter(g => g.id !== id));
  }, []);

  const toggleSubTaskCompletion = useCallback((goalId: string, subtaskId: string) => {
    setLongTermGoals(prev => prev.map(goal => {
      if (goal.id !== goalId) return goal;

      const updatedSubtasks = goal.subtasks.map(sub => {
        if (sub.id !== subtaskId) return sub;
        const willBeCompleted = !sub.completed;
        
        // Reward XP on subtask completion
        if (willBeCompleted) {
          addXPDirectly(20, `Subtarefa concluída: ${sub.title}`);
        } else {
          addXPDirectly(-20, `Subtarefa reaberta: ${sub.title}`);
        }

        return {
          ...sub,
          completed: willBeCompleted,
          completedAt: willBeCompleted ? new Date().toISOString() : undefined
        };
      });

      const allCompleted = updatedSubtasks.length > 0 && updatedSubtasks.every(s => s.completed);
      
      // Reward extra XP for goal completion
      if (allCompleted && !goal.completed) {
        addXPDirectly(150, `🏆 META CONCLUÍDA: ${goal.title}!`);
      } else if (!allCompleted && goal.completed) {
        addXPDirectly(-150, `Reabertura da meta: ${goal.title}`);
      }

      return {
        ...goal,
        subtasks: updatedSubtasks,
        completed: allCompleted
      };
    }));
  }, []);

  // Utility reset function (for testing or restart)
  const resetAllData = useCallback(() => {
    setTasks([]);
    setAchievements(DEFAULT_ACHIEVEMENTS);
    setJournalEntries([]);
    setLongTermGoals([]);
    setStats({
      xp: 0,
      level: 1,
      streak: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      totalTasksCompleted: 0,
      totalFocusMinutes: 0,
      xpLogs: [{
        id: 'reset',
        amount: 50,
        reason: 'Recomeço da jornada!',
        timestamp: new Date().toISOString()
      }],
    });
    localStorage.removeItem('focus_quest_tasks');
    localStorage.removeItem('focus_quest_achievements');
    localStorage.removeItem('focus_quest_stats');
    localStorage.removeItem('focus_quest_journal');
    localStorage.removeItem('focus_quest_long_term_goals');
    localStorage.setItem('focus_sessions_total_count', '0');
    addXPDirectly(50, 'Recomeço da jornada!');
  }, []);

  return {
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
  };
}
