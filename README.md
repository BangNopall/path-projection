# Persona Vision

Ini merupakan salah satu gamesnya

- Konsep Aktivitas

Sebuah permainan berbasis kartu persona ala tarot reading. Pemain diajak merefleksikan prioritas nilai hidup mereka untuk memproyeksikan karakter diri di masa depan melalui pilihan simbolis.

Alat & Komponen

Kartu Persona (Future Character Cards): Kartu berukuran saku/tarot dengan tampak belakang ilustrasi ikon (Karier, Kreativitas, Petualangan, dll.) dan tampak depan berupa maskot "Guess Who Are You".

Lembar Pesan Refleksi: Teks afirmasi/prediksi dibacakan oleh pemandu melalui website.

Properti Foto / Frame Booth: Area dokumentasi untuk peserta berfoto bersama kartu pilihannya.

Alur & Mekanisme Bermain

Pengundian Kartu:

Pemain mengambil 3 kartu secara acak dalam posisi tertutup (hanya tampak maskot "Guess Who Are You").

Pembukaan Pilihan:

Kartu dibuka di atas meja, menampilkan 3 aspek (misalnya: 💼 Career, 🎨 Creative, 🌎 Adventure).

Pertanyaan Pemantik:

Pemandu memberikan dilema refleksi:

"Jika kamu hanya diizinkan membawa satu hal ini ke masa depanmu, mana yang akan kamu pilih?"

Pembacaan Persona & Pesan Takdir:

Pemain menentukan 1 pilihan utama. Pemain akan scan kartu tersebut di website lalu nanti website akan menampilkan kalimat random sesuai dengan ikonnya

Build a sleek, high-engagement, responsive Web App for "PKKMB FILKOM UB 2026 - SGE Booth Game: Persona Tarot Future Character Reading".

### 1. CORE CONCEPT & GAME MECHANIC
This is an interactive Tarot-style Persona game for new students entering FILKOM UB.
- Player picks 1 card among 3 physical cards (Aspects: 💼 Career/Tech, 🎨 Creative/Design, 🌎 Adventure/Impact). Front side features the mascot "Guess Who Are You", backside features the persona icon.
- Player scans their chosen card using their device camera on this web app.
- The web app runs Computer Vision powered by Google Teachable Machine to classify the card icon.
- Once recognized with high confidence (>85%), trigger an immersive Tarot revelation animation: reveal a randomized futuristic destiny/affirmation quote tailored to that icon.
- Documentation Mode: Display an aesthetic digital card frame featuring the persona result, the mascot, and customized FILKOM UB 2026 branding, ready for on-booth photo/screenshot.

### 2. DESIGN SYSTEM & VISUAL IDENTITY (SGE FILKOM UB 2026 ALIGNED)
DO NOT make it look like a generic corporate AI template. Make it look like a bespoke creative tech exhibition piece.
- Background & Theme: Deep dark tech palette (#070B19, #0D1730) with soft floating ambient mesh gradients (electric cyan #38BDF8, soft violet #818CF8, and warm cream gold #FBF6E9).
- Accents & Typography: Warm ivory/cream (#F8F4EB) for primary headings and badges, subtle borders (border-white/10), and crisp modern sans typography (Inter / Plus Jakarta Sans / Space Grotesk).
- Card Style: Glassmorphism with holographic edge highlights, smooth hover tilt effects, and glowing neon scan lines.
- Mascot Integration: Seamlessly embed a placeholder for the mascot "Guess Who Are You" in the header and card frame.

### 3. TECHNICAL SPECIFICATIONS & ARCHITECTURE
- Frontend: Next.js / Vite React + Tailwind CSS + Lucide Icons + Framer Motion (for smooth tarot flip and pulse animations).
- Computer Vision (Teachable Machine):
  - Integrate `@tensorflow/tfjs` and `@teachablemachine/image` via standard ESM/CDN or npm packages.
  - Provide an easy configuration modal/input in the settings to input the Teachable Machine Model URL (e.g. `https://teachablemachine.withgoogle.com/models/MODEL_ID/`), with a hardcoded default fallback model URL.
  - Include an interactive camera scanner viewport with:
    - Scanning reticle / holographic cyber-frame overlay.
    - Real-time confidence gauge / detection feedback ("Arahkan ikon kartu ke dalam frame...").
    - Manual fallback button ("Bypass / Pilih Manual") in case booth lighting or camera permission fails.
- Sound & Feedback:
  - Subtle audio cues (synthesizer mystic chime when a card is recognized, click sounds). Toggleable sound button.

### 4. DATA POOL - RANDOMIZED DESTINY MESSAGES (BAHASA INDONESIA)
Provide at least 5 randomized affirmations per category:
1. "Career & Tech Innovator" (💼):
   - "Di antara jutaan baris kode masa depan, logika dan ambisimu akan meretas batasan baru. Jadilah inovator, bukan sekadar penonton."
   - "Arsitektur masa depan FILKOM dibangun oleh tangan dinginmu. Fokus pada proses, dampak besarmu menanti di semester depan."
   - "Setiap bug adalah batu loncatan. Karir gemilangmu berakar dari ketekunan menyelesaikan masalah yang orang lain hindari."
2. "Creative & Experience Crafter" (🎨):
   - "Dunia digital terlalu kaku tanpa sentuhan imajinasimu. Visualisasikan mimpimu dan ubah kompleksitas menjadi estetika yang bermakna."
   - "Kreativitasmu adalah kompas. Ketika algoritma terasa dingin, empati dan karyamulah yang memberi jiwa pada teknologi."
   - "Jangan takut menciptakan tren sendiri. Di FILKOM, ide paling liar sekalipun adalah bibit dari inovasi spektakuler."
3. "Adventure & Global Impact" (🌎):
   - "Langkah kakimu terlalu luas untuk dibatasi zona nyaman. Masa depanmu menembus panggung global dengan dedikasi tiada henti."
   - "Jelajahi setiap peluang di kampus ini. Keberanian mengambil risiko akan membawamu ke puncak kolaborasi yang tak terduga."
   - "Dunia luar menanti pemikiran revolusionermu. Berangkatlah dengan integritas, kembali dengan segudang pembuktian."

### 5. USER FLOW & SCREENS
1. Home / Standby Screen:
   - Floating Tarot deck visual with mascot badge "Guess Who Are You".
   - Subtitle: "Booth BEM FILKOM UB - Student Government Expo 2026".
   - Primary Action Button: "Mulai Membaca Takdir (Scan Kartu)".
2. Live Scanner Screen:
   - Webcam feed inside a portrait card-shaped HUD viewport.
   - Live prediction readout showing predicted class and percentage bar.
   - When confidence > 85% for 1.5 seconds, lock detection and play reveal animation.
3. Tarot Reveal & Prediction Screen:
   - 3D flip card animation showing the detected persona icon and futuristic illustration.
   - Typewriter effect for the randomized fortune affirmation.
   - Keywords/Tags (e.g., #Visionary, #ProblemSolver, #SGE2026).
4. Photo Frame / Share Mode:
   - Clean, photo-ready card view with participant name input (optional), FILKOM UB SGE watermark, QR code, and "Save Card / Reset" buttons.
5. Pastikan kata-kata yang di bikin terkait hasil

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b3d2be27-e1e2-48bb-b149-d70fb8ec1d19).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
