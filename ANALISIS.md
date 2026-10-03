# Analisis Komprehensif Repositori: Path-Projection

**PKKMB FILKOM UB — SGE 2026 Booth Game ("Guess Who Are You")**  
_Dokumen Analisis Teknis, Alur Game, Inventaris Konten, Kualitas Sistem, dan Rekomendasi UX_  
_Disusun oleh: Senior Full-Stack Engineer & UX Reviewer_  
_Status: Read-Only Audit (Checkpoint 1)_

---

## 1. Ringkasan Eksekutif

Aplikasi **"path-projection"** adalah game booth interaktif berbasis web untuk menyambut mahasiswa baru dalam rangkaian acara **PKKMB FILKOM UB — Student Government Expo (SGE) 2026**. Mengusung tajuk _"Guess Who Are You"_, permainan ini memadukan konsep _tarot reading_ modern bertema _neo-editorial_ dengan teknologi kecerdasan buatan (_Computer Vision via Teachable Machine / TensorFlow.js_) yang berjalan **100% di sisi peramban (client-side)** tanpa ketergantungan pada backend server, akun, atau basis data.

Aplikasi telah melalui proses refaktor dari purwarupa awal:

1. Menghilangkan seluruh ketergantungan CDN eksternal Lovable (`/__l5e/...`) dan memigrasikan aset 4 kartu fisik beresolusi tinggi ke dalam sistem _bundle_ lokal Vite ESM ([`src/assets/cards/`](file:///Users/noxval/_PROJECT_/path-projection/src/assets/cards/)).
2. Menerapkan sistem identitas visual resmi SGE 2026 yang elegan di [`src/styles.css`](file:///Users/noxval/_PROJECT_/path-projection/src/styles.css) (menggantikan _generic cyberpunk glow_ menjadi _neo-editorial bento_, tekstur sirkuit FILKOM, dan perforasi perangko tarot).
3. Mengembangkan komponen pembacaan refleksi dinamis [`KineticSentenceReveal.tsx`](file:///Users/noxval/_PROJECT_/path-projection/src/components/booth/KineticSentenceReveal.tsx) (kata demi kata blur-ke-tajam dan sapuan cahaya emas) dengan tombol acak kutipan (_reroll_) non-repetitif dari 18 pool refleksi per persona.
4. Memiliki rangkaian pengujian otomatis Vitest yang lulus 100% (13 berkas tes, 120 pengujian unit/integrasi/stres) dan skor Lighthouse Accessibility 100/100.

---

## 2. Peta Project, Stack & Cara Menjalankan

### 2.1 Struktur Folder Proyek

```
path-projection/
├── public/                     # Aset statis peramban (favicon, robots.txt)
├── src/
│   ├── assets/
│   │   ├── cards/              # 4 Aset gambar kartu fisik asli (Vite ESM)
│   │   │   ├── card-front.jpg      # Maskot kartu depan (314 KB, 724×1024)
│   │   │   ├── card-career.jpg     # Kartu Persona 01 Karier (281 KB, 724×1024)
│   │   │   ├── card-creative.jpg   # Kartu Persona 02 Kreativitas (288 KB, 724×1024)
│   │   │   └── card-adventure.jpg  # Kartu Persona 03 Petualangan (288 KB, 724×1024)
│   │   └── patterns/
│   │       └── PatternTeal.svg     # Vektor sirkuit mikro SGE 2026
│   ├── components/
│   │   ├── booth/              # Komponen domain game booth
│   │   │   ├── InteractiveDeck.tsx       # Tumpukan kartu 3D di layar Home
│   │   │   ├── ReflectionDilemma.tsx     # Layar seleksi dilema (3 kartu)
│   │   │   ├── ScannerHUD.tsx            # Viewfinder optikal AI kamera & drawer manual
│   │   │   ├── TarotCard3D.tsx           # Fisika tilt 3D kursor & pantulan cahaya
│   │   │   ├── KineticSentenceReveal.tsx # Animasi teks refleksi & reroll
│   │   │   └── KeepsakePhotoCard.tsx     # Studio polaroid foto kenang-kenangan & PNG export
│   │   └── ui/                 # Komponen primitif UI (shadcn / Radix)
│   ├── data/
│   │   └── personas.ts         # Data master 3 persona, 54 kutipan, dan relasi aset
│   ├── hooks/
│   │   └── use-mobile.tsx      # Deteksi breakpoint layar mobile (768px)
│   ├── lib/
│   │   ├── audio.ts            # Synthesizer efek suara sintetis (Web Audio API)
│   │   ├── classifier.ts       # Regex parser klasifikasi label AI Teachable Machine
│   │   └── utils.ts            # Tailwind class merger (clsx + tailwind-merge)
│   ├── routes/
│   │   ├── __root.tsx          # Shell dokumen HTML, Google Fonts, meta tag
│   │   └── index.tsx           # State machine 5 layar utama game
│   ├── test/                   # 13 berkas pengujian Vitest (120 skenario uji)
│   ├── client.tsx              # Entry point hidrasi klien TanStack Start
│   ├── server.ts               # Entry point SSR Nitro
│   ├── router.tsx              # Router factory TanStack Router
│   ├── routeTree.gen.ts        # Rute tergenerasi otomatis
│   └── styles.css              # Konfigurasi Tailwind v4 (@theme inline) & token SGE 2026
├── eslint.config.js            # Konfigurasi linter ESLint 9 Flat Config
├── package.json                # Dependensi proyek & script npm
├── tsconfig.json               # Konfigurasi TypeScript (ES2022, Bundler, Strict)
├── vite.config.ts              # Konfigurasi bundler Vite 8 via Lovable wrapper
└── vitest.config.ts            # Konfigurasi unit & integration test Vitest
```

### 2.2 Stack Teknologi

- **Framework & SSR Runtime**: [TanStack Start](https://tanstack.com/start) (`@tanstack/react-start` v1.168.60, `@tanstack/react-router` v1.170.41) berjalan di atas engine [Nitro 3](https://nitro.unjs.io/) (`3.0.260603-beta`).
- **Pustaka UI & Reaktivitas**: [React 19](https://react.dev/) (`react` v19.2.0, `react-dom` v19.2.0).
- **Sistem Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (`@tailwindcss/vite` v4.2.1, `tailwindcss` v4.2.1) tanpa berkas konfigurasi legacy JS, melainkan CSS-first dengan `@theme inline` di [`src/styles.css`](file:///Users/noxval/_PROJECT_/path-projection/src/styles.css).
- **Animasi & Interaksi Fisika**: [Motion (Framer Motion v13)](https://motion.dev/) (`motion` v13.4.6).
- **Komponen Primitif & Ikon**: [Radix UI](https://www.radix-ui.com/) via pola [shadcn/ui](https://ui.shadcn.com/) dan [Lucide React](https://lucide.dev/) (`lucide-react` v0.575.0).
- **AI & Computer Vision Klien**: [@teachablemachine/image](https://github.com/googlecreativelab/teachablemachine-community) v0.8.5 didukung oleh [@tensorflow/tfjs](https://www.tensorflow.org/js) v4.22.0.
- **Ekspor Dokumen Grafis**: [html-to-image](https://github.com/bubkoo/html-to-image) v1.11.13 dan [qrcode.react](https://github.com/zpao/qrcode.react) v4.2.0.
- **Audio Engine**: Sintesis gelombang frekuensi Web Audio API murni di [`src/lib/audio.ts`](file:///Users/noxval/_PROJECT_/path-projection/src/lib/audio.ts) (nol latensi HTTP dan tanpa aset file suara audio eksternal).
- **Bundler & Tooling**: [Vite 8](https://vite.dev/) (`vite` v8.1.5) dengan override [Rolldown](https://rolldown.rs/) (`rolldown` v1.2.1).
- **Package Manager**: Bun (`bun.lock`, `bunfig.toml`) dan npm (`package-lock.json`).
- **Testing**: [Vitest](https://vitest.dev/) v4.1.10 dengan lingkungan browser simulasi `jsdom`.

### 2.3 Perintah Operasional

| Perintah                         | Deskripsi                                                                                          |
| -------------------------------- | -------------------------------------------------------------------------------------------------- |
| `npm install` atau `bun install` | Memasang seluruh dependensi dari lockfile.                                                         |
| `npm run dev`                    | Menjalankan Vite development server (default pada `http://localhost:8080/` atau `8081`).           |
| `npm run build`                  | Menjalankan build produksi untuk client bundle, SSR bundle, dan Nitro worker ke folder `.output/`. |
| `npm run preview`                | Menjalankan preview server dari hasil build lokal.                                                 |
| `npm run test`                   | Menjalankan seluruh test suite Vitest (13 file, 120 uji) secara non-interactive.                   |
| `npm run lint`                   | Menjalankan pemeriksaan ESLint pada seluruh berkas TypeScript.                                     |
| `npm run format`                 | Menjalankan Prettier auto-formatter pada seluruh kode sumber.                                      |

### 2.4 Entry Point Aplikasi

1. **Client Hydration Entry**: [`src/client.tsx`](file:///Users/noxval/_PROJECT_/path-projection/src/client.tsx) — Menghidrasi aplikasi React ke DOM root peramban melalui `hydrateRoot`.
2. **Server SSR Entry**: [`src/server.ts`](file:///Users/noxval/_PROJECT_/path-projection/src/server.ts) — Menangani request SSR Nitro dengan error handler.
3. **Router Registry**: [`src/router.tsx`](file:///Users/noxval/_PROJECT_/path-projection/src/router.tsx) — Menginstansiasi instance router TanStack dengan `QueryClient`.
4. **Root Shell Layout**: [`src/routes/__root.tsx`](file:///Users/noxval/_PROJECT_/path-projection/src/routes/__root.tsx) — Memuat elemen `<head>`, font Google (_Space Grotesk, Inter, Courier Prime_), meta tag viewport, dan global stylesheet.
5. **Main Game Route & State Machine**: [`src/routes/index.tsx`](file:///Users/noxval/_PROJECT_/path-projection/src/routes/index.tsx) — Titik temu seluruh komponen game booth dan pengatur state mesin permainan.

---

## 3. Alur Game & Logika Penentuan Persona

Game booth dirancang sebagai **Single-Page Client-Side State Machine** pada [`src/routes/index.tsx`](file:///Users/noxval/_PROJECT_/path-projection/src/routes/index.tsx#L28):

```typescript
type Screen = "home" | "dilemma" | "scan" | "reveal" | "photo";
```

### 3.1 Peta Alur Interaktif (5 Layar)

```
                    ┌─────────────────────────┐
                    │     1. SCREEN: HOME     │◀──────────────────────────────┐
                    │  (Interactive 3D Deck)  │                               │
                    └────────────┬────────────┘                               │
                                 │                                            │
               ┌─────────────────┴─────────────────┐                          │
               │ (Mulai Membaca)                   │ (Scan Kamera)            │
               ▼                                   ▼                          │
    ┌──────────────────────┐            ┌──────────────────────┐              │
    │  2. SCREEN: DILEMMA  │◀──────────▶│   3. SCREEN: SCAN    │              │
    │  (Pertanyaan Pemantik│ (Beralih   │ (Viewfinder AI &     │              │
    │   & 3 Pilihan Nilai) │  Mode)     │  Drawer Manual 100%) │              │
    └──────────┬───────────┘            └──────────┬───────────┘              │
               │                                   │                          │
               │ (Pilih Salah Satu Nilai)          │ (Klasifikasi Terkunci)   │
               └─────────────────┬─────────────────┘                          │
                                 ▼                                            │
                    ┌─────────────────────────┐                               │
                    │    4. SCREEN: REVEAL    │                               │
                    │ (Kartu 3D & Efek Refleks│                               │
                    │  Kinetic + Tombol Rerol)│                               │
                    └────────────┬────────────┘                               │
                                 │ (Buat Kartu Fotomu)                        │
                                 ▼                                            │
                    ┌─────────────────────────┐                               │
                    │    5. SCREEN: PHOTO     │                               │
                    │ (Keepsake Polaroid Card │───────────────────────────────┘
                    │  Live Name + Unduh PNG) │   (Main Ulang / Reset)
                    └─────────────────────────┘
```

1. **Layar 1: `home` (Beranda & Interactive Deck)**
   - Path file: [`src/routes/index.tsx`](file:///Users/noxval/_PROJECT_/path-projection/src/routes/index.tsx#L162-L230) dan [`src/components/booth/InteractiveDeck.tsx`](file:///Users/noxval/_PROJECT_/path-projection/src/components/booth/InteractiveDeck.tsx).
   - Tampilan: Hero banner neo-editorial bertuliskan _"STUDENT GOVERNMENT EXPO 2026"_, judul utama _"Siapa kamu di masa depan?"_, dan tumpukan 3 kartu tarot 3D yang dapat dikocok (_shuffle_) dengan suara Web Audio.
   - Pilihan interaksi:
     - Klik **"MULAI MEMBACA TAKDIR"** ➔ lanjut ke layar `dilemma`.
     - Klik **"SCAN KARTU KAMERA"** ➔ lanjut ke layar `scan`.
     - Klik langsung salah satu kartu di tumpukan ➔ langsung mengunci persona tersebut dan menuju ke layar `reveal`.
     - Klik **"KOCOK KARTU ✦ SGE 2026"** ➔ memicu animasi kocok kartu dengan rotasi dinamis dan efek audio.

2. **Layar 2: `dilemma` (Dilema Refleksi Nilai Diri)**
   - Path file: [`src/components/booth/ReflectionDilemma.tsx`](file:///Users/noxval/_PROJECT_/path-projection/src/components/booth/ReflectionDilemma.tsx).
   - Pertanyaan Pemantik:
     > _“Jika kamu hanya diizinkan membawa satu hal ini ke masa depanmu, mana yang akan kamu pilih?”_
   - Pilihan: Menampilkan 3 kartu persona 3D berjejer horizontal (Karier, Kreativitas, Petualangan).
   - Tombol pada tiap kartu: **"PILIH NILAI INI"** ➔ langsung mengeksekusi `onSelectPersona(key)` dan berpindah ke layar `reveal`.
   - Opsi alternatif: Terdapat tombol **"Gunakan Kamera Scanner"** di header navigasi atas untuk berpindah ke mode kamera pemindai.

3. **Layar 3: `scan` (Scanner HUD Kamera)**
   - Path file: [`src/components/booth/ScannerHUD.tsx`](file:///Users/noxval/_PROJECT_/path-projection/src/components/booth/ScannerHUD.tsx).
   - Tampilan: Viewfinder kamera video dengan frame aspect ratio `768/1086`, garis pemindai animasi lembut, status FPS/resolusi, dan meter probabilitas AI realtime.
   - Deteksi Otomatis: Model memprediksi kartu fisik melalui webcam.
   - Fallback Manual:
     - Jika kamera gagal mendapatkan izin / tidak ada perangkat, muncul error banner dengan tombol **"Pilih Kartu Manual Saja"**.
     - Tersedia tombol sukarela **"Buka Pilihan Manual"** dengan drawer tiga kartu (💼, 🎨, 🌎) jika pencahayaan booth redup.

4. **Layar 4: `reveal` (Grand Revelation)**
   - Path file: [`src/routes/index.tsx`](file:///Users/noxval/_PROJECT_/path-projection/src/routes/index.tsx#L253-L363).
   - Tampilan: Kartu persona 3D terbuka di sisi kiri dengan efek tilt kursor/touch dan specular sheen; teks refleksi kinetik per kata di sisi kanan dengan badge tagar persona.
   - Pilihan interaksi:
     - **"Tarik Refleksi Baru"**: Mengocok kutipan refleksi baru untuk persona yang sama.
     - **"BUAT KARTU FOTOMU"**: Masuk ke studio polaroid kenang-kenangan (`photo`).
     - **"Main Lagi"**: Mengulang permainan dari beranda.

5. **Layar 5: `photo` (Keepsake Photo Studio)**
   - Path file: [`src/components/booth/KeepsakePhotoCard.tsx`](file:///Users/noxval/_PROJECT_/path-projection/src/components/booth/KeepsakePhotoCard.tsx).
   - Tampilan: Pratinjau kartu dokumentasi polaroid beresolusi tinggi rasio 9:16 yang memuat maskot, foto kartu persona, kutipan terpilih, watermark PKKMB FILKOM UB SGE 2026, dan SVG QR Code booth.
   - Aksi:
     - Input teks **"NAMA KAMU (OPSIONAL)"** (maksimal 28 karakter) yang langsung ter-render live di kartu.
     - Tombol **"UNDUH KARTU (PNG)"** mengekspor frame ke gambar PNG via `html-to-image` dengan `pixelRatio: 2.5`.
     - Tombol **"Salin Tautan Booth"** menyalin link booth ke clipboard pengunjung.
     - Tombol **"Main Ulang dari Beranda"** mereset status game kembali ke `home`.

---

### 3.2 Logika Penentuan Persona & Skor

> [!IMPORTANT]
> **Tidak ada sistem skor kuesioner akumulatif atau formula bobot numerik.** Penentuan persona bekerja secara **Direct Selection (Pilihan Langsung)** dan **Visual Direct Classification (Klasifikasi Langsung Kamera)**.

Bukti kode dan detail implementasi:

1. **Pemilihan Langsung**: Pada layar Dilemma dan Home, mengklik kartu langsung memicu `handleSelectPersona(key)` di [`src/routes/index.tsx`](file:///Users/noxval/_PROJECT_/path-projection/src/routes/index.tsx#L77-L83) dengan nilai tetap `"career" | "creative" | "adventure"`.
2. **Klasifikasi Kamera**:
   - Model Teachable Machine dievaluasi tiap frame di [`src/components/booth/ScannerHUD.tsx`](file:///Users/noxval/_PROJECT_/path-projection/src/components/booth/ScannerHUD.tsx#L91-L118).
   - Label prediksi dipetakan menggunakan fungsi `classifyLabel()` di [`src/lib/classifier.ts`](file:///Users/noxval/_PROJECT_/path-projection/src/lib/classifier.ts#L7-L38) menggunakan regular expression dwibahasa:
     - Karier: `/(^1$|\b1\b|career|karier|tech|teknologi|briefcase|bisnis|pemimpin|💼)/i` ➔ `"career"`
     - Kreativitas: `/(^2$|\b2\b|creative|kreatif|kreativitas|design|desain|\bart\b|seni|palette|palet|🎨)/i` ➔ `"creative"`
     - Petualangan: `/(^3$|\b3\b|adventure|petualangan|impact|dampak|global|world|earth|globe|bumi|jelajah|🌎)/i` ➔ `"adventure"`
3. **Filter Kestabilan Kamera (Hold Threshold)**:
   - Nilai probabilitas prediksi harus lebih dari **0.82 (82%)**.
   - Posisi kartu harus stabil dipertahankan selama minimal **1400 milidetik (1,4 detik)**.
   - Setelah waktu terpenuhi, audio `"reveal"` dibunyikan dan persona langsung dikunci tanpa keraguan visual (_anti-flicker_).
4. **Logika Pemilihan Kutipan Refleksi**:
   - Dikelola oleh fungsi `getRandomQuote(key, excludeIndex)` di [`src/data/personas.ts`](file:///Users/noxval/_PROJECT_/path-projection/src/data/personas.ts#L131-L141).
   - Mengambil indeks acak dari repositori 18 kutipan persona. Parameter `excludeIndex` menjamin kutipan baru saat reroll tidak akan pernah sama dengan kutipan yang sedang aktif saat itu.

---

## 4. Inventaris Teks & Aset Tiga Kartu Persona

Data bersumber langsung dari [`src/data/personas.ts`](file:///Users/noxval/_PROJECT_/path-projection/src/data/personas.ts#L24-L127) dan tampilan komponen di [`src/components/booth/ReflectionDilemma.tsx`](file:///Users/noxval/_PROJECT_/path-projection/src/components/booth/ReflectionDilemma.tsx) serta [`src/routes/index.tsx`](file:///Users/noxval/_PROJECT_/path-projection/src/routes/index.tsx).

### 4.1 Tabel Inventaris Metadata Tiga Kartu

| Atribut                    | Kartu 01 (Karier)                                                 | Kartu 02 (Kreativitas)                                                 | Kartu 03 (Petualangan)                                            |
| -------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------- |
| **Persona Key / ID**       | `career`                                                          | `creative`                                                             | `adventure`                                                       |
| **Nomor Archetype**        | `01`                                                              | `02`                                                                   | `03`                                                              |
| **Ikon / Simbol**          | 💼 (Briefcase)                                                    | 🎨 (Artist Palette)                                                    | 🌎 (Globe Americas)                                               |
| **Nama Persona (Title)**   | **The Foundation Builder**                                        | **The Soul Crafter**                                                   | **The Boundary Breaker**                                          |
| **Label Kartu**            | `CAREER & FOUNDATION`                                             | `CREATIVE & SOUL`                                                      | `ADVENTURE & HORIZON`                                             |
| **Nama Pendek (Short)**    | `Karier & Kepemimpinan`                                           | `Kreativitas & Jiwa`                                                   | `Petualangan & Batas Baru`                                        |
| **Deskripsi / Subtitle**   | _Pilar keteguhan yang memimpin dengan integritas dan keteladanan_ | _Pemberi warna yang mengubah kepekaan rasa menjadi keindahan bermakna_ | _Penjelajah berani yang menemukan jati diri di setiap batas baru_ |
| **Warna Aksen (Token)**    | `var(--SGEMustardGold)` (`#F2B705`)                               | `var(--SGECoralAqua)` (`#57D4DD`)                                      | `var(--SGEPacificOcean)` (`#3A8C9A`)                              |
| **Warna Glow**             | `rgba(242, 183, 5, 0.35)`                                         | `rgba(87, 212, 221, 0.35)`                                             | `rgba(58, 140, 154, 0.4)`                                         |
| **Aset Kartu Depan**       | `src/assets/cards/card-front.jpg` (314 KB)                        | `src/assets/cards/card-front.jpg` (314 KB)                             | `src/assets/cards/card-front.jpg` (314 KB)                        |
| **Aset Gambar Belakang**   | `src/assets/cards/card-career.jpg` (281 KB)                       | `src/assets/cards/card-creative.jpg` (288 KB)                          | `src/assets/cards/card-adventure.jpg` (288 KB)                    |
| **Tagar Komunitas FILKOM** | `#Kepemimpinan`, `#Integritas`, `#SGE2026`, `#PondasiMasaDepan`   | `#KepekaanRasa`, `#Imajinasi`, `#SGE2026`, `#PemberiWarna`             | `#Keberanian`, `#Eksplorasi`, `#SGE2026`, `#JejakKebaikan`        |
| **Tombol CTA di Dilemma**  | `Pilih Nilai Ini`                                                 | `Pilih Nilai Ini`                                                      | `Pilih Nilai Ini`                                                 |
| **Tombol CTA di Reveal**   | `Tarik Refleksi Baru`, `Buat Kartu Fotomu`, `Main Lagi`           | `Tarik Refleksi Baru`, `Buat Kartu Fotomu`, `Main Lagi`                | `Tarik Refleksi Baru`, `Buat Kartu Fotomu`, `Main Lagi`           |

---

### 4.2 Inventaris Lengkap Seluruh 18 Kalimat Persona (Verbatim)

#### Persona 01: The Foundation Builder (`career`) — 💼

1. _"Di ruang-ruang rapat organisasi yang larut hingga malam di FILKOM, kamu belajar bahwa memimpin bukanlah tentang siapa yang paling lantang berbicara, melainkan siapa yang paling sabar mendengarkan dan setia bertahan."_
2. _"Gelar, jabatan kepanitiaan, dan baris resume kelak akan memudar. Yang akan selalu melekat di ingatan orang adalah rasa aman dan kepercayaan yang kamu hadirkan saat badai keraguan melanda."_
3. _"Akan ada masa di mana kamu harus mengambil keputusan sulit di tengah tekanan lembaga. Pegang teguh nurani dan kejujuranmu; itulah kompas yang tak pernah menyesatkan jalan pulang."_
4. _"Kepemimpinan sejatimu tidak diukur dari berapa banyak orang yang mengagumimu, melainkan dari berapa banyak kawan yang berhasil kamu kuatkan pundaknya untuk bangkit melangkah bersama."_
5. _"Di balik setiap program kerja yang berjalan sukses dan tepuk tangan yang meriah, ada ketulusanmu merapikan hal-hal kecil tanpa perlu disorot panggung."_
6. _"Ketika orang lain tergoda mencari panggung instan, ketekunanmu membangun fondasi dalam kesunyian sedang mempersiapkanmu memegang tanggung jawab yang jauh lebih besar."_
7. _"Kamu tidak sekadar mengejar karier masa depan; kamu sedang menenun martabat dan teladan yang akan terus bercerita bahkan saat namamu telah berganti generasi di kampus ini."_
8. _"Akan ada malam-malam di mana tanggung jawab terasa terlalu berat untuk dipikul sendiri. Ingatlah bahwa meminta bantuan rekan seorganisasimu bukanlah tanda kelemahan, melainkan awal dari kekuatan bersama."_
9. _"Kewibawaanmu tidak lahir dari suara yang keras atau tatapan yang menuntut, melainkan dari konsistensi caramu menepati setiap janji kecil yang pernah kamu ucapkan."_
10. _"Di tengah dinamika lembaga yang menguji kesabaran, integritasmu yang tegak adalah pelindung terkuat yang membuat orang lain tetap percaya pada nilai-nilai kebaikan."_
11. _"Setiap evaluasi pahit dan kritik yang kamu terima bukanlah vonis kegagalan, melainkan tempaan api yang membuat naluri kepemimpinanmu semakin matang dan bijak."_
12. _"Kamu adalah sosok yang dicari saat situasi genting; bukan karena kamu memiliki semua jawaban, melainkan karena kehadiranmu membawa ketenangan bagi mereka yang panik."_
13. _"Masa depan melihatmu sebagai tiang penyangga yang kokoh; seseorang yang berani berdiri paling depan saat menghadapi masalah, dan berdiri paling belakang saat membagikan apresiasi."_
14. _"Jangan pernah mengorbankan prinsip demi tepuk tangan sesaat. Karier yang bermakna dibangun dari fondasi keberanian menolak hal yang salah, betapapun lumrahnya hal itu dianggap orang lain."_
15. _"Lelahmu mengurus dinamika organisasi hari ini sedang membentuk etika kerja dan ketahanan mental yang akan membuatmu bersinar di dunia profesional esok hari."_
16. _"Kelak, warisan terbesarmu di FILKOM bukanlah tumpukan arsip laporan pertanggungjawaban, melainkan api semangat yang berhasil kamu nyalakan di dalam dada adik-adik tingkatmu."_
17. _"Di hadapan ketidakpastian masa depan, ketenangan analisismu dan kebersihan niatmu adalah jangkar yang menahan kapal tetap seimbang di tengah gelombang besar."_
18. _"Bangunlah reputasimu dengan kejujuran yang sunyi dan kerja nyata yang berbobot. Dunia selalu kekurangan orang pintar yang tetap memilih untuk setia pada nilai-nilai integritas."_

#### Persona 02: The Soul Crafter (`creative`) — 🎨

1. _"Di tengah deru logika, angka-angka yang rumit, dan tuntutan efisiensi yang dingin di FILKOM, kepekaan rasamu adalah oase yang mengingatkan bahwa di balik setiap karya, selalu ada manusia yang ingin dimengerti."_
2. _"Sensitivitas hatimu yang sering kamu anggap beban sebenarnya adalah anugerah langka; kamu mampu menangkap kegelisahan yang luput dari pandangan mata orang biasa."_
3. _"Ide terbesarmu tidak lahir dari kepanikan mengejar tren visual, melainkan dari keberanianmu duduk hening sejenak, mendengarkan cerita-cerita kecil yang terlupakan di sekelilingmu."_
4. _"Ketika sebuah organisasi kampus mulai terjebak dalam rutinitas yang kaku, kehadiranmu membawa percikan imajinasi yang kembali menghidupkan rasa cinta pada apa yang sedang dikerjakan."_
5. _"Jangan biarkan suara bising orang-orang yang terlalu praktis membungkam keunikan intuisimu. Dunia teknologi butuh jiwa-jiwa perasa yang berani bertanya: 'Apakah karya ini membuat manusia lebih bahagia?'"_
6. _"Karyamu kelak akan menjadi tempat berteduh; di saat orang lain lelah dikejar ambisi dan angka, sentuhan estetikamu hadir memberikan jeda bernapas yang menenangkan."_
7. _"Kamu memiliki bakat untuk menerjemahkan hal-hal rumit menjadi pengalaman yang ramah dan memeluk, membuat mereka yang awalnya merasa asing menjadi merasa diterima."_
8. _"Keberanianmu menyuarakan perspektif yang berbeda dalam rapat divisi bukanlah pembangkangan; itu adalah kompas yang menyelamatkan tim dari jebakan keseragaman berpikir."_
9. _"Tidak ada goresan karya yang sia-sia selama ia lahir dari ketulusan rasa. Apa yang kamu buat dengan kejujuran batin kelak akan menemukan jalannya sendiri ke hati orang-orang yang tepat."_
10. _"Masa depan membutuhkan kelembutan caramu memandang dunia; jangan biarkan rutinitas perkuliahan mengikis keajaiban rasa ingin tahu di dalam dadamu."_
11. _"Kamu mengajarkan kami bahwa keindahan sejati bukanlah kesempurnaan tanpa celah, melainkan keberanian merayakan kerapuhan dan kemanusiaan apa adanya."_
12. _"Di tanganmu, sebuah desain bukan sekadar susunan warna dan bentuk, melainkan surat cinta yang menghubungkan rasa sepi seseorang dengan harapan baru."_
13. _"Kelak, orang-orang akan terpukau bukan hanya pada kecanggihan hasil kerjamu, melainkan pada kehangatan jiwa yang terpancar dari caramu memperlakukan sesama sepanjang proses berkarya."_
14. _"Ketika dunia terasa terlalu keras dan menuntut, karya-karyamu akan hadir sebagai lilin kecil di malam gelap, mengingatkan bahwa harapan selalu punya cara untuk bernyanyi."_
15. _"Jangan takut pada periode kebuntuan ide. Terkadang, tanah imajinasi hanya butuh waktu untuk beristirahat sebelum menumbuhkan bunga-bunga gagasan yang lebih menakjubkan."_
16. _"Di lingkungan FILKOM yang serba terstruktur, caramu berpikir bebas dan luwes adalah jembatan yang mempertemukan sains dengan kehangatan seni."_
17. _"Kreativitasmu adalah doa yang diwujudkan lewat karya nyata; teruslah mencipta, karena ada banyak jiwa yang menanti sentuhan kebaikan dari tanganmu."_
18. _"Jadilah penjaga rasa di era di mana segalanya bisa diotomatisasi. Empati dan keaslian batinmu adalah hal berharga yang takkan pernah bisa digantikan oleh mesin mana pun."_

#### Persona 03: The Boundary Breaker (`adventure`) — 🌎

1. _"FILKOM hanyalah pelabuhan pertamamu. Lautan di luar sana begitu luas, dan setiap kali kakimu bergetar menghadapi hal baru, ingatlah bahwa keberanian sejati adalah melangkah meski belum tahu ujung jalannya."_
2. _"Jangan biarkan dinding-dinding kelas membatasi luasnya cakrawala mimpimu. Kamu diciptakan untuk menguji batas, menyapa dunia luar, dan membuktikan bahwa potensimu jauh melampaui apa yang kamu duga."_
3. _"Akan ada masa di mana kamu merasa tersesat dalam menentukan arah. Percayalah, sering kali justru di persimpangan yang tak kamu rencanakan itulah kamu menemukan sahabat sejati dan versi dirimu yang paling tangguh."_
4. _"Keberanianmu mengambil risiko untuk mencoba kompetisi baru, mendaftar program di luar negeri, atau memulai inisiatif sosial dari nol akan membuka pintu-pintu takdir yang tak pernah terbayangkan."_
5. _"Masa mudamu di kampus ini terlalu berharga untuk dihabiskan hanya di sudut kenyamanan yang aman. Berangkatlah dengan rasa penasaran, pelajari dunia dengan kerendahan hati, dan kembalilah dengan kebijaksanaan."_
6. _"Setiap kegagalan yang kamu jumpai di sepanjang perjalanan bukanlah akhir cerita, melainkan bumbu pendewasaan yang membuat kisah keberhasilanmu nanti terasa jauh lebih berharga."_
7. _"Kamu membawa energi kebebasan yang menular; saat orang-orang di sekitarmu ragu untuk bermimpi besar, langkah beranimu menjadi pemantik yang menyalakan keberanian mereka."_
8. _"Bukan tentang seberapa jauh jarak yang berhasil kamu tempuh di atas peta, melainkan tentang seberapa dalam hatimu terbuka menerima perbedaan, merangkul cerita baru, dan menebarkan kebaikan di setiap persinggahan."_
9. _"Dunia luar yang kompetitif bukanlah ancaman yang harus ditakuti, melainkan taman bermain besar tempat karakter, kejujuran, dan ketangguhan mentalmu diuji lalu bersinar terang."_
10. _"Jangan biarkan rasa takut salah menghentikan langkah pertamamu. Kapal diciptakan bukan untuk diam selamanya di dermaga yang tenang, melainkan untuk mengarungi deburan ombak samudra lepas."_
11. _"Kelak kamu akan menyadari bahwa tujuan terindah dari setiap pengembaraan bukanlah titik akhir di kejauhan, melainkan kedamaian dan keteguhan batin yang kamu temukan di dalam dirimu sendiri."_
12. _"Kamu adalah pengingat bagi kami bahwa batas-batas yang dibuat manusia selalu bisa ditembus oleh ketulusan tekad dan keberanian untuk terus mencoba sekali lagi."_
13. _"Di tengah perjalananmu yang dinamis, jagalah persahabatan yang kamu bangun di kampus ini; merekalah jangkar yang akan mengingatkanmu pada rumah saat badai kehidupan mengguncang."_
14. _"Kamu tidak pernah takut menjadi orang asing di tempat baru, karena kamu tahu bahwa kerendahan hati untuk belajar adalah paspor terbaik yang membuka setiap hati manusia."_
15. _"Suatu saat nanti, kisah petualangan hidupmu akan diceritakan kembali oleh mereka yang membutuhkan suntikan keberanian untuk melepaskan belenggu keraguan."_
16. _"Teruslah melangkah melampaui apa yang dianggap biasa. FILKOM dan dunia membutuhkan sosok perintis yang berani membuka jalan setapak di tengah lebatnya ketidaktahuan."_
17. _"Dalam setiap kelelahan eksplorasimu, selalu ada bintang kejora yang membimbingmu pulang: kejujuran niatmu dan kerinduan untuk memberi manfaat bagi sesama."_
18. _"Jadilah pengembara yang bijak: berjalan dengan penuh rasa hormat pada kearifan lokal, mengamati dengan empati yang jernih, dan bertindak dengan ketegasan tekad yang membara."_

---

## 5. Layar Hasil / Reveal Saat Ini

Layar hasil dieksekusi pada komponen utama [`src/routes/index.tsx`](file:///Users/noxval/_PROJECT_/path-projection/src/routes/index.tsx#L253-L363) saat state `screen === "reveal"`.

### 5.1 Komponen Penyusun

1. **Header Refleksi**:
   - Subjudul penanda: _"REFLEKSI PERSONA TAKDIR"_.
   - Judul utama: _"Kartu Masa Depanmu Terbuka"_.
2. **Kartu 3D Interaktif ([`TarotCard3D.tsx`](file:///Users/noxval/_PROJECT_/path-projection/src/components/booth/TarotCard3D.tsx))**:
   - Berada di kolom kiri dengan rasio aspek standar kartu tarot (`768/1086`).
   - Berada dalam kondisi terbuka penuh (`isFlipped={true}`) menampilkan artwork persona asli.
   - Dilengkapi interaksi pergerakan sudut 3D (_perspective: 1200px_, tilt antara -12° hingga +12° mengikuti pergerakan kursor mouse/touch).
   - Efek visual: _Specular highlight sheen_ yang meluncur mengikuti kursor (`radial-gradient`), bias refraksi cahaya, dan bingkai perforasi perangko (`.stamp-border`).
3. **Pengungkap Teks Kinetik ([`KineticSentenceReveal.tsx`](file:///Users/noxval/_PROJECT_/path-projection/src/components/booth/KineticSentenceReveal.tsx))**:
   - Berada di kolom kanan dalam panel neo-bento gelap (`#0F1E21`).
   - Menyajikan kutipan refleksi persona secara kinetik kata per kata.
4. **Tagar & Metadata Komunitas**:
   - Menampilkan nomor kartu (`NO. 01 — CAREER & FOUNDATION`), emoji, dan 4 tagar khusus yang membumi dengan kehidupan FILKOM UB.
5. **Aksi Tombol**:
   - Tombol **"Tarik Refleksi Baru"** (dengan ikon acak `Shuffle`).
   - Tombol **"BUAT KARTU FOTOMU"** (CTA utama menuju souvenir polaroid).
   - Tombol **"Main Lagi"** (reset alur).

### 5.2 Mekanisme Animasi & State Pengatur Teks

- **Tokenisasi Kata**: Kalimat refleksi dipecah menjadi array kata terpisah menggunakan regex whitespace `sentence.trim().split(/\s+/)`.
- **Animasi Kata (_Blur-to-Focus_)**:
  - Tiap kata dibungkus komponen `motion.span`.
  - State `hidden`: `filter: blur(8px)`, `opacity: 0`, `y: 8px`.
  - State `visible`: `filter: blur(0px)`, `opacity: 1`, `y: 0px` dengan transisi spring (`stiffness: 180`, `damping: 20`).
  - Interval jeda per kata (_stagger_): **45 milidetik**.
- **Efek Berkas Sinar Emas (_Golden Sweep Beam_)**:
  - Didefinisikan dengan gradient berkilau: `linear-gradient(105deg, transparent 20%, rgba(242, 183, 5, 0.45) 50%, transparent 80%)`.
  - State `isCompleted` diaktifkan melalui timer otomatis:
    $$\text{Durasi} = (\text{Jumlah Kata} \times 45\text{ ms}) + 400\text{ ms}$$
  - Saat `isCompleted === true`, lapisan sweep bergerak melintasi paragraf dari `left: -100%` ke `left: 200%` selama 950 milidetik, memberikan efek kilauan mistis keemasan begitu seluruh kalimat terbaca sempurna.
  - Badge `"Refleksi Terbuka"` muncul di pojok kanan bawah bento box.
- **Siklus Reroll**:
  - Saat tombol _Tarik Refleksi Baru_ ditekan, state `animationCycle` dinaikkan (`setAnimationCycle(c => c + 1)`), mereset `isCompleted = false` dan memicu ulang proses _blur-to-focus_ tanpa me-reload layar. Audio tone `"shuffle"` dibunyikan.

---

## 6. Temuan Kualitas (Audit Senior Engineer & UX Reviewer)

### 6.1 Aksesibilitas (A11y)

- **Capaian Positif**:
  - Audit **Lighthouse Accessibility meraih skor sempurna 100/100** (0 violations, 46 audit lolos).
  - Teks refleksi kinetik pada `KineticSentenceReveal.tsx` dilengkapi dengan atribut `aria-live="polite"` dan `aria-atomic="true"`, sehingga pembaca layar (_screen reader_) dapat membacakan kalimat utuh secara bersih tanpa mengeja kata demi kata saat animasi berjalan.
  - Tombol ikon navigasi (suara, settings, back) memiliki `aria-label` yang deskriptif.
- **Catatan & Temuan Minor**:
  1. _Prefers-Reduced-Motion_: Walaupun Framer Motion memiliki fallback dasar, komponen `KineticSentenceReveal.tsx` dan `TarotCard3D.tsx` belum secara eksplisit memanfaatkan hook `useReducedMotion()`. Jika pengguna mengaktifkan pengaturan kurangi gerakan di sistem operasi mereka, efek 3D tilt kartu dan blur teks masih aktif.
  2. _Kontras Mikro-Teks_: Teks serial `EDITION 2026 // SGE-001` menggunakan warna `text-[var(--SGEPapayaWhip)]/60` dengan ukuran font `9px`. Pada monitor dengan saturasi rendah di area booth terbuka, teks ini memiliki kontras tipis terhadap latar gelap `#0F1E21`.

### 6.2 Performa & Ukuran Aset

- **Ukuran Bundle**:
  - Build produksi menghasilkan peringatan bahwa chunk `@tensorflow/tfjs` dan `@teachablemachine/image` berukuran ~1.17 MB (gzipped ~301 KB). Ini wajar untuk pustaka _deep learning in-browser_, namun pemuatan modul di `ScannerHUD.tsx` sudah tepat menggunakan **dynamic import** (`await import("@teachablemachine/image")`) sehingga tidak membebani First Contentful Paint layar Home.
- **Ukuran Aset Gambar Kartu**:
  - Keempat aset kartu di `src/assets/cards/` berukuran total ~1.17 MB (masing-masing ~281 KB – 314 KB format JPEG).
  - Aset ini sudah dimigrasikan dari remote CDN ke ESM lokal, menghasilkan kestabilan penuh secara offline. Konversi ke format WebP berkualitas 85% dapat memangkas ukurannya hingga di bawah ~70 KB per kartu tanpa distorsi visual.

### 6.3 Kode Mati & Duplikasi

- **Komponen UI Berlebih (Shadcn Leftovers)**:
  - Terdapat 37 berkas komponen di folder [`src/components/ui/`](file:///Users/noxval/_PROJECT_/path-projection/src/components/ui/) (`calendar.tsx`, `sidebar.tsx`, `breadcrumb.tsx`, `context-menu.tsx`, `drawer.tsx`, `pagination.tsx`, `input-otp.tsx`, dll.) yang merupakan peninggalan inisialisasi awal shadcn UI.
  - Komponen domain booth game **hanya menggunakan `Button` dan `Input`**. Sisanya adalah _dead code_ yang menambah waktu kompilasi ESLint dan TypeScript type-checking.
- **Boilerplate Telemetri Lovable**:
  - Berkas [`src/lib/lovable-error-reporting.ts`](file:///Users/noxval/_PROJECT_/path-projection/src/lib/lovable-error-reporting.ts) dan [`src/lib/error-capture.ts`](file:///Users/noxval/_PROJECT_/path-projection/src/lib/error-capture.ts) berisi penangkap error telemetri platform Lovable. Di lingkungan _standalone booth_, kode ini tidak aktif (safely inert).

### 6.4 Responsivitas Mobile

- **Desktop & Tablet**: Tampilan 2 kolom pada layar Home, Reveal, dan Keepsake Photo Card sangat seimbang dan proporsional.
- **Mobile Viewport (≤ 390px)**:
  - Seluruh layout mengalir dengan baik berkat utility `flex-col` dan `max-w-6xl`.
  - Pada Layar Dilemma, 3 kartu 3D berjejer vertikal membutuhkan _scrolling_ yang agak panjang di layar kecil. Pengunjung harus menggulir ke bawah untuk melihat kartu ketiga (Petualangan).

---

## 7. Rekomendasi Perbaikan

Daftar peluang optimasi disusun berdasarkan matriks dampak (_impact_) vs usaha (_effort_):

| Prioritas | Item Perbaikan                                                                                                                                                                                                                                                                 | Dampak | Usaha  | Lokasi File                                                                                                                                                                                                                                                                      |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **P1**    | **Dukungan `prefers-reduced-motion`**: Pasang hook `useReducedMotion()` dari `motion/react` pada `KineticSentenceReveal` dan `TarotCard3D` agar transisi blur dan rotasi 3D dinonaktifkan secara otomatis bagi pengguna dengan preferensi aksesibilitas.                       | Tinggi | Rendah | [`src/components/booth/KineticSentenceReveal.tsx`](file:///Users/noxval/_PROJECT_/path-projection/src/components/booth/KineticSentenceReveal.tsx), [`src/components/booth/TarotCard3D.tsx`](file:///Users/noxval/_PROJECT_/path-projection/src/components/booth/TarotCard3D.tsx) |
| **P1**    | **Ganti Native `alert()` dengan Toast UI**: Di modal Settings URL model, gantikan dialog `alert("Gunakan URL model HTTPS yang valid.")` dengan toast notification (sudah ada `sonner` di dependensi) agar konsisten dengan tema desain booth.                                  | Sedang | Rendah | [`src/routes/index.tsx`](file:///Users/noxval/_PROJECT_/path-projection/src/routes/index.tsx#L461-L464)                                                                                                                                                                          |
| **P2**    | **Pembersihan Komponen UI Tak Terpakai**: Hapus ~37 file shadcn UI yang tidak dipakai di `src/components/ui/` untuk merapikan struktur proyek dan mempercepat eksekusi build/test.                                                                                             | Sedang | Rendah | [`src/components/ui/`](file:///Users/noxval/_PROJECT_/path-projection/src/components/ui/)                                                                                                                                                                                        |
| **P2**    | **Optimasi Format Gambar (WebP/AVIF)**: Konversi 4 aset kartu JPEG beresolusi tinggi ke WebP 85-90% untuk mengurangi total payload aset dari 1.17 MB menjadi ~280 KB tanpa mengurangi ketajaman export polaroid.                                                               | Sedang | Rendah | [`src/assets/cards/`](file:///Users/noxval/_PROJECT_/path-projection/src/assets/cards/)                                                                                                                                                                                          |
| **P3**    | **Mobile Card Carousel / Tabs di Dilemma**: Ubah tampilan 3 kartu vertikal pada layar mobile menjadi carousel horizontal yang dapat di-swipe atau switcher tab, sehingga pengunjung mobile tidak perlu melakukan scroll panjang.                                               | Tinggi | Sedang | [`src/components/booth/ReflectionDilemma.tsx`](file:///Users/noxval/_PROJECT_/path-projection/src/components/booth/ReflectionDilemma.tsx)                                                                                                                                        |
| **P3**    | **Offline Pre-cached AI Model Weights**: Simpan berkas `model.json`, `metadata.json`, dan bobot `.bin` Teachable Machine langsung di dalam folder `public/models/` lokal, sehingga booth game tetap dapat mendeteksi kartu via kamera meski koneksi internet venue drop total. | Tinggi | Sedang | [`src/components/booth/ScannerHUD.tsx`](file:///Users/noxval/_PROJECT_/path-projection/src/components/booth/ScannerHUD.tsx), `public/models/`                                                                                                                                    |

---

_Dokumen ini disusun sebagai baseline review dan konfirmasi sebelum melangkah ke tahap implementasi atau tindakan lebih lanjut._
