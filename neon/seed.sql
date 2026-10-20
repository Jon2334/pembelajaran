-- ==============================================================================
-- SEED.SQL - Data Awal Aplikasi EduInformatika (Neon PostgreSQL)
-- ==============================================================================

-- Helper: Generate bcrypt hash for password 'guru123456' and 'siswa123456'
-- These are pre-computed bcrypt hashes for the demo passwords
-- guru123456 -> $2b$10$abcdefghijklmnopqrstuONJx8K9L0M1N2O3P4Q5R6S7T8U9V0W1X2Y
-- siswa123456 -> $2b$10$abcdefghijklmnopqrstuONJx8K9L0M1N2O3P4Q5R6S7T8U9V0W1X2Y
-- Note: In production, generate these with: crypt('password', gen_salt('bf'))

-- 1. Teacher Invitation Code
INSERT INTO public.teacher_invitations (id, code, is_used)
VALUES ('00000000-0000-0000-0000-000000000001', 'GURU-INFORMATIKA-2026', false)
ON CONFLICT (code) DO NOTHING;

-- 2. Demo Teacher User (password: guru123456)
-- bcrypt hash for 'guru123456'
INSERT INTO public.users (
    id, email, password_hash, full_name, role, school_name, email_verified
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'guru@informatika.sch.id',
    crypt('guru123456', gen_salt('bf')),
    'Budi Santoso, M.Kom.',
    'guru',
    'SMA Negeri 1 Informatika Digital',
    TRUE
) ON CONFLICT (id) DO NOTHING;

-- 3. Demo Student User (password: siswa123456)
INSERT INTO public.users (
    id, email, password_hash, full_name, role, school_name, class_code, email_verified
) VALUES (
    '22222222-2222-2222-2222-222222222222',
    'siswa@informatika.sch.id',
    crypt('siswa123456', gen_salt('bf')),
    'Ahmad Fauzi',
    'siswa',
    'SMA Negeri 1 Informatika Digital',
    'X-RPL-1',
    TRUE
) ON CONFLICT (id) DO NOTHING;

-- 4. Classes
INSERT INTO public.classes (id, teacher_id, name, code, academic_year, description)
VALUES 
(
    '33333333-3333-3333-3333-333333333331',
    '11111111-1111-1111-1111-111111111111',
    'X RPL 1 (Rekayasa Perangkat Lunak)',
    'X-RPL-1',
    '2026/2027',
    'Kelas Kejuruan Informatika Dasar & Rekayasa Perangkat Lunak'
),
(
    '33333333-3333-3333-3333-333333333332',
    '11111111-1111-1111-1111-111111111111',
    'X TKJ 1 (Teknik Komputer & Jaringan)',
    'X-TKJ-1',
    '2026/2027',
    'Kelas Kejuruan Sistem Komputer & Jaringan Komputer'
) ON CONFLICT (code) DO NOTHING;

-- 5. Class Members
INSERT INTO public.class_members (class_id, student_id)
VALUES ('33333333-3333-3333-3333-333333333331', '22222222-2222-2222-2222-222222222222')
ON CONFLICT (class_id, student_id) DO NOTHING;

