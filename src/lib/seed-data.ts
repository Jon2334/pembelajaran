import { Profile, ClassRoom } from '../types/auth';
import { LearningMaterial } from '../types/materials';
import { Quiz, QuizQuestion, QuizAttempt } from '../types/quizzes';

export const SEED_TEACHER: Profile = {
  id: 'guru-demo-001',
  email: 'guru@informatika.sch.id',
  full_name: 'Budi Santoso, M.Kom.',
  role: 'guru',
  school_name: 'SMA Negeri Informatika Digital',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  updated_at: new Date().toISOString(),
};

export const SEED_STUDENT: Profile = {
  id: 'siswa-demo-001',
  email: 'siswa@informatika.sch.id',
  full_name: 'Ahmad Fauzi',
  role: 'siswa',
  class_code: 'X-RPL-1',
  school_name: 'SMA Negeri Informatika Digital',
  avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
  created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  updated_at: new Date().toISOString(),
};

export const SEED_STUDENT_2: Profile = {
  id: 'siswa-demo-002',
  email: 'siti.rahma@informatika.sch.id',
  full_name: 'Siti Rahmawati',
  role: 'siswa',
  class_code: 'X-RPL-1',
  school_name: 'SMA Negeri Informatika Digital',
  created_at: new Date(Date.now() - 18 * 86400000).toISOString(),
  updated_at: new Date().toISOString(),
};

