# Rencana Sistem Animasi dan Desain Gerak SGE FILKOM UB 2026

## "Guess Who Are You" Booth Game — Motion Graphics Elevation Plan

Dokumen ini memetakan seluruh arsitektur gerak, evaluasi kode saat ini, Motion System terpadu, spesifikasi animasi per layar, storyboard Grand Revelation ala After Effects, dan pembagian kerja tim (Worker W1–W4).

---

## 1. Verifikasi Temuan Audit Statis (T1 – T13)

Berikut adalah status verifikasi empiris setiap temuan berdasarkan audit kode langsung:

| #       | Temuan                                                                                                                                                                                              | Status            | Lokasi Kode                                                                                                                                                               | Bukti & Analisis Detail                                                                                                                                                                                                                                                                                              |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **T1**  | Dokumen usang: `PROJECT.md` dan `ANALISIS.md` menyebut 5 layar + Keepsake Photo, kode hanya punya 4 layar. `qrcode.react` ada di dependensi tapi tidak dipakai.                                     | **Terkonfirmasi** | `PROJECT.md` (L14, L42, L69), `ANALISIS.md` (L46, L145, L183, L383), `src/routes/index.tsx` (L32), `package.json` (L63)                                                   | Di `src/routes/index.tsx`, `Screen = "home" \| "dilemma" \| "scan" \| "reveal"`. Komponen `KeepsakePhotoCard.tsx` telah dihapus pada commit `27a3678`. Dependensi `"qrcode.react": "^4.2.0"` masih ada di `package.json` tetapi tidak pernah di-import dalam berkas kode mana pun.                                   |
| **T2**  | `KineticSentenceReveal.tsx` (215 baris) **tidak di-import** di mana pun selain test. Layar Reveal menampilkan teks statis di dalam `motion.div` fade.                                               | **Terkonfirmasi** | `src/routes/index.tsx` (L386–404), `src/components/booth/KineticSentenceReveal.tsx`                                                                                       | Pada `src/routes/index.tsx`, narasi refleksi takdir dirender statis di dalam `<p>` dengan `motion.div` fade biasa. Komponen `KineticSentenceReveal` hanya diimpor di `src/test/kinetic-reveal.test.tsx` dan `src/test/final-challenger-stress.test.tsx`.                                                             |
| **T3**  | **Kartu tidak pernah benar-benar dibalik.** `RevealCard` selalu merender `TarotCard3D isFlipped={true}`, jadi transisi maskot ke persona tidak ada; kartu hanya fade + rotateY -20° ke 0.           | **Terkonfirmasi** | `src/components/booth/RevealCard.tsx` (L40–62, L110)                                                                                                                      | `RevealCard` mengoper `isFlipped={true}` secara statis ke `TarotCard3D`. Akibatnya sisi kartu persona (180° backface) langsung terlihat sejak frame pertama. Varian Motion `cardVariants` hanya memutar `rotateY` dari -20° ke 0°, tidak ada putaran dari sisi maskot (0°) ke persona (180°).                        |
| **T4**  | `MotionGraphReveal` hanya timeline GSAP ±1 detik (grid + 8 node, opacity akhir 0.35) dan "skip" lewat flag boolean, bukan kontrol timeline.                                                         | **Terkonfirmasi** | `src/components/booth/MotionGraphReveal.tsx` (L39–42, L52–95)                                                                                                             | Timeline GSAP hanya menjalankan animasi singkat berdurasi total 1,0 detik dengan fallback `setTimeout(triggerComplete, 1000)`. Prop `isSkipped` hanya mengecek `if (isSkipped) { onComplete(); return; }` saat mount, bukan mengendalikan `tl.timeScale()` atau `tl.progress(1)`.                                    |
| **T5**  | Chime ganda: `ScannerHUD` memanggil `playAudioTone("reveal")` lalu `handleSelectPersona` memanggilnya lagi.                                                                                         | **Terkonfirmasi** | `src/components/booth/ScannerHUD.tsx` (L115), `src/routes/index.tsx` (L114)                                                                                               | Saat deteksi kartu berhasil dikunci (1400 ms), `ScannerHUD` memanggil `playAudioTone("reveal", soundEnabled)`, kemudian memanggil `onDetectCard(key)` yang diteruskan ke `handleSelectPersona(key)` di `index.tsx`, di mana nada `"reveal"` dipanggil untuk kedua kalinya secara tumpang tindih.                     |
| **T6**  | Efek `ScannerHUD` punya `soundEnabled` di dependency array, jadi **menekan tombol suara saat scan me-restart kamera dan memuat ulang model**.                                                       | **Terkonfirmasi** | `src/components/booth/ScannerHUD.tsx` (L35–159, L159)                                                                                                                     | Dependency array `useEffect` kamera berisi `[modelUrl, soundEnabled, onDetectCard]`. Ketika operator/pengunjung menekan tombol suara di header global, perubahan `soundEnabled` memicu unmount stream kamera (`track.stop()`) dan mengeksekusi ulang `getUserMedia()` serta pemuatan model visual Teachable Machine. |
| **T7**  | `setPrediction` dan `setHoldProgress` dipanggil di setiap iterasi prediksi, jadi re-render React sampai ±60 kali/detik. Nilai kontinu harus lewat ref/MotionValue/`quickTo`, state dibatasi ≤10 Hz. | **Terkonfirmasi** | `src/components/booth/ScannerHUD.tsx` (L82–135, L97, L110)                                                                                                                | Loop `requestAnimationFrame` memanggil `setPrediction` dan `setHoldProgress` setiap frame prediksi. Hal ini memicu re-render React beruntun (~60 fps) pada seluruh subtree ScannerHUD, membebani CPU booth.                                                                                                          |
| **T8**  | Tidak ada momen "lock-on": saat deteksi terkunci layar langsung diganti (exit 0.35 s + enter) sehingga ada jeda hampa. Ambang 0.82 / 1400 ms, sedangkan README menyebut >85% / 1,5 s.               | **Terkonfirmasi** | `src/components/booth/ScannerHUD.tsx` (L102, L109, L113)                                                                                                                  | Ambang probabilitas disetel ke `0.82` dan durasi `1400` ms (tidak selaras dengan README yang mencatat >85% dan 1,5 detik). Ketika `elapsed >= 1400`, tidak ada visual punch / bracket snap / flash, melainkan langsung transisi pergantian layar seketika.                                                           |
| **T9**  | `playAudioTone` membuat `AudioContext` baru di setiap panggilan. Perlu satu context bersama yang di-resume pada gesture pertama (iOS).                                                              | **Terkonfirmasi** | `src/lib/audio.ts` (L17, L34, L51, L73, L96)                                                                                                                              | Setiap panggilan fungsi `playAudioTone` mengeksekusi `new AudioContextClass()` dan menjadwalkan penutupan dengan `window.setTimeout(() => void context.close())`. Tidak ada singleton context bersama dan tidak ada penanganan resume audio context pada sentuhan/klik pertama (kebijakan autoplay iOS/WebKit).      |
| **T10** | Modal Pengaturan dirender kondisional tanpa `AnimatePresence`, tanpa focus trap, dan memakai `alert()`. Radix Dialog dan `sonner` sudah ada di dependensi.                                          | **Terkonfirmasi** | `src/routes/index.tsx` (L475–561, L547)                                                                                                                                   | Modal pengaturan dirender dengan `{settingsOpen && (<div ...>)}` tanpa `AnimatePresence`, tidak memiliki focus trap maupun penanganan tombol Escape. Validasi URL pada L547 masih menggunakan fungsi sinkronus `alert()`. Komponen Radix Dialog dan Sonner sudah tersedia di `package.json`.                         |
| **T11** | Animasi Home berupa 3 loop `repeat: Infinity` Motion terpisah pada kartu deck; Dilema hanya fade + hover; header/footer statis; tidak ada koreografi antar-layar.                                   | **Terkonfirmasi** | `src/components/booth/InteractiveDeck.tsx` (L55–60, L93–98, L129–134), `src/components/booth/ReflectionDilemma.tsx` (L23–28), `src/routes/index.tsx` (L132–181, L464–471) | Tiga kartu di `InteractiveDeck` menjalankan tiga loop Motion `repeat: Infinity` independen (durasi 4.8s, 5.2s, 5.0s). Tombol shuffle hanya memicu increment state sederhana untuk memicu remount. Dilema hanya transisi statis `initial={{ opacity: 0, y: 16 }}`. Header dan footer tidak memiliki koreografi intro. |
| **T12** | `KineticSentenceReveal` tidak memakai `useReducedMotion` (komponen lain sudah). CSS global menekan durasi ke 0.01 ms saat reduced-motion, tapi itu tidak cukup untuk timeline GSAP.                 | **Terkonfirmasi** | `src/components/booth/KineticSentenceReveal.tsx`, `src/styles.css` (L371–382)                                                                                             | `KineticSentenceReveal` sama sekali tidak mengimpor `useReducedMotion`. Di `styles.css`, media query reduced-motion hanya menimpa CSS animation/transition ke `0.01ms`, sementara timeline JavaScript GSAP tidak terpengaruh oleh CSS tersebut kecuali dikendalikan dengan `gsap.matchMedia()`.                      |
| **T13** | Font dari Google Fonts: di venue dengan internet buruk, tipografi bisa jatuh ke fallback. Model TM juga remote.                                                                                     | **Terkonfirmasi** | `src/routes/__root.tsx` (L91–96), `src/routes/index.tsx` (L35)                                                                                                            | Link stylesheet Google Fonts dimuat via CDN eksternal (`fonts.googleapis.com`). Model Teachable Machine default dimuat dari endpoint remote Google. Di lingkungan booth offline atau jaringan padat, font dan model rentan gagal diunduh.                                                                            |