-- 6. Learning Materials (9 Topik Informatika Lengkap)
INSERT INTO public.learning_materials (
    id, teacher_id, title, slug, category, difficulty, reading_time_minutes, description, content, status, order_index
) VALUES
(
    '44444444-4444-4444-4444-444444444401',
    '11111111-1111-1111-1111-111111111111',
    'Pengantar Informatika Modern & Etika Digital',
    'pengantar-informatika-modern',
    'Dasar-Dasar Informatika',
    'Pemula',
    8,
    'Mengenal pilar informatika, literasi digital, hak cipta software, dan netiket di dunia cyber.',
    '# Pengantar Informatika Modern & Etika Digital

Informatika adalah ilmu komputasi yang mencakup perangkat keras, perangkat lunak, data, dan dampaknya bagi masyarakat.

## Pilar-Pilar Utama Informatika
1. Berpikir Komputasional (BK)
2. Teknologi Informasi & Komunikasi (TIK)
3. Sistem Komputer (SK)
4. Jaringan Komputer & Internet (JKI)
5. Analisis Data (AD)
6. Algoritma & Pemrograman (AP)
7. Dampak Sosial Informatika (DSI)

## Netiket & Etika Digital
- Menghormati privasi data pribadi.
- Verifikasi informasi sebelum disebarkan (anti-hoaks).
- Menghargai hak cipta dan lisensi perangkat lunak.',
    'published',
    1
),
(
    '44444444-4444-4444-4444-444444444402',
    '11111111-1111-1111-1111-111111111111',
    '4 Pilar Berpikir Komputasional dalam Pemecahan Masalah',
    '4-pilar-berpikir-komputasional',
    'Berpikir Komputasional',
    'Pemula',
    10,
    'Pelajari Dekomposisi, Pengenalan Pola, Abstraksi, dan Perancangan Algoritma untuk memecahkan persoalan rumit.',
    '# 4 Pilar Berpikir Komputasional

Metode berpikir sistematis yang digunakan oleh ilmuwan komputer untuk memecahkan masalah kompleks.

## 1. Dekomposisi
Memecah masalah besar menjadi sub-masalah kecil yang mandiri.

## 2. Pengenalan Pola
Menemukan keteraturan atau kesamaan dari pengalaman problem solving sebelumnya.

## 3. Abstraksi
Menyaring informasi esensial dan mengabaikan detail-detail yang tidak relevan.

## 4. Perancangan Algoritma
Menyusun langkah instruksi logis dan berurutan untuk menghasilkan solusi.',
    'published',
    2
),
(
    '44444444-4444-4444-4444-444444444403',
    '11111111-1111-1111-1111-111111111111',
    'Algoritma Percabangan, Perulangan & Struktur Data',
    'algoritma-percabangan-perulangan',
    'Algoritma dan Pemrograman',
    'Menengah',
    12,
    'Kuasai struktur kontrol if-else, looping for/while, serta struktur data array dan stack.',
    '# Algoritma Percabangan, Perulangan & Struktur Data

Struktur kontrol merupakan fondasi penulisan kode program.

## 1. Percabangan (Branching)
Mengevaluasi ekspresi boolean untuk menentukan alur eksekusi.

## 2. Perulangan (Looping)
Mengeksekusi blok kode berulang kali (for, while, do-while).

## 3. Struktur Data
- Array: Koleksi data sejenis dengan indeks numerik.
- Stack: Prinsip LIFO (Last In First Out).
- Queue: Prinsip FIFO (First In First Out).',
    'published',
    3
),
(
    '44444444-4444-4444-4444-444444444404',
    '11111111-1111-1111-1111-111111111111',
    'Arsitektur Komputer & Siklus Fetch-Decode-Execute',
    'arsitektur-komputer-siklus-instruksi',
    'Sistem Komputer',
    'Menengah',
    10,
    'Memahami arsitektur Von Neumann, komponen CPU (ALU, CU, Register), dan hierarki memori.',
    '# Arsitektur Komputer & Siklus Fetch-Decode-Execute

Model Von Neumann mendasari hampir seluruh komputer modern.

## Komponen Utama CPU
- Control Unit (CU): Mengatur sinyal kontrol instruksi.
- Arithmetic Logic Unit (ALU): Operasi aritmatika & logika.
- Registers: Memori register berkecepatan paling tinggi di dalam prosesor.

## Siklus Instruksi Mesin
1. Fetch (ambil instruksi dari RAM)
2. Decode (terjemahkan instruksi biner)
3. Execute (eksekusi perhitungan/gerakan data)',
    'published',
    4
),
(
    '44444444-4444-4444-4444-444444444405',
    '11111111-1111-1111-1111-111111111111',
    'Protokol Jaringan Internet & Model 7 Lapisan OSI',
    'protokol-jaringan-model-osi',
    'Jaringan Komputer dan Internet',
    'Menengah',
    12,
    'Pelajari cara kerja komunikasi data melalui model OSI 7 layer, protokol TCP/IP, dan sistem DNS.',
    '# Protokol Jaringan Internet & Model 7 Lapisan OSI

## 7 Lapisan OSI
1. Physical
2. Data Link
3. Network (Routing IP)
4. Transport (TCP / UDP)
5. Session
6. Presentation (Enkripsi / Format Data)
7. Application (HTTP, HTTPS, DNS, FTP)

## TCP vs UDP
TCP berorientasi koneksi dan andal (reliable), sedangkan UDP cepat dan berlatensi rendah tanpa verifikasi urutan paket.',
    'published',
    5
),
(
    '44444444-4444-4444-4444-444444444406',
    '11111111-1111-1111-1111-111111111111',
    'Desain Relasional Basis Data & Query SQL Fundamental',
    'desain-relasional-database-sql',
    'Basis Data',
    'Menengah',
    11,
    'Kuasai Primary Key, Foreign Key, normalisasi data, serta perintah DDL dan DML.',
    '# Desain Relasional Basis Data & Query SQL Fundamental

Basis data relasional menyimpan informasi dalam bentuk tabel berelasi.

## Kunci Utama Relasi
- Primary Key (PK): Pengenal unik suatu record baris, NOT NULL.
- Foreign Key (FK): Kolom referensi ke Primary Key tabel relasi.

## Perintah SQL Populer
- SELECT kolom FROM tabel WHERE kondisi ORDER BY kolom DESC;
- INSERT INTO tabel (kolom) VALUES (nilai);
- UPDATE tabel SET kolom = nilai WHERE kondisi;
- DELETE FROM tabel WHERE kondisi;',
    'published',
    6
),
(
    '44444444-4444-4444-4444-444444444407',
    '11111111-1111-1111-1111-111111111111',
    'Keamanan Digital: Kriptografi & Perlindungan Siber',
    'keamanan-digital-kriptografi',
    'Keamanan Digital',
    'Mahir',
    10,
    'Fondasi CIA Triad, enkripsi simetris (AES) vs asimetris (RSA), dan perlindungan dari phishing.',
    '# Keamanan Digital: Kriptografi & Perlindungan Siber

## CIA Triad
- Confidentiality: Menjaga kerahasiaan data dari pihak tidak berwenang.
- Integrity: Menjamin data tidak dimanipulasi atau diubah di jalan.
- Availability: Memastikan layanan data selalu siap diakses saat dibutuhkan.

## Kriptografi
- Enkripsi Simetris: Satu kunci rahasia yang sama untuk enkripsi dan dekripsi (AES-256).
- Enkripsi Asimetris: Menggunakan pasangan Public Key & Private Key (RSA, TLS/SSL).',
    'published',
    7
),
(
    '44444444-4444-4444-4444-444444444408',
    '11111111-1111-1111-1111-111111111111',
    'Analisis Data: Statistik Deskriptif & Visualisasi',
    'analisis-data-visualisasi',
    'Analisis Data',
    'Menengah',
    9,
    'Siklus pengolahan data mentah, pembersihan data hilang, ukuran tendensi sentral, dan visualisasi grafik.',
    '# Analisis Data: Statistik Deskriptif & Visualisasi

## Siklus Analisis Data
1. Data Collection
2. Data Cleaning
3. Exploratory Data Analysis (EDA)
4. Data Visualization

## Tendensi Sentral
- Mean: Nilai rata-rata dari seluruh data.
- Median: Nilai tengah data yang telah diurutkan.
- Modus: Nilai yang paling sering muncul.',
    'published',
    8
),
(
    '44444444-4444-4444-4444-444444444409',
    '11111111-1111-1111-1111-111111111111',
    'Pengantar Kecerdasan Buatan & Machine Learning',
    'pengantar-kecerdasan-buatan-machine-learning',
    'Kecerdasan Buatan',
    'Mahir',
    11,
    'Memahami perbedaan AI, Machine Learning, Deep Learning, serta tipe pembelajaran Supervised dan Unsupervised.',
    '# Pengantar Kecerdasan Buatan & Machine Learning

Kecerdasan Buatan (AI) memungkinkan komputer meniru proses kognitif manusia.

## Paradigma Machine Learning
1. Supervised Learning: Belajar dari data berlabel input-target (contoh: deteksi spam).
2. Unsupervised Learning: Menemukan pola alami tersembunyi tanpa label (contoh: segmentasi pelanggan).
3. Reinforcement Learning: Belajar melalui reward dan penalty interaksi lingkungan.',
    'published',
    9
) ON CONFLICT (id) DO NOTHING;