export const SEED_CLASSES: ClassRoom[] = [
  {
    id: 'class-001',
    name: 'X RPL 1 (Rekayasa Perangkat Lunak)',
    code: 'X-RPL-1',
    academic_year: '2026/2027',
    description: 'Kelas Informatika Dasar & Pemrograman Web/Mobile',
    teacher_id: SEED_TEACHER.id,
    student_count: 32,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'class-002',
    name: 'X TKJ 1 (Teknik Komputer & Jaringan)',
    code: 'X-TKJ-1',
    academic_year: '2026/2027',
    description: 'Kelas Sistem Komputer & Jaringan Internet',
    teacher_id: SEED_TEACHER.id,
    student_count: 30,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
];

export const SEED_MATERIALS: LearningMaterial[] = [
  {
    id: 'mat-001',
    teacher_id: SEED_TEACHER.id,
    title: 'Pengantar Informatika Modern & Etika Digital',
    slug: 'pengantar-informatika-modern',
    category: 'Dasar-Dasar Informatika',
    difficulty: 'Pemula',
    reading_time_minutes: 8,
    status: 'published',
    order_index: 1,
    cover_image_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600',
    description: 'Mengenal pilar-pilar informatika, literasi informasi digital, hak cipta software, dan netiket di dunia cyber.',
    content: `# Pengantar Informatika Modern & Etika Digital

Informatika adalah disiplin ilmu yang mencakup struktur, sifat, dan interaksi dari beberapa sistem yang dipakai untuk mengumpulkan data, memproses dan menyimpan hasil pemrosesan data, serta menampilkannya dalam bentuk informasi.

## Pilar Utama Informatika
1. **Berpikir Komputasional (Computational Thinking)**: Fondasi memecahkan masalah kompleks secara terstruktur.
2. **Teknologi Informasi & Komunikasi (TIK)**: Pemanfaatan perangkat keras dan lunak untuk produktivitas.
3. **Sistem Komputer (SK)**: Cara kerja perangkat keras, sistem operasi, dan instruksi mesin.
4. **Jaringan Komputer & Internet (JKI)**: Komunikasi data antar-komputer melalui protokol jaringan.
5. **Analisis Data (AD)**: Pengolahan sekumpulan data untuk menghasilkan kesimpulan bermakna.
6. **Algoritma & Pemrograman (AP)**: Penulisan instruksi logis untuk dieksekusi oleh mesin.
7. **Dampak Sosial Informatika (DSI)**: Implikasi sosial, hukum, privasi, dan etika teknologi.

## Netiket dan Etika Digital
Dalam era digital, setiap individu wajib mematuhi etika:
- Menghormati privasi dan data pribadi orang lain.
- Tidak menyebarkan hoaks atau informasi yang belum terverifikasi.
- Menghargai hak cipta perangkat lunak dan lisensi open-source.
- Menghindari cyberbullying dan ujaran kebencian di ruang maya.`,
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    teacher_name: SEED_TEACHER.full_name,
  },
  {
    id: 'mat-002',
    teacher_id: SEED_TEACHER.id,
    title: '4 Pilar Berpikir Komputasional dalam Pemecahan Masalah',
    slug: '4-pilar-berpikir-komputasional',
    category: 'Berpikir Komputasional',
    difficulty: 'Pemula',
    reading_time_minutes: 10,
    status: 'published',
    order_index: 2,
    cover_image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600',
    description: 'Pelajari Dekomposisi, Pengenalan Pola, Abstraksi, dan Perancangan Algoritma untuk menyelesaikan masalah kompleks.',
    content: `# 4 Pilar Berpikir Komputasional (Computational Thinking)

Computational Thinking (CT) bukan berarti berpikir seperti robot, melainkan sebuah metode sistematis untuk menyelesaikan persoalan rumit agar solusinya dapat dieksekusi oleh manusia maupun komputer.

## 1. Dekomposisi (Decomposition)
Memecah masalah besar dan rumit menjadi bagian-bagian kecil yang lebih mudah dikelola dan dipahami.
*Contoh*: Saat membuat aplikasi e-commerce, kita memecahnya menjadi modul autentikasi, katalog produk, keranjang belanja, dan sistem pembayaran.

## 2. Pengenalan Pola (Pattern Recognition)
Melihat kesamaan, tren, atau keteraturan dalam masalah-masalah yang pernah dihadapi sebelumnya.
*Contoh*: Pola pencarian data dalam array terurut selalu dapat dioptimalkan menggunakan Binary Search alih-alih Linear Search.

## 3. Abstraksi (Abstraction)
Fokus pada informasi yang benar-benar penting dan mengabaikan detail-detail yang tidak relevan dengan solusi.
*Contoh*: Pada peta jalur MRT, kita hanya membutuhkan urutan stasiun dan jalur transfer, bukan kontur tanah geografis sebenarnya.

## 4. Perancangan Algoritma (Algorithm Design)
Menyusun langkah-langkah terurut, logis, dan terdefinisi dengan jelas untuk mencapai solusi akhir.`,
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    teacher_name: SEED_TEACHER.full_name,
  },
  {
    id: 'mat-003',
    teacher_id: SEED_TEACHER.id,
    title: 'Algoritma Percabangan, Perulangan & Struktur Data',
    slug: 'algoritma-percabangan-perulangan',
    category: 'Algoritma dan Pemrograman',
    difficulty: 'Menengah',
    reading_time_minutes: 12,
    status: 'published',
    order_index: 3,
    cover_image_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600',
    description: 'Kuasai struktur kendali percabangan (if-else, switch), perulangan (for, while), dan struktur data array serta dictionary.',
    content: `# Algoritma Percabangan, Perulangan & Struktur Data

Struktur kendali merupakan blok bangunan utama dalam setiap bahasa pemrograman modern.

## 1. Struktur Percabangan (Branching)
Percabangan memungkinkan program mengambil keputusan berdasarkan evaluasi kondisi boolean (true/false).
- **If - Else**: Memilih antara dua cabang eksekusi.
- **Nested If / Switch-Case**: Menangani banyak kemungkinan nilai secara terstruktur.

\`\`\`javascript
if (nilai >= 75) {
  console.log("Status: LULUS");
} else {
  console.log("Status: REMEDIAL");
}
\`\`\`

## 2. Struktur Perulangan (Looping)
Perulangan mengeksekusi blok kode berulang kali selama kondisi terpenuhi.
- **For Loop**: Digunakan saat jumlah iterasi sudah diketahui secara pasti.
- **While Loop**: Digunakan saat jumlah perulangan bergantung pada kondisi dinamis.
- **Do-While**: Menjamin kode dieksekusi minimal satu kali sebelum kondisi diuji.

## 3. Struktur Data Dasar
- **Array**: Kumpulan elemen bertipe sejenis yang diakses menggunakan indeks numerik (0-indexed).
- **Stack & Queue**: Stack (LIFO - Last In First Out) dan Queue (FIFO - First In First Out).`,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    teacher_name: SEED_TEACHER.full_name,
  },
  {
    id: 'mat-004',
    teacher_id: SEED_TEACHER.id,
    title: 'Arsitektur Komputer & Siklus Fetch-Decode-Execute',
    slug: 'arsitektur-komputer-siklus-instruksi',
    category: 'Sistem Komputer',
    difficulty: 'Menengah',
    reading_time_minutes: 10,
    status: 'published',
    order_index: 4,
    cover_image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600',
    description: 'Memahami Central Processing Unit (ALU, CU, Register), hierarki memori, dan siklus eksekusi instruksi komputer.',
    content: `# Arsitektur Komputer & Siklus Fetch-Decode-Execute

Setiap komputer modern mengadopsi model **Von Neumann Architecture**, di mana data dan instruksi program disimpan bersama di dalam memori utama.

## Komponen Utama CPU
1. **Control Unit (CU)**: Mengatur jalannya lalu lintas data dan menginterpretasikan instruksi.
2. **Arithmetic Logic Unit (ALU)**: Melakukan perhitungan aritmatika (+, -, *, /) dan operasi logika (AND, OR, NOT).
3. **Registers**: Memori internal CPU berkecepatan paling tinggi (Program Counter, Instruction Register, Accumulator).

## Hierarki Memori
Hierarki memori diurutkan dari kecepatan tertinggi ke terendah:
1. Register CPU
2. Cache L1, L2, L3
3. RAM (Random Access Memory)
4. Solid State Drive (SSD) / Hard Disk Drive (HDD)

## Siklus Instruksi Mesin
- **Fetch**: Mengambil instruksi dari RAM ke register CPU melalui Program Counter.
- **Decode**: Menerjemahkan instruksi biner menjadi sinyal kontrol.
- **Execute**: Menjalankan aksi yang diperintahkan (aritmatika atau perpindahan data).
- **Store**: Menyimpan hasil kembali ke memori jika diperlukan.`,
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    teacher_name: SEED_TEACHER.full_name,
  },
  {
    id: 'mat-005',
    teacher_id: SEED_TEACHER.id,
    title: 'Protokol Jaringan Internet & Model 7 Lapisan OSI',
    slug: 'protokol-jaringan-model-osi',
    category: 'Jaringan Komputer dan Internet',
    difficulty: 'Menengah',
    reading_time_minutes: 12,
    status: 'published',
    order_index: 5,
    cover_image_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600',
    description: 'Pelajari konsep komunikasi data melalui OSI 7 Layer, TCP/IP, IP Addressing (IPv4/IPv6), subnetting, dan sistem DNS.',
    content: `# Protokol Jaringan Internet & Model 7 Lapisan OSI

Jaringan komputer adalah sistem yang menghubungkan dua perangkat atau lebih agar dapat saling bertukar data dan sumber daya.

## Model 7 Lapisan OSI (Open Systems Interconnection)
1. **Application (Layer 7)**: Antarmuka langsung ke pengguna (HTTP, HTTPS, FTP, SMTP, DNS).
2. **Presentation (Layer 6)**: Enkripsi, kompresi, dan format data (TLS/SSL, JSON, PNG).
3. **Session (Layer 5)**: Membuka, mengelola, dan menutup sesi komunikasi antar-aplikasi.
4. **Transport (Layer 4)**: Pengiriman data end-to-end dengan keandalan (TCP - reliable, UDP - fast).
5. **Network (Layer 3)**: Pengalamatan logis dan routing paket antar-jaringan (IP, ICMP, Router).
6. **Data Link (Layer 2)**: Pengalamatan fisik MAC Address, switch, frame.
7. **Physical (Layer 1)**: Transmisi sinyal fisik melalui kabel tembaga, fiber optik, atau gelombang radio Wi-Fi.

## Perbedaan TCP vs UDP
- **TCP (Transmission Control Protocol)**: Berorientasi koneksi (3-way handshake), menjamin setiap paket tiba tanpa cacat dan berurutan. Digunakan pada web browsing dan email.
- **UDP (User Datagram Protocol)**: Tanpa koneksi (connectionless), tidak menjamin urutan, tetapi latensi sangat rendah. Digunakan untuk live streaming dan game online.`,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    teacher_name: SEED_TEACHER.full_name,
  },
  {
    id: 'mat-006',
    teacher_id: SEED_TEACHER.id,
    title: 'Desain Relasional Basis Data & Query SQL Fundamental',
    slug: 'desain-relasional-database-sql',
    category: 'Basis Data',
    difficulty: 'Menengah',
    reading_time_minutes: 11,
    status: 'published',
    order_index: 6,
    cover_image_url: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600',
    description: 'Kuasai konsep Primary Key, Foreign Key, normalisasi data, serta perintah DDL dan DML dalam SQL.',
    content: `# Desain Relasional Basis Data & Query SQL Fundamental

Basis data relasional menyimpan data dalam bentuk tabel-tabel dua dimensi (baris dan kolom) yang saling terhubung menggunakan kunci relasi.

## Kunci Relasi (Keys)
- **Primary Key (PK)**: Atribut unik yang menjadi identitas tunggal setiap baris record pada sebuah tabel. Tidak boleh bernilai NULL.
- **Foreign Key (FK)**: Kolom yang mereferensikan Primary Key dari tabel lain untuk membentuk hubungan relasi (1-to-Many, Many-to-Many).

## Kategori Perintah SQL
### 1. DDL (Data Definition Language)
Perintah untuk mendefinisikan dan memodifikasi struktur skema basis data:
- \`CREATE TABLE\` : Membuat tabel baru.
- \`ALTER TABLE\` : Mengubah kolom tabel.
- \`DROP TABLE\` : Menghapus tabel.

### 2. DML (Data Manipulation Language)
Perintah untuk mengelola isi data:
\`\`\`sql
-- Memilih data dengan filter
SELECT nama, nilai FROM siswa WHERE nilai >= 80 ORDER BY nilai DESC;

-- Memasukkan data baru
INSERT INTO siswa (nama, email, kelas) VALUES ('Ahmad', 'ahmad@mail.com', 'X RPL 1');

-- Memperbarui data
UPDATE siswa SET nilai = 90 WHERE id = 1;
\`\`\`

## Normalisasi Data
Proses mengorganisasi data dalam database guna mengurangi redundansi (duplikasi data) dan mencegah anomali saat insert, update, atau delete.`,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    teacher_name: SEED_TEACHER.full_name,
  },
  {
    id: 'mat-007',
    teacher_id: SEED_TEACHER.id,
    title: 'Keamanan Digital: Kriptografi & Perlindungan Siber',
    slug: 'keamanan-digital-kriptografi',
    category: 'Keamanan Digital',
    difficulty: 'Mahir',
    reading_time_minutes: 10,
    status: 'published',
    order_index: 7,
    cover_image_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600',
    description: 'Memahami prinsip CIA Triad, enkripsi simetris vs asimetris, pencegahan phishing, dan penerapan autentikasi multi-faktor.',
    content: `# Keamanan Digital: Kriptografi & Perlindungan Siber

Keamanan siber berfokus pada upaya melindungi sistem, jaringan, program, dan data dari serangan digital tanpa izin.

## CIA Triad (Fondasi Keamanan Informasi)
1. **Confidentiality (Kerahasiaan)**: Memastikan informasi hanya dapat diakses oleh pihak yang berwenang (misal: enkripsi data).
2. **Integrity (Integritas)**: Menjamin data tetap akurat, konsisten, dan tidak diubah oleh pihak yang tidak sah saat transmisi (misal: cryptographic hashing SHA-256).
3. **Availability (Ketersediaan)**: Memastikan data dan layanan selalu dapat diakses saat dibutuhkan (misal: proteksi terhadap serangan DDoS).

## Kriptografi Simetris vs Asimetris
- **Enkripsi Simetris (Symmetric Encryption)**: Menggunakan satu kunci yang sama untuk proses enkripsi dan dekripsi. Cepat dan efisien untuk data besar (contoh: AES-256).
- **Enkripsi Asimetris (Public-Key Cryptography)**: Menggunakan sepasang kunci: Public Key (dibagikan ke siapa saja untuk mengenkripsi) dan Private Key (disimpan rahasia untuk mendekripsi). Contoh: RSA, ECC, TLS/SSL.

## Langkah Praktis Perlindungan Akun
- Mengaktifkan **Two-Factor Authentication (2FA)** atau MFA.
- Menggunakan kata sandi unik dengan kombinasi minimal 12 karakter.
- Berhati-hati terhadap email phishing yang memalsukan alamat pengirim resmi.`,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    teacher_name: SEED_TEACHER.full_name,
  },
  {
    id: 'mat-008',
    teacher_id: SEED_TEACHER.id,
    title: 'Analisis Data: Statistik Deskriptif & Visualisasi',
    slug: 'analisis-data-visualisasi',
    category: 'Analisis Data',
    difficulty: 'Menengah',
    reading_time_minutes: 9,
    status: 'published',
    order_index: 8,
    cover_image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600',
    description: 'Siklus pengolahan data mentah, pembersihan missing value, perhitungan tendensi sentral, dan interpretasi grafik data.',
    content: `# Analisis Data: Statistik Deskriptif & Visualisasi

Data di era modern sering disebut sebagai "the new oil". Analisis data adalah seni dan ilmu mengekstrak pola bernilai dari kumpulan angka mentah.

## Siklus Analisis Data
1. **Data Collection (Pengumpulan)**: Mengumpulkan data dari database, sensor IoT, API, atau formulir web.
2. **Data Cleaning (Pembersihan)**: Menangani missing value (data kosong), membuang outlier ekstrim, dan standarisasi format.
3. **Exploratory Data Analysis (EDA)**: Menghitung statistik ringkasan dan mengeksplorasi hubungan antar-variabel.
4. **Data Visualization (Visualisasi)**: Mengubah angka menjadi grafik intuitif (bar chart, line chart, scatter plot).

## Ukuran Tendensi Sentral
- **Mean (Rata-rata)**: Jumlah semua nilai dibagi total sampel. Sensitif terhadap data pencilan (outlier).
- **Median**: Nilai tengah saat data diurutkan dari kecil ke besar. Kebal terhadap pencilan.
- **Modus**: Nilai yang paling sering muncul dalam kumpulan data.`,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    teacher_name: SEED_TEACHER.full_name,
  },
  {
    id: 'mat-009',
    teacher_id: SEED_TEACHER.id,
    title: 'Pengantar Kecerdasan Buatan & Machine Learning',
    slug: 'pengantar-kecerdasan-buatan-machine-learning',
    category: 'Kecerdasan Buatan',
    difficulty: 'Mahir',
    reading_time_minutes: 11,
    status: 'published',
    order_index: 9,
    cover_image_url: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600',
    description: 'Memahami perbedaan AI, Machine Learning, dan Deep Learning, serta tipe pembelajaran Supervised, Unsupervised, dan Reinforcement.',
    content: `# Pengantar Kecerdasan Buatan & Machine Learning

Kecerdasan Buatan (Artificial Intelligence) merujuk pada kemampuan sistem komputer untuk meniru kemampuan kognitif manusia, seperti belajar, bernalar, dan memecahkan masalah.

## Hubungan AI, Machine Learning & Deep Learning
- **Artificial Intelligence (AI)**: Konsep payung besar yang mencakup semua teknologi cerdas.
- **Machine Learning (ML)**: Sub-bidang AI di mana mesin belajar mengenali pola dari data tanpa perlu diprogram secara eksplisit langkah demi langkah.
- **Deep Learning (DL)**: Bagian dari ML yang menggunakan Jaringan Saraf Tiruan berlapis (Artificial Neural Networks) yang terinspirasi oleh struktur otak manusia.

## Paradigma Pembelajaran Mesin
1. **Supervised Learning (Pembelajaran Terarah)**:
   Model dilatih menggunakan data berlabel (*input -> label target*).
   *Contoh*: Klasifikasi email spam vs non-spam, prediksi harga rumah.

2. **Unsupervised Learning (Pembelajaran Tak Terarah)**:
   Model mencari pola atau struktur alami dari data tanpa label panduan.
   *Contoh*: Customer segmentation, clustering kemiripan produk.

3. **Reinforcement Learning (Pembelajaran Penguatan)**:
   Agen belajar mengambil keputusan optimal melalui interaksi dengan lingkungan melalui mekanisme *reward* (hadiah) dan *penalty* (hukuman).`,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    teacher_name: SEED_TEACHER.full_name,
  },
];

export const SEED_QUIZZES: Quiz[] = [
  {
    id: 'quiz-001',
    teacher_id: SEED_TEACHER.id,
    material_id: 'mat-002',
    title: 'Kuis Evaluasi 1: Berpikir Komputasional & Algoritma',
    description: 'Kuis komprehensif menguji pemahaman 4 pilar computational thinking, alur logika algoritma, dan struktur kontrol.',
    category: 'Berpikir Komputasional',
    time_limit_minutes: 15,
    passing_grade: 75,
    randomize_questions: false,
    randomize_options: false,
    status: 'published',
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    teacher_name: SEED_TEACHER.full_name,
    questions_count: 5,
    total_points: 100,
  },
  {
    id: 'quiz-002',
    teacher_id: SEED_TEACHER.id,
    material_id: 'mat-005',
    title: 'Kuis Evaluasi 2: Sistem Komputer & Jaringan Internet',
    description: 'Uji pemahaman tentang komponen CPU Von Neumann, fungsi 7 Lapisan OSI, dan protokol TCP/IP.',
    category: 'Jaringan Komputer dan Internet',
    time_limit_minutes: 20,
    passing_grade: 70,
    randomize_questions: false,
    randomize_options: false,
    status: 'published',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    teacher_name: SEED_TEACHER.full_name,
    questions_count: 4,
    total_points: 100,
  },
  {
    id: 'quiz-003',
    teacher_id: SEED_TEACHER.id,
    material_id: 'mat-006',
    title: 'Kuis Evaluasi 3: Basis Data Relasional & SQL',
    description: 'Evaluasi pemahaman konsep Primary Key, Foreign Key, dan sintaks query manipulasi data SQL.',
    category: 'Basis Data',
    time_limit_minutes: 15,
    passing_grade: 80,
    randomize_questions: false,
    randomize_options: false,
    status: 'published',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    teacher_name: SEED_TEACHER.full_name,
    questions_count: 3,
    total_points: 60,
  },
];

export const SEED_QUESTIONS: Record<string, QuizQuestion[]> = {
  'quiz-001': [
    {
      id: 'q-001',
      quiz_id: 'quiz-001',
      question_text: 'Dalam 4 pilar berpikir komputasional, teknik memecah masalah besar menjadi bagian-bagian yang lebih kecil dan mudah dikelola disebut...',
      question_type: 'multiple_choice',
      points: 20,
      order_index: 1,
      explanation: 'Dekomposisi adalah proses memecah masalah kompleks menjadi sub-masalah yang lebih kecil agar lebih mudah diselesaikan secara terpisah.',
      options: [
        { id: 'opt-1-1', question_id: 'q-001', option_key: 'A', option_text: 'Abstraksi', is_correct: false, order_index: 1 },
        { id: 'opt-1-2', question_id: 'q-001', option_key: 'B', option_text: 'Dekomposisi', is_correct: true, order_index: 2 },
        { id: 'opt-1-3', question_id: 'q-001', option_key: 'C', option_text: 'Pengenalan Pola', is_correct: false, order_index: 3 },
        { id: 'opt-1-4', question_id: 'q-001', option_key: 'D', option_text: 'Perancangan Algoritma', is_correct: false, order_index: 4 },
      ],
    },
    {
      id: 'q-002',
      quiz_id: 'quiz-001',
      question_text: 'Fokus pada informasi utama yang penting dan mengabaikan detail-detail yang tidak relevan merupakan definisi dari pilar Abstraksi.',
      question_type: 'true_false',
      points: 20,
      order_index: 2,
      explanation: 'Benar. Abstraksi menyaring detail yang tidak penting sehingga fokus tetap tertuju pada karakteristik esensial dari masalah.',
      options: [
        { id: 'opt-2-1', question_id: 'q-002', option_key: 'true', option_text: 'Benar', is_correct: true, order_index: 1 },
        { id: 'opt-2-2', question_id: 'q-002', option_key: 'false', option_text: 'Salah', is_correct: false, order_index: 2 },
      ],
    },
    {
      id: 'q-003',
      quiz_id: 'quiz-001',
      question_text: 'Struktur data linear yang mengadopsi prinsip LIFO (Last In First Out) disebut...',
      question_type: 'multiple_choice',
      points: 20,
      order_index: 3,
      explanation: 'Stack (tumpukan) menerapkan prinsip LIFO, di mana elemen yang terakhir dimasukkan akan menjadi elemen pertama yang dikeluarkan.',
      options: [
        { id: 'opt-3-1', question_id: 'q-003', option_key: 'A', option_text: 'Queue', is_correct: false, order_index: 1 },
        { id: 'opt-3-2', question_id: 'q-003', option_key: 'B', option_text: 'Array', is_correct: false, order_index: 2 },
        { id: 'opt-3-3', question_id: 'q-003', option_key: 'C', option_text: 'Stack', is_correct: true, order_index: 3 },
        { id: 'opt-3-4', question_id: 'q-003', option_key: 'D', option_text: 'Linked List', is_correct: false, order_index: 4 },
      ],
    },
    {
      id: 'q-004',
      quiz_id: 'quiz-001',
      question_text: 'Perulangan For selalu digunakan ketika kondisi berhentinya tidak diketahui di awal pemrograman.',
      question_type: 'true_false',
      points: 20,
      order_index: 4,
      explanation: 'Salah. For loop idealnya digunakan ketika jumlah iterasi sudah diketahui secara pasti. Jika batas iterasi dinamis dan belum tentu, lebih tepat menggunakan While loop.',
      options: [
        { id: 'opt-4-1', question_id: 'q-004', option_key: 'true', option_text: 'Benar', is_correct: false, order_index: 1 },
        { id: 'opt-4-2', question_id: 'q-004', option_key: 'false', option_text: 'Salah', is_correct: true, order_index: 2 },
      ],
    },
    {
      id: 'q-005',
      quiz_id: 'quiz-001',
      question_text: 'Tuliskan nama algoritma pencarian elemen pada kumpulan data terurut yang bekerja dengan membagi dua ruang pencarian secara berulang (dalam bahasa Inggris):',
      question_type: 'short_answer',
      points: 20,
      order_index: 5,
      correct_answer_text: 'Binary Search, Binary Search Algorithm',
      explanation: 'Binary Search (Pencarian Biner) membagi rentang pencarian menjadi dua bagian berulang kali sehingga memiliki kompleksitas waktu O(log n).',
    },
  ],
  'quiz-002': [
    {
      id: 'q-201',
      quiz_id: 'quiz-002',
      question_text: 'Komponen CPU yang bertanggung jawab langsung untuk melakukan operasi perhitungan matematika dan perbandingan logika adalah...',
      question_type: 'multiple_choice',
      points: 25,
      order_index: 1,
      explanation: 'ALU (Arithmetic Logic Unit) adalah sirkuit digital di dalam CPU yang mengeksekusi operasi aritmatika (seperti penjumlahan) dan operasi logika (AND, OR, perbandingan nilai).',
      options: [
        { id: 'opt-201-1', question_id: 'q-201', option_key: 'A', option_text: 'Control Unit (CU)', is_correct: false, order_index: 1 },
        { id: 'opt-201-2', question_id: 'q-201', option_key: 'B', option_text: 'Arithmetic Logic Unit (ALU)', is_correct: true, order_index: 2 },
        { id: 'opt-201-3', question_id: 'q-201', option_key: 'C', option_text: 'Register Cache', is_correct: false, order_index: 3 },
        { id: 'opt-201-4', question_id: 'q-201', option_key: 'D', option_text: 'System Bus', is_correct: false, order_index: 4 },
      ],
    },
    {
      id: 'q-202',
      quiz_id: 'quiz-002',
      question_text: 'Protokol HTTP dan HTTPS beroperasi pada lapisan (layer) ke berapa dalam model 7 Layer OSI?',
      question_type: 'multiple_choice',
      points: 25,
      order_index: 2,
      explanation: 'HTTP, HTTPS, DNS, dan FTP bekerja pada Layer 7 (Application Layer) yang berinteraksi langsung dengan aplikasi pengguna.',
      options: [
        { id: 'opt-202-1', question_id: 'q-202', option_key: 'A', option_text: 'Layer 7 (Application)', is_correct: true, order_index: 1 },
        { id: 'opt-202-2', question_id: 'q-202', option_key: 'B', option_text: 'Layer 4 (Transport)', is_correct: false, order_index: 2 },
        { id: 'opt-202-3', question_id: 'q-202', option_key: 'C', option_text: 'Layer 3 (Network)', is_correct: false, order_index: 3 },
        { id: 'opt-202-4', question_id: 'q-202', option_key: 'D', option_text: 'Layer 2 (Data Link)', is_correct: false, order_index: 4 },
      ],
    },
    {
      id: 'q-203',
      quiz_id: 'quiz-002',
      question_text: 'Protokol UDP menjamin bahwa setiap paket data pasti sampai ke tujuan secara berurutan dan tanpa kesalahan.',
      question_type: 'true_false',
      points: 25,
      order_index: 3,
      explanation: 'Salah. UDP bersifat connectionless dan tidak menjamin penerimaan paket. Protokol yang menjamin penerimaan berurutan dan bebas galat adalah TCP.',
      options: [
        { id: 'opt-203-1', question_id: 'q-203', option_key: 'true', option_text: 'Benar', is_correct: false, order_index: 1 },
        { id: 'opt-203-2', question_id: 'q-203', option_key: 'false', option_text: 'Salah', is_correct: true, order_index: 2 },
      ],
    },
    {
      id: 'q-204',
      quiz_id: 'quiz-002',
      question_text: 'Sebutkan singkatan dari sistem yang bertugas menerjemahkan nama domain (seperti google.com) menjadi alamat IP numerik:',
      question_type: 'short_answer',
      points: 25,
      order_index: 4,
      correct_answer_text: 'DNS, Domain Name System',
      explanation: 'DNS (Domain Name System) berfungsi layaknya buku telepon internet yang memetakan nama domain ke alamat IP server tujuan.',
    },
  ],
  'quiz-003': [
    {
      id: 'q-301',
      quiz_id: 'quiz-003',
      question_text: 'Kolom unik yang berfungsi sebagai penanda tunggal setiap baris data pada tabel relasional dan tidak boleh bernilai NULL adalah...',
      question_type: 'multiple_choice',
      points: 20,
      order_index: 1,
      explanation: 'Primary Key secara ketat mengidentifikasi setiap record dan memiliki constraint NOT NULL serta UNIQUE.',
      options: [
        { id: 'opt-301-1', question_id: 'q-301', option_key: 'A', option_text: 'Foreign Key', is_correct: false, order_index: 1 },
        { id: 'opt-301-2', question_id: 'q-301', option_key: 'B', option_text: 'Primary Key', is_correct: true, order_index: 2 },
        { id: 'opt-301-3', question_id: 'q-301', option_key: 'C', option_text: 'Candidate Key', is_correct: false, order_index: 3 },
        { id: 'opt-301-4', question_id: 'q-301', option_key: 'D', option_text: 'Index Key', is_correct: false, order_index: 4 },
      ],
    },
    {
      id: 'q-302',
      quiz_id: 'quiz-003',
      question_text: 'Klausul SQL apa yang digunakan untuk mengurutkan hasil query dari nilai terbesar ke nilai terkecil?',
      question_type: 'multiple_choice',
      points: 20,
      order_index: 2,
      explanation: 'ORDER BY kolom DESC mengurutkan data secara menurun (Descending), dari nilai terbesar ke terkecil.',
      options: [
        { id: 'opt-302-1', question_id: 'q-302', option_key: 'A', option_text: 'GROUP BY kolom ASC', is_correct: false, order_index: 1 },
        { id: 'opt-302-2', question_id: 'q-302', option_key: 'B', option_text: 'ORDER BY kolom DESC', is_correct: true, order_index: 2 },
        { id: 'opt-302-3', question_id: 'q-302', option_key: 'C', option_text: 'SORT BY kolom DOWN', is_correct: false, order_index: 3 },
        { id: 'opt-302-4', question_id: 'q-302', option_key: 'D', option_text: 'FILTER BY kolom DESC', is_correct: false, order_index: 4 },
      ],
    },
    {
      id: 'q-303',
      quiz_id: 'quiz-003',
      question_text: 'Tuliskan kata kunci SQL (1 kata) yang digunakan untuk menghapus baris data yang ada pada suatu tabel:',
      question_type: 'short_answer',
      points: 20,
      order_index: 3,
      correct_answer_text: 'DELETE, DELETE FROM',
      explanation: 'Perintah DELETE digunakan dalam SQL DML untuk menghapus baris data dari tabel.',
    },
  ],
};

export const SEED_ATTEMPTS: QuizAttempt[] = [
  {
    id: 'att-001',
    quiz_id: 'quiz-001',
    student_id: SEED_STUDENT.id,
    score: 80,
    earned_points: 80,
    total_points: 100,
    is_passed: true,
    started_at: new Date(Date.now() - 2 * 86400000 - 900000).toISOString(),
    completed_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    duration_seconds: 540,
    quiz_title: 'Kuis Evaluasi 1: Berpikir Komputasional & Algoritma',
    quiz_category: 'Berpikir Komputasional',
    student_name: SEED_STUDENT.full_name,
    student_email: SEED_STUDENT.email,
    passing_grade: 75,
  },
  {
    id: 'att-002',
    quiz_id: 'quiz-002',
    student_id: SEED_STUDENT.id,
    score: 100,
    earned_points: 100,
    total_points: 100,
    is_passed: true,
    started_at: new Date(Date.now() - 1 * 86400000 - 720000).toISOString(),
    completed_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    duration_seconds: 680,
    quiz_title: 'Kuis Evaluasi 2: Sistem Komputer & Jaringan Internet',
    quiz_category: 'Jaringan Komputer dan Internet',
    student_name: SEED_STUDENT.full_name,
    student_email: SEED_STUDENT.email,
    passing_grade: 70,
  },
];
