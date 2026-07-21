export type Difficulty = 'easy' | 'medium' | 'hard';
export type TaskCategory = 'work' | 'study' | 'health' | 'organization' | 'creative';
export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  difficulty: Difficulty;
  category: TaskCategory;
  priority?: Priority;
  xpReward: number;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  dueDate?: string;
  estimatedFocusPomodoros: number; // 1 pomodoro = 15 or 25 mins
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: string;
  icon: string; // lucide icon name
  conditionType: 'tasks' | 'focus' | 'level' | 'streak' | 'custom';
  conditionValue: number;
}

export interface XPLog {
  id: string;
  amount: number;
  reason: string;
  timestamp: string;
}

export interface UserStats {
  xp: number;
  level: number;
  streak: number;
  lastActiveDate?: string; // YYYY-MM-DD
  totalTasksCompleted: number;
  totalFocusMinutes: number;
  xpLogs: XPLog[];
}

export interface AICoachResponse {
  motivationalMessage: string;
  suggestedFocusGoal: string;
  supportiveTagline: string;
}

export interface JournalEntry {
  id: string;
  note: string;
  mood: string;
  timestamp: string;
  taskTitle?: string;
  focusMinutes?: number;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
}

export interface LongTermGoal {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  completed: boolean;
  subtasks: SubTask[];
}
