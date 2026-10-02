import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowRight, Camera, CameraOff, Check, ChevronRight, Download, HelpCircle, RotateCcw, ScanLine, Settings2, Sparkles, Volume2, VolumeX, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import front from "@/assets/depan.webp.asset.json";
import careerArt from "@/assets/belakang1.webp.asset.json";
import creativeArt from "@/assets/belakang2.webp.asset.json";
import adventureArt from "@/assets/belakang3.webp.asset.json";

type PersonaKey = "career" | "creative" | "adventure";
type Screen = "home" | "scan" | "reveal" | "photo";
const MODEL_STORAGE_KEY = "sge-teachable-machine-model";
// Replace this with the exported model URL from the booth's own Teachable Machine project.
const DEFAULT_MODEL_URL = "https://teachablemachine.withgoogle.com/models/MODEL_ID/";
const personas: Record<PersonaKey, { number: string; label: string; short: string; title: string; icon: string; image: string; tags: string[]; quotes: string[] }> = {
  career: {
    number: "01", label: "CAREER / TECH", short: "Karier & Teknologi", title: "The Tech Innovator", icon: "💼", image: careerArt.url,
    tags: ["#Visionary", "#ProblemSolver", "#SGE2026"],
    quotes: [
      "Di antara jutaan baris kode masa depan, logika dan ambisimu akan meretas batasan baru. Jadilah inovator, bukan sekadar penonton.",
      "Arsitektur masa depan FILKOM dibangun oleh tangan dinginmu. Fokus pada proses, dampak besarmu menanti di semester depan.",
      "Setiap bug adalah batu loncatan. Karier gemilangmu berakar dari ketekunan menyelesaikan masalah yang orang lain hindari.",
      "Rasa ingin tahumu adalah modal terbesar. Dari satu solusi kecil hari ini, kamu bisa membangun teknologi yang mengubah banyak kehidupan.",
      "Kamu tak hanya mengikuti perubahan teknologi. Dengan ketekunan dan keberanian mencoba, kamu akan menjadi bagian yang menciptakannya.",
    ],
  },
  creative: {
    number: "02", label: "CREATIVE / DESIGN", short: "Kreativitas & Desain", title: "The Experience Crafter", icon: "🎨", image: creativeArt.url,
    tags: ["#CreativeMind", "#ExperienceMaker", "#SGE2026"],
    quotes: [
      "Dunia digital terlalu kaku tanpa sentuhan imajinasimu. Visualisasikan mimpimu dan ubah kompleksitas menjadi estetika yang bermakna.",
      "Kreativitasmu adalah kompas. Ketika algoritma terasa dingin, empati dan karyamulah yang memberi jiwa pada teknologi.",
      "Jangan takut menciptakan tren sendiri. Di FILKOM, ide paling liar sekalipun adalah bibit dari inovasi spektakuler.",
      "Dari sketsa sederhana hingga pengalaman yang dikenang, tangan kreatifmu mampu membuat teknologi terasa lebih manusiawi.",
      "Cara pandangmu yang berbeda bukan hambatan. Itulah kekuatanmu untuk merancang sesuatu yang belum pernah dibayangkan orang lain.",
    ],
  },
  adventure: {
    number: "03", label: "ADVENTURE / IMPACT", short: "Petualangan & Dampak", title: "The Global Explorer", icon: "🌎", image: adventureArt.url,
    tags: ["#BoldExplorer", "#ChangeMaker", "#SGE2026"],
    quotes: [
      "Langkah kakimu terlalu luas untuk dibatasi zona nyaman. Masa depanmu menembus panggung global dengan dedikasi tiada henti.",
      "Jelajahi setiap peluang di kampus ini. Keberanian mengambil risiko akan membawamu ke puncak kolaborasi yang tak terduga.",
      "Dunia luar menanti pemikiran revolusionermu. Berangkatlah dengan integritas, kembali dengan segudang pembuktian.",
      "Setiap pertemuan baru membuka peta kemungkinan. Keberanianmu menjelajah akan mengubah rasa penasaran menjadi dampak nyata.",
      "Perjalanan besarmu dimulai dari satu langkah berani di FILKOM. Bawa ilmu, rangkul sesama, dan tinggalkan jejak yang berarti.",
    ],
  },
};
const personaKeys: PersonaKey[] = ["career", "creative", "adventure"];