---

## 2. Peta Animasi Saat Ini & Risiko Performa

### 2.1 Inventaris Komponen & Properti yang Dianimasikan

| Komponen                                                   | Library                    | Elemen & Properti                                                                                         | Karakteristik / Kelemahan                                                                                          | Risiko Performa                               |
| ---------------------------------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| **Global Canvas (`index.tsx`)**                            | Motion                     | `AnimatePresence mode="wait"` membungkus `<main>` dengan 4 layar                                          | Crossfade standar 350 ms, tidak ada orkestrasi arah maju/mundur, tidak ada aksen dinamis antar-layar               | Rendah                                        |
| **Header & Footer (`index.tsx`)**                          | Statis / CSS               | Tidak ada animasi; logo dan tombol suara statis                                                           | Kurang sentuhan mikro-interaksi booth premium                                                                      | Nol                                           |
| **Home Deck (`InteractiveDeck.tsx`)**                      | Motion                     | 3 kartu: `x`, `y`, `rotate`, `scale`, array keyframes, 3 loop `repeat: Infinity` independen               | Loop berjalan terus-menerus bahkan saat tab disembunyikan; shuffle hanya remount key React                         | Sedang (beban thread konstan di latar)        |
| **Dilemma Selection (`ReflectionDilemma.tsx`)**            | Motion                     | Container `opacity`, `y`; Card `whileHover`, `whileTap`                                                   | Kartu saudara tidak meredup saat kartu disentuh; kartu terpilih tidak beranimasi keluar secara koreografis         | Rendah                                        |
| **Scanner Viewfinder (`ScannerHUD.tsx`)**                  | CSS + Motion + React State | `.scan-line` keyframe linear; prediction bar continuous update; text status update                        | `setPrediction` dan `setHoldProgress` memicu render React 60 Hz; `soundEnabled` merestart kamera                   | **Tinggi** (jank rendering saat kamera aktif) |
| **Revelation Container (`MotionGraphReveal.tsx`)**         | GSAP 3.15 + Motion         | SVG grid lines (`scale`, `rotateX`, `opacity`), 8 node constellations (`scale`, `opacity`, `back.out`)    | Timeline hanya 1 detik; `isSkipped` sekadar unmount flag bukan timeline control; tidak ada koreografi dengan kartu | Rendah                                        |
| **Revelation Card (`RevealCard.tsx` + `TarotCard3D.tsx`)** | Motion                     | Wrapper card: spring `scale`, `rotateY` (-20°→0°); Card 3D: pointer tilt `rotateX`, `rotateY`, `sheenPos` | **Kartu tidak pernah berputar dari sisi maskot** (`isFlipped={true}`); tilt memicu re-render React lokal           | Sedang                                        |
| **Revelation Title (`RevealLetterRoll.tsx`)**              | Motion                     | Split perkata dan perhuruf: masked `y` (115%→0%), `rotateX` (40°→0°), `opacity`                           | Efek roll bersih, tetapi tidak bersinergi dengan waktu kedatangan kartu                                            | Rendah                                        |
| **Sentence Narrative (`KineticSentenceReveal.tsx`)**       | Motion                     | Per-kata: `blur(8px)`→`0px`, spring vertical translation, golden sweep linear-gradient                    | **Belum dipasang** di layar utama (`index.tsx`); belum mendukung reduced-motion                                    | Rendah                                        |

