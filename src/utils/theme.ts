export type AccentTheme = 'orange' | 'blue' | 'green' | 'violet' | 'rose';

export interface ThemeOption {
  id: AccentTheme;
  name: string;
  tagline: string;
  previewHex: string;
  borderClass: string;
  textClass: string;
  bgClass: string;
  badgeClass: string;
  buttonClass: string;
  activeTabClass: string;
  glowShadow: string;
  xpGradient: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'orange',
    name: 'Laranja Neon',
    tagline: 'Cyberpunk Original FocusOS',
    previewHex: '#f97316',
    borderClass: 'border-orange-500/40',
    textClass: 'text-orange-400',
    bgClass: 'bg-orange-500/10',
    badgeClass: 'bg-orange-950/40 border-orange-500/30 text-orange-400',
    buttonClass: 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-500/20',
    activeTabClass: 'bg-orange-950/40 text-orange-400 border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.15)]',
    glowShadow: 'shadow-[0_0_20px_rgba(249,115,22,0.2)]',
    xpGradient: 'from-orange-600 via-orange-500 to-orange-400',
  },
  {
    id: 'blue',
    name: 'Azul Cyber',
    tagline: 'High-Tech Matrix & Ciano',
    previewHex: '#06b6d4',
    borderClass: 'border-cyan-500/40',
    textClass: 'text-cyan-400',
    bgClass: 'bg-cyan-500/10',
    badgeClass: 'bg-cyan-950/40 border-cyan-500/30 text-cyan-400',
    buttonClass: 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-500/20',
    activeTabClass: 'bg-cyan-950/40 text-cyan-400 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]',
    glowShadow: 'shadow-[0_0_20px_rgba(6,182,212,0.2)]',
    xpGradient: 'from-blue-600 via-cyan-500 to-sky-400',
  },
  {
    id: 'green',
    name: 'Verde Matrix',
    tagline: 'Bio Terminal & Esmeralda',
    previewHex: '#10b981',
    borderClass: 'border-emerald-500/40',
    textClass: 'text-emerald-400',
    bgClass: 'bg-emerald-500/10',
    badgeClass: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400',
    buttonClass: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20',
    activeTabClass: 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
    glowShadow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]',
    xpGradient: 'from-emerald-600 via-green-500 to-teal-400',
  },
  {
    id: 'violet',
    name: 'Violeta Neon',
    tagline: 'Synthwave & Horizon Roxo',
    previewHex: '#8b5cf6',
    borderClass: 'border-violet-500/40',
    textClass: 'text-violet-400',
    bgClass: 'bg-violet-500/10',
    badgeClass: 'bg-violet-950/40 border-violet-500/30 text-violet-400',
    buttonClass: 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-500/20',
    activeTabClass: 'bg-violet-950/40 text-violet-400 border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.15)]',
    glowShadow: 'shadow-[0_0_20px_rgba(139,92,246,0.2)]',
    xpGradient: 'from-purple-600 via-violet-500 to-indigo-400',
  },
  {
    id: 'rose',
    name: 'Rosa Synth',
    tagline: 'Cyber Rose & Neon Pink',
    previewHex: '#ec4899',
    borderClass: 'border-pink-500/40',
    textClass: 'text-pink-400',
    bgClass: 'bg-pink-500/10',
    badgeClass: 'bg-pink-950/40 border-pink-500/30 text-pink-400',
    buttonClass: 'bg-pink-600 hover:bg-pink-500 text-white shadow-pink-500/20',
    activeTabClass: 'bg-pink-950/40 text-pink-400 border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.15)]',
    glowShadow: 'shadow-[0_0_20px_rgba(236,72,153,0.2)]',
    xpGradient: 'from-rose-600 via-pink-500 to-fuchsia-400',
  }
];

export function getThemeConfig(themeId: AccentTheme): ThemeOption {
  return THEME_OPTIONS.find(t => t.id === themeId) || THEME_OPTIONS[0];
}
