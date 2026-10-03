export type ToneKind =
  "click" | "shuffle" | "reveal" | "hover" | "lockon" | "whoosh" | "impact" | "shimmer" | "tick";

let sharedAudioContext: AudioContext | null = null;

/**
 * Mengambil atau menginisialisasi AudioContext bersama (singleton).
 * Didesain lazy dan aman untuk server-side rendering (SSR Nitro).
 */
export function getSharedAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextClass) return null;

  // Di lingkungan test (jsdom), pastikan membuat context baru jika mock diganti di beforeEach
  const isTestEnv =
    typeof process !== "undefined" &&
    (process.env?.["NODE_ENV"] === "test" ||
      (import.meta as { env?: { MODE?: string } }).env?.MODE === "test");

  if (!sharedAudioContext || sharedAudioContext.state === "closed" || isTestEnv) {
    try {
      sharedAudioContext = new AudioContextClass();
    } catch {
      return null;
    }
  }

  if (sharedAudioContext.state === "suspended") {
    void sharedAudioContext.resume().catch(() => {});
  }

  return sharedAudioContext;
}

// Inisialisasi resume otomatis pada gesture pertama pengguna (kebijakan WebKit / iOS)
if (typeof window !== "undefined") {
  const handleUserGesture = () => {
    const ctx = getSharedAudioContext();
    if (ctx && ctx.state === "suspended") {
      void ctx.resume().catch(() => {});
    }
  };
  window.addEventListener("pointerdown", handleUserGesture, { passive: true });
  window.addEventListener("keydown", handleUserGesture, { passive: true });
  window.addEventListener("touchstart", handleUserGesture, { passive: true });
}

/**
 * Menghasilkan nada feedback sintetis menggunakan Web Audio API murni.
 * Tanpa file aset audio eksternal dan beroperasi 100% di sisi klien.
 */
export function playAudioTone(kind: ToneKind, enabled: boolean): void {
  if (!enabled || typeof window === "undefined") return;

  try {
    const context = getSharedAudioContext();
    if (!context) return;

    const now = context.currentTime;

    if (kind === "click") {
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
      return;
    }

    if (kind === "hover") {
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(659.25, now); // E5

      gain.gain.setValueAtTime(0.015, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      osc.connect(gain).connect(context.destination);
      osc.start(now);
      osc.stop(now + 0.09);
      return;
    }

    if (kind === "shuffle") {
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
      return;
    }

    if (kind === "reveal") {
      // Akord pentatonik harmoni [G4, C5, E5, G5, C6]
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
      return;
    }

    if (kind === "lockon") {
      // Nada kunci konfirmasi teknologi tinggi: dua pip cepat naik (784Hz -> 1046Hz)
      const pips = [783.99, 1046.5];
      pips.forEach((freq, idx) => {
        const osc = context.createOscillator();
        const gain = context.createGain();
        const start = now + idx * 0.07;

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.06, start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.06);

        osc.connect(gain).connect(context.destination);
        osc.start(start);
        osc.stop(start + 0.07);
      });
      return;
    }

    if (kind === "whoosh") {
      // Sapuan udara cepat: frekuensi meluncur turun (220Hz -> 65Hz)
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(65, now + 0.28);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.04, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

      osc.connect(gain).connect(context.destination);
      osc.start(now);
      osc.stop(now + 0.32);
      return;
    }

    if (kind === "impact") {
      // Dentuman bass mendarat: frekuensi sub-bass menurun (140Hz -> 36Hz)
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(36, now + 0.35);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

      osc.connect(gain).connect(context.destination);
      osc.start(now);
      osc.stop(now + 0.42);
      return;
    }

    if (kind === "shimmer") {
      // Kilau nada kosmik: akord cepat arpeggio tinggi [880, 1174, 1318, 1760]
      const notes = [880, 1174.66, 1318.51, 1760];
      notes.forEach((freq, idx) => {
        const osc = context.createOscillator();
        const gain = context.createGain();
        const start = now + idx * 0.05;

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.linearRampToValueAtTime(0.03, start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);

        osc.connect(gain).connect(context.destination);
        osc.start(start);
        osc.stop(start + 0.38);
      });
      return;
    }

    if (kind === "tick") {
      // Klik mekanis mikro
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1200, now);

      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

      osc.connect(gain).connect(context.destination);
      osc.start(now);
      osc.stop(now + 0.02);
      return;
    }
  } catch {
    // Web Audio adalah enhancement murni dan tidak pernah melempar unhandled error
  }
}