---

## 3. Desain Motion System Terpadu

### 3.1 Hierarki Gerak (Motion Tiers)

1. **Tier 1 — Hero:** Grand Revelation sinematik (Bagian 4) dan Intro Home Deck (pembagian kartu dari tumpukan).
2. **Tier 2 — Transisi Layar:** Satu bahasa visual transisi panggung dengan circuit tracing lines yang menggambar melintasi panggung (0.5–0.7s), dengan arah terarah (maju vs kembali).
3. **Tier 3 — Respons Aksi (Tactile Feedback):** Tombol klik, hover kartu dengan redaman kartu lain, touch tilt responsif tanpa jank, lock-on confirmation.
4. **Tier 4 — Ambient (Background):** Partikel lembut, pernapasan aurora/blob latar, sweep holografik perlahan. Harus selalu berada di latar belakang dan otomatis dijeda saat `document.hidden`.

### 3.2 Token Desain Gerak Konsisten

Selaras dengan brand token SGE 2026 yang sudah ada di repo:

```ts
// src/lib/motion/tokens.ts
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
    emphasized: [0.16, 1, 0.3, 1] as const, // Kurva editorial signature SGE
    overshoot: [0.34, 1.56, 0.64, 1] as const,
    decelerate: [0.0, 0.0, 0.2, 1] as const,
    accelerate: [0.4, 0.0, 1, 1] as const,
  },
  spring: {
    button: { stiffness: 400, damping: 22 },
    card: { stiffness: 340, damping: 24, mass: 0.8 },
    cardHover: { stiffness: 350, damping: 22 },
    text: { stiffness: 180, damping: 20 },
    gentle: { stiffness: 200, damping: 28 },
  },
  gsapEase: {
    emphasized: "power3.out",
    smooth: "power2.inOut",
    impact: "back.out(1.4)",
    spinDecel: "expo.out",
    dramatic: "power4.out",
  },
} as const;
```

