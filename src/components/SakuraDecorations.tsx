import React from 'react';

// Floating Sakura Petals overlay component
export function FallingSakuraPetals() {
  const petals = Array.from({ length: 18 });

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-20">
      {petals.map((_, i) => {
        const left = (i * 5.8 + 2) % 100;
        const duration = 8 + (i % 7) * 2;
        const delay = (i % 5) * 1.5;
        const size = 10 + (i % 4) * 4;
        const opacity = 0.35 + (i % 3) * 0.2;

        return (
          <div
            key={i}
            className="absolute animate-sakura-fall"
            style={{
              left: `${left}%`,
              top: `-30px`,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
              animationIterationCount: 'infinite',
              animationTimingFunction: 'linear',
            }}
          >
            <svg
              width={size}
              height={size * 1.3}
              viewBox="0 0 30 40"
              fill="none"
              style={{
                opacity,
                filter: 'drop-shadow(0px 2px 4px rgba(244, 114, 182, 0.3))',
              }}
            >
              {/* Petal shape */}
              <path
                d="M15 0 C22 10 30 20 20 35 C15 40 10 38 10 32 C5 25 0 15 15 0 Z"
                fill="url(#sakuraGradient)"
              />
            </svg>
          </div>
        );
      })}

      {/* Shared SVG Gradients */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="sakuraGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="60%" stopColor="#fb7185" />
            <stop offset="100%" stopColor="#fda4af" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// Japanese Sakura Tree SVG Header Branch
export function SakuraTreeBranch({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 300 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none ${className}`}
    >
      <defs>
        <linearGradient id="branchWood" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3f2e2b" />
          <stop offset="100%" stopColor="#1f1816" />
        </linearGradient>
        <radialGradient id="blossomGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f472b6" stopOpacity="0.9" />
          <stop offset="70%" stopColor="#fb7185" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#fda4af" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Main Wood Branch */}
      <path
        d="M300 10 C250 25, 200 15, 160 35 C120 55, 80 40, 30 70 M170 32 C140 15, 100 10, 70 20 M110 50 C90 70, 50 80, 10 95"
        stroke="url(#branchWood)"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Sakura Flowers Group */}
      {[
        { cx: 270, cy: 12, r: 12 },
        { cx: 240, cy: 22, r: 14 },
        { cx: 210, cy: 18, r: 10 },
        { cx: 180, cy: 30, r: 16 },
        { cx: 150, cy: 22, r: 12 },
        { cx: 130, cy: 45, r: 15 },
        { cx: 100, cy: 15, r: 11 },
        { cx: 80, cy: 38, r: 13 },
        { cx: 60, cy: 65, r: 14 },
        { cx: 35, cy: 72, r: 12 },
        { cx: 15, cy: 95, r: 10 },
      ].map((f, i) => (
        <g key={i}>
          {/* Petals */}
          <circle cx={f.cx} cy={f.cy} r={f.r * 1.2} fill="url(#blossomGlow)" />
          <path
            d={`M${f.cx} ${f.cy - f.r} C${f.cx + f.r} ${f.cy - f.r / 2}, ${f.cx + f.r} ${f.cy + f.r / 2}, ${f.cx} ${f.cy + f.r} C${f.cx - f.r} ${f.cy + f.r / 2}, ${f.cx - f.r} ${f.cy - f.r / 2}, ${f.cx} ${f.cy - f.r} Z`}
            fill="#f472b6"
            opacity="0.85"
          />
          <circle cx={f.cx} cy={f.cy} r={f.r * 0.3} fill="#fff1f2" />
        </g>
      ))}
    </svg>
  );
}

// Japanese Torii Gate Icon / Silhouette
export function ToriiGateIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor">
      <path
        d="M2 5C8 3 16 3 22 5M4 8H20M7 8V21M17 8V21M10 8V12M14 8V12M10 12H14"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Japanese HUD Corner Brackets Ornament
export function JapaneseHudBracket() {
  return (
    <div className="flex items-center space-x-1.5 text-[10px] font-mono text-pink-400/80 tracking-widest uppercase">
      <span className="text-pink-500 font-bold">⛩️</span>
      <span className="text-zinc-500">[</span>
      <span className="text-rose-300 font-extrabold">桜 SAKURA HUD</span>
      <span className="text-zinc-500">]</span>
    </div>
  );
}