function classifyLabel(label: string): PersonaKey | null {
  const normalized = label.toLowerCase().trim();
  if (/career|karier|tech|teknologi|briefcase|tas|business|1$/.test(normalized)) return "career";
  if (/creative|kreatif|design|desain|art|palette|palet|2$/.test(normalized)) return "creative";
  if (/adventure|petualangan|impact|global|world|earth|globe|bumi|3$/.test(normalized)) return "adventure";
  return null;
}

function playTone(kind: "click" | "reveal", enabled: boolean) {
  if (!enabled || typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext;
    const context = new AudioContextClass();
    const now = context.currentTime;
    const notes = kind === "reveal" ? [392, 523.25, 659.25, 783.99] : [660];
    notes.forEach((frequency, i) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, now + i * 0.13);
      gain.gain.setValueAtTime(0.0001, now + i * 0.13);
      gain.gain.exponentialRampToValueAtTime(0.08, now + i * 0.13 + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.13 + 0.6);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(now + i * 0.13);
      oscillator.stop(now + i * 0.13 + 0.65);
    });
    window.setTimeout(() => void context.close(), 1800);
  } catch { /* Audio is optional. */ }
}

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Guess Who Are You — SGE FILKOM UB 2026" },
    { name: "description", content: "Pilih kartu masa depanmu, scan persona pilihanmu, dan temukan pesan refleksi di booth SGE FILKOM UB 2026." },
    { property: "og:title", content: "Guess Who Are You — SGE FILKOM UB 2026" },
    { property: "og:description", content: "Satu pilihan, banyak kemungkinan. Temukan persona masa depanmu di booth SGE FILKOM UB 2026." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Game,
});

