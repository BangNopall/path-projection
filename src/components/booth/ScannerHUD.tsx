import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, CameraOff, ChevronRight, HelpCircle, ScanLine, Sparkles } from "lucide-react";
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
  const [holdProgress, setHoldProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lockedRef = useRef(false);

  useEffect(() => {
    let disposed = false;
    let raf = 0;
    let busy = false;
    let holdKey: PersonaKey | null = null;
    let holdSince = 0;
    lockedRef.current = false;

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
              setPrediction({
                label: key ? personas[key].short : best.className,
                confidence: best.probability,
              });

              if (key && best.probability > 0.82) {
                if (holdKey !== key) {
                  holdKey = key;
                  holdSince = performance.now();
                }

                const elapsed = performance.now() - holdSince;
                const progressPct = Math.min(100, Math.round((elapsed / 1400) * 100));
                setHoldProgress(progressPct);
                setScanStatus(`Mengenali ${personas[key].short}... Tahan kartu stabil`);

                if (elapsed >= 1400) {
                  lockedRef.current = true;
                  playAudioTone("reveal", soundEnabled);
                  onDetectCard(key);
                  return;
                }
              } else {
                holdKey = null;
                setHoldProgress(0);
                setScanStatus("Arahkan ikon kartu fisik ke dalam kotak frame...");
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
  }, [modelUrl, soundEnabled, onDetectCard]);

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
              playAudioTone("click", soundEnabled);
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
            className="absolute inset-0 size-full object-cover"
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

          {/* Clean Editorial Target Reticle */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 aspect-[768/1086] h-[74%] -translate-x-1/2 -translate-y-1/2 border border-[var(--SGECoralAqua)]/30 rounded-lg">
            {/* Editorial Telemetry Labels */}
            <div className="absolute top-2 left-2.5 font-mono text-[8px] uppercase tracking-wider text-[var(--SGECoralAqua)]/80 select-none">
              OPTICAL // 01
            </div>
            <div className="absolute top-2 right-2.5 font-mono text-[8px] uppercase tracking-wider text-[var(--SGEPapayaWhip)]/60 select-none">
              768×1086
            </div>

            {/* Corner Precision Alignment Markers */}
            <span className="absolute -left-1 -top-1 size-6 border-l-2 border-t-2 border-[var(--SGECoralAqua)]" />
            <span className="absolute -right-1 -top-1 size-6 border-r-2 border-t-2 border-[var(--SGECoralAqua)]" />
            <span className="absolute -bottom-1 -left-1 size-6 border-b-2 border-l-2 border-[var(--SGECoralAqua)]" />
            <span className="absolute -bottom-1 -right-1 size-6 border-b-2 border-r-2 border-[var(--SGECoralAqua)]" />

            {/* Subtle Optical Scan Line */}
            <span className="scan-line absolute left-0 h-[2px] w-full opacity-70" />

            {/* Center Precision Crosshair */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-8 flex items-center justify-center opacity-40">
              <span className="w-full h-px bg-[var(--SGECoralAqua)] absolute" />
              <span className="h-full w-px bg-[var(--SGECoralAqua)] absolute" />
            </div>
          </div>

          {/* Live Scanner Telemetry Badge */}
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-lg bg-[#081113]/90 px-3 py-1.5 text-[10px] font-mono font-bold tracking-[0.16em] text-[var(--SGECoralAqua)] border border-white/10 backdrop-blur-md">
            <span className="size-2 rounded-full bg-[var(--SGECoralAqua)] animate-pulse" />
            <span>LIVE SCAN</span>
          </div>

          {/* Real-time Status Readout Bar */}
          <div className="absolute inset-x-4 bottom-4 text-center px-4 py-2.5 rounded-xl bg-[#081113]/90 border border-white/10 backdrop-blur-md shadow-lg">
            <p className="text-xs font-medium text-white flex items-center justify-center gap-2">
              <Sparkles size={13} className="text-[var(--SGEMustardGold)]" />
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
              <span className="font-mono font-bold text-[var(--SGECoralAqua)]">
                {Math.round(prediction.confidence * 100)}%
              </span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#081113] border border-white/5">
              <div
                className="h-full rounded-full bg-[var(--SGECoralAqua)] transition-all duration-200"
                style={{ width: `${Math.round(prediction.confidence * 100)}%` }}
              />
            </div>

            {/* Hold progress when locked */}
            {holdProgress > 0 && (
              <div className="mt-4 pt-3 border-t border-white/10">
                <div className="flex justify-between text-[11px] text-[var(--SGEMustardGold)] font-bold mb-1">
                  <span>Mengunci Deteksi</span>
                  <span className="font-mono">{holdProgress}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[#081113]">
                  <div
                    className="h-full rounded-full bg-[var(--SGEMustardGold)] transition-all duration-100"
                    style={{ width: `${holdProgress}%` }}
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
                playAudioTone("click", soundEnabled);
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
                        playAudioTone("click", soundEnabled);
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
