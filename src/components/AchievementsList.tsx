import React, { useState } from 'react';
import { CheckCircle, Zap, Award, Clock, Shield, Star, Sparkles, Flame, Crown, CalendarDays, Lock, Eye, EyeOff } from 'lucide-react';
import { Achievement } from '../types';

interface AchievementsListProps {
  achievements: Achievement[];
}

const ICON_MAP: Record<string, any> = {
  CheckCircle,
  Zap,
  Award,
  Clock,
  Shield,
  Star,
  Sparkles,
  Flame,
  Crown,
  CalendarDays,
};

export default function AchievementsList({ achievements }: AchievementsListProps) {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const filteredAchievements = achievements.filter((ach) => {
    if (filter === 'unlocked') return ach.unlocked;
    if (filter === 'locked') return !ach.unlocked;
    return true;
  });

  return (
    <div id="achievements-section-container" className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-2 border-b border-zinc-850 gap-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight uppercase">Conquistas e Recompensas</h3>
          <p className="text-xs text-zinc-500">Complete desafios diários e de foco para desbloquear marcos históricos e subir de nível mais rápido</p>
        </div>
        <div className="mt-2 md:mt-0 bg-emerald-950/40 border border-emerald-900/40 text-emerald-400 text-xs font-bold py-1.5 px-3.5 rounded-full shrink-0 self-start md:self-center font-mono shadow-[0_0_10px_rgba(16,185,129,0.1)]">
          {achievements.filter(a => a.unlocked).length} / {achievements.length} Desbloqueadas
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap items-center gap-2 p-1 bg-zinc-950/60 border border-zinc-900 rounded-2xl w-fit">
        <button
          id="btn-filter-achievements-all"
          type="button"
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
            filter === 'all'
              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 font-extrabold shadow-[0_0_15px_rgba(16,185,129,0.12)]'
              : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
          }`}
        >
          <span>Todas ({achievements.length})</span>
        </button>
        <button
          id="btn-filter-achievements-unlocked"
          type="button"
          onClick={() => setFilter('unlocked')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center space-x-1.5 ${
            filter === 'unlocked'
              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 font-extrabold shadow-[0_0_15px_rgba(16,185,129,0.12)]'
              : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Desbloqueadas ({achievements.filter(a => a.unlocked).length})</span>
        </button>
        <button
          id="btn-filter-achievements-locked"
          type="button"
          onClick={() => setFilter('locked')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center space-x-1.5 ${
            filter === 'locked'
              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 font-extrabold shadow-[0_0_15px_rgba(16,185,129,0.12)]'
              : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Bloqueadas ({achievements.filter(a => !a.unlocked).length})</span>
        </button>
      </div>

      {filteredAchievements.length === 0 ? (
        <div className="py-12 text-center bg-zinc-950/20 border border-zinc-900 rounded-3xl">
          <p className="text-sm text-zinc-500">Nenhuma conquista encontrada neste filtro.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAchievements.map((ach) => {
            const IconComponent = ICON_MAP[ach.icon] || Award;
            
            return (
              <div
                id={`achievement-card-${ach.id}`}
                key={ach.id}
                className={`p-4 rounded-3xl flex items-center justify-between border transition-all duration-300 relative overflow-hidden group ${ach.unlocked ? 'border-emerald-900/50 bg-emerald-950/10 hover:border-emerald-700/60 shadow-[0_0_15px_rgba(16,185,129,0.05)]' : 'border-zinc-850 bg-zinc-950/30 opacity-70'}`}
              >
                
                {/* Symmetrical simple layout containing icon, description and lock status */}
                <div className="flex items-center space-x-4 pr-4">
                  
                  {/* Icon wrapper */}
                  <div className={`p-3 rounded-xl shrink-0 transition-transform duration-300 group-hover:scale-105 border ${ach.unlocked ? 'bg-emerald-950/40 border-emerald-900/40 text-emerald-400' : 'bg-zinc-900/60 border-zinc-850 text-zinc-600'}`}>
                    {ach.unlocked ? <IconComponent className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <h4 className={`text-sm font-bold ${ach.unlocked ? 'text-white' : 'text-zinc-500'}`}>
                        {ach.title}
                      </h4>
                      {ach.unlocked && (
                        <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-900/50 text-[9px] font-bold px-1.5 py-0.5 rounded-sm">
                          Concluído
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 leading-tight">
                      {ach.description}
                    </p>
                    {ach.unlocked && ach.unlockedAt && (
                      <span className="text-[10px] text-zinc-600 font-mono block">
                        Liberado em: {new Date(ach.unlockedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* XP reward badge */}
                <div className="text-right shrink-0">
                  <span className={`inline-block font-mono font-bold text-xs px-2.5 py-1 rounded-lg border ${ach.unlocked ? 'bg-emerald-950/60 text-emerald-400 border-emerald-900/50' : 'bg-zinc-900/50 text-zinc-600 border-zinc-850/50'}`}>
                    +{ach.xpReward} XP
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
