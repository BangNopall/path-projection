export type ToneKind = "click" | "shuffle" | "reveal" | "hover";

/**
 * Generates synthetic pentatonic chimes and feedback sounds using native Web Audio API.
 * Requires no external audio assets and operates 100% client-side.
 */
export function playAudioTone(kind: ToneKind, enabled: boolean): void {
  if (!enabled || typeof window === "undefined") return;

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextClass) return;

    const context = new AudioContextClass();
    const now = context.currentTime;

    if (kind === "click") {
      // Crisp subtle tactile click
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.05);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      osc.connect(gain).connect(context.destination);
      osc.start(now);
      osc.stop(now + 0.06);
      window.setTimeout(() => void context.close(), 200);
      return;
    }

    if (kind === "hover") {
      // Soft ambient shimmer on hover
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(659.25, now); // E5

      gain.gain.setValueAtTime(0.015, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      osc.connect(gain).connect(context.destination);
      osc.start(now);
      osc.stop(now + 0.09);
      window.setTimeout(() => void context.close(), 300);
      return;
    }

    if (kind === "shuffle") {
      // Rapid soft card flutter sound
      const frequencies = [330, 440, 550, 660];
      frequencies.forEach((freq, idx) => {
        const osc = context.createOscillator();
        const gain = context.createGain();
        const startTime = now + idx * 0.04;

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.02, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.05);

        osc.connect(gain).connect(context.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.06);
      });
      window.setTimeout(() => void context.close(), 500);
      return;
    }

    if (kind === "reveal") {
      // Harmonious mystical pentatonic revelation chord [G4, C5, E5, G5, C6]
      const notes = [392.0, 523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        const osc = context.createOscillator();
        const gain = context.createGain();
        const noteStart = now + i * 0.12;

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.0001, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.08, noteStart + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.85);

        osc.connect(gain).connect(context.destination);
        osc.start(noteStart);
        osc.stop(noteStart + 0.9);
      });
      window.setTimeout(() => void context.close(), 2000);
    }
  } catch {
    // Audio is non-blocking and strictly enhancement
  }
}
