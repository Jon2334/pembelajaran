# Neon PostgreSQL Setup Guide for EduInformatika

## Overview
Database menggunakan **Neon PostgreSQL** (serverless Postgres) sebagai database utama.

---

## 1. Buat Project Neon

1. Daftar/login di [console.neon.tech](https://console.neon.tech)
2. Klik **Create Project**
3. Isi:
   - Project name: `eduinformatika`
   - Database name: `eduinformatika`
   - Region: Pilih terdekat (Singapore/Jakarta untuk latency terendah)
4. Klik **Create Project**

---

## 2. Dapatkan Connection String

Di dashboard Neon project:
1. Pilih branch `main`
2. Klik **Connect** → **Connection String**
3. Copy connection string (format):
   ```
   postgresql://user:***@ep-xxx.neon.tech/eduinformatika?sslmode=require
   ```

---

## 3. Konfigurasi Environment Variables

```bash
# Copy template
cp .env.example .env

# Edit .env dengan editor
# Isi variabel berikut:
```

```env
# Neon PostgreSQL (Primary Database)
EXPO_PUBLIC_NEON_DATABASE_URL=postgresql://user:***@ep-xxx.neon.tech/eduinformatika?sslmode=require
EXPO_PUBLIC_NEON_PROJECT_ID=your-neon-project-id
EXPO_PUBLIC_TEACHER_INVITE_CODE=GURU-INFORMATIKA-2026
```

---

## 4. Jalankan Migrasi Database

### Opsi A: Via Neon SQL Editor (Recommended)

1. Buka Neon Console → **SQL Editor**
2. Jalankan 3 file migrasi **berurutan**:

```sql
-- 1. Schema Utama
\i neon/migrations/01_initial_schema.sql

-- 2. Row Level Security Policies
\i neon/migrations/02_rls_policies.sql

-- 3. Stored Procedures / RPC Functions
\i neon/migrations/03_rpc_functions.sql
```

3. Jalankan seed data:
```sql
\i neon/seed.sql
```

### Opsi B: Via CLI (psql)

```bash
# Install psql (jika belum)
# Ubuntu/Debian: sudo apt install postgresql-client
# macOS: brew install postgresql
# Windows: Download dari postgresql.org

# Jalankan migrasi
psql "$EXPO_PUBLIC_NEON_DATABASE_URL" -f neon/migrations/01_initial_schema.sql
psql "$EXPO_PUBLIC_NEON_DATABASE_URL" -f neon/migrations/02_rls_policies.sql
psql "$EXPO_PUBLIC_NEON_DATABASE_URL" -f neon/migrations/03_rpc_functions.sql

# Jalankan seed
psql "$EXPO_PUBLIC_NEON_DATABASE_URL" -f neon/seed.sql
```

---

## 5. Verifikasi Migrasi

Di Neon SQL Editor, jalankan:

```sql
-- Cek tabel
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Cek data demo
SELECT id, email, role, full_name FROM public.users;
SELECT code, is_used FROM public.teacher_invitations;
SELECT title, category FROM public.learning_materials WHERE status = 'published';
SELECT title FROM public.quizzes WHERE status = 'published';
```

Harus muncul:
- 12 tabel
- 2 user demo (guru + siswa)
- 1 kode undangan guru
- 9 materi pembelajaran
- 1 kuis dengan 4 soal

---

## 6. Akun Demo

Setelah seed berhasil:

| Role | Email | Password |
|------|-------|----------|
| **Guru** | `guru@informatika.sch.id` | `guru123456` |
| **Siswa** | `siswa@informatika.sch.id` | `siswa123456` |

**Kode Undangan Guru**: `GURU-INFORMATIKA-2026`

---

## 7. Testing Aplikasi

```bash
# Install dependencies (sudah dilakukan)
npm install

# Jalankan development server
npm run start
# atau
npx expo start
```

Pilih platform:
- **Web**: Tekan `w` di terminal atau scan QR di browser
- **Android**: Tekan `a` (butuh Android Studio/device)
- **iOS**: Tekan `i` (butuh macOS + Xcode)

---

## 8. Arsitektur Database

```
┌─────────────────────────────────────────────────────┐
│                   App Startup                        │
└─────────────────────┬───────────────────────────────┘
                      ▼
         ┌────────────────────────┐
         │ isNeonConfigured?      │
         └───────────┬────────────┘
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
    YES (Neon)              NO (LocalStorage)
         │                       │
         ▼                       ▼
┌──────────────────┐    ┌──────────────────┐
│ @neondatabase/   │    │ LocalStorage     │
│ serverless       │    │ (Offline/Demo)   │
│ - Auth via RPC   │    │ - Demo accounts  │
│ - RLS via SQL    │    │ - Persistent     │
│ - Serverless     │    │                  │
└──────────────────┘    └──────────────────┘
         │                       │
         └───────────┬───────────┘
                     ▼
         ┌────────────────────────┐
         │ Fallback: LocalStorage │
         │ (Offline/Demo mode)    │
         └────────────────────────┘
```

**Prioritas**: Neon → LocalStorage

---

## 9. RPC Functions (Neon)

Semua operasi kritis menggunakan **Stored Procedures** di server:

| Function | Deskripsi |
|----------|-----------|
| `login_user(email, password)` | Autentikasi + generate session token |
| `register_student(email, password, full_name, class_code)` | Registrasi siswa + validasi kode kelas |
| `register_teacher(email, password, full_name, school_name, invite_code)` | Registrasi guru + validasi kode undangan |
| `validate_session(token)` | Validasi token session |
| `logout_user(token)` | Hapus session (server-side) |
| `submit_and_grade_quiz(p_attempt_id)` | **Penilaian otomatis di server** (secure) |
| `get_quiz_statistics(p_quiz_id)` | Statistik kuis untuk guru |
| `get_student_quiz_history(p_student_id)` | Riwayat kuis siswa |
| `create_teacher_invitation(code, email)` | Buat kode undangan guru |

---

## 10. Troubleshooting

### Error: "Neon database URL not configured"
```bash
# Pastikan .env ada dan variabel diisi
cat .env | grep NEON
```

### Error: "connection terminated unexpectedly"
- Neon free tier menutup koneksi idle setelah 5 menit
- `neonConfig.poolQueryViaFetch = true` sudah dikonfigurasi di `src/lib/neon.ts`
- Untuk production, upgrade ke Neon Pro untuk persistent connections

### Error: "function login_user does not exist"
- Jalankan migrasi `03_rpc_functions.sql` di SQL Editor
- Pastikan ekstensi `pgcrypto` terinstall: `CREATE EXTENSION IF NOT EXISTS pgcrypto;`

### Login gagal tapi password benar
- Cek case-sensitivity email (Neon: lowercase di RPC)
- Cek `password_hash` di tabel `users` menggunakan `crypt()`

---

## 11. Production Considerations

| Aspek | Rekomendasi |
|-------|-------------|
| **Connection Pooling** | Neon built-in pooler (aktifkan di Settings) |
| **Read Replicas** | Gunakan Neon read replicas untuk query berat |
| **Branching** | Gunakan Neon branches untuk staging/development |
| **Point-in-Time Recovery** | Enable di Neon Pro untuk backup otomatis |
| **Monitoring** | Integrasikan Neon metrics dengan Datadog/Grafana |
| **SSL** | Selalu gunakan `sslmode=require` di connection string |

---

## 12. File Penting

| File | Deskripsi |
|------|-----------|
| `neon/migrations/01_initial_schema.sql` | DDL: tabel, index, constraints |
| `neon/migrations/02_rls_policies.sql` | Row Level Security policies |
| `neon/migrations/03_rpc_functions.sql` | Stored procedures (auth, grading, stats) |
| `neon/seed.sql` | Data demo (user, materi, kuis, soal) |
| `src/lib/neon.ts` | Neon client + typed query helpers |
| `src/lib/config.ts` | Konfigurasi env variables |
| `src/features/auth/AuthContext.tsx` | Auth logic Neon + LocalStorage |

---

## 13. Quick Commands

```bash
# Typecheck
npm run typecheck

# Lint
npm run lint

# Expo Doctor (cek kompatibilitas)
npx expo-doctor

# Build APK Preview (EAS)
npx eas-cli build --platform android --profile preview

# Reset local storage (debug)
# Di Chrome DevTools Console:
# await AsyncStorage.clear()
```