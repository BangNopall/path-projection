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
  futureProjections: string[];
  narration?: string[];
  feelings?: string[];
  closingMessage?: string;
}

export const personas: Record<PersonaKey, PersonaInfo> = {
  career: {
    key: "career",
    number: "01",
    label: "CAREER & FOUNDATION",
    short: "Karier & Kepemimpinan",
    title: "The Foundation Builder",
    subtitle:
      "Sepuluh tahun ke depan, kamu jadi orang yang dipercaya memimpin tim dan menyelesaikan urusan penting sampai tuntas.",
    icon: "💼",
    image: cardCareerImg,
    frontImage: cardFrontImg,
    accentColor: "var(--SGEMustardGold)",
    glowColor: "rgba(242, 183, 5, 0.35)",
    tags: ["#TemanAndalan", "#KebaikanTulus", "#SGE2026", "#PondasiHangat"],
    narration: [
      "Di hari pertama, kamu mungkin lebih banyak diam sambil mengamati sekitar.",
      "Tapi saat kawan sebelahmu bingung mencari ruangan, kamu yang pertama menyapa.",
      "Kehadiranmu yang tenang membuat orang lain merasa punya tempat bersandar.",
    ],
    feelings: [
      "Diam-diam mencatat info penting agar teman sekelompok tidak tertinggal.",
      "Merasa lega saat melihat semua orang di sekitarmu sudah nyaman.",
      "Kadang lelah karena selalu menahan cemas sendiri demi menguatkan kawan.",
    ],
    closingMessage: "Di kampus ini, ketulusan caramu peduli akan jadi rumah bagi banyak orang.",
    quotes: [
      "Di hari pertama, kamu mungkin diam memperhatikan sekitar. Kehadiranmu yang tenang membuat orang lain merasa punya tempat bersandar.",
      "Saat kawan sebelahmu bingung mencari ruangan kelas, kamu yang pertama menyapa. Kebaikan kecilmu langsung mencairkan rasa cemasnya.",
      "Kamu tidak butuh banyak bicara untuk didengar. Sikapmu yang selalu menepati janji sudah cukup membuat orang lain percaya.",
      "Di balik tugas kelompok yang selesai rapi, ada ketulusanmu merapikan hal-hal kecil. Kamu menjaga agar tidak ada kawan yang tertinggal.",
      "Kadang kamu merasa lelah karena selalu menahan cemas sendiri. Ingat, kamu juga boleh bersandar pada pundak kawanmu.",
      "Bukan gelar atau jabatan yang paling diingat kawan-kawanmu. Melainkan rasa aman yang selalu hadir setiap kali kamu ada di dekat mereka.",
      "Ketika suasana kelas mulai gaduh dan panik, ketenanganmu adalah jangkar. Orang-orang mencari tatapan matamu untuk kembali merasa tenang.",
      "Kamu tipe yang diam-diam mencatat info penting dari dosen. Lalu membagikannya dengan tulus ke teman sekelas yang kebingungan.",
      "Memimpin bagimu bukan tentang berdiri paling depan. Tapi tentang memastikan setiap kawan punya ruang untuk melangkah bersama.",
      "Mungkin kamu sering ragu apakah usahamu terlihat. Percayalah, kawan-kawanmu sangat bersyukur memilikimu di dalam kelompok mereka.",
      "Saat yang lain terburu-buru mengejar hasil instan, kamu sabar merapikan proses. Fondasi kokoh yang kamu bangun akan bertahan sangat lama.",
      "Satu tegur sapamu di koridor kampus bisa mengubah hari seseorang. Kehangatan yang kamu bawa selalu dirindukan banyak kawan.",
      "Kamu tidak pernah membiarkan kawan baru makan sendirian di kantin. Keramahan sederhanamu adalah berkah bagi mereka yang merantau.",
      "Ada keteguhan lembut di dalam caramu memegang prinsip. Kamu berani jujur meski hal itu bukan pilihan yang paling mudah.",
      "Jangan takut jika langkahmu terasa pelan di awal perkuliahan. Bangunan yang megah selalu butuh waktu lebih lama untuk fondasinya.",
      "Di ruang kelas yang dingin, senyum tulusmu adalah kehangatan. Kamu mengajarkan kami arti kesetiaan pada proses dan kawan.",
      "Kelelahanmu hari ini mengurus kebutuhan bersama tidak akan sia-sia. Kamu sedang belajar menjadi pribadi yang bijak dan berjiwa besar.",
      "Di kampus ini, ketulusan caramu peduli akan jadi rumah bagi banyak orang. Tetaplah menjadi pribadi yang menguatkan sekitarmu.",
    ],
    futureProjections: [
      "Sepuluh tahun ke depan, kamu bukan lagi orang yang menunggu arahan, melainkan pengambil keputusan strategis yang menentukan arah gerak tim.",
      "Sepuluh tahun ke depan, kamu dipercaya memegang tanggung jawab besar karena integritas dan caramu menyelesaikan masalah yang tenang.",
      "Sepuluh tahun ke depan, kamu bakal sadar bahwa dinamika organisasi kampus yang dulu melelahkan adalah latihan terbaikmu memimpin orang dengan berbagai karakter.",
      "Sepuluh tahun ke depan, kamu punya posisi tawar kuat untuk memilih kultur kerja yang sehat dan tempat di mana nilaimu benar-benar dihargai.",
      "Sepuluh tahun ke depan, kamu memimpin dengan mendengarkan—menjadi atasan yang dulu sangat kamu harapkan ada saat kamu baru memulai karier.",
      "Sepuluh tahun ke depan, pencapaian terbesarmu bukan cuma promosi jabatan, tapi melihat orang-orang yang kamu bimbing sukses melampaui ekspektasi.",
      "Sepuluh tahun ke depan, kamu berhasil membuktikan bahwa kerja cerdas dan konsistensi nyata jauh lebih bernilai daripada sekadar cari muka di tempat kerja.",
      "Sepuluh tahun ke depan, kamu menemukan ritme profesionalmu sendiri: berdaya saing tinggi tanpa harus kehilangan prinsip hidup dan waktu untuk dirimu sendiri.",
    ],
  },
  creative: {
    key: "creative",
    number: "02",
    label: "CREATIVE & SOUL",
    short: "Kreativitas & Jiwa",
    title: "The Soul Crafter",
    subtitle:
      "Sepuluh tahun ke depan, kamu sering diajak kerja bareng karena selalu punya ide menarik yang belum dipikirkan orang lain.",
    icon: "🎨",
    image: cardCreativeImg,
    frontImage: cardFrontImg,
    accentColor: "var(--SGECoralAqua)",
    glowColor: "rgba(87, 212, 221, 0.35)",
    tags: ["#KepekaanRasa", "#ImajinasiHangat", "#SGE2026", "#PemberiWarna"],
    narration: [
      "Ketika orang lain sibuk membicarakan tugas, kamu menangkap raut lelah mereka.",
      "Sentuhan kecilmu, dari senyuman hingga coretan ide, selalu menghidupkan suasana.",
      "Kamu mengingatkan kami bahwa di balik kesibukan, ada hati yang perlu dimengerti.",
    ],
    feelings: [
      "Menemukan ketenangan saat mendengarkan musik di selasar kampus yang sepi.",
      "Ragu membagikan idemu, padahal teman-teman selalu kagum dengan sudut pandangmu.",
      "Lega luar biasa saat berhasil menemukan teman mengobrol yang benar-benar sefrekuensi.",
    ],
    closingMessage:
      "Jangan sembunyikan kelembutanmu; dunia perkuliahan selalu rindu jiwa sehangat dirimu.",
    quotes: [
      "Ketika orang lain sibuk membicarakan tugas, kamu menangkap raut lelah mereka. Hatimu yang peka selalu tahu kapan harus memberi jeda.",
      "Sentuhan kecilmu, dari senyuman hingga coretan ide, selalu menghidupkan suasana. Kamu membawa warna di tengah rutinitas yang kaku.",
      "Sensitivitas hatimu bukanlah sebuah kelemahan. Justru dari sanalah lahir karya dan kepedulian yang menyentuh perasaan banyak orang.",
      "Kamu selalu punya cara unik memandang hal sederhana. Di matamu, sudut selasar kampus yang sepi pun menyimpan cerita tersendiri.",
      "Mungkin kamu sempat cemas idemu dianggap aneh oleh orang lain. Padahal sudut pandangmu yang berbedalah yang paling ditunggu kawan-kawanmu.",
      "Di tengah ramainya obrolan kelas, kamu menemukan ketenangan lewat musik. Dari keheningan itu, gagasan indahmu mulai bermekaran perlahan.",
      "Karyamu kelak akan jadi tempat berteduh bagi yang lelah. Kehangatan yang kamu tuangkan membuat orang lain merasa dipeluk.",
      "Saat teman kelompokmu kehabisan inspirasi, kamu hadir membawa percikan baru. Kehadiranmu membuat tugas terasa seperti ruang bermain.",
      "Tidak apa-apa jika sesekali kamu butuh menyendiri untuk bernapas. Menjaga ketenangan hatimu sama pentingnya dengan menyelesaikan tugas kuliah.",
      "Kamu mengajarkan kami bahwa keindahan ada pada ketidaksempurnaan. Keberanianmu menjadi diri sendiri membuat orang lain ikut merasa nyaman.",
      "Lega rasanya saat akhirnya kamu menemukan kawan yang sefrekuensi. Percakapan hangat hingga malam membuat rasa asing di kampus memudar.",
      "Jangan biarkan suara bising memadamkan keunikan intuisimu. Dunia perkuliahan ini butuh jiwa-jiwa perasa yang peduli pada kebahagiaan sesama.",
      "Buku catatanmu mungkin penuh coretan visual yang riang. Dari rasa penasaran yang bebas itulah kreativitasmu terus tumbuh subur.",
      "Kamu mampu mendengar apa yang tak terucapkan dari teman dekatmu. Empatimu yang hangat adalah anugerah terindah di lingkungan pertemanan.",
      "Tidak ada karya tulus yang berakhir sia-sia. Apa yang kamu buat dari hati kelak akan menemukan jalannya ke hati yang lain.",
      "Ketika hari terasa berat dan melelahkan, kamu selalu ingat cara tersenyum. Humor halusmu sering kali menyelamatkan kawan dari kejenuhan.",
      "Di kampus ini, kamu bebas merajut imajinasimu tanpa batas. Jadikan setiap ruang kelas sebagai kanvas untuk menebar kebaikan.",
      "Jangan sembunyikan kelembutanmu; dunia perkuliahan selalu rindu jiwa sehangat dirimu. Tetaplah berkarya dengan cinta dan ketulusan rasa.",
    ],
    futureProjections: [
      "Sepuluh tahun ke depan, karya dan seleramu diakui bukan karena ikut-ikutan tren, tapi karena punya identitas yang konsisten kamu rawat.",
      "Sepuluh tahun ke depan, kamu dibayar mahal untuk sudut pandang dan intuisimu, bukan cuma sekadar operator software desain.",
      "Sepuluh tahun ke depan, kamu punya studio atau proyek mandiri yang lahir dari keresahan-keresahan kecil yang dulu kamu simpan di sketchbook.",
      "Sepuluh tahun ke depan, kamu tidak lagi merasa bersalah untuk menolak brief yang bertentangan dengan standar karyamu.",
      "Sepuluh tahun ke depan, karya atau narasi yang kamu bikin benar-benar menyelesaikan masalah manusia, bukan cuma estetik di portofolio.",
      "Sepuluh tahun ke depan, kamu bisa melihat ke belakang dan bangga bahwa kamu tidak pernah mengorbankan selera orisinalmu demi validasi instan.",
      "Sepuluh tahun ke depan, kamu dikelilingi lingkaran kreatif yang saling mendorong bertumbuh tanpa drama dan kompetisi yang melelahkan.",
      "Sepuluh tahun ke depan, kamu berhasil hidup layak dari kreativitasmu tanpa harus menjual habis idealisme yang kamu bawa dari kampus.",
    ],
  },
  adventure: {
    key: "adventure",
    number: "03",
    label: "ADVENTURE & HORIZON",
    short: "Petualangan & Batas Baru",
    title: "The Boundary Breaker",
    subtitle:
      "Sepuluh tahun ke depan, kamu jadi orang yang berani mencoba hal baru dan cepat belajar langsung dari pengalamanmu.",
    icon: "🌎",
    image: cardAdventureImg,
    frontImage: cardFrontImg,
    accentColor: "var(--SGEPacificOcean)",
    glowColor: "rgba(58, 140, 154, 0.4)",
    tags: ["#LangkahBerani", "#KawanPenjelajah", "#SGE2026", "#JejakKebaikan"],
    narration: [
      "Memasuki gerbang kampus membuat dadamu berdebar kencang penuh rasa penasaran.",
      "Meski belum tahu ujung jalannya, kakimu tetap melangkah menyapa dunia baru.",
      "Semangatmu yang menyala menular, mengajak kawan di sebelahmu ikut melangkah.",
    ],
    feelings: [
      "Deg-degan mencoba mendaftar kegiatan baru, tapi tetap nekat menekan tombol kirim.",
      "Tersenyum bangga saat berhasil menemukan jalan pintas baru menuju gedung kuliah.",
      "Pernah merasa tersesat, tapi justru menemukan sahabat terbaik di persimpangan itu.",
    ],
    closingMessage:
      "Teruslah melangkah dengan riang; kampus ini adalah taman bermain luas untuk petualanganmu.",
    quotes: [
      "Memasuki gerbang kampus membuat dadamu berdebar kencang penuh rasa penasaran. Kakimu siap melangkah menyapa ribuan cerita yang menanti.",
      "Langkah beranimu menjadi pemantik bagi kawan-kawan yang masih ragu. Semangatmu yang cerah membuat suasana baru terasa menyenangkan.",
      "Kamu tidak takut menjadi orang baru di tempat asing. Keramahan dan senyum lepasmu membuka pintu pertemanan di mana pun kamu berada.",
      "Masa kuliahmu terlalu berharga untuk dilewatkan di sudut rasa takut. Rasa ingin tahumu adalah kompas terbaik menuju pengalaman berharga.",
      "Mungkin kamu pernah tersesat mencari ruang laboratorium di hari perdana. Tapi dari situlah kamu justru menemukan kawan seperjuangan terbaik.",
      "Keberanianmu mencoba hal baru sangat menginspirasi sekitarmu. Kamu membuktikan bahwa rasa cemas bisa dikalahkan dengan satu langkah pertama.",
      "Saat orang lain ragu mendaftar kegiatan kampus, kamu berani mencoba. Bagimu, setiap kesempatan adalah pintu untuk bertumbuh lebih tangguh.",
      "Bukan tentang seberapa jauh kamu pergi menjelajah. Tapi tentang seberapa hangat kamu merangkul setiap kawan baru di perjalananmu.",
      "Kegagalan kecil di awal perkuliahan bukanlah akhir cerita. Itu hanyalah cerita seru yang akan kamu tertawakan bersama sahabat kelak.",
      "Kamu membawa energi segar ke dalam setiap kelompok kerja. Suasana yang kaku mendadak cair begitu kamu mulai melontarkan ide segar.",
      "Jangan biarkan keraguan menahan langkah kakimu yang lincah. Kampus ini diciptakan untuk kamu jelajahi dengan penuh rasa gembira.",
      "Kamu senang mengamati riuhnya selasar dan mencoba hal-hal tak terduga. Hidup bagimu adalah lembaran petualangan yang siap kamu tulis.",
      "Saat menghadapi tantangan tugas yang rumit, matamu berbinar antusias. Kamu selalu percaya selalu ada jalan keluar jika dicari bersama.",
      "Keberanianmu menyapa duluan membuat teman yang pemalu merasa dihargai. Kamu adalah jembatan yang menghubungkan banyak orang di kampus ini.",
      "Terkadang kamu rindu rumah dan merasa gamang di perantauan. Ingatlah, keberanianmu merantau adalah bukti betapa tangguhnya jiwamu.",
      "Petualangan terbesarmu di kampus bukanlah mengejar pujian orang. Melainkan menemukan sahabat sejati yang siap berjalan di sampingmu.",
      "Di setiap persimpangan baru, dengarkan kata hatimu yang berani. Langkah kakimu sedang menorehkan jejak kebaikan yang tak terlupakan.",
      "Teruslah melangkah dengan riang; kampus ini adalah taman bermain luas untuk petualanganmu. Dunia sedang menanti cerita hebat dari langkahmu.",
    ],
    futureProjections: [
      "Sepuluh tahun ke depan, kamu bekerja dengan caramu sendiri—laptop di tas, jam kerja fleksibel, dan kontrol penuh atas waktumu.",
      "Sepuluh tahun ke depan, kamu membuktikan bahwa memilih jalan yang tidak linier bukan berarti tersesat, tapi berani merintis jalur baru.",
      "Sepuluh tahun ke depan, kamu punya jejaring pertemanan dan kolaborator lintas kota dan negara yang kamu temui dari perjalananmu.",
      "Sepuluh tahun ke depan, ketidakpastian tidak lagi bikin kamu cemas, karena kamu sudah terbiasa beradaptasi di situasi apa pun.",
      "Sepuluh tahun ke depan, kamu punya kebebasan finansial untuk mengambil jeda dan eksplorasi tanpa harus meminta izin atasan.",
      "Sepuluh tahun ke depan, cerita hidupmu bakal jauh lebih kaya dari sekadar jabatan di LinkedIn, penuh pengalaman nyata di lapangan.",
      "Sepuluh tahun ke depan, kamu berhasil membangun sistem hidup di mana karier melayani kebebasanmu, bukan sebaliknya.",
      "Sepuluh tahun ke depan, kamu tersenyum melihat orang-orang yang dulu meragukan pilihan hidupmu kini penasaran bagaimana kamu mewujudkannya.",
    ],
  },
};

