/**
 * Motion System Design Tokens — SGE FILKOM UB 2026
 * "Guess Who Are You" Booth Game
 *
 * Menjamin konsistensi ritme, kurva, dan fisika gerak di seluruh aplikasi.
 */

export const motionTokens = {
  duration: {
    instant: 0.1,
    rapid: 0.2,
    base: 0.35,
    extended: 0.5,
    hero: 0.7,
    cinematic: 1.2,
  },
  ease: {
    // Kurva emphasized signature SGE (editorial, presisi, berkarakter)
    emphasized: [0.16, 1, 0.3, 1] as const,
    // Kurva overshoot untuk mendaratnya kartu dan badge
    overshoot: [0.34, 1.56, 0.64, 1] as const,
    // Kurva deakselerasi halus untuk elemen keluar
    decelerate: [0.0, 0.0, 0.2, 1] as const,
    // Kurva akselerasi untuk elemen yang ditarik mundur
    accelerate: [0.4, 0.0, 1, 1] as const,
  },
  spring: {
    // Respons sentuhan tombol & kontrol mikro
    button: { stiffness: 400, damping: 22 },
    // Fisika mendaratnya kartu tarot 3D
    card: { stiffness: 340, damping: 24, mass: 0.8 },
    // Hover kartu di panggung seleksi
    cardHover: { stiffness: 350, damping: 22 },
    // Kemunculan kata teks kinetik
    text: { stiffness: 180, damping: 20 },
    // Transisi latar & ambient
    gentle: { stiffness: 200, damping: 28 },
  },
  gsapEase: {
    emphasized: "power3.out",
    smooth: "power2.inOut",
    impact: "back.out(1.6)",
    spinDecel: "expo.out",
    dramatic: "power4.out",
  },
} as const;

export type MotionTokens = typeof motionTokens;
