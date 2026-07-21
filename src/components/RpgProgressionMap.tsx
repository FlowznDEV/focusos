import React, { useState } from 'react';
import { Trophy, Shield, Lock, CheckCircle, Flame, Star, Sparkles, Sword } from 'lucide-react';
import { playTypeSound } from '../lib/sound';

interface MapNode {
  id: number;
  name: string;
  requiredLevel: number;
  description: string;
  boss: string;
  icon: string;
  color: string;
  bgGradient: string;
  borderGlow: string;
}

const RPG_MAP_NODES: MapNode[] = [
  {
    id: 1,
    name: "Vale da Partida",
    requiredLevel: 1,
    description: "O início da sua jornada de foco. Onde as primeiras missões diárias nascem e a procrastinação começa a tremer.",
    boss: "Slime Preguiçoso",
    icon: "🌱",
    color: "text-emerald-400 border-emerald-500/20",
    bgGradient: "from-emerald-950/40 via-emerald-900/10 to-zinc-950",
    borderGlow: "group-hover:shadow-[0_0_15px_rgba(16,185,129,0.25)]"
  },
  {
    id: 2,
    name: "Floresta do Foco Inicial",
    requiredLevel: 3,
    description: "Um bosque denso onde as primeiras sessões Pomodoro são testadas. Cuidado com os gnomos das redes sociais!",
    boss: "Gnomo das Notificações",
    icon: "🌲",
    color: "text-teal-400 border-teal-500/20",
    bgGradient: "from-teal-950/40 via-teal-900/10 to-zinc-950",
    borderGlow: "group-hover:shadow-[0_0_15px_rgba(20,184,166,0.25)]"
  },
  {
    id: 3,
    name: "Montanhas da Rotina",
    requiredLevel: 5,
    description: "Onde o hábito diário é forjado no frio das altitudes. Subir aqui exige consistência diária inabalável.",
    boss: "Golem da Inércia",
    icon: "🏔️",
    color: "text-cyan-400 border-cyan-500/20",
    bgGradient: "from-cyan-950/40 via-cyan-900/10 to-zinc-950",
    borderGlow: "group-hover:shadow-[0_0_15px_rgba(6,182,212,0.25)]"
  },
  {
    id: 4,
    name: "Canyon da Alta Prioridade",
    requiredLevel: 7,
    description: "Um desfiladeiro perigoso onde apenas as tarefas urgentes e mais valiosas são concluídas com destreza.",
    boss: "Gargula da Urgência",
    icon: "⚡",
    color: "text-amber-400 border-amber-500/20",
    bgGradient: "from-amber-950/40 via-amber-900/10 to-zinc-950",
    borderGlow: "group-hover:shadow-[0_0_15px_rgba(245,158,11,0.25)]"
  },
  {
    id: 5,
    name: "Oásis do Modo Zen",
    requiredLevel: 10,
    description: "Um refúgio escondido de distração zero. Onde o silêncio reina e as abas do navegador estão trancadas a sete chaves.",
    boss: "Esfinge da Concentração",
    icon: "🏝️",
    color: "text-emerald-400 border-emerald-500/20",
    bgGradient: "from-emerald-950/40 via-emerald-900/10 to-zinc-950",
    borderGlow: "group-hover:shadow-[0_0_15px_rgba(16,185,129,0.25)]"
  },
  {
    id: 6,
    name: "Templo do Fluxo Profundo",
    requiredLevel: 12,
    description: "O santuário ancestral onde o lendário Estado de Flow é atingido. Mente, corpo e foco operam em perfeita sintonia.",
    boss: "Dragão do Caos Mental",
    icon: "⛩️",
    color: "text-fuchsia-400 border-fuchsia-500/20",
    bgGradient: "from-fuchsia-950/40 via-fuchsia-900/10 to-zinc-950",
    borderGlow: "group-hover:shadow-[0_0_15px_rgba(217,70,239,0.25)]"
  },
  {
    id: 7,
    name: "Pico do Mestre Mental",
    requiredLevel: 15,
    description: "O topo absoluto do mundo. Apenas lendas do foco conseguem meditar aqui, imunes a qualquer interrupção do universo.",
    boss: "Mestre Supremo do Tempo",
    icon: "👑",
    color: "text-rose-400 border-rose-500/20",
    bgGradient: "from-rose-950/40 via-rose-900/10 to-zinc-950",
    borderGlow: "group-hover:shadow-[0_0_15px_rgba(244,63,94,0.25)]"
  }
];

