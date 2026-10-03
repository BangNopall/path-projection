import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  Check,
  FastForward,
  RotateCcw,
  ScanLine,
  Settings2,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  personas,
  type PersonaKey,
  getRandomQuote,
  getRandomFutureProjection,
} from "@/data/personas";
import { InteractiveDeck } from "@/components/booth/InteractiveDeck";
import { ReflectionDilemma } from "@/components/booth/ReflectionDilemma";
import { ScannerHUD } from "@/components/booth/ScannerHUD";
import { CinematicReveal } from "@/components/booth/reveal/CinematicReveal";
import { playAudioTone } from "@/lib/audio";

type Screen = "home" | "dilemma" | "scan" | "reveal";

const MODEL_STORAGE_KEY = "sge-teachable-machine-model";
const DEFAULT_MODEL_URL = "https://teachablemachine.withgoogle.com/models/_ig3wD9VH/";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Guess Who Are You — SGE FILKOM UB 2026" },
      {
        name: "description",
        content:
          "Permainan kartu persona ala tarot reading untuk memproyeksikan karakter masa depan di booth SGE FILKOM UB 2026.",
      },
      { property: "og:title", content: "Guess Who Are You — SGE FILKOM UB 2026" },
      {
        property: "og:description",
        content:
          "Satu pilihan, banyak kemungkinan. Temukan persona masa depanmu di booth SGE FILKOM UB 2026.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Game,
});