-- 7. Quizzes
INSERT INTO public.quizzes (
    id, teacher_id, material_id, title, description, category, time_limit_minutes, passing_grade, status
) VALUES (
    '55555555-5555-5555-5555-555555555501',
    '11111111-1111-1111-1111-111111111111',
    '44444444-4444-4444-4444-444444444402',
    'Kuis Evaluasi 1: Berpikir Komputasional & Algoritma',
    'Kuis evaluasi pemahaman 4 pilar computational thinking, alur logika algoritma, dan struktur data linear.',
    'Berpikir Komputasional',
    15,
    75,
    'published'
) ON CONFLICT (id) DO NOTHING;

-- 8. Questions for Quiz 1
INSERT INTO public.quiz_questions (
    id, quiz_id, question_text, question_type, points, order_index, correct_answer_text, explanation
) VALUES
(
    '66666666-6666-6666-6666-666666666601',
    '55555555-5555-5555-5555-555555555501',
    'Dalam 4 pilar berpikir komputasional, teknik memecah masalah besar menjadi bagian-bagian yang lebih kecil disebut...',
    'multiple_choice',
    25,
    1,
    NULL,
    'Dekomposisi adalah proses memecah persoalan kompleks menjadi sub-persoalan yang lebih mudah dikelola.'
),
(
    '66666666-6666-6666-6666-666666666602',
    '55555555-5555-5555-5555-555555555501',
    'Fokus pada informasi utama yang penting dan mengabaikan detail-detail yang tidak relevan merupakan definisi dari Abstraksi.',
    'true_false',
    25,
    2,
    NULL,
    'Benar. Abstraksi menyaring detail tidak penting agar solusi berfokus pada inti persoalan.'
),
(
    '66666666-6666-6666-6666-666666666603',
    '55555555-5555-5555-5555-555555555501',
    'Struktur data linear yang mengadopsi prinsip LIFO (Last In First Out) disebut...',
    'multiple_choice',
    25,
    3,
    NULL,
    'Stack (tumpukan) menerapkan prinsip LIFO, di mana data terakhir masuk adalah yang pertama keluar.'
),
(
    '66666666-6666-6666-6666-666666666604',
    '55555555-5555-5555-5555-555555555501',
    'Tuliskan nama algoritma pencarian elemen terurut yang bekerja dengan membagi dua ruang pencarian secara berulang (dalam bahasa Inggris):',
    'short_answer',
    25,
    4,
    'Binary Search, Binary Search Algorithm',
    'Binary Search membagi dua ruang pencarian berulang kali dengan kompleksitas waktu O(log n).'
) ON CONFLICT (id) DO NOTHING;

-- 9. Options for Questions
INSERT INTO public.quiz_options (question_id, option_key, option_text, is_correct, order_index)
VALUES
('66666666-6666-6666-6666-666666666601', 'A', 'Abstraksi', false, 1),
('66666666-6666-6666-6666-666666666601', 'B', 'Dekomposisi', true, 2),
('66666666-6666-6666-6666-666666666601', 'C', 'Pengenalan Pola', false, 3),
('66666666-6666-6666-6666-666666666601', 'D', 'Perancangan Algoritma', false, 4),

('66666666-6666-6666-6666-666666666602', 'true', 'Benar', true, 1),
('66666666-6666-6666-6666-666666666602', 'false', 'Salah', false, 2),

('66666666-6666-6666-6666-666666666603', 'A', 'Queue', false, 1),
('66666666-6666-6666-6666-666666666603', 'B', 'Array', false, 2),
('66666666-6666-6666-6666-666666666603', 'C', 'Stack', true, 3),
('66666666-6666-6666-6666-666666666603', 'D', 'Linked List', false, 4);