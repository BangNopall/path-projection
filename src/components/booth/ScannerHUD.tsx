import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, CameraOff, ChevronRight, ScanLine, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { personas, personaKeys, type PersonaKey } from "@/data/personas";
import { classifyLabel } from "@/lib/classifier";
import { playAudioTone } from "@/lib/audio";

interface ScannerHUDProps {
  modelUrl: string;
  soundEnabled: boolean;
  onDetectCard: (key: PersonaKey) => void;
  onBack: () => void;
}

export const ScannerHUD: React.FC<ScannerHUDProps> = ({
  modelUrl,
  soundEnabled,
  onDetectCard,
  onBack,
}) => {
  const [cameraError, setCameraError] = useState("");
  const [scanStatus, setScanStatus] = useState("Menyiapkan kamera...");
  const [prediction, setPrediction] = useState<{ label: string; confidence: number }>({
    label: "Menunggu kartu",
    confidence: 0,
  });
  const [manualOpen, setManualOpen] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // Audio ref untuk mencegah kamera unmount/restart saat tombol suara ditekan (T6 fix)
  const soundRef = useRef(soundEnabled);
  soundRef.current = soundEnabled;

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lockedRef = useRef(false);

  // DOM Refs untuk pembaruan visual kontinu 60fps tanpa memicu re-render React (T7 fix)
  const confidenceBarRef = useRef<HTMLDivElement>(null);
  const confidenceTextRef = useRef<HTMLSpanElement>(null);
  const holdProgressBarRef = useRef<HTMLDivElement>(null);
  const holdProgressTextRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let disposed = false;
    let raf = 0;
    let busy = false;
    let holdKey: PersonaKey | null = null;
    let holdSince = 0;
    let lastStateUpdate = 0;
    let lastLabel = "Menunggu kartu";
    lockedRef.current = false;
    setIsLocked(false);

    const start = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Kamera tidak didukung pada browser ini.");
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 720 },
            height: { ideal: 960 },
          },
          audio: false,
        });

        if (disposed) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        if (!modelUrl.trim() || modelUrl.includes("MODEL_ID")) {
          setScanStatus("Model belum diatur. Gunakan pilihan manual di samping.");
          return;
        }

        setScanStatus("Memuat model visual Teachable Machine...");
        const tmImage = await import("@teachablemachine/image");
        const base = modelUrl.trim().replace(/\/?$/, "/");
        const model = await tmImage.load(`${base}model.json`, `${base}metadata.json`);

        if (disposed) return;
        setScanStatus("Arahkan ikon kartu fisik ke dalam kotak frame...");

        const detect = async () => {
          if (disposed || lockedRef.current) return;
          if (busy || !videoRef.current || videoRef.current.readyState < 2) {
            raf = requestAnimationFrame(detect);
            return;
          }

          busy = true;
          try {
            const results = await model.predict(videoRef.current);
            if (disposed) return;

            const best = [...results].sort((a, b) => b.probability - a.probability)[0];
            if (best) {
              const key = classifyLabel(best.className);
              const label = key ? personas[key].short : best.className;
              const prob = best.probability;
              const probPct = Math.round(prob * 100);

              // 1. Pembaruan DOM langsung untuk bar keyakinan (zero-overhead 60fps)
              if (confidenceBarRef.current) {
                confidenceBarRef.current.style.width = `${probPct}%`;
              }
              if (confidenceTextRef.current) {
                confidenceTextRef.current.textContent = `${probPct}%`;
              }

              // 2. Pembatasan setState ke <= 10 Hz untuk teks judul & label
              const now = performance.now();
              if (label !== lastLabel || now - lastStateUpdate >= 100) {
                lastStateUpdate = now;
                lastLabel = label;
                setPrediction({ label, confidence: prob });
              }

              // 3. Ambang deteksi > 85% dan hold timer 1.5 detik (T8 fix)
              if (key && prob >= 0.85) {
                if (holdKey !== key) {
                  holdKey = key;
                  holdSince = performance.now();
                  setIsHolding(true);
                  setScanStatus(`Mengenali ${personas[key].short}... Tahan kartu stabil`);
                }

                const elapsed = performance.now() - holdSince;
                const progressPct = Math.min(100, Math.round((elapsed / 1500) * 100));

                // Pembaruan bar progress penguncian via ref
                if (holdProgressBarRef.current) {
                  holdProgressBarRef.current.style.width = `${progressPct}%`;
                }
                if (holdProgressTextRef.current) {
                  holdProgressTextRef.current.textContent = `${progressPct}%`;
                }

                // 4. Momen lock-on terkonfirmasi (1500 ms)
                if (elapsed >= 1500) {
                  lockedRef.current = true;
                  setIsLocked(true);
                  // Nada lockon (T5 fix: bukan nada reveal, mencegah chime ganda)
                  playAudioTone("lockon", soundRef.current);
                  setScanStatus(`KARTU TERKUNCI! Menyiapkan Takdir ${personas[key].short}...`);

                  // Beat lock-on 380ms sebelum perpindahan layar
                  window.setTimeout(() => {
                    if (!disposed) {
                      onDetectCard(key);
                    }
                  }, 380);
                  return;
                }
              } else {
                if (holdKey !== null) {
                  holdKey = null;
                  setIsHolding(false);
                  if (holdProgressBarRef.current) {
                    holdProgressBarRef.current.style.width = "0%";
                  }
                  if (holdProgressTextRef.current) {
                    holdProgressTextRef.current.textContent = "0%";
                  }
                  setScanStatus("Arahkan ikon kartu fisik ke dalam kotak frame...");
                }
              }
            }
          } catch {
            if (!disposed) {
              setScanStatus("Pembacaan terjeda. Pilih secara manual bila perlu.");
            }
          }

          busy = false;
          raf = requestAnimationFrame(detect);
        };

        raf = requestAnimationFrame(detect);
      } catch (err) {
        if (!disposed) {
          setCameraError(
            err instanceof Error ? err.message : "Izin kamera ditolak atau tidak tersedia.",
          );
          setScanStatus("Gunakan tombol pemilihan manual di samping.");
        }
      }
    };

    void start();

    const currentVideo = videoRef.current;

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      if (currentVideo) {
        currentVideo.srcObject = null;
      }
    };
  }, [modelUrl, onDetectCard]); // soundEnabled sengaja dihilangkan dari dependency array (T6 fix)

  return (
    <motion.section
      key="scanner"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.35 }}
      className="mx-auto w-full max-w-6xl flex-1 py-6 sm:py-10"
    >
      {/* Top Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="mb-2 -ml-3 text-[var(--SGEPapayaWhip)]/80 hover:text-white"
            onClick={() => {
              playAudioTone("click", soundRef.current);
              onBack();
            }}
          >
            <ArrowLeft className="mr-1 size-4" /> Kembali
          </Button>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--SGECoralAqua)]">
            <ScanLine size={13} />
            <span>02 · Pindai Kartu Persona</span>
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-4xl font-bold text-white">
            Arahkan Kartu ke Frame
          </h1>
        </div>

        <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--SGECoralAqua)]/30 bg-[#0F1E21]/80 text-xs font-bold text-[var(--SGECoralAqua)]">
          <span className="size-2 rounded-full bg-[var(--SGECoralAqua)] animate-pulse" />
          <span>SCANNER HUD AKTIF</span>
        </div>
      </div>

      <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.2fr)_360px] lg:gap-12">
        {/* Modern Editorial Viewfinder Container */}
        <div className="neo-bento-card circuit-pattern-bg relative mx-auto aspect-[4/4.4] w-full max-w-[620px] overflow-hidden rounded-2xl sm:aspect-[4/3.4]">
          <video
            ref={videoRef}
            muted
            playsInline
            autoPlay
            className={`absolute inset-0 size-full object-cover transition-all duration-300 ${
              isLocked ? "brightness-95 contrast-110 saturate-50" : ""
            }`}
            aria-label="Kamera pemindai kartu"
          />

          {cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#081113]/95 px-8 text-center z-20">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/15 text-destructive border border-destructive/30 shadow-sm">
                <CameraOff size={28} />
              </div>
              <p className="text-sm text-[var(--muted-foreground)] max-w-sm">{cameraError}</p>
              <Button
                variant="luminous"
                size="sm"
                onClick={() => setManualOpen(true)}
                className="cursor-pointer"
              >
                Pilih Kartu Manual Saja
              </Button>
            </div>
          )}

          {/* Vignette Overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#081113]/40 via-transparent to-[#081113]/85" />

          {/* Clean Editorial Target Reticle dengan penjepitan bracket saat lock-on */}
          <div
            className={`pointer-events-none absolute left-1/2 top-1/2 aspect-[768/1086] h-[74%] -translate-x-1/2 -translate-y-1/2 rounded-lg transition-all duration-300 ${
              isLocked
                ? "border-2 border-[var(--SGEMustardGold)] scale-[0.98] shadow-[0_0_30px_rgba(242,183,5,0.4)]"
                : "border border-[var(--SGECoralAqua)]/30"
            }`}
          >
            {/* Editorial Telemetry Labels */}
            <div className="absolute top-2 left-2.5 font-mono text-[8px] uppercase tracking-wider text-[var(--SGECoralAqua)]/80 select-none">
              OPTICAL // 01
            </div>
            <div className="absolute top-2 right-2.5 font-mono text-[8px] uppercase tracking-wider text-[var(--SGEPapayaWhip)]/60 select-none">
              768×1086
            </div>

            {/* Corner Precision Alignment Markers (menjepit saat lock-on) */}
            <span
              className={`absolute size-6 border-l-2 border-t-2 transition-all duration-300 ${
                isLocked
                  ? "border-[var(--SGEMustardGold)] -left-0.5 -top-0.5 size-7 shadow-[0_0_10px_#F2B705]"
                  : "border-[var(--SGECoralAqua)] -left-1 -top-1"
              }`}
            />
            <span
              className={`absolute size-6 border-r-2 border-t-2 transition-all duration-300 ${
                isLocked
                  ? "border-[var(--SGEMustardGold)] -right-0.5 -top-0.5 size-7 shadow-[0_0_10px_#F2B705]"
                  : "border-[var(--SGECoralAqua)] -right-1 -top-1"
              }`}
            />
            <span
              className={`absolute size-6 border-b-2 border-l-2 transition-all duration-300 ${
                isLocked
                  ? "border-[var(--SGEMustardGold)] -bottom-0.5 -left-0.5 size-7 shadow-[0_0_10px_#F2B705]"
                  : "border-[var(--SGECoralAqua)] -bottom-1 -left-1"
              }`}
            />
            <span
              className={`absolute size-6 border-b-2 border-r-2 transition-all duration-300 ${
                isLocked
                  ? "border-[var(--SGEMustardGold)] -bottom-0.5 -right-0.5 size-7 shadow-[0_0_10px_#F2B705]"
                  : "border-[var(--SGECoralAqua)] -bottom-1 -right-1"
              }`}
            />

            {/* Subtle Optical Scan Line */}
            {!isLocked && <span className="scan-line absolute left-0 h-[2px] w-full opacity-70" />}

            {/* Center Precision Crosshair */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-8 flex items-center justify-center opacity-40">
              <span className="w-full h-px bg-[var(--SGECoralAqua)] absolute" />
              <span className="h-full w-px bg-[var(--SGECoralAqua)] absolute" />
            </div>
          </div>

          {/* Lock-on Flash Overlay (WCAG 2.3.1: durasi <= 120ms, opacity <= 0.5) */}
          {isLocked && (
            <div
              className="pointer-events-none absolute inset-0 bg-white/40 transition-opacity duration-150 animate-out fade-out fill-mode-forwards"
              aria-hidden="true"
            />
          )}

          {/* Live Scanner Telemetry Badge */}
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-lg bg-[#081113]/90 px-3 py-1.5 text-[10px] font-mono font-bold tracking-[0.16em] text-[var(--SGECoralAqua)] border border-white/10 backdrop-blur-md">
            <span
              className={`size-2 rounded-full ${isLocked ? "bg-[var(--SGEMustardGold)]" : "bg-[var(--SGECoralAqua)] animate-pulse"}`}
            />
            <span>{isLocked ? "LOCKED" : "LIVE SCAN"}</span>
          </div>

          {/* Real-time Status Readout Bar */}
          <div className="absolute inset-x-4 bottom-4 text-center px-4 py-2.5 rounded-xl bg-[#081113]/90 border border-white/10 backdrop-blur-md shadow-lg">
            <p className="text-xs font-medium text-white flex items-center justify-center gap-2">
              {isLocked ? (
                <CheckCircle2 size={14} className="text-[var(--SGEMustardGold)] animate-bounce" />
              ) : (
                <Sparkles size={13} className="text-[var(--SGEMustardGold)]" />
              )}
              <span>{scanStatus}</span>
            </p>
          </div>
        </div>

        {/* Right Panel: Prediction Meter & Manual Override */}
        <div className="space-y-6">
          <div className="neo-bento-card p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--SGECoralAqua)]">
                Prediksi Realtime
              </span>
              <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--SGEPapayaWhip)]/60">
                AI.INFERENCE
              </span>
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-white">{prediction.label}</p>

            <div className="mt-4 flex justify-between text-xs">
              <span className="text-[var(--muted-foreground)]">Keyakinan Visual</span>
              <span
                ref={confidenceTextRef}
                className="font-mono font-bold text-[var(--SGECoralAqua)]"
              >
                {Math.round(prediction.confidence * 100)}%
              </span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#081113] border border-white/5">
              <div
                ref={confidenceBarRef}
                className="h-full rounded-full bg-[var(--SGECoralAqua)] transition-all duration-150"
                style={{ width: `${Math.round(prediction.confidence * 100)}%` }}
              />
            </div>

            {/* Hold progress when locking */}
            {isHolding && (
              <div className="mt-4 pt-3 border-t border-white/10">
                <div className="flex justify-between text-[11px] text-[var(--SGEMustardGold)] font-bold mb-1">
                  <span>Mengunci Deteksi</span>
                  <span ref={holdProgressTextRef} className="font-mono">
                    0%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[#081113]">
                  <div
                    ref={holdProgressBarRef}
                    className="h-full rounded-full bg-[var(--SGEMustardGold)] transition-all duration-100"
                    style={{ width: "0%" }}
                  />
                </div>
              </div>
            )}

            <p className="mt-4 text-[11px] text-[var(--muted-foreground)] leading-relaxed">
              Tahan ikon kartu di dalam frame selama 1,5 detik untuk memicu animasi revelation
              tarot.
            </p>
          </div>

          {/* Manual Bypass Section: 100% Client-Side Offline Fallback */}
          <div className="neo-bento-card p-5 backdrop-blur-xl">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              Pencahayaan Booth Kurang Bagus?
            </p>
            <Button
              variant="outline"
              className="h-11 w-full justify-between border-white/10 text-white hover:border-[var(--SGECoralAqua)] hover:bg-[#122225] cursor-pointer"
              onClick={() => {
                playAudioTone("click", soundRef.current);
                setManualOpen(!manualOpen);
              }}
            >
              <span className="flex items-center gap-2">
                <CameraOff size={15} />
                <span>Buka Pilihan Manual</span>
              </span>
              <ChevronRight
                size={16}
                className={`transition-transform duration-200 ${manualOpen ? "rotate-90" : ""}`}
              />
            </Button>

            {manualOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 mt-4 pt-3 border-t border-white/10"
              >
                <p className="text-xs text-[var(--muted-foreground)] mb-2">
                  Pilih salah satu ikon kartu fisikmu:
                </p>
                {personaKeys.map((key) => (
                  <motion.div
                    key={key}
                    whileHover={{ scale: 1.015, x: 3 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Button
                      variant="ghost"
                      className="h-12 w-full justify-start gap-3 border border-white/10 hover:border-[var(--SGECoralAqua)] hover:bg-[#152B2F] text-left cursor-pointer"
                      onClick={() => {
                        playAudioTone("click", soundRef.current);
                        onDetectCard(key);
                      }}
                    >
                      <span className="text-xl">{personas[key].icon}</span>
                      <span className="font-semibold text-sm">{personas[key].short}</span>
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
};