function Game() {
  const [screen, setScreen] = useState<Screen>("home");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [modelUrl, setModelUrl] = useState(DEFAULT_MODEL_URL);
  const [sound, setSound] = useState(true);
  const [selected, setSelected] = useState<PersonaKey>("career");
  const [currentProjection, setCurrentProjection] = useState("");
  const [currentReflection, setCurrentReflection] = useState("");
  const [isRevealSkipped, setIsRevealSkipped] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const soundRef = useRef(sound);
  soundRef.current = sound;

  const lastProjectionIndexRef = useRef<Record<PersonaKey, number | undefined>>({
    career: undefined,
    creative: undefined,
    adventure: undefined,
  });

  const lastReflectionRef = useRef<Record<PersonaKey, string | undefined>>({
    career: undefined,
    creative: undefined,
    adventure: undefined,
  });

  const persona = personas[selected];

  // Initialize settings
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem(MODEL_STORAGE_KEY);
      if (saved) setModelUrl(saved);
    }
  }, []);

  // Persona card selected handler with dynamic non-repeating projection & reflection
  const handleSelectPersona = useCallback((key: PersonaKey) => {
    setSelected(key);
    setIsRevealSkipped(false);

    // Draw random 10-year projection with zero immediate repetition
    const lastProjIdx = lastProjectionIndexRef.current[key];
    const { projection, index: projIdx } = getRandomFutureProjection(key, lastProjIdx);
    lastProjectionIndexRef.current[key] = projIdx;
    setCurrentProjection(projection);

    // Draw random campus reflection quote with zero immediate repetition
    const pool = personas[key].quotes;
    const prevQuote = lastReflectionRef.current[key];
    const prevQuoteIdx = prevQuote ? pool.indexOf(prevQuote) : -1;
    const quote = getRandomQuote(key, prevQuoteIdx >= 0 ? prevQuoteIdx : undefined);
    lastReflectionRef.current[key] = quote;
    setCurrentReflection(quote);

    playAudioTone("reveal", soundRef.current);
    setScreen("reveal");
  }, []);

  const handleReset = () => {
    playAudioTone("click", sound);
    setIsRevealSkipped(false);
    setScreen("home");
  };

  return (
    <div className="app-canvas relative min-h-screen text-foreground selection:bg-[var(--SGECoralAqua)]/30">
      {/* Background Ambience */}
      <div className="ambient-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-[var(--SGECoralAqua)]/40 to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1440px] flex-col px-5 sm:px-9 lg:px-16">
        {/* Global Navigation Header */}
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center border-b border-[var(--border)] py-4 sm:py-5">
          <div
            className="flex min-w-0 items-center gap-3 sm:gap-4 cursor-pointer"
            onClick={handleReset}
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[var(--SGECoralAqua)]/30 bg-[var(--SGECoralAqua)]/10 text-[var(--SGECoralAqua)] shadow-sm">
              <Sparkles size={20} />
            </div>
            <div className="min-w-0">
              <div className="truncate font-display text-base sm:text-lg font-bold tracking-tight text-white">
                GUESS <span className="text-[var(--SGECoralAqua)]">WHO</span> ARE YOU
                <span className="text-[var(--SGEMustardGold)]">.</span>
              </div>
              <div className="truncate text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--SGEPapayaWhip)]/80">
                SGE FILKOM UB · 2026
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="size-9 rounded-xl text-[var(--muted-foreground)] hover:text-white"
              aria-label={sound ? "Matikan suara" : "Nyalakan suara"}
              title={sound ? "Matikan suara" : "Nyalakan suara"}
              onClick={() => {
                const next = !sound;
                setSound(next);
                playAudioTone("click", next);
              }}
            >
              {sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="size-9 rounded-xl text-[var(--muted-foreground)] hover:text-white"
              aria-label="Pengaturan scanner"
              title="Pengaturan scanner"
              onClick={() => {
                playAudioTone("click", sound);
                setSettingsOpen(true);
              }}
            >
              <Settings2 size={18} />
            </Button>
          </div>
        </header>

        {/* Dynamic Screen Flow */}
        <main className="flex flex-1 flex-col">
          <AnimatePresence mode="wait">
            {/* 1. SCREEN: HOME / LANDING */}
            {screen === "home" && (
              <motion.section
                key="home"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={shouldReduceMotion ? { duration: 0.05 } : { duration: 0.35 }}
                className="grid flex-1 items-center gap-8 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:py-12"
              >
                <div className="relative z-10 max-w-[620px]">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#0F1E21]/90 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--SGECoralAqua)] shadow-sm backdrop-blur-md">
                    <span className="size-2 rounded-full bg-[var(--SGECoralAqua)]" />
                    Student Government Expo 2026 · SGE FILKOM UB
                  </div>

                  <h1 className="font-display text-[clamp(2.75rem,5.5vw,5.5rem)] font-bold leading-[1.02] text-white">
                    Siapa kamu <br />
                    di <span className="shine-text">masa depan?</span>
                  </h1>

                  <p className="mt-6 max-w-lg text-sm sm:text-base leading-relaxed text-[var(--muted-foreground)]">
                    Tiga kartu persona. Satu nilai yang kamu bawa melangkah di FILKOM UB.
                  </p>

                  <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <motion.div
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    >
                      <Button
                        variant="luminous"
                        size="lg"
                        className="h-13 w-full sm:w-auto rounded-xl px-7 text-xs font-bold uppercase tracking-wider shadow-lg cursor-pointer"
                        onClick={() => {
                          playAudioTone("click", sound);
                          setScreen("dilemma");
                        }}
                      >
                        <Sparkles className="mr-2 size-4" /> Mulai Membaca Takdir{" "}
                        <ArrowRight className="ml-2 size-4" />
                      </Button>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    >
                      <Button
                        variant="outline"
                        size="lg"
                        className="h-13 w-full sm:w-auto rounded-xl px-6 text-xs font-bold uppercase tracking-wider border-white/15 text-white hover:border-[var(--SGECoralAqua)] hover:bg-[#122225] cursor-pointer"
                        onClick={() => {
                          playAudioTone("click", sound);
                          setScreen("scan");
                        }}
                      >
                        <ScanLine className="mr-2 size-4 text-[var(--SGECoralAqua)]" />
                        Scan Kartu Kamera
                      </Button>
                    </motion.div>
                  </div>
                </div>

                {/* Right Hero: Interactive Deck with Shuffle */}
                <InteractiveDeck soundEnabled={sound} onSelectPersona={handleSelectPersona} />
              </motion.section>
            )}

            {/* 2. SCREEN: BOOTH DILEMMA SELECTION */}
            {screen === "dilemma" && (
              <ReflectionDilemma
                soundEnabled={sound}
                onSelectPersona={handleSelectPersona}
                onOpenScanner={() => setScreen("scan")}
                onBack={() => setScreen("home")}
              />
            )}

            {/* 3. SCREEN: SCANNER HUD */}
            {screen === "scan" && (
              <ScannerHUD
                modelUrl={modelUrl}
                soundEnabled={sound}
                onDetectCard={handleSelectPersona}
                onBack={() => setScreen("dilemma")}
              />
            )}

            {/* 4. SCREEN: GRAND REVELATION */}
            {screen === "reveal" && (
              <motion.section
                key="reveal"
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0.2 }
                    : { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
                }
                className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center py-8 sm:py-12"
              >
                <CinematicReveal
                  persona={persona}
                  currentProjection={currentProjection}
                  currentReflection={currentReflection}
                  soundEnabled={sound}
                  onSelectOtherCard={() => setScreen("dilemma")}
                  onResetToHome={handleReset}
                />
              </motion.section>
            )}
          </AnimatePresence>
        </main>

        {/* Global Footer */}
        <footer className="flex items-center justify-between border-t border-[var(--border)] py-4 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
          <span>© 2026 SGE FILKOM UB</span>
          <span className="hidden sm:block">Guest Who You Are?</span>
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-[var(--SGECoralAqua)]" />
            Made for the future
          </span>
        </footer>
      </div>

      {/* Configuration Modal */}
      {settingsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSettingsOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
            className="glass-surface glass-edge w-full max-w-lg rounded-2xl p-6 sm:p-8"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--SGECoralAqua)]">
                  Konfigurasi Booth
                </p>
                <h2 id="settings-title" className="mt-1 font-display text-2xl font-bold text-white">
                  Pengaturan Kamera Scanner
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl text-[var(--muted-foreground)] hover:text-white"
                aria-label="Tutup pengaturan"
                onClick={() => setSettingsOpen(false)}
              >
                <X size={18} />
              </Button>
            </div>

            <p className="mt-4 text-xs sm:text-sm leading-relaxed text-[var(--muted-foreground)]">
              Masukkan URL model Google Teachable Machine milik booth SGE FILKOM UB. Model perlu
              memiliki kelas untuk ikon Karier, Kreativitas, dan Petualangan.
            </p>

            <label
              htmlFor="model-url"
              className="mt-6 mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[var(--SGECoralAqua)]"
            >
              URL Model Teachable Machine
            </label>
            <Input
              id="model-url"
              type="url"
              value={modelUrl}
              onChange={(e) => setModelUrl(e.target.value)}
              placeholder={DEFAULT_MODEL_URL}
              className="h-12 border-[var(--border)] bg-[#081113]/80 text-white placeholder:text-[var(--muted-foreground)]"
            />

            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Pilihan manual tetap dapat digunakan jika tanpa model. Konfigurasi disimpan di browser
              ini.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                className="border-[var(--border)] text-white"
                onClick={() => setSettingsOpen(false)}
              >
                Batal
              </Button>
              <Button
                variant="luminous"
                className="font-bold text-xs uppercase tracking-wider"
                onClick={() => {
                  const url = modelUrl.trim();
                  if (url && !/^https:\/\//i.test(url)) {
                    alert("Gunakan URL model HTTPS yang valid.");
                    return;
                  }
                  window.localStorage.setItem(MODEL_STORAGE_KEY, url);
                  setModelUrl(url);
                  setSettingsOpen(false);
                  playAudioTone("click", sound);
                }}
              >
                <Check className="mr-1.5 size-4" /> Simpan Pengaturan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
