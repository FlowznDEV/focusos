import React from 'react';
import { X, Palette, Volume2, VolumeX, Moon, Sun, Shield, Sparkles, Check, RefreshCw, Leaf, Sliders } from 'lucide-react';
import { AccentTheme, THEME_OPTIONS } from '../utils/theme';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  accentTheme: AccentTheme;
  onSelectTheme: (theme: AccentTheme) => void;
  isNight: boolean;
  onToggleNight: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  zenMode: boolean;
  onToggleZen: () => void;
  premium: boolean;
  daysOfUse: number;
  completedTasksCount?: number;
  onOpenPremiumModal: () => void;
  onResetJourney: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  accentTheme,
  onSelectTheme,
  isNight,
  onToggleNight,
  soundEnabled,
  onToggleSound,
  zenMode,
  onToggleZen,
  premium,
  daysOfUse,
  completedTasksCount = 0,
  onOpenPremiumModal,
  onResetJourney,
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-zinc-950/90 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-hidden">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl relative flex flex-col my-auto max-h-[84vh] overflow-hidden animate-pop-in">
        {/* Top Glow Bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500 via-cyan-400 to-purple-500" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-5 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-2xl text-orange-400 shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">
                // CONFIGURAÇÕES DO SISTEMA
              </span>
              <h3 className="text-base font-black text-white uppercase tracking-tight">
                Personalizar HUD & Preferências
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-500 hover:text-white transition-colors rounded-xl hover:bg-zinc-900 cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          {/* SECTION 1: SELETOR DE TEMAS (CORES DE DESTAQUE) */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Palette className="w-4 h-4 text-orange-400" />
              <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">
                Cor de Destaque do HUD
              </h4>
            </div>
            <p className="text-xs text-zinc-400 mb-3.5">
              Escolha o tema de iluminação neon para transformar o visual de todas as telas e painéis do aplicativo.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {THEME_OPTIONS.map((theme) => {
                const isSelected = accentTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => onSelectTheme(theme.id)}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer relative overflow-hidden group ${
                      isSelected
                        ? `${theme.badgeClass} ring-1 ring-white/20 shadow-lg`
                        : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {/* Theme Preview Color Swatch Circle */}
                      <div
                        className="w-7 h-7 rounded-full shrink-0 border border-white/20 flex items-center justify-center shadow-md transition-transform group-hover:scale-110"
                        style={{ backgroundColor: theme.previewHex }}
                      >
                        {isSelected && <Check className="w-4 h-4 text-zinc-950 stroke-[3]" />}
                      </div>

                      <div>
                        <span className="text-xs font-black text-white block uppercase tracking-tight">
                          {theme.name}
                        </span>
                        <span className="text-[10px] text-zinc-400 block font-mono">
                          {theme.tagline}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 uppercase tracking-widest text-white border border-white/20 shrink-0">
                        Ativo
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: MODO NOTURNO & SOM */}
          <div className="border-t border-zinc-900 pt-5">
            <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono mb-3.5 flex items-center space-x-2">
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Visual & Áudio</span>
            </h4>

            <div className="space-y-2.5">
              {/* Day/Night Filter */}
              <div className="bg-zinc-900/40 border border-zinc-850 p-3.5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-xl border ${isNight ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-400' : 'bg-amber-950/40 border-amber-500/30 text-amber-400'}`}>
                    {isNight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Filtro Noturno de Tela</span>
                    <span className="text-[10px] text-zinc-400 font-mono">Ajusta o contraste para descanso ocular</span>
                  </div>
                </div>
                <button
                  onClick={onToggleNight}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider border transition-all cursor-pointer ${
                    isNight
                      ? 'bg-indigo-600 text-white border-indigo-400'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'
                  }`}
                >
                  {isNight ? 'Ativado' : 'Desativado'}
                </button>
              </div>

              {/* Sound Effects Toggle */}
              <div className="bg-zinc-900/40 border border-zinc-850 p-3.5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-xl border ${soundEnabled ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}>
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Efeitos Sonoros</span>
                    <span className="text-[10px] text-zinc-400 font-mono">Sons de digitação e conclusão de missões</span>
                  </div>
                </div>
                <button
                  onClick={onToggleSound}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider border transition-all cursor-pointer ${
                    soundEnabled
                      ? 'bg-emerald-600 text-white border-emerald-400'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'
                  }`}
                >
                  {soundEnabled ? 'Ativado' : 'Mudo'}
                </button>
              </div>

              {/* Zen Mode Toggle */}
              <div className="bg-zinc-900/40 border border-zinc-850 p-3.5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-xl border ${zenMode ? 'bg-zinc-800 border-zinc-600 text-white' : 'bg-zinc-800/60 border-zinc-750 text-zinc-500'}`}>
                    <Leaf className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Modo Zen (Foco Limpo)</span>
                    <span className="text-[10px] text-zinc-400 font-mono">Oculta contadores e navegação extra</span>
                  </div>
                </div>
                <button
                  onClick={onToggleZen}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider border transition-all cursor-pointer ${
                    zenMode
                      ? 'bg-zinc-700 text-white border-zinc-500'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'
                  }`}
                >
                  {zenMode ? 'Ativo' : 'Normal'}
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 3: PLANO & PERÍODO DE TESTE */}
          <div className="border-t border-zinc-900 pt-5">
            <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono mb-3.5 flex items-center space-x-2">
              <Shield className="w-4 h-4 text-orange-400" />
              <span>Status da Conta & Licença</span>
            </h4>

            <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className={`p-2 rounded-xl ${premium ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-zinc-800 text-zinc-400'}`}>
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-white uppercase block">
                      {premium ? 'Plano Premium Ativo' : 'Período Gratuito de Teste'}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      Dias: {daysOfUse} | Tarefas concluídas: {completedTasksCount}/5
                    </span>
                  </div>
                </div>

                {!premium && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenPremiumModal();
                    }}
                    className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-black text-[10px] px-3 py-2 rounded-xl uppercase tracking-wider shadow-md cursor-pointer shrink-0"
                  >
                    Assinar Premium
                  </button>
                )}
              </div>

              {!premium && (daysOfUse >= 1 || completedTasksCount >= 5) && (
                <div className="bg-amber-950/40 border border-amber-500/40 p-2.5 rounded-xl text-[10.5px] text-amber-200 font-mono flex items-center space-x-2">
                  <span className="text-amber-400 font-bold shrink-0">⚠️</span>
                  <span>O teste grátis terminou (1 dia de uso ou 5 tarefas concluídas). Assine o Premium para acesso ilimitado.</span>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 4: RESET JOURNEY */}
          <div className="border-t border-zinc-900 pt-5 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-zinc-300 block">Reiniciar Progresso</span>
                <span className="text-[10px] text-zinc-500 font-mono">Apaga tarefas e recomeça do nível 1</span>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onResetJourney();
                }}
                className="bg-red-950/30 hover:bg-red-900/50 border border-red-500/30 hover:border-red-500/60 text-red-400 font-bold text-[10px] px-3 py-2 rounded-xl font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Resetar RPG</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