### 3.3 Tingkat Kualitas Grafis Dinamis (Performance Quality Tiers)

Sistem secara otomatis mendeteksi kapabilitas perangkat booth dan operator dapat mengubahnya melalui modal Pengaturan atau parameter URL `?fx=high|medium|low`:

| Fitur / Parameter                | High Tier                                                                              | Medium Tier                                 | Low Tier                      |
| -------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------- | ----------------------------- |
| **Kriteria Deteksi**             | `hardwareConcurrency >= 6`, FPS probe >= 55, memory >= 4GB                             | `hardwareConcurrency >= 4`, FPS probe >= 40 | Perangkat low-spec / `fx=low` |
| **Partikel Canvas**              | Pool 120 partikel, alpha blending, decay dinamis                                       | Pool 60 partikel, durasi singkat            | Dimatikan (0 partikel)        |
| **Echo Trails (Bayangan Putar)** | 3 klon kartu dengan opacity menurun                                                    | 1 klon kartu                                | Dimatikan                     |
| **Efek Kamera / Filter**         | RGB-Split chromatic aberration (120ms), zoom dolly 3D                                  | Zoom dolly sederhana tanpa RGB-split        | Transform skala 2D saja       |
| **Motion Blur & Glow**           | Radial glow canvas + CSS blur                                                          | CSS blur ringkas                            | Warna solid border saja       |
| **Reduced Motion**               | Dihormati penuh: crossfade 300ms, tanpa spin, tanpa shake, tanpa partikel, tanpa kilat |

### 3.4 Aturan Kepemilikan Properti (GSAP vs Motion Invariant)

**Aturan Emas:** Satu elemen DOM hanya boleh digerakkan oleh satu pustaka animasi.

1. `TarotCard3D` menggunakan `motion/react` untuk gesture tilt internal pengunjung (interaksi pointer hover/touch).
2. GSAP mengendalikan wrapper terluar kartu (`cardStageRef`) untuk timeline sinematik: translasi 3D, rotasi Y 1260° pada fase spin, scale overshoot, dan impact shake.
3. Selama timeline GSAP aktif, gesture pointer pada kartu di-disable (`pointer-events: none`). Setelah label `settle` tercapai, kontrol diserahkan kembali secara mulus ke pointer tilt kartu.

---

## 4. Storyboard & Spesifikasi Grand Revelation Sinematik

### 4.1 Master Timeline (Total Durasi ~6.8 Detik)

Timeline GSAP master dengan label terorkestrasi, dapat diskip kapan saja (`tl.progress(1)` langsung ke label `settle`):

