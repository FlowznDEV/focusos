// Custom Web Audio API Sound Synthesizer
// Clean, lightweight, professional sound effects matching the app's minimalist design

let globalSoundEnabled = true;

if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('focus_quest_sound_enabled');
  if (saved !== null) {
    globalSoundEnabled = saved === 'true';
  } else {
    // Sync with other local storage if it existed
    const timerSaved = localStorage.getItem('focus_quest_timer_sound_enabled');
    if (timerSaved !== null) {
      globalSoundEnabled = timerSaved === 'true';
    }
  }
}

export function isSoundEnabled(): boolean {
  return globalSoundEnabled;
}

export function setSoundEnabled(enabled: boolean) {
  globalSoundEnabled = enabled;
  if (typeof window !== 'undefined') {
    localStorage.setItem('focus_quest_sound_enabled', String(enabled));
  }
}

// Helper to play a tone with precise parameters
function playTone(
  ctx: AudioContext,
  freq: number,
  start: number,
  duration: number,
  type: OscillatorType,
  maxGain: number = 0.2
) {
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);

  gainNode.gain.setValueAtTime(maxGain, start);
  // Smoothly decay to silence
  gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(start);
  osc.stop(start + duration);
}

/**
 * Play a satisfying metallic coin clink & achievement chime when a task is completed.
 * Metallic double coin clink + ascending E Major sparkle resolution.
 */
export function playTaskCompleteSound() {
  if (!globalSoundEnabled) return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;
    
    // Coin Clink 1 (High metallic ring)
    playTone(ctx, 987.77, now, 0.15, 'triangle', 0.25);
    playTone(ctx, 1975.53, now + 0.04, 0.35, 'sine', 0.20);
    playTone(ctx, 2637.02, now + 0.08, 0.40, 'sine', 0.15);

    // Coin Clink 2 (Secondary high metallic clink)
    playTone(ctx, 1318.51, now + 0.12, 0.20, 'triangle', 0.25);
    playTone(ctx, 2637.02, now + 0.15, 0.45, 'sine', 0.22);
    playTone(ctx, 3135.96, now + 0.18, 0.50, 'sine', 0.18);

    // Achievement Resolution Chord (E Major Sparkle)
    playTone(ctx, 1318.51, now + 0.24, 0.6, 'sine', 0.12); // E6
    playTone(ctx, 1661.22, now + 0.28, 0.7, 'sine', 0.10); // G#6
    playTone(ctx, 1975.53, now + 0.32, 0.8, 'sine', 0.10); // B6
    playTone(ctx, 2637.02, now + 0.36, 1.0, 'sine', 0.08); // E7
  } catch (e) {
    console.error("Failed to play task complete sound:", e);
  }
}

/**
 * Play a celebratory upward chord progression on leveling up.
 * Rich major-seventh style futuristic chime.
 */
export function playLevelUpSound() {
  if (!globalSoundEnabled) return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;

    // Arpeggio leading into a bright chord
    // First notes (A Major-ish upward sequence)
    playTone(ctx, 440.00, now, 0.6, 'sine', 0.15);        // A4
    playTone(ctx, 554.37, now + 0.08, 0.6, 'sine', 0.15); // C#5
    playTone(ctx, 659.25, now + 0.16, 0.7, 'sine', 0.15); // E5
    playTone(ctx, 880.00, now + 0.24, 0.8, 'sine', 0.15); // A5

    // Second chord (B Major 7 / Triumphant shift)
    playTone(ctx, 493.88, now + 0.40, 0.8, 'sine', 0.12); // B4
    playTone(ctx, 622.25, now + 0.48, 0.8, 'sine', 0.12); // D#5
    playTone(ctx, 739.99, now + 0.56, 0.9, 'sine', 0.12); // F#5
    playTone(ctx, 987.77, now + 0.64, 1.0, 'sine', 0.10); // B5

    // High resolution Sparkle (Major 9 finale)
    playTone(ctx, 1109.73, now + 0.80, 1.2, 'sine', 0.08); // C#6
    playTone(ctx, 1318.51, now + 0.88, 1.4, 'sine', 0.06); // E6
    playTone(ctx, 1661.22, now + 0.96, 1.6, 'sine', 0.05); // G#6
    playTone(ctx, 2093.00, now + 1.04, 1.8, 'sine', 0.04); // C7
  } catch (e) {
    console.error("Failed to play level up sound:", e);
  }
}

/**
 * Play a sparkling sound for achievements unlocked.
 */
export function playAchievementSound() {
  if (!globalSoundEnabled) return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;

    // Fast, magical F Major chime sweep
    playTone(ctx, 698.46, now, 0.4, 'sine', 0.12);        // F5
    playTone(ctx, 880.00, now + 0.05, 0.5, 'sine', 0.12); // A5
    playTone(ctx, 1046.50, now + 0.10, 0.6, 'sine', 0.12); // C6
    playTone(ctx, 1396.91, now + 0.15, 0.8, 'sine', 0.10); // F6
    playTone(ctx, 1760.00, now + 0.20, 1.0, 'sine', 0.08); // A6
  } catch (e) {
    console.error("Failed to play achievement sound:", e);
  }
}

/**
 * Play a subtle, quiet pop/click sound for tactile search typing feedback.
 */
export function playTypeSound() {
  if (!globalSoundEnabled) return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1300, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.03);

    // Keep it extremely quiet so it is pleasant and not annoying
    gainNode.gain.setValueAtTime(0.012, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  } catch (e) {
    // Ignore audio errors during high frequency typing
  }
}

/**
 * Play a descending error / cancellation sound effect when a task is deleted
 * or a focus cycle is interrupted prematurely.
 */
export function playCancelSound() {
  if (!globalSoundEnabled) return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;

    // Soft downward buzz/thud for cancellation or task deletion
    playTone(ctx, 280, now, 0.1, 'sawtooth', 0.12);
    playTone(ctx, 200, now + 0.06, 0.12, 'sawtooth', 0.12);
    playTone(ctx, 130, now + 0.12, 0.2, 'triangle', 0.10);
  } catch (e) {
    console.error("Failed to play cancel sound:", e);
  }
}

export const playErrorSound = playCancelSound;

