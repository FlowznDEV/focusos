import { Task, Achievement, UserStats, JournalEntry, LongTermGoal } from '../types';

export interface AppFullBackup {
  version: string;
  type: string;
  exportedAt: string;
  data: {
    tasks: Task[];
    achievements: Achievement[];
    stats: UserStats;
    journalEntries: JournalEntry[];
    longTermGoals: LongTermGoal[];
    session?: any;
    preferences?: {
      accentTheme?: string;
      nightMode?: boolean;
      soundEnabled?: boolean;
      zenMode?: boolean;
      premium?: boolean;
      planType?: string | null;
      firstUsedAt?: string;
      simulatedDays?: number;
      usedFunctions?: string[];
    };
  };
}

export const AUTO_BACKUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 Hours in ms

/**
 * Generates full JSON backup object from current app state & localStorage
 */
export function createBackupObject(
  tasks: Task[],
  achievements: Achievement[],
  stats: UserStats,
  journalEntries: JournalEntry[],
  longTermGoals: LongTermGoal[],
  session?: any,
  extraPreferences?: Record<string, any>
): AppFullBackup {
  return {
    version: "1.0",
    type: "FocusOS_Gamified_Backup",
    exportedAt: new Date().toISOString(),
    data: {
      tasks: tasks || [],
      achievements: achievements || [],
      stats: stats || {
        xp: 0,
        level: 1,
        streak: 1,
        totalTasksCompleted: 0,
        totalFocusMinutes: 0,
        xpLogs: []
      },
      journalEntries: journalEntries || [],
      longTermGoals: longTermGoals || [],
      session: session || null,
      preferences: {
        accentTheme: localStorage.getItem('focus_quest_accent_theme') || 'orange',
        nightMode: localStorage.getItem('focus_quest_night_mode') === 'true',
        soundEnabled: localStorage.getItem('focus_quest_sound_enabled') !== 'false',
        zenMode: localStorage.getItem('focus_quest_zen_mode') === 'true',
        premium: localStorage.getItem('focus_quest_premium') === 'true',
        planType: localStorage.getItem('focus_quest_plan_type') || null,
        firstUsedAt: localStorage.getItem('focus_quest_first_used_at') || new Date().toISOString(),
        simulatedDays: parseInt(localStorage.getItem('focus_quest_simulated_days') || '0', 10),
        usedFunctions: JSON.parse(localStorage.getItem('focus_quest_used_functions') || '[]'),
        ...extraPreferences
      }
    }
  };
}

/**
 * Triggers a browser file download for the JSON backup object
 */
export function triggerJsonDownload(backupObj: AppFullBackup, isAutoBackup: boolean = false) {
  const dateStr = new Date().toISOString().split('T')[0];
  const prefix = isAutoBackup ? 'focusos_autobackup_24h' : 'focusos_backup_manual';
  const fileName = `${prefix}_${dateStr}.json`;

  const jsonString = JSON.stringify(backupObj, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Validates and parses imported backup JSON content
 */
export function parseAndValidateBackup(jsonString: string): { success: boolean; data?: AppFullBackup; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);

    // Support both wrapped backup format (parsed.data.tasks) and direct object formats
    let backupData: AppFullBackup['data'];

    if (parsed.data && typeof parsed.data === 'object') {
      backupData = parsed.data;
    } else if (parsed.tasks || parsed.stats || parsed.achievements) {
      backupData = {
        tasks: parsed.tasks || [],
        achievements: parsed.achievements || [],
        stats: parsed.stats || { xp: 0, level: 1, streak: 1, totalTasksCompleted: 0, totalFocusMinutes: 0, xpLogs: [] },
        journalEntries: parsed.journalEntries || parsed.journal || [],
        longTermGoals: parsed.longTermGoals || parsed.goals || [],
        session: parsed.session || null,
        preferences: parsed.preferences || {}
      };
    } else {
      return {
        success: false,
        error: "O arquivo JSON selecionado não contém um formato de backup válido do FocusOS."
      };
    }

    const fullBackupObj: AppFullBackup = {
      version: parsed.version || "1.0",
      type: parsed.type || "FocusOS_Backup",
      exportedAt: parsed.exportedAt || new Date().toISOString(),
      data: backupData
    };

    return { success: true, data: fullBackupObj };
  } catch (err: any) {
    return {
      success: false,
      error: `Erro ao analisar o arquivo JSON: ${err.message || 'Sintaxe inválida'}`
    };
  }
}

/**
 * Checks if 24 hours have passed since last auto backup
 */
export function isAutoBackupDue(lastBackupTimestamp: number | null): boolean {
  if (!lastBackupTimestamp) return true;
  const now = Date.now();
  return (now - lastBackupTimestamp) >= AUTO_BACKUP_INTERVAL_MS;
}
