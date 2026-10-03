import React, { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, Shuffle } from "lucide-react";
import { personas } from "@/data/personas";
import { playAudioTone } from "@/lib/audio";

interface InteractiveDeckProps {
  soundEnabled: boolean;
  onSelectPersona?: (key: "career" | "creative" | "adventure") => void;
}

export const InteractiveDeck: React.FC<InteractiveDeckProps> = ({
  soundEnabled,
  onSelectPersona,
}) => {
  const [shuffleState, setShuffleState] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleShuffle = () => {
    playAudioTone("shuffle", soundEnabled);
    setShuffleState((prev) => prev + 1);
  };

  return (
    <div
      className="relative mx-auto flex h-[460px] w-full max-w-[620px] items-center justify-center sm:h-[540px] lg:h-[600px]"
      aria-label="Tumpukan tiga kartu persona interaktif SGE 2026"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Neo-Editorial Bento Circuit Texture Backdrop */}
      <div className="circuit-pattern-bg absolute left-1/2 top-1/2 size-[380px] sm:size-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 opacity-35 pointer-events-none" />
      <div className="absolute left-1/2 top-1/2 size-[310px] sm:size-[390px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[var(--SGEMustardGold)]/25 pointer-events-none" />
      <div className="absolute left-1/2 top-1/2 size-[250px] sm:size-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5 pointer-events-none" />

      {/* Editorial Registration Marks */}
      <div className="absolute top-4 left-6 text-[10px] font-mono tracking-widest text-[var(--SGECoralAqua)]/40 pointer-events-none select-none">
        ⌜ DECK.SGE.2026 // TR-01
      </div>
      <div className="absolute bottom-4 right-6 text-[10px] font-mono tracking-widest text-[var(--SGEMustardGold)]/40 pointer-events-none select-none">
        ARCHETYPE.SYSTEM // 03 ⌟
      </div>

      {/* CARD 1: Career (Left Fan) */}
      <motion.div
        key={`career-${shuffleState}`}
        className="deck-card left-1/2 top-1/2 z-[1] cursor-pointer"
        style={{ transformOrigin: "bottom center" }}
        initial={{ x: "-72%", y: "-46%", rotate: -20, scale: 0.94 }}
        animate={{
          x: isHovered ? "-82%" : "-72%",
          y: isHovered ? ["-48%", "-52%", "-48%"] : ["-46%", "-49%", "-46%"],
          rotate: isHovered ? -26 : -20,
          scale: isHovered ? 0.98 : 0.94,
        }}
        transition={{
          duration: 4.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        whileHover={{
          scale: 1.05,
          zIndex: 10,
          transition: { type: "spring", stiffness: 350, damping: 22 },
        }}
        whileTap={{ scale: 0.97 }}
        onClick={() => {
          playAudioTone("click", soundEnabled);
          onSelectPersona?.("career");
        }}
        title="Kartu Karier & Kepemimpinan"
      >
        <img src={personas.career.image} alt="Kartu Karier & Kepemimpinan" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#081113]/85 via-transparent to-transparent flex items-end p-3">
          <span className="rounded-md border border-[var(--SGEMustardGold)]/35 bg-[#081113]/85 px-2 py-0.5 text-[9px] font-bold tracking-wider text-[var(--SGEMustardGold)] uppercase backdrop-blur-sm">
            01 · Karier
          </span>
        </div>
      </motion.div>

      {/* CARD 2: Adventure (Right Fan) */}
      <motion.div
        key={`adventure-${shuffleState}`}
        className="deck-card left-1/2 top-1/2 z-[2] cursor-pointer"
        style={{ transformOrigin: "bottom center" }}
        initial={{ x: "-20%", y: "-45%", rotate: 18, scale: 0.94 }}
        animate={{
          x: isHovered ? "-10%" : "-20%",
          y: isHovered ? ["-47%", "-44%", "-47%"] : ["-45%", "-42%", "-45%"],
          rotate: isHovered ? 24 : 18,
          scale: isHovered ? 0.98 : 0.94,
        }}
        transition={{
          duration: 5.2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.6,
        }}
        whileHover={{
          scale: 1.05,
          zIndex: 10,
          transition: { type: "spring", stiffness: 350, damping: 22 },
        }}
        whileTap={{ scale: 0.97 }}
        onClick={() => {
          playAudioTone("click", soundEnabled);
          onSelectPersona?.("adventure");
        }}
        title="Kartu Petualangan & Batas Baru"
      >
        <img src={personas.adventure.image} alt="Kartu Petualangan & Batas Baru" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#081113]/85 via-transparent to-transparent flex items-end p-3">
          <span className="rounded-md border border-[var(--SGEPacificOcean)]/40 bg-[#081113]/85 px-2 py-0.5 text-[9px] font-bold tracking-wider text-[var(--SGECoralAqua)] uppercase backdrop-blur-sm">
            03 · Petualangan
          </span>
        </div>
      </motion.div>

      {/* CARD 3: Mascot Front / Creative (Center Stage) */}
      <motion.div
        key={`mascot-${shuffleState}`}
        className="deck-card left-1/2 top-1/2 z-[4] cursor-pointer shadow-[0_24px_70px_rgba(0,0,0,0.85)]"
        initial={{ x: "-50%", y: "-53%", rotate: 0, scale: 1 }}
        animate={{
          x: "-50%",
          y: ["-53%", "-57%", "-53%"],
          rotate: [0, 1.5, 0, -1.5, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.1,
        }}
        whileHover={{
          scale: 1.06,
          y: "-58%",
          transition: { type: "spring", stiffness: 350, damping: 22 },
        }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          playAudioTone("click", soundEnabled);
          onSelectPersona?.("creative");
        }}
        title="Maskot Guess Who Are You · SGE 2026"
      >
        <img src={personas.creative.frontImage} alt="Maskot Guess Who Are You" />
        <div className="hologram-foil absolute inset-0 opacity-40 hover:opacity-75 transition-opacity" />
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#081113]/85 border border-[var(--SGECoralAqua)]/40 text-[9px] font-bold text-[var(--SGECoralAqua)] backdrop-blur-sm">
          <Sparkles size={11} /> GUESS WHO
        </div>
      </motion.div>

      {/* Interactive Shuffle Trigger Badge */}
      <motion.button
        type="button"
        className="absolute bottom-2 left-1/2 z-10 -translate-x-1/2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#0F1E21]/95 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--SGEPapayaWhip)] backdrop-blur-xl shadow-lg hover:border-[var(--SGEMustardGold)] hover:text-white transition-colors cursor-pointer"
        whileHover={{
          scale: 1.05,
          y: -2,
          transition: { type: "spring", stiffness: 400, damping: 22 },
        }}
        whileTap={{ scale: 0.95 }}
        onClick={handleShuffle}
        title="Kocok tumpukan kartu"
      >
        <Shuffle size={13} className="text-[var(--SGECoralAqua)]" />
        <span>Kocok Kartu &nbsp;✦&nbsp; SGE 2026</span>
      </motion.button>
    </div>
  );
};
