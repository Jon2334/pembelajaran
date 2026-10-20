-- ==============================================================================
-- 02_SECURITY_RLS.SQL
-- Kebijakan Row Level Security (RLS) Neon PostgreSQL
-- ==============================================================================

-- Create authenticated role if not exists (Supabase compatibility)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        CREATE ROLE authenticated NOLOGIN;
    END IF;
END $$;

-- Grant usage on schema to authenticated role
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- 1. Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user ID from session setting
-- In Neon, we'll use a session-based approach where the app passes user_id via SET LOCAL
CREATE OR REPLACE FUNCTION current_user_id() RETURNS UUID AS $$
    SELECT current_setting('app.current_user_id', true)::UUID;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 2. USERS POLICIES
CREATE POLICY "Users can view all profiles"
    ON public.users FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON public.users FOR UPDATE
    TO authenticated
    USING (id = current_user_id());

-- 3. CLASSES POLICIES
CREATE POLICY "Classes can be read by all authenticated users"
    ON public.classes FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Teachers can insert and manage their classes"
    ON public.classes FOR ALL
    TO authenticated
    USING (teacher_id = current_user_id())
    WITH CHECK (teacher_id = current_user_id());

-- 4. CLASS MEMBERS POLICIES
CREATE POLICY "Students can view their class memberships"
    ON public.class_members FOR SELECT
    TO authenticated
    USING (student_id = current_user_id());

CREATE POLICY "Teachers can view class members for their classes"
    ON public.class_members FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.classes c
            WHERE c.id = class_members.class_id
            AND c.teacher_id = current_user_id()
        )
    );

CREATE POLICY "Students can join classes"
    ON public.class_members FOR INSERT
    TO authenticated
    WITH CHECK (student_id = current_user_id());

-- 5. TEACHER INVITATIONS POLICIES
CREATE POLICY "Anyone can validate invitation codes"
    ON public.teacher_invitations FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "System can manage invitations"
    ON public.teacher_invitations FOR ALL
    TO authenticated
    USING (false) -- Only via service role
    WITH CHECK (false);

-- 6. LEARNING MATERIALS POLICIES
CREATE POLICY "Students can view published materials"
    ON public.learning_materials FOR SELECT
    TO authenticated
    USING (status = 'published' OR teacher_id = current_user_id());

CREATE POLICY "Teachers can insert and manage their own materials"
    ON public.learning_materials FOR ALL
    TO authenticated
    USING (teacher_id = current_user_id())
    WITH CHECK (teacher_id = current_user_id());

-- 7. MATERIAL PROGRESS POLICIES
CREATE POLICY "Students can view and manage their own progress"
    ON public.material_progress FOR ALL
    TO authenticated
    USING (student_id = current_user_id())
    WITH CHECK (student_id = current_user_id());

-- 8. QUIZZES POLICIES
CREATE POLICY "Students can view published quizzes"
    ON public.quizzes FOR SELECT
    TO authenticated
    USING (status = 'published' OR teacher_id = current_user_id());

CREATE POLICY "Teachers can manage their own quizzes"
    ON public.quizzes FOR ALL
    TO authenticated
    USING (teacher_id = current_user_id())
    WITH CHECK (teacher_id = current_user_id());

-- 9. QUIZ QUESTIONS & OPTIONS POLICIES
CREATE POLICY "Questions can be viewed for active quizzes"
    ON public.quiz_questions FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.quizzes q
            WHERE q.id = quiz_questions.quiz_id
            AND (q.status = 'published' OR q.teacher_id = current_user_id())
        )
    );

CREATE POLICY "Teachers can manage questions for their quizzes"
    ON public.quiz_questions FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.quizzes q
            WHERE q.id = quiz_questions.quiz_id
            AND q.teacher_id = current_user_id()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.quizzes q
            WHERE q.id = quiz_questions.quiz_id
            AND q.teacher_id = current_user_id()
        )
    );

CREATE POLICY "Options can be viewed for active questions"
    ON public.quiz_options FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.quiz_questions qq
            JOIN public.quizzes q ON q.id = qq.quiz_id
            WHERE qq.id = quiz_options.question_id
            AND (q.status = 'published' OR q.teacher_id = current_user_id())
        )
    );

CREATE POLICY "Teachers can manage options"
    ON public.quiz_options FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.quiz_questions qq
            JOIN public.quizzes q ON q.id = qq.quiz_id
            WHERE qq.id = quiz_options.question_id
            AND q.teacher_id = current_user_id()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.quiz_questions qq
            JOIN public.quizzes q ON q.id = qq.quiz_id
            WHERE qq.id = quiz_options.question_id
            AND q.teacher_id = current_user_id()
        )
    );

-- 10. QUIZ ATTEMPTS & ANSWERS POLICIES
CREATE POLICY "Students can view their own attempts"
    ON public.quiz_attempts FOR SELECT
    TO authenticated
    USING (
        student_id = current_user_id()
        OR EXISTS (
            SELECT 1 FROM public.quizzes q
            WHERE q.id = quiz_attempts.quiz_id
            AND q.teacher_id = current_user_id()
        )
    );

CREATE POLICY "Students can insert their attempts"
    ON public.quiz_attempts FOR INSERT
    TO authenticated
    WITH CHECK (student_id = current_user_id());

CREATE POLICY "Answers can be viewed by student owner or quiz teacher"
    ON public.quiz_answers FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.quiz_attempts qa
            LEFT JOIN public.quizzes q ON q.id = qa.quiz_id
            WHERE qa.id = quiz_answers.attempt_id
            AND (qa.student_id = current_user_id() OR q.teacher_id = current_user_id())
        )
    );

CREATE POLICY "Answers can be inserted by student owner"
    ON public.quiz_answers FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.quiz_attempts qa
            WHERE qa.id = quiz_answers.attempt_id
            AND qa.student_id = current_user_id()
        )
    );

-- 11. SESSIONS POLICIES
CREATE POLICY "Users can view their own sessions"
    ON public.sessions FOR SELECT
    TO authenticated
    USING (user_id = current_user_id());

CREATE POLICY "Users can manage their own sessions"
    ON public.sessions FOR ALL
    TO authenticated
    USING (user_id = current_user_id())
    WITH CHECK (user_id = current_user_id());