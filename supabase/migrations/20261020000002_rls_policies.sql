-- ==============================================================================
-- 02_SECURITY_RLS.SQL
-- Kebijakan Row Level Security (RLS) Supabase PostgreSQL
-- ==============================================================================

-- 1. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
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

-- 2. PROFILES POLICIES
CREATE POLICY "Profiles can be viewed by authenticated users"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- 3. CLASSES POLICIES
CREATE POLICY "Classes can be read by all authenticated users"
    ON public.classes FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Teachers can insert and manage their classes"
    ON public.classes FOR ALL
    TO authenticated
    USING (auth.uid() = teacher_id);

-- 4. LEARNING MATERIALS POLICIES
CREATE POLICY "Students can view published materials"
    ON public.learning_materials FOR SELECT
    TO authenticated
    USING (status = 'published' OR auth.uid() = teacher_id);

CREATE POLICY "Teachers can insert and manage their own materials"
    ON public.learning_materials FOR ALL
    TO authenticated
    USING (auth.uid() = teacher_id)
    WITH CHECK (auth.uid() = teacher_id);

-- 5. MATERIAL PROGRESS POLICIES
CREATE POLICY "Students can view and manage their own progress"
    ON public.material_progress FOR ALL
    TO authenticated
    USING (auth.uid() = student_id)
    WITH CHECK (auth.uid() = student_id);

-- 6. QUIZZES POLICIES
CREATE POLICY "Students can view published quizzes"
    ON public.quizzes FOR SELECT
    TO authenticated
    USING (status = 'published' OR auth.uid() = teacher_id);

CREATE POLICY "Teachers can manage their own quizzes"
    ON public.quizzes FOR ALL
    TO authenticated
    USING (auth.uid() = teacher_id)
    WITH CHECK (auth.uid() = teacher_id);

-- 7. QUIZ QUESTIONS & OPTIONS POLICIES
CREATE POLICY "Questions can be viewed for active quizzes"
    ON public.quiz_questions FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.quizzes q
            WHERE q.id = quiz_questions.quiz_id
            AND (q.status = 'published' OR q.teacher_id = auth.uid())
        )
    );

CREATE POLICY "Teachers can manage questions for their quizzes"
    ON public.quiz_questions FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.quizzes q
            WHERE q.id = quiz_questions.quiz_id
            AND q.teacher_id = auth.uid()
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
            AND (q.status = 'published' OR q.teacher_id = auth.uid())
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
            AND q.teacher_id = auth.uid()
        )
    );

-- 8. QUIZ ATTEMPTS & ANSWERS POLICIES
CREATE POLICY "Students can view their own attempts"
    ON public.quiz_attempts FOR SELECT
    TO authenticated
    USING (
        auth.uid() = student_id
        OR EXISTS (
            SELECT 1 FROM public.quizzes q
            WHERE q.id = quiz_attempts.quiz_id
            AND q.teacher_id = auth.uid()
        )
    );

CREATE POLICY "Students can insert their attempts"
    ON public.quiz_attempts FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Answers can be viewed by student owner or quiz teacher"
    ON public.quiz_answers FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.quiz_attempts qa
            LEFT JOIN public.quizzes q ON q.id = qa.quiz_id
            WHERE qa.id = quiz_answers.attempt_id
            AND (qa.student_id = auth.uid() OR q.teacher_id = auth.uid())
        )
    );

CREATE POLICY "Answers can be inserted by student owner"
    ON public.quiz_answers FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.quiz_attempts qa
            WHERE qa.id = quiz_answers.attempt_id
            AND qa.student_id = auth.uid()
        )
    );