```
0.0s       0.5s       1.0s       2.0s       3.3s   3.7s       4.8s       6.5s
 ├──────────┼──────────┼──────────┼──────────┼──────┼──────────┼──────────┤
 [lockOn]  [iris]    [charge]    [spin]   [impact] [burst]    [reading]  [settle]
```

1. **`lockOn` (0.00 – 0.55s):**
   - Transisi dari Scanner atau Dilemma. Bracket sudut menjepit ke arah tengah kartu.
   - Kilatan putih mikro aksen (durasi 90ms, opacity 0.45 — mematuhi WCAG 2.3.1).
   - Audio: sintetis `lockon`.
2. **`iris` (0.40 – 1.10s):**
   - Iris radial `clip-path: circle()` mengembang dari titik pusat kartu dengan warna aksen persona, membuka panggung kosmik gelap `#081113`.
   - Audio: sapuan `whoosh`.
3. **`charge` (0.90 – 2.20s):**
   - Kartu muncul di panggung menghadap ke depan: **Sisi Maskot (0° Face-Down)**.
   - Kartu tertarik sedikit mundur ke sumbu Z (-120px) sebagai gerakan antisipasi (_anticipation_).
   - Pilar cahaya dan garis partikel menyatu ke kartu. Kamera dolly-in halus (`perspective` container).
   - Audio: nada `shimmer` naik.
4. **`spin` (2.00 – 3.30s):**
   - Kartu terangkat mengambang dan berputar sumbu Y **3.5 putaran penuh (0° ke 1260°)** dengan kurva deakselerasi ekstrim (`expo.inOut` melambat di ujung).
   - Di belakang kartu muncul 2–3 jejak bayangan (_echo trails_) dengan opacity menurun pada High & Medium tier.
   - Di ujung putaran 1260°, kartu berhenti tepat menghadap penonton pada **Sisi Persona (180° back artwork)**.
   - Audio: sapuan udara cepat `whoosh`.
5. **`impact` (3.30 – 3.70s):**
   - Hantaman pendaratan kartu: scale overshoot 1.12 ke 1.0 (`back.out(1.6)`).
   - Gelombang kejut (_shockwave ring_) mengembang keluar dari balik kartu.
   - Guncangan kamera mikro (_micro screen-shake_, amplitudo 4px, durasi 180ms).
   - RGB-Split singkat (durasi 100ms pada tier High).
   - Audio: dentuman nada `impact`.
6. **`burst` (3.40 – 4.60s):**
   - Letupan konfeti/partikel canvas warna aksen persona + emas.
   - Streak lensa anamorphic tipis menyapu kartu.
   - Masuknya tanda tangan visual unik per persona (lihat 4.2).
   - Audio: kilau `shimmer`.
7. **`title` (3.90 – 5.20s):**
   - Badge nomor kartu `"NO. 0X"` melakukan decode scramble teks tipis.
   - Judul persona naik per huruf dengan masking roll (`RevealLetterRoll`).
   - Garis bawah aksen menggambar dirinya sendiri via DrawSVG / scaleX.
   - Audio: nada klik `tick` diskrit.
8. **`reading` (4.90 – 6.50s):**
   - Integrasi `KineticSentenceReveal`: kalimat proyeksi takdir muncul per kata (`blur(8px)` ke `0px`, spring vertical).
   - Sapuan cahaya emas (_golden sweep_) melintasi kartu narasi saat teks selesai dibaca.
9. **`settle` (6.50s+):**
   - Tombol aksi ganda ("Pilih Kartu Lain" dan "Kembali ke Awal") beranimasi masuk via spring.
   - Kartu masuk ke mode idle breathing Tier 4 dan mengaktifkan interaktivitas pointer tilt 3D holografik.

### 4.2 Tanda Tangan Karakter Per Persona (Diferensiasi Bahasa Gerak)

Karena persona _Creative_ dan _Adventure_ sama-sama menggunakan nuansa warna biru-teal (Coral Aqua `#57D4DD` dan Pacific Ocean `#3A8C9A`), diferensiasi panggung **wajib ditekankan pada bentuk dan gerak**:

- **Career — "The Foundation Builder" (Emas `#F2B705`):**
  - _Bahasa Gerak:_ Arsitektural, presisi, kokoh.
  - _Elemen:_ Garis grid blueprint menggambar diri dengan sudut 90°, balok-balok pondasi naik secara bertingkat (_staggered slab rise_), wipe cahaya horizontal tegas.
  - _Kurva:_ `power3.out`, tanpa pantulan elastis (stabil).
  - _Partikel:_ Partikel persegi emas kecil yang jatuh teratur mengikuti gravitasi.
