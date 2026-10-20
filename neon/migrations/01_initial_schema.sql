-- ==============================================================================
-- 01_INITIAL_SCHEMA.SQL
-- Skema Database Relasional Pembelajaran Informatika (Neon PostgreSQL)
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUM TYPES
CREATE TYPE user_role AS ENUM ('guru', 'siswa', 'admin');
CREATE TYPE difficulty_level AS ENUM ('Pemula', 'Menengah', 'Mahir');
CREATE TYPE publish_status AS ENUM ('draft', 'published');
CREATE TYPE question_type AS ENUM ('multiple_choice', 'true_false', 'short_answer');

-- 2. USERS TABLE (replaces auth.users + profiles)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL, -- bcrypt hash
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'siswa',
    avatar_url TEXT,
    school_name TEXT,
    class_code TEXT,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_class_code ON public.users(class_code);
CREATE INDEX idx_users_email ON public.users(email);

-- 3. CLASSES TABLE (Kelas Pembelajaran)
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    academic_year TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_classes_teacher ON public.classes(teacher_id);
CREATE INDEX idx_classes_code ON public.classes(code);

-- 4. CLASS MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.class_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(class_id, student_id)
);

-- 5. TEACHER INVITATIONS TABLE (Untuk pendaftaran akun guru yang aman)
CREATE TABLE IF NOT EXISTS public.teacher_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    email TEXT,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    used_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days')
);

-- 6. LEARNING MATERIALS TABLE (Materi Pembelajaran 9 Topik Informatika)
CREATE TABLE IF NOT EXISTS public.learning_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'Dasar-Dasar Informatika',
        'Berpikir Komputasional',
        'Algoritma dan Pemrograman',
        'Sistem Komputer',
        'Jaringan Komputer dan Internet',
        'Basis Data',
        'Keamanan Digital',
        'Analisis Data',
        'Kecerdasan Buatan'
    )),
    difficulty difficulty_level NOT NULL DEFAULT 'Pemula',
    reading_time_minutes INT NOT NULL DEFAULT 10 CHECK (reading_time_minutes > 0),
    description TEXT NOT NULL,
    content TEXT NOT NULL,
    cover_image_url TEXT,
    attachment_url TEXT,
    attachment_name TEXT,
    status publish_status NOT NULL DEFAULT 'draft',
    order_index INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_materials_category ON public.learning_materials(category);
CREATE INDEX idx_materials_status ON public.learning_materials(status);
CREATE INDEX idx_materials_teacher ON public.learning_materials(teacher_id);

-- 7. MATERIAL PROGRESS TABLE (Pelacakan progres baca siswa)
CREATE TABLE IF NOT EXISTS public.material_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES public.learning_materials(id) ON DELETE CASCADE,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, material_id)
);

-- 8. QUIZZES TABLE (Paket Kuis)
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    material_id UUID REFERENCES public.learning_materials(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    time_limit_minutes INT NOT NULL DEFAULT 15 CHECK (time_limit_minutes > 0),
    passing_grade INT NOT NULL DEFAULT 75 CHECK (passing_grade >= 0 AND passing_grade <= 100),
    randomize_questions BOOLEAN NOT NULL DEFAULT FALSE,
    randomize_options BOOLEAN NOT NULL DEFAULT FALSE,
    status publish_status NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quizzes_teacher ON public.quizzes(teacher_id);
CREATE INDEX idx_quizzes_category ON public.quizzes(category);
CREATE INDEX idx_quizzes_status ON public.quizzes(status);

-- 9. QUIZ QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type question_type NOT NULL DEFAULT 'multiple_choice',
    points INT NOT NULL DEFAULT 20 CHECK (points > 0),
    order_index INT NOT NULL DEFAULT 1,
    correct_answer_text TEXT, -- Untuk isian singkat
    explanation TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_questions_quiz ON public.quiz_questions(quiz_id);

-- 10. QUIZ OPTIONS TABLE (Pilihan Ganda & Benar/Salah)
CREATE TABLE IF NOT EXISTS public.quiz_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
    option_key TEXT NOT NULL, -- 'A', 'B', 'C', 'D' atau 'true', 'false'
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    order_index INT NOT NULL DEFAULT 1
);

CREATE INDEX idx_options_question ON public.quiz_options(question_id);

-- 11. QUIZ ATTEMPTS TABLE (Hasil pengerjaan kuis siswa)
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    score INT NOT NULL CHECK (score >= 0 AND score <= 100),
    earned_points INT NOT NULL DEFAULT 0,
    total_points INT NOT NULL DEFAULT 100,
    is_passed BOOLEAN NOT NULL DEFAULT FALSE,
    duration_seconds INT NOT NULL DEFAULT 0,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_attempts_quiz ON public.quiz_attempts(quiz_id);
CREATE INDEX idx_attempts_student ON public.quiz_attempts(student_id);

-- 12. QUIZ ANSWERS TABLE (Detail jawaban tiap butir soal)
CREATE TABLE IF NOT EXISTS public.quiz_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
    selected_option_id UUID REFERENCES public.quiz_options(id) ON DELETE SET NULL,
    short_answer_text TEXT,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    points_earned INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_answers_attempt ON public.quiz_answers(attempt_id);

-- 13. SESSIONS TABLE (Untuk JWT token storage / session management)
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL, -- Hash dari refresh token
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_user ON public.sessions(user_id);
CREATE INDEX idx_sessions_token ON public.sessions(token_hash);
CREATE INDEX idx_sessions_expires ON public.sessions(expires_at);