interface RpgProgressionMapProps {
  currentLevel: number;
}

export default function RpgProgressionMap({ currentLevel }: RpgProgressionMapProps) {
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(RPG_MAP_NODES[0]);

  // Determine current active node based on level
  // The player is at the highest node they qualify for
  const activeNodeIndex = [...RPG_MAP_NODES]
    .reverse()
    .find(node => currentLevel >= node.requiredLevel)?.id || 1;

  const handleNodeClick = (node: MapNode) => {
    setSelectedNode(node);
    playTypeSound();
  };

  return (
    <div id="rpg-progression-map-card" className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden flex flex-col">
      {/* Dynamic Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35" />

      {/* Header and Level display */}
      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-zinc-900">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center space-x-1.5 uppercase tracking-tight">
            <Sword className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Mapa da Jornada Mental RPG</span>
          </h4>
          <p className="text-[11px] text-zinc-500 mt-0.5">Desbloqueie novas terras mentais e derrote monstros da procrastinação ao subir de nível</p>
        </div>
        <div className="flex items-center space-x-2 bg-emerald-950/20 border border-emerald-500/20 rounded-xl px-3 py-1 text-xs text-emerald-400 font-bold shrink-0 font-mono">
          <Star className="w-3.5 h-3.5 fill-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>STATUS: NÍVEL {currentLevel}</span>
        </div>
      </div>

      {/* The RPG Winding Trail Container */}
      <div className="relative z-10 my-6 py-6 overflow-x-auto select-none no-scrollbar flex flex-col justify-center min-h-[220px]">
        
        {/* SVG connection path for desktop/tablet layout */}
        <div className="hidden md:block absolute left-10 right-10 top-1/2 -translate-y-1/2 h-1.5 z-0">
          <svg className="w-full h-12" viewBox="0 0 1000 100" fill="none" preserveAspectRatio="none">
            <path
              d="M 50,50 Q 200,10 350,50 T 650,50 T 950,50"
              stroke="#27272a"
              strokeWidth="4"
              strokeDasharray="8 8"
            />
            {/* Active connecting highlight */}
            <path
              d={`M 50,50 Q 200,10 350,50 T 650,50 T 950,50`}
              stroke="url(#rpg-trail-grad)"
              strokeWidth="4"
              strokeDasharray="6 6"
              className="animate-[dash_20s_linear_infinite]"
              style={{
                strokeDashoffset: -20,
                clipPath: `polygon(0 0, ${Math.min(100, (currentLevel / 15) * 100)}% 0, ${Math.min(100, (currentLevel / 15) * 100)}% 100%, 0 100%)`
              }}
            />
            <defs>
              <linearGradient id="rpg-trail-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Trail Nodes Flex Container */}
        <div className="flex items-center justify-between gap-6 md:gap-2 px-4 z-10 w-max md:w-full">
          {RPG_MAP_NODES.map((node, index) => {
            const isCompleted = currentLevel > node.requiredLevel;
            const isActive = currentLevel === node.requiredLevel || activeNodeIndex === node.id;
            const isLocked = currentLevel < node.requiredLevel;

            // Determine custom node layout heights to create a winding wave effect
            const waveTranslate = index % 2 === 0 ? 'md:-translate-y-3' : 'md:translate-y-3';

            return (
              <div
                key={node.id}
                className={`flex flex-col items-center relative transition-all duration-300 ${waveTranslate} group`}
              >
                {/* Node Button Circle */}
                <button
                  id={`rpg-node-btn-${node.id}`}
                  onClick={() => handleNodeClick(node)}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all relative cursor-pointer active:scale-95 ${
                    isCompleted
                      ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                      : isActive
                      ? 'bg-indigo-950/50 border-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] animate-pulse'
                      : 'bg-zinc-950 border-zinc-850 text-zinc-600'
                  }`}
                >
                  {/* Lock Indicator */}
                  {isLocked && (
                    <div className="absolute -top-1 -right-1 bg-zinc-900 border border-zinc-800 p-0.5 rounded-full text-zinc-500">
                      <Lock className="w-2.5 h-2.5" />
                    </div>
                  )}

                  {/* Completed Star Check Badge */}
                  {isCompleted && (
                    <div className="absolute -top-1 -right-1 bg-emerald-500 p-0.5 rounded-full text-zinc-950">
                      <CheckCircle className="w-2.5 h-2.5 fill-current" />
                    </div>
                  )}

                  {/* Node Icon/Emoji */}
                  <span className={`text-xl transition-transform group-hover:scale-125 duration-300 ${isLocked ? 'grayscale opacity-45' : ''}`}>
                    {node.icon}
                  </span>

                  {/* Player token overlay for current active location */}
                  {isActive && (
                    <span className="absolute -bottom-2.5 bg-indigo-500 text-[8px] text-white font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider font-mono animate-bounce shadow-md">
                      Você
                    </span>
                  )}
                </button>

                {/* Node Text */}
                <div className="text-center mt-3">
                  <span className={`block text-[10px] font-bold font-mono tracking-tight ${isLocked ? 'text-zinc-600' : 'text-zinc-300 group-hover:text-white transition-colors'}`}>
                    Fase {node.id}
                  </span>
                  <span className={`block text-[9px] uppercase tracking-wider font-extrabold ${isLocked ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    {node.name.split(' ')[0]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Node Details Lore Card */}
      {selectedNode && (
        <div className={`mt-2 bg-zinc-900/40 border rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-300 relative overflow-hidden bg-gradient-to-r ${selectedNode.bgGradient} border-zinc-850`}>
          <div className="space-y-1.5 flex-1 pr-2">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{selectedNode.icon}</span>
              <div>
                <h5 className="text-xs font-black uppercase text-white tracking-wider flex items-center space-x-1.5">
                  <span>Fase {selectedNode.id}: {selectedNode.name}</span>
                  {currentLevel >= selectedNode.requiredLevel ? (
                    <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-bold px-1.5 py-0.5 rounded-sm">CONQUISTADO</span>
                  ) : (
                    <span className="text-[9px] bg-zinc-900 border border-zinc-800 text-zinc-500 font-mono px-1.5 py-0.5 rounded-sm flex items-center gap-1">
                      <Lock className="w-2 h-2" /> REQUER NÍVEL {selectedNode.requiredLevel}
                    </span>
                  )}
                </h5>
                <span className="text-[10px] font-bold text-zinc-500 block">Monstro Protetor: <span className="text-zinc-400 font-semibold">{selectedNode.boss} 👾</span></span>
              </div>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed max-w-xl">{selectedNode.description}</p>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            {currentLevel >= selectedNode.requiredLevel ? (
              <div className="flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-4 py-2.5 rounded-xl font-bold w-full justify-center md:w-auto">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Território Seguro (+{selectedNode.requiredLevel * 100} XP Máximo)</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 bg-zinc-900/60 border border-zinc-800 text-zinc-500 text-xs px-4 py-2.5 rounded-xl font-semibold w-full justify-center md:w-auto">
                <Lock className="w-4 h-4" />
                <span>Bloqueado (Faltam {selectedNode.requiredLevel - currentLevel} Níveis)</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