- **Creative — "The Soul Crafter" (Aqua `#57D4DD`):**
  - _Bahasa Gerak:_ Organik, mengalir, lembut.
  - _Elemen:_ Goresan kuas melengkung bermekaran (_brush stroke reveal_ via path mask), blob aurora fluida yang mengembang, aksen kilau warm papaya whip (`#FFEFD3`).
  - _Kurva:_ `sine.out` dan pantulan halus elastis.
  - _Partikel:_ Orb partikel bulat berukuran acak yang melayang ke atas dengan gerak meliuk.
- **Adventure — "The Boundary Breaker" (Ocean `#3A8C9A`):**
  - _Bahasa Gerak:_ Eksploratif, dinamis, menembus batas.
  - _Elemen:_ Cincin kompas berputar cepat, garis cakrawala menyapu melebar, streak radial warp meluncur dari titik pusat panggung.
  - _Kurva:_ `expo.out` berekor panjang dengan dorongan maju (_forward momentum_).
  - _Partikel:_ Partikel garis kecepatan radial (_speed lines_) memancar keluar.

---

## 5. Rencana Perbaikan Bug & Refactoring Kode

| Kode Temuan | Target File                                                                              | Rencana Tindakan & Solusi                                                                                                                                                                                                                                                                                                                                       |
| ----------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **T2**      | `src/routes/index.tsx`, `src/components/booth/KineticSentenceReveal.tsx`                 | Hubungkan `KineticSentenceReveal` ke layar Reveal di `index.tsx`. Sediakan prop `showReroll={false}` agar tombol "Tarik Refleksi Baru" tersembunyi di alur reveal utama (memenuhi ekspektasi test `e2e-booth-flow.test.tsx`), sementara API komponen tetap kompatibel dengan test unit `kinetic-reveal.test.tsx`.                                               |
| **T3**      | `src/components/booth/RevealCard.tsx`, `src/components/booth/reveal/CinematicReveal.tsx` | Buat komponen `CinematicReveal` baru. Mulai render kartu pada sisi depan maskot (`rotateY: 0`), lalu putar Y 1260° pada fase spin GSAP hingga berhenti sempurna di sisi persona (`rotateY: 1260` -> ekuivalen 180° back artwork).                                                                                                                               |
| **T5**      | `src/components/booth/ScannerHUD.tsx`, `src/routes/index.tsx`                            | Hapus pemanggilan duplikat `playAudioTone("reveal")` di `ScannerHUD.tsx`. Cukup mainkan suara lockon/confirm saat kartu terkunci, dan serahkan pemutaran audio reveal ke transisi `handleSelectPersona` / timeline reveal.                                                                                                                                      |
| **T6**      | `src/components/booth/ScannerHUD.tsx`                                                    | Simpan referensi `soundEnabled` di dalam `soundRef = useRef(soundEnabled)` dan gunakan ref tersebut di dalam callback handler audio tanpa memasukkan `soundEnabled` ke dependency array `useEffect` kamera. Kamera dan model tidak akan lagi ter-restart saat tombol suara ditekan.                                                                             |
| **T7**      | `src/components/booth/ScannerHUD.tsx`                                                    | Ubah pembaruan visual kontinu (persentase hold & bar keyakinan) menjadi langsung memanipulasi DOM style via ref (`progressRef.current.style.width`) atau MotionValue. Batasi `setPrediction` React state maksimum 10 Hz (throttle interval >= 100ms).                                                                                                           |
| **T8**      | `src/components/booth/ScannerHUD.tsx`                                                    | Pasang animasi lock-on 0.5s sebelum navigasi: sudut reticle menjepit ke arah kartu, video desaturasi/freeze sesaat, kilatan aksen <=120ms, nada audio `lockon`, kemudian panggil `onDetectCard(key)`. Selaraskan ambang ke >85% dan 1.5 detik.                                                                                                                  |
| **T9**      | `src/lib/audio.ts`                                                                       | Buat shared singleton `AudioContext` yang dibuat secara lazy. Tambahkan listener pada gesture pertama (pointerdown/keydown) untuk melakukan `context.resume()`. Tambahkan nada sintetis baru: `lockon`, `whoosh`, `impact`, `shimmer`, `tick`.                                                                                                                  |
| **T10**     | `src/routes/index.tsx`                                                                   | Bungkus modal Pengaturan dengan Radix Dialog (`@radix-ui/react-dialog`) dan `AnimatePresence`. Mengganti `alert()` dengan toast notification dari `sonner`. Tambahkan pilihan slider/dropdown "Kualitas Efek" (High, Medium, Low).                                                                                                                              |
| **T11**     | `src/components/booth/InteractiveDeck.tsx`, `src/components/booth/ReflectionDilemma.tsx` | Satukan 3 loop independen di Home menjadi orkestrasi timeline terpadu yang otomatis dijeda saat tab tersembunyi. Buat animasi shuffle nyata dengan persilangan busur 3D dan pertukaran z-index. Pada Dilemma, tambahkan efek peredupan kartu saudara saat satu kartu di-hover, serta animasi kartu terpilih terangkat dan kartu lain jatuh memudar saat diklik. |
| **T12**     | `src/components/booth/KineticSentenceReveal.tsx`, `src/lib/motion/*`                     | Pasang `useReducedMotion()` di `KineticSentenceReveal` dan gunakan `gsap.matchMedia()` di seluruh timeline GSAP untuk cabang reduced-motion yang elegan (crossfade <=300ms, tanpa spin/shake/partikel).                                                                                                                                                         |