function Game() {
  const [screen, setScreen] = useState<Screen>("home");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [modelUrl, setModelUrl] = useState(DEFAULT_MODEL_URL);
  const [sound, setSound] = useState(true);
  const [selected, setSelected] = useState<PersonaKey>("career");
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [name, setName] = useState("");
  const [displayed, setDisplayed] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [scanStatus, setScanStatus] = useState("Menyiapkan kamera...");
  const [prediction, setPrediction] = useState<{ label: string; confidence: number }>({ label: "Menunggu kartu", confidence: 0 });
  const [manualOpen, setManualOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const lockedRef = useRef(false);
  const soundRef = useRef(sound);
  soundRef.current = sound;
  const persona = personas[selected];

  useEffect(() => { setModelUrl(window.localStorage.getItem(MODEL_STORAGE_KEY) || DEFAULT_MODEL_URL); setShareUrl(window.location.origin); }, []);
  useEffect(() => {
    if (screen !== "reveal") return;
    const text = persona.quotes[quoteIndex] ?? persona.quotes[0] ?? "";
    setDisplayed("");
    let position = 0;
    const timer = window.setInterval(() => {
      position = Math.min(position + 2, text.length);
      setDisplayed(text.slice(0, position));
      if (position >= text.length) window.clearInterval(timer);
    }, 27);
    return () => window.clearInterval(timer);
  }, [screen, selected, quoteIndex]);

  const choose = useCallback((key: PersonaKey) => {
    if (lockedRef.current) return;
    lockedRef.current = true;
    setSelected(key);
    setQuoteIndex(Math.floor(Math.random() * personas[key].quotes.length));
    playTone("reveal", soundRef.current);
    setManualOpen(false);
    setScreen("reveal");
  }, []);

  useEffect(() => {
    if (screen !== "scan") return;
    let disposed = false;
    let raf = 0;
    let busy = false;
    let holdKey: PersonaKey | null = null;
    let holdSince = 0;
    lockedRef.current = false;
    const start = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("Kamera tidak tersedia di browser ini.");
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 720 }, height: { ideal: 960 } }, audio: false });
        if (disposed) { stream.getTracks().forEach(track => track.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
        if (!modelUrl.trim() || modelUrl.includes("MODEL_ID")) {
          setScanStatus("Model belum diatur. Buka pengaturan atau pilih manual.");
          return;
        }
        setScanStatus("Memuat model pembaca kartu...");
        const tmImage = await import("@teachablemachine/image");
        const base = modelUrl.trim().replace(/\/?$/, "/");
        const model = await tmImage.load(`${base}model.json`, `${base}metadata.json`);
        if (disposed) return;
        setScanStatus("Arahkan ikon kartu ke dalam frame...");
        const detect = async () => {
          if (disposed || lockedRef.current) return;
          if (busy || !videoRef.current || videoRef.current.readyState < 2) { raf = requestAnimationFrame(detect); return; }
          busy = true;
          try {
            const results = await model.predict(videoRef.current);
            if (disposed) return;
            const best = [...results].sort((a, b) => b.probability - a.probability)[0];
            if (best) {
              const key = classifyLabel(best.className);
              setPrediction({ label: key ? personas[key].short : best.className, confidence: best.probability });
              if (key && best.probability > 0.85) {
                if (holdKey !== key) { holdKey = key; holdSince = performance.now(); }
                setScanStatus(`Mengenali ${personas[key].short}... tahan kartu tetap stabil`);
                if (performance.now() - holdSince >= 1500) { choose(key); return; }
              } else { holdKey = null; setScanStatus("Arahkan ikon kartu ke dalam frame..."); }
            }
          } catch { if (!disposed) setScanStatus("Pembacaan terhenti. Coba pilih manual."); }
          busy = false;
          raf = requestAnimationFrame(detect);
        };
        raf = requestAnimationFrame(detect);
      } catch (error) {
        if (!disposed) { setCameraError(error instanceof Error ? error.message : "Kamera gagal dibuka."); setScanStatus("Gunakan pilihan manual untuk melanjutkan."); }
      }
    };
    void start();
    return () => { disposed = true; cancelAnimationFrame(raf); streamRef.current?.getTracks().forEach(track => track.stop()); streamRef.current = null; if (videoRef.current) videoRef.current.srcObject = null; };
  }, [screen, modelUrl, choose]);

  const reset = () => { playTone("click", sound); setName(""); setPrediction({ label: "Menunggu kartu", confidence: 0 }); setCameraError(""); setManualOpen(false); lockedRef.current = false; setScreen("home"); };
  const saveImage = async () => {
    if (!photoRef.current) return;
    try {
      const dataUrl = await toPng(photoRef.current, { pixelRatio: 2, cacheBust: true });
      const link = document.createElement("a");
      link.download = `sge-2026-${selected}-${(name.trim() || "persona").toLowerCase().replace(/[^a-z0-9-]/g, "-")}.png`;
      link.href = dataUrl;
      link.click();
    } catch { alert("Kartu belum bisa disimpan. Coba screenshot layar ini."); }
  };

  return <div className="app-canvas relative min-h-screen text-foreground selection:bg-primary/30">
    <div className="ambient-grid pointer-events-none absolute inset-0" aria-hidden="true" />
    <div className="pointer-events-none absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan/40 to-transparent" />
    <div className="relative z-10 mx-auto flex min-h-screen max-w-[1440px] flex-col px-5 sm:px-9 lg:px-16">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center border-b border-border py-5 sm:py-6">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-cyan/30 bg-cyan/10 text-cyan sm:size-11"><Sparkles size={21} strokeWidth={1.6} /></div>
          <div className="min-w-0"><div className="truncate font-display text-base font-bold leading-tight sm:text-lg">GUESS <span className="text-cyan">WHO</span> ARE YOU<span className="text-cyan">.</span></div><div className="truncate text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground sm:text-[10px]">SGE FILKOM UB · 2026</div></div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3">
          <span className="hidden border-r border-border pr-5 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground md:block">An interactive future reading</span>
          <Button variant="ghost" size="icon" className="size-10 text-muted-foreground hover:text-foreground" aria-label={sound ? "Matikan suara" : "Nyalakan suara"} title={sound ? "Matikan suara" : "Nyalakan suara"} onClick={() => setSound(!sound)}>{sound ? <Volume2 /> : <VolumeX />}</Button>
          <Button variant="ghost" size="icon" className="size-10 text-muted-foreground hover:text-foreground" aria-label="Pengaturan model" title="Pengaturan model" onClick={() => setSettingsOpen(true)}><Settings2 /></Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <AnimatePresence mode="wait">
          {screen === "home" && <motion.section key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid flex-1 items-center gap-5 py-10 lg:grid-cols-[1fr_1fr] lg:gap-16 lg:py-14">
            <div className="relative z-10 max-w-[630px]">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan/25 bg-cyan/5 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan"><span className="size-1.5 rounded-full bg-cyan shadow-[0_0_12px_var(--cyan)]" /> Student Government Expo 2026</div>
              <p className="mb-4 font-display text-sm font-medium uppercase tracking-[0.24em] text-gold sm:text-base">The future is yours to discover</p>
              <h1 className="font-display text-[clamp(3.25rem,6.2vw,6.5rem)] font-bold leading-[0.98] text-ivory">Siapa kamu<br />di <span className="shine-text">masa depan?</span></h1>
              <p className="mt-7 max-w-lg text-base leading-8 text-muted-foreground sm:text-lg">Tiga kartu. Satu pilihan. Temukan sisi dirimu yang akan membentuk perjalanan di FILKOM.</p>
              <div className="mt-9 flex flex-col items-start gap-5 sm:flex-row sm:items-center"><Button variant="luminous" size="lg" className="h-14 w-full rounded-md px-7 text-sm font-bold sm:w-auto" onClick={() => { playTone("click", sound); setCameraError(""); setScreen("scan"); }}><ScanLine className="mr-1" /> Mulai Membaca Takdir <ArrowRight className="ml-2" /></Button><span className="text-xs text-muted-foreground">01 — 03 &nbsp; / &nbsp; PILIH • SCAN • UNGKAP</span></div>
              <div className="mt-14 flex max-w-md items-start gap-4 border-t border-border pt-6"><div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border text-gold"><HelpCircle size={17} /></div><p className="text-sm leading-6 text-muted-foreground">Pilih satu dari tiga kartu fisik yang paling mencerminkan prioritasmu, lalu arahkan ikonnya ke kamera.</p></div>
            </div>
            <div className="relative mx-auto flex h-[430px] w-full max-w-[620px] items-center justify-center sm:h-[550px] lg:h-[600px]" aria-label="Ilustrasi tiga kartu persona">
              <div className="absolute inset-x-[15%] top-1/2 h-24 -translate-y-1/2 rounded-full bg-cyan/10 blur-[65px]" />
              <div className="absolute left-1/2 top-1/2 size-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan/10 sm:size-[470px]" />
              <div className="absolute left-1/2 top-1/2 size-[290px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-cyan/10 sm:size-[385px]" />
              <motion.div className="deck-card left-1/2 top-1/2 z-[1]" style={{ transformOrigin: "bottom center" }} initial={{ x: "-71%", y: "-46%", rotate: -19 }} animate={{ x: "-71%", y: ["-46%", "-48%", "-46%"], rotate: -19 }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}><img src={careerArt.url} alt="Kartu Karier dan Teknologi" /></motion.div>
              <motion.div className="deck-card left-1/2 top-1/2 z-[2]" initial={{ x: "-21%", y: "-45%", rotate: 17 }} animate={{ x: "-21%", y: ["-45%", "-43%", "-45%"], rotate: 17 }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}><img src={creativeArt.url} alt="Kartu Kreativitas dan Desain" /></motion.div>
              <motion.div className="deck-card left-1/2 top-1/2 z-[3]" initial={{ x: "-50%", y: "-55%", rotate: 0 }} animate={{ x: "-50%", y: ["-55%", "-58%", "-55%"], rotate: 0 }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}><img src={front.url} alt="Kartu maskot Guess Who Are You" /></motion.div>
              <div className="absolute bottom-1 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-border bg-background/80 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur-xl sm:bottom-3">✦ &nbsp; Choose your future self &nbsp; ✦</div>
            </div>
          </motion.section>}

          {screen === "scan" && <motion.section key="scan" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mx-auto w-full max-w-6xl flex-1 py-8 sm:py-12">
            <div className="mb-8 flex items-start justify-between gap-4"><div><Button variant="ghost" size="sm" className="mb-5 -ml-3 text-muted-foreground" onClick={reset}><ArrowLeft /> Kembali</Button><p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan">01 / The reading</p><h1 className="font-display text-3xl font-bold text-ivory sm:text-5xl">Temukan kartu pilihanmu.</h1><p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">Arahkan ikon pada kartu fisikmu ke dalam frame. Pastikan terlihat jelas dan tahan sebentar.</p></div><span className="hidden rounded-full border border-cyan/20 px-4 py-2 text-xs text-cyan sm:inline-flex">● &nbsp; SCANNER AKTIF</span></div>
            <div className="grid items-center gap-9 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14">
              <div className="glass-surface glass-edge relative mx-auto aspect-[4/4.3] w-full max-w-[640px] overflow-hidden rounded-lg sm:aspect-[4/3.3]">
                <video ref={videoRef} muted playsInline autoPlay className="absolute inset-0 size-full object-cover" aria-label="Pratinjau kamera untuk memindai kartu" />
                {cameraError && <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/90 px-8 text-center"><CameraOff size={40} className="text-muted-foreground" /><p className="text-sm text-muted-foreground">{cameraError}</p></div>}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/35 via-transparent to-background/70" />
                <div className="pointer-events-none absolute left-1/2 top-1/2 aspect-[768/1086] h-[75%] -translate-x-1/2 -translate-y-1/2 border border-cyan/40 shadow-[0_0_65px_var(--glow-primary)]">
                  <span className="absolute -left-px -top-px h-7 w-7 border-l-2 border-t-2 border-cyan" /><span className="absolute -right-px -top-px h-7 w-7 border-r-2 border-t-2 border-cyan" /><span className="absolute -bottom-px -left-px h-7 w-7 border-b-2 border-l-2 border-cyan" /><span className="absolute -bottom-px -right-px h-7 w-7 border-b-2 border-r-2 border-cyan" />
                  <span className="scan-line absolute left-0 h-px w-full" />
                </div>
                <div className="absolute left-5 top-5 flex items-center gap-2 rounded-sm bg-background/70 px-3 py-2 text-[10px] font-bold tracking-[0.18em] text-cyan"><span className="size-1.5 animate-pulse rounded-full bg-cyan" /> LIVE SCAN</div>
                <div className="absolute inset-x-5 bottom-5 text-center text-xs font-medium text-ivory">{scanStatus}</div>
              </div>
              <div className="space-y-6"><div className="border-b border-border pb-6"><span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Detected persona</span><p className="mt-3 font-display text-2xl font-semibold text-ivory">{prediction.label}</p><div className="mt-5 flex justify-between text-xs"><span className="text-muted-foreground">Tingkat keyakinan</span><span className="font-semibold text-cyan">{Math.round(prediction.confidence * 100)}%</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-cyan transition-all duration-300" style={{ width: `${prediction.confidence * 100}%` }} /></div><p className="mt-3 text-xs text-muted-foreground">Pembacaan dimulai setelah keyakinan di atas 85% selama 1,5 detik.</p></div>
                <div><p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Tidak bisa scan?</p><Button variant="glass" className="h-12 w-full" onClick={() => setManualOpen(!manualOpen)}><CameraOff /> Bypass / Pilih Manual <ChevronRight className="ml-auto" /></Button></div>
                {manualOpen && <div className="space-y-2"><p className="text-xs text-muted-foreground">Pilih ikon yang ada pada kartu fisikmu:</p>{personaKeys.map(key => <Button key={key} variant="glass" className="h-14 w-full justify-start gap-4 text-left" onClick={() => choose(key)}><span className="text-xl">{personas[key].icon}</span><span>{personas[key].short}</span><ArrowRight className="ml-auto" /></Button>)}</div>}
                <p className="text-xs leading-6 text-muted-foreground">Kamera digunakan hanya untuk mengenali kartu di perangkatmu. Video tidak disimpan.</p>
              </div>
            </div>
          </motion.section>}

          {screen === "reveal" && <motion.section key="reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center py-10 sm:py-14">
            <div className="mb-8 text-center"><p className="mb-3 text-[11px] font-bold uppercase tracking-[0.25em] text-cyan">02 / The revelation</p><h1 className="font-display text-3xl font-bold text-ivory sm:text-5xl">Kartu masa depanmu terbuka.</h1></div>
            <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1fr)] lg:gap-20">
              <motion.div className="mx-auto w-full max-w-[350px] [perspective:1200px]" initial={{ rotateY: 180, scale: 0.82, opacity: 0 }} animate={{ rotateY: 0, scale: 1, opacity: 1 }} transition={{ duration: 1.1, ease: [0.2, 0.8, 0.2, 1] }}><div className="glass-edge overflow-hidden rounded-[15px] border-[5px] border-cyan/40"><img src={persona.image} alt={`Kartu ${persona.short}`} className="block w-full" /></div></motion.div>
              <div className="text-center lg:text-left"><span className="inline-flex rounded-full border border-gold/30 bg-gold/5 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">✦ &nbsp; YOUR FUTURE PERSONA &nbsp; ✦</span><p className="mt-7 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan">NO. {persona.number} — {persona.label}</p><h2 className="mt-3 font-display text-4xl font-bold leading-tight text-ivory sm:text-6xl">{persona.title}<span className="text-cyan">.</span></h2><div className="mt-7 border-l-2 border-cyan pl-5 text-left"><p className="min-h-28 text-base leading-8 text-foreground sm:text-xl sm:leading-9">“{displayed}<span className="animate-pulse text-cyan">{displayed.length < (persona.quotes[quoteIndex] ?? "").length ? "▍" : ""}</span>”</p></div><div className="mt-8 flex flex-wrap justify-center gap-2 lg:justify-start">{persona.tags.map(tag => <span key={tag} className="rounded-full border border-border bg-card/50 px-3 py-1.5 text-xs text-muted-foreground">{tag}</span>)}</div><Button variant="luminous" size="lg" className="mt-9 h-13 w-full px-7 font-bold sm:w-auto" onClick={() => { playTone("click", sound); setScreen("photo"); }}><Camera /> Buat Kartu Fotomu <ArrowRight className="ml-2" /></Button></div>
            </div>
          </motion.section>}

          {screen === "photo" && <motion.section key="photo" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mx-auto w-full max-w-6xl flex-1 py-8 sm:py-12"><div className="mb-8"><Button variant="ghost" size="sm" className="mb-5 -ml-3 text-muted-foreground" onClick={() => setScreen("reveal")}><ArrowLeft /> Kembali ke hasil</Button><p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan">03 / Keep the moment</p><h1 className="font-display text-3xl font-bold text-ivory sm:text-5xl">Simpan momenmu.</h1></div>
            <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_350px] lg:gap-16"><div className="mx-auto w-full max-w-[650px] overflow-hidden rounded-md border border-cyan/30 shadow-[0_25px_90px_var(--glow-primary)]"><div ref={photoRef} className="photo-card relative overflow-hidden p-5 text-ivory sm:p-8"><div className="flex items-start justify-between gap-4 border-b border-ivory/20 pb-4"><div><div className="font-display text-base font-bold sm:text-lg">GUESS <span className="text-cyan">WHO</span> ARE YOU.</div><div className="mt-1 text-[8px] font-bold uppercase tracking-[0.18em] text-soft sm:text-[10px]">PKKMB FILKOM UB · SGE 2026</div></div><span className="text-right text-[9px] font-bold uppercase tracking-[0.16em] text-cyan">Future Character<br />Reading / {persona.number}</span></div><div className="my-6 grid grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)] items-center gap-5 sm:gap-8"><div className="overflow-hidden rounded-md border-[3px] border-cyan/50 shadow-[0_10px_40px_var(--glow-primary)]"><img src={persona.image} alt={persona.short} crossOrigin="anonymous" className="block w-full" /></div><div className="min-w-0"><p className="text-[8px] font-bold uppercase tracking-[0.16em] text-cyan sm:text-[10px]">THE FUTURE IS YOURS</p><h2 className="mt-3 font-display text-xl font-bold leading-tight break-words sm:text-4xl">{persona.title}<span className="text-cyan">.</span></h2><p className="mt-4 text-[10px] leading-relaxed text-ivory/85 sm:text-sm sm:leading-7">“{persona.quotes[quoteIndex]}”</p></div></div><div className="flex items-end justify-between gap-3 border-t border-ivory/20 pt-4"><div className="min-w-0"><p className="text-[8px] font-bold uppercase tracking-[0.18em] text-soft">FUTURE BELONGS TO</p><p className="mt-1 truncate font-display text-base font-bold sm:text-xl">{name.trim() || "Your future self"}</p><p className="mt-2 text-[9px] text-cyan sm:text-xs">{persona.tags.join("  ·  ")}</p></div><div className="shrink-0 bg-ivory p-1.5"><QRCodeSVG value={shareUrl || "https://lovable.dev"} size={54} bgColor="transparent" fgColor="#0D1730" title="QR menuju permainan Guess Who Are You" /></div></div></div></div>
              <div className="space-y-6"><div><label htmlFor="participant-name" className="mb-3 block text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">Nama kamu <span className="font-normal normal-case tracking-normal">(opsional)</span></label><Input id="participant-name" maxLength={32} value={name} onChange={e => setName(e.target.value)} placeholder="Tulis namamu di kartu" className="h-12 border-border bg-card/60 text-foreground" /></div><p className="text-sm leading-7 text-muted-foreground">Kartu ini siap disimpan atau dijadikan bagian dari foto booth-mu.</p><Button variant="luminous" className="h-12 w-full font-bold" onClick={() => void saveImage()}><Download /> Simpan Kartu</Button><Button variant="glass" className="h-12 w-full" onClick={reset}><RotateCcw /> Main Lagi</Button></div></div>
          </motion.section>}
        </AnimatePresence>
      </main>
      <footer className="flex items-center justify-between gap-3 border-t border-border py-5 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground"><span>© 2026 SGE · FILKOM UB</span><span className="hidden sm:block">Your story starts here</span><span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-cyan" /> Made for the future</span></footer>
    </div>
    {settingsOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-md" onMouseDown={e => { if (e.target === e.currentTarget) setSettingsOpen(false); }}><div role="dialog" aria-modal="true" aria-labelledby="settings-title" className="glass-surface glass-edge w-full max-w-lg rounded-lg p-6 sm:p-8"><div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan">Booth configuration</p><h2 id="settings-title" className="mt-2 font-display text-2xl font-bold text-ivory">Pengaturan scanner</h2></div><Button variant="ghost" size="icon" aria-label="Tutup pengaturan" onClick={() => setSettingsOpen(false)}><X /></Button></div><p className="mt-5 text-sm leading-7 text-muted-foreground">Masukkan URL model Google Teachable Machine milik booth. Model perlu memiliki kelas untuk ikon Karier, Kreativitas, dan Petualangan.</p><label htmlFor="model-url" className="mt-6 mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">URL model</label><Input id="model-url" type="url" value={modelUrl} onChange={e => setModelUrl(e.target.value)} placeholder={DEFAULT_MODEL_URL} className="h-12 border-border bg-background/60" /><p className="mt-3 text-xs leading-6 text-muted-foreground">Belum punya model? Pilih Manual tetap bisa digunakan. URL disimpan hanya di browser ini.</p><Button variant="luminous" className="mt-7 h-12 w-full font-bold" onClick={() => { const url = modelUrl.trim(); if (url && !/^https:\/\//i.test(url)) { alert("Gunakan URL model yang dimulai dengan https://"); return; } window.localStorage.setItem(MODEL_STORAGE_KEY, url); setModelUrl(url); setSettingsOpen(false); }}><Check /> Simpan Pengaturan</Button></div></div>}
  </div>;
}
