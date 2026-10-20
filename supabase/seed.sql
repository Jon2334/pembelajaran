-- ==============================================================================
-- SEED.SQL - Data Awal Aplikasi EduInformatika
-- ==============================================================================

-- 1. Teacher Invitation Code
INSERT INTO public.teacher_invitations (id, code, is_used)
VALUES ('00000000-0000-0000-0000-000000000001', 'GURU-INFORMATIKA-2026', false)
ON CONFLICT (code) DO NOTHING;

-- 2. Demo Teacher Profile (Note: auth.users entry must exist in Supabase auth)
-- For demonstration and local development:
INSERT INTO public.profiles (
    id, email, full_name, role, school_name, created_at, updated_at
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'guru@informatika.sch.id',
    'Budi Santoso, M.Kom.',
    'guru',
    'SMA Negeri 1 Informatika Digital',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 3. Demo Student Profile
INSERT INTO public.profiles (
    id, email, full_name, role, school_name, class_code, created_at, updated_at
) VALUES (
    '22222222-2222-2222-2222-222222222222',
    'siswa@informatika.sch.id',
    'Ahmad Fauzi',
    'siswa',
    'SMA Negeri 1 Informatika Digital',
    'X-RPL-1',
    NOW(),
    NOW()
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

-- 5. Learning Materials (9 Topik Informatika Lengkap)
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
    '# Pengantar Informatika Modern & Etika Digital\n\nInformatika adalah ilmu komputasi yang mencakup perangkat keras, perangkat lunak, data, dan dampaknya bagi masyarakat.\n\n## Pilar-Pilar Utama Informatika\n1. Berpikir Komputasional (BK)\n2. Teknologi Informasi & Komunikasi (TIK)\n3. Sistem Komputer (SK)\n4. Jaringan Komputer & Internet (JKI)\n5. Analisis Data (AD)\n6. Algoritma & Pemrograman (AP)\n7. Dampak Sosial Informatika (DSI)\n\n## Netiket & Etika Digital\n- Menghormati privasi data pribadi.\n- Verifikasi informasi sebelum disebarkan (anti-hoaks).\n- Menghargai hak cipta dan lisensi perangkat lunak.',
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
    '# 4 Pilar Berpikir Komputasional\n\nMetode berpikir sistematis yang digunakan oleh ilmuwan komputer untuk memecahkan masalah kompleks.\n\n## 1. Dekomposisi\nMemecah masalah besar menjadi sub-masalah kecil yang mandiri.\n\n## 2. Pengenalan Pola\nMenemukan keteraturan atau kesamaan dari pengalaman problem solving sebelumnya.\n\n## 3. Abstraksi\nMenyaring informasi esensial dan mengabaikan detail-detail yang tidak relevan.\n\n## 4. Perancangan Algoritma\nMenyusun langkah instruksi logis dan berurutan untuk menghasilkan solusi.',
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
    '# Algoritma Percabangan, Perulangan & Struktur Data\n\nStruktur kontrol merupakan fondasi penulisan kode program.\n\n## 1. Percabangan (Branching)\nMengevaluasi ekspresi boolean untuk menentukan alur eksekusi.\n\n## 2. Perulangan (Looping)\nMengeksekusi blok kode berulang kali (for, while, do-while).\n\n## 3. Struktur Data\n- Array: Koleksi data sejenis dengan indeks numerik.\n- Stack: Prinsip LIFO (Last In First Out).\n- Queue: Prinsip FIFO (First In First Out).',
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
    '# Arsitektur Komputer & Siklus Fetch-Decode-Execute\n\nModel Von Neumann mendasari hampir seluruh komputer modern.\n\n## Komponen Utama CPU\n- Control Unit (CU): Mengatur sinyal kontrol instruksi.\n- Arithmetic Logic Unit (ALU): Operasi aritmatika & logika.\n- Registers: Memori register berkecepatan paling tinggi di dalam prosesor.\n\n## Siklus Instruksi Mesin\n1. Fetch (ambil instruksi dari RAM)\n2. Decode (terjemahkan instruksi biner)\n3. Execute (eksekusi perhitungan/gerakan data)',
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
    '# Protokol Jaringan Internet & Model 7 Lapisan OSI\n\n## 7 Lapisan OSI\n1. Physical\n2. Data Link\n3. Network (Routing IP)\n4. Transport (TCP / UDP)\n5. Session\n6. Presentation (Enkripsi / Format Data)\n7. Application (HTTP, HTTPS, DNS, FTP)\n\n## TCP vs UDP\nTCP berorientasi koneksi dan andal (reliable), sedangkan UDP cepat dan berlatensi rendah tanpa verifikasi urutan paket.',
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
    '# Desain Relasional Basis Data & Query SQL Fundamental\n\nBasis data relasional menyimpan informasi dalam bentuk tabel berelasi.\n\n## Kunci Utama Relasi\n- Primary Key (PK): Pengenal unik suatu record baris, NOT NULL.\n- Foreign Key (FK): Kolom referensi ke Primary Key tabel relasi.\n\n## Perintah SQL Populer\n- SELECT kolom FROM tabel WHERE kondisi ORDER BY kolom DESC;\n- INSERT INTO tabel (kolom) VALUES (nilai);\n- UPDATE tabel SET kolom = nilai WHERE kondisi;\n- DELETE FROM tabel WHERE kondisi;',
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
    '# Keamanan Digital: Kriptografi & Perlindungan Siber\n\n## CIA Triad\n- Confidentiality: Menjaga kerahasiaan data dari pihak tidak berwenang.\n- Integrity: Menjamin data tidak dimanipulasi atau diubah di jalan.\n- Availability: Memastikan layanan data selalu siap diakses saat dibutuhkan.\n\n## Kriptografi\n- Enkripsi Simetris: Satu kunci rahasia yang sama untuk enkripsi dan dekripsi (AES-256).\n- Enkripsi Asimetris: Menggunakan pasangan Public Key & Private Key (RSA, TLS/SSL).',
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
    '# Analisis Data: Statistik Deskriptif & Visualisasi\n\n## Siklus Analisis Data\n1. Data Collection\n2. Data Cleaning\n3. Exploratory Data Analysis (EDA)\n4. Data Visualization\n\n## Tendensi Sentral\n- Mean: Nilai rata-rata dari seluruh data.\n- Median: Nilai tengah data yang telah diurutkan.\n- Modus: Nilai yang paling sering muncul.',
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
    '# Pengantar Kecerdasan Buatan & Machine Learning\n\nKecerdasan Buatan (AI) memungkinkan komputer meniru proses kognitif manusia.\n\n## Paradigma Machine Learning\n1. Supervised Learning: Belajar dari data berlabel input-target (contoh: deteksi spam).\n2. Unsupervised Learning: Menemukan pola alami tersembunyi tanpa label (contoh: segmentasi pelanggan).\n3. Reinforcement Learning: Belajar melalui reward dan penalty interaksi lingkungan.',
    'published',
    9
) ON CONFLICT (id) DO NOTHING;

-- 6. Quizzes
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

-- 7. Questions for Quiz 1
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
    '55555555-5555-5555-5555-555555555502',
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

-- 8. Options for Questions
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