---

## 6. Pembagian Kerja Per Worker & File yang Disentuh

| Sub-Agent Worker           | Cakupan Tanggung Jawab                                                                                                                                           | File yang Disentuh Eksklusif                                                                                                                                                                                                                                                                                                                                                                                                            |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **W1 Motion Foundation**   | Fondasi motion system, tokens, audio singleton, tier detection, reduced-motion hook, perbaikan T5, T6, T7, T9.                                                   | - `src/lib/motion/tokens.ts` (baru)<br>- `src/lib/motion/tiers.ts` (baru)<br>- `src/lib/motion/gsap-setup.ts` (baru)<br>- `src/lib/motion/use-reduced-motion-unified.ts` (baru)<br>- `src/lib/audio.ts`<br>- `src/styles.css`<br>- `package.json` (tambah `@gsap/react`, hapus `@types/gsap` lama)                                                                                                                                      |
| **W2 Cinematic Reveal**    | Orkes reveal sinematik After Effects, partikel canvas pool, tanda tangan 3 persona, perbaikan T2, T3, T4, T12.                                                   | - `src/components/booth/reveal/CinematicReveal.tsx` (baru)<br>- `src/components/booth/reveal/ParticleCanvas.tsx` (baru)<br>- `src/components/booth/reveal/PersonaSignatures.tsx` (baru)<br>- `src/components/booth/RevealCard.tsx`<br>- `src/components/booth/MotionGraphReveal.tsx`<br>- `src/components/booth/TarotCard3D.tsx`<br>- `src/components/booth/KineticSentenceReveal.tsx`<br>- `src/components/booth/RevealLetterRoll.tsx` |
| **W3 Screens**             | Peningkatan gerak Home Deck (intro + shuffle nyata + float), Dilemma (focus hover + exit lift + mobile snap carousel), ScannerHUD (lock-on beat + T6/T7/T8 fix). | - `src/components/booth/InteractiveDeck.tsx`<br>- `src/components/booth/ReflectionDilemma.tsx`<br>- `src/components/booth/ScannerHUD.tsx`                                                                                                                                                                                                                                                                                               |
| **W4 Shell & Transitions** | Transisi panggung global (circuit draw line), dialog pengaturan Radix + Sonner (T10), ambient stage accent, 404 touch.                                           | - `src/routes/index.tsx`<br>- `src/routes/__root.tsx`                                                                                                                                                                                                                                                                                                                                                                                   |

---

## 7. Usulan di Luar Scope (Tandai: Perlu Persetujuan)

Usulan berikut merupakan penyempurnaan di luar batasan fitur dasar yang dapat diimplementasikan untuk keandalan maksimal booth game:

1. **[USULAN-1] Model Teachable Machine Bundled Offline di `public/models/`**
   - _Masalah:_ Model TM dimuat dari Google CDN (`https://teachablemachine.withgoogle.com/...`). Jika internet venue FILKOM UB terputus, kamera tidak dapat melakukan inferensi.
   - _Solusi:_ Menyimpan file `model.json`, `metadata.json`, dan `weights.bin` di folder `public/models/` sebagai fallback otomatis jika fetch remote gagal.
   - _Estimasi Ukuran:_ ±4.2 MB.
   - _Risiko:_ Rendah, hanya statis asset. _Status:_ **Perlu Persetujuan Pengguna**.

