import cardFrontImg from "@/assets/cards/card-front.jpg";
import cardCareerImg from "@/assets/cards/card-career.jpg";
import cardCreativeImg from "@/assets/cards/card-creative.jpg";
import cardAdventureImg from "@/assets/cards/card-adventure.jpg";

export type PersonaKey = "career" | "creative" | "adventure";

export interface PersonaInfo {
  key: PersonaKey;
  number: string;
  label: string;
  short: string;
  title: string;
  subtitle: string;
  icon: string;
  image: string;
  frontImage: string;
  accentColor: string;
  glowColor: string;
  tags: string[];
  quotes: string[];
}

export const personas: Record<PersonaKey, PersonaInfo> = {
  career: {
    key: "career",
    number: "01",
    label: "CAREER & FOUNDATION",
    short: "Karier & Kepemimpinan",
    title: "The Foundation Builder",
    subtitle: "Pilar keteguhan yang memimpin dengan integritas dan keteladanan",
    icon: "💼",
    image: cardCareerImg,
    frontImage: cardFrontImg,
    accentColor: "var(--SGEMustardGold)",
    glowColor: "rgba(242, 183, 5, 0.35)",
    tags: ["#Kepemimpinan", "#Integritas", "#SGE2026", "#PondasiMasaDepan"],
    quotes: [
      "Di ruang-ruang rapat organisasi yang larut hingga malam di FILKOM, kamu belajar bahwa memimpin bukanlah tentang siapa yang paling lantang berbicara, melainkan siapa yang paling sabar mendengarkan dan setia bertahan.",
      "Gelar, jabatan kepanitiaan, dan baris resume kelak akan memudar. Yang akan selalu melekat di ingatan orang adalah rasa aman dan kepercayaan yang kamu hadirkan saat badai keraguan melanda.",
      "Akan ada masa di mana kamu harus mengambil keputusan sulit di tengah tekanan lembaga. Pegang teguh nurani dan kejujuranmu; itulah kompas yang tak pernah menyesatkan jalan pulang.",
      "Kepemimpinan sejatimu tidak diukur dari berapa banyak orang yang mengagumimu, melainkan dari berapa banyak kawan yang berhasil kamu kuatkan pundaknya untuk bangkit melangkah bersama.",
      "Di balik setiap program kerja yang berjalan sukses dan tepuk tangan yang meriah, ada ketulusanmu merapikan hal-hal kecil tanpa perlu disorot panggung.",
      "Ketika orang lain tergoda mencari panggung instan, ketekunanmu membangun fondasi dalam kesunyian sedang mempersiapkanmu memegang tanggung jawab yang jauh lebih besar.",
      "Kamu tidak sekadar mengejar karier masa depan; kamu sedang menenun martabat dan teladan yang akan terus bercerita bahkan saat namamu telah berganti generasi di kampus ini.",
      "Akan ada malam-malam di mana tanggung jawab terasa terlalu berat untuk dipikul sendiri. Ingatlah bahwa meminta bantuan rekan seorganisasimu bukanlah tanda kelemahan, melainkan awal dari kekuatan bersama.",
      "Kewibawaanmu tidak lahir dari suara yang keras atau tatapan yang menuntut, melainkan dari konsistensi caramu menepati setiap janji kecil yang pernah kamu ucapkan.",
      "Di tengah dinamika lembaga yang menguji kesabaran, integritasmu yang tegak adalah pelindung terkuat yang membuat orang lain tetap percaya pada nilai-nilai kebaikan.",
      "Setiap evaluasi pahit dan kritik yang kamu terima bukanlah vonis kegagalan, melainkan tempaan api yang membuat naluri kepemimpinanmu semakin matang dan bijak.",
      "Kamu adalah sosok yang dicari saat situasi genting; bukan karena kamu memiliki semua jawaban, melainkan karena kehadiranmu membawa ketenangan bagi mereka yang panik.",
      "Masa depan melihatmu sebagai tiang penyangga yang kokoh; seseorang yang berani berdiri paling depan saat menghadapi masalah, dan berdiri paling belakang saat membagikan apresiasi.",
      "Jangan pernah mengorbankan prinsip demi tepuk tangan sesaat. Karier yang bermakna dibangun dari fondasi keberanian menolak hal yang salah, betapapun lumrahnya hal itu dianggap orang lain.",
      "Lelahmu mengurus dinamika organisasi hari ini sedang membentuk etika kerja dan ketahanan mental yang akan membuatmu bersinar di dunia profesional esok hari.",
      "Kelak, warisan terbesarmu di FILKOM bukanlah tumpukan arsip laporan pertanggungjawaban, melainkan api semangat yang berhasil kamu nyalakan di dalam dada adik-adik tingkatmu.",
      "Di hadapan ketidakpastian masa depan, ketenangan analisismu dan kebersihan niatmu adalah jangkar yang menahan kapal tetap seimbang di tengah gelombang besar.",
      "Bangunlah reputasimu dengan kejujuran yang sunyi dan kerja nyata yang berbobot. Dunia selalu kekurangan orang pintar yang tetap memilih untuk setia pada nilai-nilai integritas.",
    ],
  },
  creative: {
    key: "creative",
    number: "02",
    label: "CREATIVE & SOUL",
    short: "Kreativitas & Jiwa",
    title: "The Soul Crafter",
    subtitle: "Pemberi warna yang mengubah kepekaan rasa menjadi keindahan bermakna",
    icon: "🎨",
    image: cardCreativeImg,
    frontImage: cardFrontImg,
    accentColor: "var(--SGECoralAqua)",
    glowColor: "rgba(87, 212, 221, 0.35)",
    tags: ["#KepekaanRasa", "#Imajinasi", "#SGE2026", "#PemberiWarna"],
    quotes: [
      "Di tengah deru logika, angka-angka yang rumit, dan tuntutan efisiensi yang dingin di FILKOM, kepekaan rasamu adalah oase yang mengingatkan bahwa di balik setiap karya, selalu ada manusia yang ingin dimengerti.",
      "Sensitivitas hatimu yang sering kamu anggap beban sebenarnya adalah anugerah langka; kamu mampu menangkap kegelisahan yang luput dari pandangan mata orang biasa.",
      "Ide terbesarmu tidak lahir dari kepanikan mengejar tren visual, melainkan dari keberanianmu duduk hening sejenak, mendengarkan cerita-cerita kecil yang terlupakan di sekelilingmu.",
      "Ketika sebuah organisasi kampus mulai terjebak dalam rutinitas yang kaku, kehadiranmu membawa percikan imajinasi yang kembali menghidupkan rasa cinta pada apa yang sedang dikerjakan.",
      "Jangan biarkan suara bising orang-orang yang terlalu praktis membungkam keunikan intuisimu. Dunia teknologi butuh jiwa-jiwa perasa yang berani bertanya: 'Apakah karya ini membuat manusia lebih bahagia?'",
      "Karyamu kelak akan menjadi tempat berteduh; di saat orang lain lelah dikejar ambisi dan angka, sentuhan estetikamu hadir memberikan jeda bernapas yang menenangkan.",
      "Kamu memiliki bakat untuk menerjemahkan hal-hal rumit menjadi pengalaman yang ramah dan memeluk, membuat mereka yang awalnya merasa asing menjadi merasa diterima.",
      "Keberanianmu menyuarakan perspektif yang berbeda dalam rapat divisi bukanlah pembangkangan; itu adalah kompas yang menyelamatkan tim dari jebakan keseragaman berpikir.",
      "Tidak ada goresan karya yang sia-sia selama ia lahir dari ketulusan rasa. Apa yang kamu buat dengan kejujuran batin kelak akan menemukan jalannya sendiri ke hati orang-orang yang tepat.",
      "Masa depan membutuhkan kelembutan caramu memandang dunia; jangan biarkan rutinitas perkuliahan mengikis keajaiban rasa ingin tahu di dalam dadamu.",
      "Kamu mengajarkan kami bahwa keindahan sejati bukanlah kesempurnaan tanpa celah, melainkan keberanian merayakan kerapuhan dan kemanusiaan apa adanya.",
      "Di tanganmu, sebuah desain bukan sekadar susunan warna dan bentuk, melainkan surat cinta yang menghubungkan rasa sepi seseorang dengan harapan baru.",
      "Kelak, orang-orang akan terpukau bukan hanya pada kecanggihan hasil kerjamu, melainkan pada kehangatan jiwa yang terpancar dari caramu memperlakukan sesama sepanjang proses berkarya.",
      "Ketika dunia terasa terlalu keras dan menuntut, karya-karyamu akan hadir sebagai lilin kecil di malam gelap, mengingatkan bahwa harapan selalu punya cara untuk bernyanyi.",
      "Jangan takut pada periode kebuntuan ide. Terkadang, tanah imajinasi hanya butuh waktu untuk beristirahat sebelum menumbuhkan bunga-bunga gagasan yang lebih menakjubkan.",
      "Di lingkungan FILKOM yang serba terstruktur, caramu berpikir bebas dan luwes adalah jembatan yang mempertemukan sains dengan kehangatan seni.",
      "Kreativitasmu adalah doa yang diwujudkan lewat karya nyata; teruslah mencipta, karena ada banyak jiwa yang menanti sentuhan kebaikan dari tanganmu.",
      "Jadilah penjaga rasa di era di mana segalanya bisa diotomatisasi. Empati dan keaslian batinmu adalah hal berharga yang takkan pernah bisa digantikan oleh mesin mana pun.",
    ],
  },
  adventure: {
    key: "adventure",
    number: "03",
    label: "ADVENTURE & HORIZON",
    short: "Petualangan & Batas Baru",
    title: "The Boundary Breaker",
    subtitle: "Penjelajah berani yang menemukan jati diri di setiap batas baru",
    icon: "🌎",
    image: cardAdventureImg,
    frontImage: cardFrontImg,
    accentColor: "var(--SGEPacificOcean)",
    glowColor: "rgba(58, 140, 154, 0.4)",
    tags: ["#Keberanian", "#Eksplorasi", "#SGE2026", "#JejakKebaikan"],
    quotes: [
      "FILKOM hanyalah pelabuhan pertamamu. Lautan di luar sana begitu luas, dan setiap kali kakimu bergetar menghadapi hal baru, ingatlah bahwa keberanian sejati adalah melangkah meski belum tahu ujung jalannya.",
      "Jangan biarkan dinding-dinding kelas membatasi luasnya cakrawala mimpimu. Kamu diciptakan untuk menguji batas, menyapa dunia luar, dan membuktikan bahwa potensimu jauh melampaui apa yang kamu duga.",
      "Akan ada masa di mana kamu merasa tersesat dalam menentukan arah. Percayalah, sering kali justru di persimpangan yang tak kamu rencanakan itulah kamu menemukan sahabat sejati dan versi dirimu yang paling tangguh.",
      "Keberanianmu mengambil risiko untuk mencoba kompetisi baru, mendaftar program di luar negeri, atau memulai inisiatif sosial dari nol akan membuka pintu-pintu takdir yang tak pernah terbayangkan.",
      "Masa mudamu di kampus ini terlalu berharga untuk dihabiskan hanya di sudut kenyamanan yang aman. Berangkatlah dengan rasa penasaran, pelajari dunia dengan kerendahan hati, dan kembalilah dengan kebijaksanaan.",
      "Setiap kegagalan yang kamu jumpai di sepanjang perjalanan bukanlah akhir cerita, melainkan bumbu pendewasaan yang membuat kisah keberhasilanmu nanti terasa jauh lebih berharga.",
      "Kamu membawa energi kebebasan yang menular; saat orang-orang di sekitarmu ragu untuk bermimpi besar, langkah beranimu menjadi pemantik yang menyalakan keberanian mereka.",
      "Bukan tentang seberapa jauh jarak yang berhasil kamu tempuh di atas peta, melainkan tentang seberapa dalam hatimu terbuka menerima perbedaan, merangkul cerita baru, dan menebarkan kebaikan di setiap persinggahan.",
      "Dunia luar yang kompetitif bukanlah ancaman yang harus ditakuti, melainkan taman bermain besar tempat karakter, kejujuran, dan ketangguhan mentalmu diuji lalu bersinar terang.",
      "Jangan biarkan rasa takut salah menghentikan langkah pertamamu. Kapal diciptakan bukan untuk diam selamanya di dermaga yang tenang, melainkan untuk mengarungi deburan ombak samudra lepas.",
      "Kelak kamu akan menyadari bahwa tujuan terindah dari setiap pengembaraan bukanlah titik akhir di kejauhan, melainkan kedamaian dan keteguhan batin yang kamu temukan di dalam dirimu sendiri.",
      "Kamu adalah pengingat bagi kami bahwa batas-batas yang dibuat manusia selalu bisa ditembus oleh ketulusan tekad dan keberanian untuk terus mencoba sekali lagi.",
      "Di tengah perjalananmu yang dinamis, jagalah persahabatan yang kamu bangun di kampus ini; merekalah jangkar yang akan mengingatkanmu pada rumah saat badai kehidupan mengguncang.",
      "Kamu tidak pernah takut menjadi orang asing di tempat baru, karena kamu tahu bahwa kerendahan hati untuk belajar adalah paspor terbaik yang membuka setiap hati manusia.",
      "Suatu saat nanti, kisah petualangan hidupmu akan diceritakan kembali oleh mereka yang membutuhkan suntikan keberanian untuk melepaskan belenggu keraguan.",
      "Teruslah melangkah melampaui apa yang dianggap biasa. FILKOM dan dunia membutuhkan sosok perintis yang berani membuka jalan setapak di tengah lebatnya ketidaktahuan.",
      "Dalam setiap kelelahan eksplorasimu, selalu ada bintang kejora yang membimbingmu pulang: kejujuran niatmu dan kerinduan untuk memberi manfaat bagi sesama.",
      "Jadilah pengembara yang bijak: berjalan dengan penuh rasa hormat pada kearifan lokal, mengamati dengan empati yang jernih, dan bertindak dengan ketegasan tekad yang membara.",
    ],
  },
};

export const personaKeys: PersonaKey[] = ["career", "creative", "adventure"];

export function getRandomQuote(key: PersonaKey, excludeIndex?: number): string {
  const pool = personas[key]?.quotes || [];
  if (pool.length === 0) return "";
  if (pool.length === 1) return pool[0] ?? "";

  let nextIndex = Math.floor(Math.random() * pool.length);
  if (excludeIndex !== undefined && nextIndex === excludeIndex) {
    nextIndex = (nextIndex + 1) % pool.length;
  }
  return pool[nextIndex] ?? "";
}