export const personaKeys: PersonaKey[] = ["career", "creative", "adventure"];

export function getRandomQuote(key: PersonaKey, excludeIndex?: number): string {
  const p = personas[key];
  if (!p) return "";
  const pool = p.quotes;
  const len = pool.length;
  if (len === 0) return "";
  if (len === 1) return pool[0] ?? "";

  let nextIndex = (Math.random() * len) | 0;
  if (excludeIndex !== undefined && nextIndex === excludeIndex) {
    nextIndex = (nextIndex + 1) % len;
  }
  return pool[nextIndex] ?? "";
}

export interface RandomProjectionResult {
  projection: string;
  index: number;
}

export function getRandomFutureProjection(
  key: PersonaKey,
  excludeIndex?: number,
): RandomProjectionResult {
  const p = personas[key];
  if (!p || !p.futureProjections || p.futureProjections.length === 0) {
    return { projection: "", index: -1 };
  }
  const pool = p.futureProjections;
  const len = pool.length;
  if (len === 1) {
    return { projection: pool[0] ?? "", index: 0 };
  }

  let nextIndex = (Math.random() * len) | 0;
  if (
    excludeIndex !== undefined &&
    typeof excludeIndex === "number" &&
    !Number.isNaN(excludeIndex) &&
    nextIndex === excludeIndex
  ) {
    nextIndex = (nextIndex + 1) % len;
  }
  return { projection: pool[nextIndex] ?? "", index: nextIndex };
}
