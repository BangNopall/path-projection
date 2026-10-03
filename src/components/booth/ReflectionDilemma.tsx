import React from "react";
import { motion } from "motion/react";
import { Camera, ArrowLeft, Sparkles, HelpCircle } from "lucide-react";
import { personas, personaKeys, type PersonaKey } from "@/data/personas";
import { TarotCard3D } from "./TarotCard3D";
import { Button } from "@/components/ui/button";
import { playAudioTone } from "@/lib/audio";
import { useUnifiedReducedMotion } from "@/lib/motion/use-reduced-motion-unified";
import { useQualityTier } from "@/lib/motion/tiers";

interface ReflectionDilemmaProps {
  soundEnabled: boolean;
  onSelectPersona: (key: PersonaKey) => void;
  onOpenScanner: () => void;
  onBack: () => void;
}

export const ReflectionDilemma: React.FC<ReflectionDilemmaProps> = ({
  soundEnabled,
  onSelectPersona,
  onOpenScanner,
  onBack,
}) => {
  const shouldReduceMotion = useUnifiedReducedMotion();
  const { tier } = useQualityTier();

  return (
    <motion.section
      key="dilemma"
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -16 }}
      transition={{ duration: shouldReduceMotion ? 0.05 : 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto flex w-full max-w-6xl flex-1 flex-col py-6 sm:py-10"
    >
      {/* Top Navigation & Breadcrumbs */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <motion.div whileHover={{ x: -3 }} whileTap={{ scale: 0.97 }} className="inline-block">
            <Button
              variant="ghost"
              size="sm"
              className="mb-3 -ml-3 text-[var(--SGEPapayaWhip)]/80 hover:text-white cursor-pointer"
              onClick={() => {
                playAudioTone("click", soundEnabled);
                onBack();
              }}
            >
              <ArrowLeft className="mr-1 size-4" /> Kembali
            </Button>
          </motion.div>

          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--SGECoralAqua)]">
            <Sparkles size={13} />
            <span>Tahap 01 · Dilema Refleksi</span>
          </div>
        </div>

        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Button
            variant="outline"
            size="sm"
            className="border-[var(--SGECoralAqua)]/40 bg-[var(--card)]/60 text-[var(--SGECoralAqua)] hover:bg-[var(--SGECoralAqua)]/15 cursor-pointer shadow-sm"
            onClick={() => {
              playAudioTone("click", soundEnabled);
              onOpenScanner();
            }}
          >
            <Camera className="mr-2 size-4" />
            Gunakan Kamera Scanner
          </Button>
        </motion.div>
      </div>

      {/* Dilemma Prompt Card / Bento Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="neo-bento-card circuit-pattern-bg relative mb-8 overflow-hidden border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-lg"
      >
        <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-[var(--SGEMustardGold)]/10 to-transparent pointer-events-none" />
        <div className="flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--SGEMustardGold)]/15 text-[var(--SGEMustardGold)] border border-[var(--SGEMustardGold)]/30 shadow-sm">
            <HelpCircle size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--SGEMustardGold)]">
                Pertanyaan Pemantik Masa Depan
              </span>
            </div>
            <h1 className="mt-2 font-display text-xl sm:text-3xl lg:text-4xl font-bold leading-snug text-white">
              “Jika kamu hanya diizinkan membawa{" "}
              <span className="text-[var(--SGECoralAqua)]">satu hal</span> ini ke masa depanmu, mana
              yang akan kamu pilih?”
            </h1>
            <p className="mt-3 text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed max-w-2xl">
              Pilih satu kartu di bawah ini untuk membuka pesan refleksi takdirmu.
            </p>
          </div>
        </div>
      </motion.div>

      {/* 3-Card Bento Table Spread with Staggered Entrance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 my-auto items-stretch">
        {personaKeys.map((key, index) => {
          const item = personas[key];
          const badgeAccent =
            item.key === "career"
              ? "text-[var(--SGEMustardGold)] border-[var(--SGEMustardGold)]/30 bg-[var(--SGEMustardGold)]/10"
              : item.key === "creative"
                ? "text-[var(--SGECoralAqua)] border-[var(--SGECoralAqua)]/30 bg-[var(--SGECoralAqua)]/10"
                : "text-[var(--SGECoralAqua)] border-[var(--SGEPacificOcean)]/40 bg-[var(--SGEPacificOcean)]/15";

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                shouldReduceMotion
                  ? { duration: 0.05 }
                  : {
                      duration: 0.5,
                      delay: 0.15 + index * 0.1,
                      ease: [0.16, 1, 0.3, 1],
                    }
              }
              whileHover={{
                y: -8,
                scale: 1.018,
                transition: { type: "spring", stiffness: 350, damping: 22 },
              }}
              whileTap={{ scale: 0.99 }}
              className="neo-bento-card stamp-border flex flex-col p-5 sm:p-6 backdrop-blur-xl shadow-lg transition-shadow hover:shadow-[0_16px_40px_rgba(0,0,0,0.6)]"
            >
              {/* Card Thumbnail 3D Preview */}
              <div className="mx-auto w-full max-w-[210px] mb-5">
                <TarotCard3D
                  frontImage={item.frontImage}
                  backImage={item.image}
                  isFlipped={true}
                  altText={`Kartu ${item.short}`}
                  accentColor={item.accentColor}
                  soundEnabled={soundEnabled}
                  interactiveTilt={!shouldReduceMotion && tier !== "low"}
                  onClick={() => {
                    playAudioTone("click", soundEnabled);
                    onSelectPersona(key);
                  }}
                />
              </div>

              {/* Persona Metadata & Trigger */}
              <div className="flex-1 flex flex-col justify-between text-center mt-2">
                <div>
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm ${badgeAccent}`}
                  >
                    <span>{item.icon}</span>
                    <span>NO. {item.number}</span>
                  </div>

                  <div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-[var(--SGEPapayaWhip)]/60">
                    EDITION 2026 // SGE-0{item.number}
                  </div>

                  <h3 className="mt-2 font-display text-xl font-bold text-white">{item.short}</h3>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)] leading-relaxed">
                    {item.subtitle}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-white/10">
                  <motion.div whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      variant="luminous"
                      className="w-full h-11 text-xs font-bold tracking-wider uppercase shadow-md cursor-pointer"
                      onClick={() => {
                        playAudioTone("click", soundEnabled);
                        onSelectPersona(key);
                      }}
                    >
                      Pilih Nilai Ini
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 text-center text-xs text-[var(--muted-foreground)] tracking-wide">
        “Setiap pilihan hari ini adalah cermin prioritas yang membentuk langkahmu di FILKOM UB.”
      </div>
    </motion.section>
  );
};
