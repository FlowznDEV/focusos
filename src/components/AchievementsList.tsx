import { CheckCircle, Zap, Award, Clock, Shield, Star, Sparkles, Flame, Crown, CalendarDays, Lock } from 'lucide-react';
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
  return (
    <div id="achievements-section-container" className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-2 border-b border-zinc-850">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight uppercase">Conquistas e Recompensas</h3>
          <p className="text-xs text-zinc-500">Complete desafios diários e de foco para desbloquear marcos históricos e subir de nível mais rápido</p>
        </div>
        <div className="mt-2 md:mt-0 bg-indigo-950/60 border border-indigo-900/60 text-indigo-400 text-xs font-bold py-1.5 px-3.5 rounded-full shrink-0 self-start md:self-center font-mono">
          {achievements.filter(a => a.unlocked).length} / {achievements.length} Desbloqueadas
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((ach) => {
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
    </div>
  );
}