2. **[USULAN-2] Self-Hosted Web Fonts (Inter, Space Grotesk, Courier Prime)**
   - _Masalah:_ Font bergantung pada koneksi internet ke `fonts.googleapis.com`.
   - _Solusi:_ Download file WOFF2 dan muat secara lokal di `public/fonts/` dengan font-display `swap`.
   - _Estimasi Ukuran:_ ±120 KB WOFF2.
   - _Risiko:_ Rendah. _Status:_ **Perlu Persetujuan Pengguna**.

3. **[USULAN-3] Konversi Kartu Gambar JPG ke Modern WebP / AVIF**
   - _Masalah:_ 4 gambar kartu JPG saat ini berukuran total ~1.17 MB (masing-masing 280–314 KB).
   - _Solusi:_ Menyediakan versi WebP yang terkompresi tanpa mengurangi kualitas visual (menjadi ~90 KB per kartu, total ~360 KB).
   - _Estimasi Ukuran:_ Penghematan ~800 KB transfer data.
   - _Risiko:_ Tes `card-assets.test.ts` dan `final-challenger-2-stress.test.tsx` memeriksa header JPG (`FF D8 FF`) pada file asli. Jika dikonversi, file JPG asli harus tetap dipertahankan atau test diperbarui secara sadar. _Status:_ **Perlu Persetujuan Pengguna**.

4. **[USULAN-4] Attract Mode / Auto-Reset Timer Saat Booth Menganggur**
   - _Masalah:_ Jika pengunjung booth meninggalkan layar Reveal atau Dilemma tanpa menekan tombol "Kembali ke Awal", layar akan tetap diam di sana.
   - _Solusi:_ Idle timer 90 detik tanpa interaksi pointer/sentuhan yang secara otomatis mengembalikan layar ke Home dengan animasi fade lembut.
   - _Risiko:_ Nol. _Status:_ **Perlu Persetujuan Pengguna**.

5. **[USULAN-5] Perbaikan Typo Teks Footer "Guest Who You Are?" Menjadi "Guess Who You Are?"**
   - _Masalah:_ Sesuai Aturan Keras 2, teks konten tidak boleh diubah tanpa izin. Footer saat ini bertuliskan "Guest Who You Are?".
   - _Status:_ **Perlu Persetujuan Pengguna** untuk mengubah copy string footer tersebut atau dibiarkan apa adanya.

---

## 8. Estimasi Dampak Bundle & Pengujian

### 8.1 Estimasi Ukuran Bundle

- **Penambahan `@gsap/react`:** ~3.2 kB gzip. (GSAP 3.15 sudah terpasang di project, `@gsap/react` hanya wrapper hook `useGSAP`).
- **Pembersihan `@types/gsap`:** 0 kB (dev dependency lama).
- **Komponen Motion Foundation & Canvas Particle:** ~4.5 kB gzip (100% kode internal tanpa pustaka pihak ketiga).
- **Dampak Total:** < 8 kB gzip tambahan pada client bundle.
- **Strategi Code-Splitting:** Modul partikel dan timeline GSAP di-lazy load sehingga First Contentful Paint (FCP) layar Home tetap instan (< 1.2 detik).

### 8.2 Rencana Pengujian Otomatis & Regresi

- Seluruh 15 file test yang ada (`129/129 tests passing`) wajib dipertahankan kelulusannya.
- Khusus test `src/test/m1-challenger-stress.test.ts` (100.000 iterasi benchmark) diverifikasi tetap stabil di bawah batas waktu.
- Khusus test `src/test/e2e-booth-flow.test.tsx` (assertion bahwa tombol `Tarik Refleksi Baru` tidak muncul pada layar Revelation), komponen `KineticSentenceReveal` akan dikonfigurasi dengan aman.
- Penambahan test suite baru untuk:
  1. Label timeline reveal (`lockOn`, `iris`, `charge`, `spin`, `impact`, `burst`, `title`, `reading`, `settle`) dan durasi total 6.5–7.0s.
  2. Fungsi `skip()` yang memanggil `onComplete` tepat 1 kali dan langsung melompat ke state settle.
  3. Cabang `prefers-reduced-motion` yang tidak menginisialisasi rotasi Y atau partikel.
  4. Audio singleton yang tidak melempar pengecualian saat `AudioContext` tidak didukung.
  5. Pengujian bahwa toggle `soundEnabled` di ScannerHUD tidak me-restart kamera.
