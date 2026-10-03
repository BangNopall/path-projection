import React, { useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Download, RotateCcw, Share2, Sparkles, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type PersonaInfo } from "@/data/personas";
import { playAudioTone } from "@/lib/audio";

interface KeepsakePhotoCardProps {
  persona: PersonaInfo;
  quote: string;
  soundEnabled: boolean;
  onReset: () => void;
  onBackToReveal: () => void;
}

export const KeepsakePhotoCard: React.FC<KeepsakePhotoCardProps> = ({
  persona,
  quote,
  soundEnabled,
  onReset,
  onBackToReveal,
}) => {
  const [name, setName] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const photoCardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!photoCardRef.current || isDownloading) return;
    setIsDownloading(true);
    playAudioTone("click", soundEnabled);

    try {
      const dataUrl = await toPng(photoCardRef.current, {
        pixelRatio: 2.5,
        cacheBust: true,
        style: {
          borderRadius: "0",
        },
      });

      const sanitizedName = (name.trim() || "persona").toLowerCase().replace(/[^a-z0-9]/g, "-");
      const filename = `SGE2026-${persona.key}-${sanitizedName}.png`;

      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } catch {
      alert("Gagal menyimpan otomatis. Anda dapat mengambil screenshot frame ini.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    playAudioTone("click", soundEnabled);
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <motion.section
      key="photo-mode"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.4 }}
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
              onBackToReveal();
            }}
          >
            <ArrowLeft className="mr-1 size-4" /> Kembali ke Hasil
          </Button>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--SGECoralAqua)]">
            <Sparkles size={13} />
            <span>Tahap 03 · Kartu Dokumentasi Booth</span>
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-4xl font-bold text-white">
            Simpan Momen Masa Depanmu
          </h1>
        </div>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-14">
        {/* Left: Exportable Portrait Keepsake Frame (9:16 / 4:5 format) with SGE 2026 Polaroid Styling */}
        <div className="mx-auto w-full max-w-[440px] overflow-hidden rounded-2xl border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.7)]">
          <div
            ref={photoCardRef}
            className="photo-card circuit-pattern-bg relative flex flex-col justify-between overflow-hidden text-white aspect-[9/16] select-none"
            style={{
              backgroundColor: "#0A1719",
              backgroundSize: "cover, 200px 200px",
            }}
          >
            {/* Header: Authentic SGE 2026 #1F6F78 Steady Teal Banner */}
            <div className="bg-[#1F6F78] px-5 py-3.5 flex items-center justify-between border-b border-white/15 shadow-sm">
              <div className="flex items-center gap-3">
                <img
                  src={persona.frontImage}
                  alt="Maskot Guess Who Are You"
                  crossOrigin="anonymous"
                  className="size-10 rounded-lg border border-[var(--SGECoralAqua)]/60 object-cover shadow-sm bg-[#081113]"
                />
                <div>
                  <div className="font-display text-sm font-bold tracking-wide text-white">
                    GUESS <span className="text-[var(--SGECoralAqua)]">WHO</span> ARE YOU.
                  </div>
                  <div className="text-[8px] font-bold uppercase tracking-[0.2em] text-[var(--SGEMustardGold)]">
                    PKKMB FILKOM UB · SGE 2026
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-2.5 py-1 rounded-md bg-[#081113]/85 border border-[var(--SGECoralAqua)]/40 font-mono text-[8px] font-bold tracking-widest text-[var(--SGECoralAqua)] uppercase">
                  CARD NO. {persona.number}
                </span>
              </div>
            </div>

            {/* Corner Editorial Registration Marks */}
            <div className="pointer-events-none absolute top-16 left-3 font-mono text-[10px] text-[var(--SGECoralAqua)]/40 select-none">
              ⌜
            </div>
            <div className="pointer-events-none absolute top-16 right-3 font-mono text-[10px] text-[var(--SGECoralAqua)]/40 select-none">
              ⌝
            </div>
            <div className="pointer-events-none absolute bottom-20 left-3 font-mono text-[10px] text-[var(--SGEMustardGold)]/40 select-none">
              ⌞
            </div>
            <div className="pointer-events-none absolute bottom-20 right-3 font-mono text-[10px] text-[var(--SGEMustardGold)]/40 select-none">
              ⌟
            </div>

            {/* Center: Tarot Card Image & Narrative */}
            <div className="my-auto px-6 py-4 flex flex-col items-center text-center relative z-10">
              <div className="w-[160px] sm:w-[185px] aspect-[768/1086] rounded-xl overflow-hidden border-2 border-[var(--SGEMustardGold)]/80 shadow-[0_12px_35px_rgba(242,183,5,0.25)] mb-3 bg-[#0F1E21]">
                <img
                  src={persona.image}
                  alt={persona.title}
                  crossOrigin="anonymous"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F1E21]/80 border border-white/15 text-[9px] font-bold uppercase tracking-widest text-[var(--SGECoralAqua)] shadow-sm">
                <span>{persona.icon}</span>
                <span>{persona.title}</span>
              </div>

              <p className="mt-2.5 font-mono text-[11px] sm:text-xs leading-relaxed text-[var(--SGEPapayaWhip)]/90 italic px-2 max-w-[340px]">
                “{quote}”
              </p>
            </div>

            {/* Footer: Participant Name & SGE Hologram QR */}
            <div className="border-t border-white/15 bg-[#081113]/90 px-5 py-4 flex items-end justify-between gap-4 backdrop-blur-sm">
              <div className="min-w-0">
                <p className="text-[8px] font-mono font-bold uppercase tracking-[0.18em] text-[var(--SGEPapayaWhip)]/70">
                  FUTURE BELONGS TO:
                </p>
                <p className="mt-0.5 font-display text-base sm:text-lg font-bold truncate text-white">
                  {name.trim() || "Your Future Self"}
                </p>
                <p className="mt-1 font-mono text-[9px] text-[var(--SGECoralAqua)]">
                  {persona.tags.slice(0, 2).join(" · ")}
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="bg-white p-1 rounded-md shadow-sm">
                  <QRCodeSVG
                    value={
                      typeof window !== "undefined"
                        ? window.location.origin
                        : "https://filkom.ub.ac.id"
                    }
                    size={46}
                    bgColor="#FFFFFF"
                    fgColor="#081113"
                  />
                </div>
                <span className="mt-1 font-mono text-[7px] font-bold uppercase tracking-wider text-white/60">
                  SCAN BOOTH
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Personalization & Action Controls */}
        <div className="space-y-6">
          <div className="neo-bento-card p-6 backdrop-blur-xl">
            <label
              htmlFor="card-name"
              className="block text-xs font-bold uppercase tracking-[0.16em] text-[var(--SGECoralAqua)] mb-2"
            >
              Nama Kamu{" "}
              <span className="text-[var(--muted-foreground)] font-normal">(Opsional)</span>
            </label>
            <Input
              id="card-name"
              maxLength={28}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              className="h-12 border-white/10 bg-[#081113]/80 text-white placeholder:text-[var(--muted-foreground)] focus:border-[var(--SGECoralAqua)]"
            />
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Nama yang kamu masukkan akan langsung tertera di frame kartu dokumentasi.
            </p>
          </div>

          <div className="space-y-3">
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Button
                variant="luminous"
                className="h-13 w-full font-bold text-sm tracking-wider uppercase shadow-md cursor-pointer"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                <Download className="mr-2 size-4" />
                {isDownloading ? "Menyiapkan Gambar..." : "Unduh Kartu (PNG)"}
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Button
                variant="outline"
                className="h-12 w-full border-white/10 text-white hover:border-[var(--SGECoralAqua)] hover:bg-[#122225] cursor-pointer"
                onClick={handleShare}
              >
                {isCopied ? (
                  <>
                    <Check className="mr-2 size-4 text-[var(--SGECoralAqua)]" />
                    <span>Tautan Disalin!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="mr-2 size-4" />
                    <span>Salin Tautan Booth</span>
                  </>
                )}
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Button
                variant="ghost"
                className="h-12 w-full text-[var(--muted-foreground)] hover:text-white cursor-pointer"
                onClick={() => {
                  playAudioTone("click", soundEnabled);
                  onReset();
                }}
              >
                <RotateCcw className="mr-2 size-4" />
                Main Ulang dari Beranda
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};
