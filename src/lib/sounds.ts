/**
 * Sound effect utilities using Web Audio API.
 * Generates synthetic sounds without external audio files.
 */

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioContext;
  } catch {
    return null;
  }
}

/**
 * Plays a short synthetic "pop" sound effect.
 * Uses a sine wave frequency sweep from 800Hz to 200Hz over 100ms.
 * Wrapped in try/catch for browsers that block audio.
 */
export function playConfettiSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Resume context if suspended (autoplay policy)
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const now = ctx.currentTime;
    const duration = 0.1; // 100ms

    // Oscillator: sine wave with frequency sweep 800Hz → 200Hz
    const oscillator = ctx.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(800, now);
    oscillator.frequency.exponentialRampToValueAtTime(200, now + duration);

    // Gain envelope: quick attack, fast decay
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

    // Connect and play
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.start(now);
    oscillator.stop(now + duration);
  } catch {
    // Silently fail if audio is blocked
  }
}
