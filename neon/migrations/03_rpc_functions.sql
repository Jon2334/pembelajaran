-- ==============================================================================
-- 03_SECURE_RPC_GRADING.SQL
-- Stored Procedure / RPC untuk Penilaian Otomatis Kuis yang Aman di Sisi Server
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.submit_and_grade_quiz(
    p_quiz_id UUID,
    p_student_id UUID,
    p_answers JSONB, -- Array of { question_id, selected_option_id, short_answer_text }
    p_duration_seconds INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Berjalan dengan privilege sistem terpercaya
SET search_path = public
AS $$
DECLARE
    v_quiz RECORD;
    v_question RECORD;
    v_correct_opt_id UUID;
    v_student_ans JSONB;
    v_selected_opt_id UUID;
    v_short_text TEXT;
    v_is_correct BOOLEAN;
    v_total_points INT := 0;
    v_earned_points INT := 0;
    v_final_score INT := 0;
    v_is_passed BOOLEAN := FALSE;
    v_attempt_id UUID;
    v_points_earned INT;
BEGIN
    -- 1. Validasi keberadaan kuis
    SELECT * INTO v_quiz FROM public.quizzes WHERE id = p_quiz_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Kuis tidak ditemukan';
    END IF;

    -- 2. Buat ID Attempt baru
    v_attempt_id := gen_random_uuid();

    -- 3. Loop pertama: Hitung total points
    FOR v_question IN
        SELECT id, question_type, points, correct_answer_text
        FROM public.quiz_questions
        WHERE quiz_id = p_quiz_id
        ORDER BY order_index ASC
    LOOP
        v_total_points := v_total_points + COALESCE(v_question.points, 20);
    END LOOP;

    -- 4. Simpan hasil percobaan kuis DULU (sebelum answers untuk FK constraint)
    -- Score akan diupdate setelah evaluasi
    INSERT INTO public.quiz_attempts (
        id,
        quiz_id,
        student_id,
        score,
        earned_points,
        total_points,
        is_passed,
        duration_seconds,
        started_at,
        completed_at
    ) VALUES (
        v_attempt_id,
        p_quiz_id,
        p_student_id,
        0,  -- Temporary, will update after grading
        0,  -- Temporary, will update after grading
        v_total_points,
        FALSE,  -- Temporary, will update after grading
        p_duration_seconds,
        NOW() - (p_duration_seconds || ' seconds')::INTERVAL,
        NOW()
    );

    -- 5. Loop kedua: Evaluasi jawaban & simpan ke detail jawaban (SETelah attempt dibuat)
    FOR v_question IN
        SELECT id, question_type, points, correct_answer_text
        FROM public.quiz_questions
        WHERE quiz_id = p_quiz_id
        ORDER BY order_index ASC
    LOOP
        v_is_correct := FALSE;
        v_points_earned := 0;

        -- Cari jawaban siswa dari JSON parameter
        SELECT elem::jsonb INTO v_student_ans
        FROM jsonb_array_elements(p_answers) AS elem
        WHERE (elem->>'question_id')::UUID = v_question.id
        LIMIT 1;

        v_selected_opt_id := NULL;
        v_short_text := NULL;

        IF v_student_ans IS NOT NULL THEN
            IF v_student_ans ? 'selected_option_id' AND (v_student_ans->>'selected_option_id') IS NOT NULL THEN
                v_selected_opt_id := (v_student_ans->>'selected_option_id')::UUID;
            END IF;
            IF v_student_ans ? 'short_answer_text' AND (v_student_ans->>'short_answer_text') IS NOT NULL THEN
                v_short_text := TRIM(v_student_ans->>'short_answer_text');
            END IF;
        END IF;

        -- Evaluasi berdasarkan jenis soal
        IF v_question.question_type IN ('multiple_choice', 'true_false') THEN
            -- Ambil opsi jawaban yang benar dari tabel quiz_options
            SELECT id INTO v_correct_opt_id
            FROM public.quiz_options
            WHERE question_id = v_question.id AND is_correct = TRUE
            LIMIT 1;

            IF v_selected_opt_id IS NOT NULL AND v_selected_opt_id = v_correct_opt_id THEN
                v_is_correct := TRUE;
            END IF;

        ELSIF v_question.question_type = 'short_answer' THEN
            -- Pencocokan teks jawaban (case-insensitive & whitespace trimmed)
            IF v_short_text IS NOT NULL AND LENGTH(v_short_text) > 0 THEN
                IF LOWER(v_short_text) = ANY(
                    SELECT LOWER(TRIM(unnest(string_to_array(v_question.correct_answer_text, ','))))
                ) THEN
                    v_is_correct := TRUE;
                END IF;
            END IF;
        END IF;

        -- Hitung poin
        IF v_is_correct THEN
            v_points_earned := COALESCE(v_question.points, 20);
            v_earned_points := v_earned_points + v_points_earned;
        END IF;

        -- Simpan ke tabel detail jawaban
        INSERT INTO public.quiz_answers (
            attempt_id,
            question_id,
            selected_option_id,
            short_answer_text,
            is_correct,
            points_earned
        ) VALUES (
            v_attempt_id,
            v_question.id,
            v_selected_opt_id,
            v_short_text,
            v_is_correct,
            v_points_earned
        );
    END LOOP;

    -- 6. Hitung final score SELASEKALI evaluasi selesai
    IF v_total_points > 0 THEN
        v_final_score := ROUND((v_earned_points::NUMERIC / v_total_points::NUMERIC) * 100);
    ELSE
        v_final_score := 0;
    END IF;

    -- 7. Cek kelulusan KKM
    IF v_final_score >= v_quiz.passing_grade THEN
        v_is_passed := TRUE;
    END IF;

    -- 8. Update quiz_attempts dengan hasil akhir
    UPDATE public.quiz_attempts
    SET 
        score = v_final_score,
        earned_points = v_earned_points,
        is_passed = v_is_passed
    WHERE id = v_attempt_id;

    -- 9. Kembalikan hasil ringkasan ke client
    RETURN jsonb_build_object(
        'attempt_id', v_attempt_id,
        'score', v_final_score,
        'earned_points', v_earned_points,
        'total_points', v_total_points,
        'is_passed', v_is_passed,
        'passing_grade', v_quiz.passing_grade
    );
END;
$$;

-- ==============================================================================
-- HELPER FUNCTIONS FOR AUTHENTICATION
-- ==============================================================================

-- Function to validate user credentials and create session
CREATE OR REPLACE FUNCTION public.login_user(
    p_email TEXT,
    p_password TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user RECORD;
    v_token TEXT;
    v_token_hash TEXT;
    v_expires_at TIMESTAMPTZ;
BEGIN
    -- Find user by email
    SELECT * INTO v_user FROM public.users WHERE email = LOWER(p_email);
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Email atau password salah';
    END IF;

    -- Verify password (using crypt for bcrypt)
    IF NOT (v_user.password_hash = crypt(p_password, v_user.password_hash)) THEN
        RAISE EXCEPTION 'Email atau password salah';
    END IF;

    -- Generate session token
    v_token := encode(gen_random_bytes(32), 'hex');
    v_token_hash := crypt(v_token, gen_salt('bf'));
    v_expires_at := NOW() + INTERVAL '30 days';

    -- Store session
    INSERT INTO public.sessions (user_id, token_hash, expires_at)
    VALUES (v_user.id, v_token_hash, v_expires_at);

    RETURN jsonb_build_object(
        'user', jsonb_build_object(
            'id', v_user.id,
            'email', v_user.email,
            'full_name', v_user.full_name,
            'role', v_user.role,
            'avatar_url', v_user.avatar_url,
            'school_name', v_user.school_name,
            'class_code', v_user.class_code
        ),
        'token', v_token,
        'expires_at', v_expires_at
    );
END;
$$;

-- Function to register a new student
CREATE OR REPLACE FUNCTION public.register_student(
    p_email TEXT,
    p_password TEXT,
    p_full_name TEXT,
    p_class_code TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user RECORD;
    v_class RECORD;
    v_token TEXT;
    v_token_hash TEXT;
    v_expires_at TIMESTAMPTZ;
BEGIN
    -- Check if email already exists
    IF EXISTS (SELECT 1 FROM public.users WHERE email = LOWER(p_email)) THEN
        RAISE EXCEPTION 'Email sudah terdaftar';
    END IF;

    -- Verify class code exists
    SELECT * INTO v_class FROM public.classes WHERE code = UPPER(p_class_code);
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Kode kelas tidak valid';
    END IF;

    -- Create user
    INSERT INTO public.users (email, password_hash, full_name, role, class_code)
    VALUES (LOWER(p_email), crypt(p_password, gen_salt('bf')), p_full_name, 'siswa', UPPER(p_class_code))
    RETURNING * INTO v_user;

    -- Add to class members
    INSERT INTO public.class_members (class_id, student_id)
    VALUES (v_class.id, v_user.id);

    -- Generate session token
    v_token := encode(gen_random_bytes(32), 'hex');
    v_token_hash := crypt(v_token, gen_salt('bf'));
    v_expires_at := NOW() + INTERVAL '30 days';

    INSERT INTO public.sessions (user_id, token_hash, expires_at)
    VALUES (v_user.id, v_token_hash, v_expires_at);

    RETURN jsonb_build_object(
        'user', jsonb_build_object(
            'id', v_user.id,
            'email', v_user.email,
            'full_name', v_user.full_name,
            'role', v_user.role,
            'class_code', v_user.class_code
        ),
        'token', v_token,
        'expires_at', v_expires_at
    );
END;
$$;

-- Function to register a new teacher (requires valid invitation code)
CREATE OR REPLACE FUNCTION public.register_teacher(
    p_email TEXT,
    p_password TEXT,
    p_full_name TEXT,
    p_school_name TEXT,
    p_invite_code TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user RECORD;
    v_invitation RECORD;
    v_token TEXT;
    v_token_hash TEXT;
    v_expires_at TIMESTAMPTZ;
BEGIN
    -- Check if email already exists
    IF EXISTS (SELECT 1 FROM public.users WHERE email = LOWER(p_email)) THEN
        RAISE EXCEPTION 'Email sudah terdaftar';
    END IF;

    -- Validate invitation code
    SELECT * INTO v_invitation
    FROM public.teacher_invitations
    WHERE code = p_invite_code AND is_used = FALSE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Kode undangan tidak valid atau sudah digunakan';
    END IF;

    -- Create user
    INSERT INTO public.users (email, password_hash, full_name, role, school_name)
    VALUES (LOWER(p_email), crypt(p_password, gen_salt('bf')), p_full_name, 'guru', p_school_name)
    RETURNING * INTO v_user;

    -- Mark invitation as used
    UPDATE public.teacher_invitations
    SET is_used = TRUE, used_by = v_user.id
    WHERE id = v_invitation.id;

    -- Generate session token
    v_token := encode(gen_random_bytes(32), 'hex');
    v_token_hash := crypt(v_token, gen_salt('bf'));
    v_expires_at := NOW() + INTERVAL '30 days';

    INSERT INTO public.sessions (user_id, token_hash, expires_at)
    VALUES (v_user.id, v_token_hash, v_expires_at);

    RETURN jsonb_build_object(
        'user', jsonb_build_object(
            'id', v_user.id,
            'email', v_user.email,
            'full_name', v_user.full_name,
            'role', v_user.role,
            'school_name', v_user.school_name
        ),
        'token', v_token,
        'expires_at', v_expires_at
    );
END;
$$;

-- ==============================================================================
-- ANALYTICS & STATISTICS RPC FUNCTIONS
-- ==============================================================================

-- Function to get quiz statistics (teacher only)
CREATE OR REPLACE FUNCTION public.get_quiz_stats(
    p_quiz_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_stats RECORD;
    v_distribution JSONB;
    v_question_stats JSONB;
BEGIN
    -- Check if quiz exists
    IF NOT EXISTS (SELECT 1 FROM public.quizzes WHERE id = p_quiz_id) THEN
        RAISE EXCEPTION 'Kuis tidak ditemukan';
    END IF;

    -- Get basic stats
    SELECT 
        COUNT(DISTINCT qa.student_id) as total_attempts,
        ROUND(AVG(qa.score)::NUMERIC, 2) as average_score,
        MAX(qa.score) as highest_score,
        MIN(qa.score) as lowest_score,
        SUM(CASE WHEN qa.is_passed THEN 1 ELSE 0 END)::INT as passed_count,
        SUM(CASE WHEN NOT qa.is_passed THEN 1 ELSE 0 END)::INT as failed_count,
        ROUND(
            SUM(CASE WHEN qa.is_passed THEN 1 ELSE 0 END)::NUMERIC / 
            NULLIF(COUNT(DISTINCT qa.student_id), 0) * 100, 2
        ) as pass_rate
    INTO v_stats
    FROM public.quiz_attempts qa
    WHERE qa.quiz_id = p_quiz_id;

    -- Score distribution
    SELECT jsonb_object_agg(range, count ORDER BY range)
    INTO v_distribution
    FROM (
        SELECT 
            CASE 
                WHEN score >= 90 THEN '90-100'
                WHEN score >= 80 THEN '80-89'
                WHEN score >= 70 THEN '70-79'
                WHEN score >= 60 THEN '60-69'
                ELSE '0-59'
            END as range,
            COUNT(*) as count
        FROM public.quiz_attempts
        WHERE quiz_id = p_quiz_id
        GROUP BY 1
    ) sub;

    -- Per-question statistics
    SELECT jsonb_agg(jsonb_build_object(
        'question_id', sub.id,
        'question_text', sub.question_text,
        'question_type', sub.question_type,
        'points', sub.points,
        'total_answers', sub.total_answers,
        'correct_answers', sub.correct_answers,
        'correct_percentage', sub.correct_percentage
    ))
    INTO v_question_stats
    FROM (
        SELECT 
            qq.id,
            qq.question_text,
            qq.question_type,
            qq.points,
            COUNT(DISTINCT qa.id) as total_answers,
            SUM(CASE WHEN qa.is_correct THEN 1 ELSE 0 END)::INT as correct_answers,
            CASE 
                WHEN COUNT(DISTINCT qa.id) = 0 THEN 0
                ELSE ROUND(
                    SUM(CASE WHEN qa.is_correct THEN 1 ELSE 0 END)::NUMERIC / 
                    COUNT(DISTINCT qa.id) * 100, 2
                )
            END as correct_percentage
        FROM public.quiz_questions qq
        LEFT JOIN public.quiz_answers qa ON qa.question_id = qq.id
        LEFT JOIN public.quiz_attempts qat ON qat.id = qa.attempt_id AND qat.quiz_id = p_quiz_id
        WHERE qq.quiz_id = p_quiz_id
        GROUP BY qq.id, qq.question_text, qq.question_type, qq.points
        ORDER BY qq.order_index
    ) sub;

    RETURN jsonb_build_object(
        'total_attempts', COALESCE(v_stats.total_attempts, 0),
        'average_score', COALESCE(v_stats.average_score, 0),
        'highest_score', COALESCE(v_stats.highest_score, 0),
        'lowest_score', COALESCE(v_stats.lowest_score, 0),
        'passed_count', COALESCE(v_stats.passed_count, 0),
        'failed_count', COALESCE(v_stats.failed_count, 0),
        'pass_rate', COALESCE(v_stats.pass_rate, 0),
        'score_distribution', COALESCE(v_distribution, '{}'::JSONB),
        'question_stats', COALESCE(v_question_stats, '[]'::JSONB)
    );
END;
$$;

-- Function to get student quiz history
CREATE OR REPLACE FUNCTION public.get_student_quiz_history(
    p_student_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_history JSONB;
BEGIN
    SELECT jsonb_agg(row_to_json(h) ORDER BY h.completed_at DESC)
    INTO v_history
    FROM (
        SELECT 
            qa.id as attempt_id,
            q.title as quiz_title,
            q.category,
            qa.score,
            qa.earned_points,
            qa.total_points,
            qa.is_passed,
            qa.duration_seconds,
            qa.completed_at,
            q.passing_grade
        FROM public.quiz_attempts qa
        JOIN public.quizzes q ON q.id = qa.quiz_id
        WHERE qa.student_id = p_student_id
        ORDER BY qa.completed_at DESC
    ) h;

    RETURN jsonb_build_object(
        'history', COALESCE(v_history, '[]'::JSONB)
    );
END;
$$;

-- Function to get teacher dashboard statistics
CREATE OR REPLACE FUNCTION public.get_teacher_dashboard_stats(
    p_teacher_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_stats RECORD;
    v_recent_attempts JSONB;
    v_pending_invitations JSONB;
BEGIN
    -- Get overall stats for teacher's quizzes
    SELECT 
        COUNT(DISTINCT q.id) as total_quizzes,
        COUNT(DISTINCT qa.id) as total_attempts,
        COUNT(DISTINCT qa.student_id) as total_students,
        ROUND(AVG(qa.score)::NUMERIC, 2) as average_score,
        SUM(CASE WHEN qa.is_passed THEN 1 ELSE 0 END)::INT as total_passed,
        SUM(CASE WHEN NOT qa.is_passed THEN 1 ELSE 0 END)::INT as total_failed
    INTO v_stats
    FROM public.quizzes q
    LEFT JOIN public.quiz_attempts qa ON qa.quiz_id = q.id
    WHERE q.teacher_id = p_teacher_id;

    -- Get recent quiz attempts (last 10)
    SELECT jsonb_agg(row_to_json(r))
    INTO v_recent_attempts
    FROM (
        SELECT 
            qa.id,
            q.title as quiz_title,
            u.full_name as student_name,
            u.email as student_email,
            qa.score,
            qa.is_passed,
            qa.completed_at
        FROM public.quiz_attempts qa
        JOIN public.quizzes q ON q.id = qa.quiz_id
        JOIN public.users u ON u.id = qa.student_id
        WHERE q.teacher_id = p_teacher_id
        ORDER BY qa.completed_at DESC
        LIMIT 10
    ) r;

    -- Get pending teacher invitations
    SELECT jsonb_agg(row_to_json(i))
    INTO v_pending_invitations
    FROM (
        SELECT id, code, email, created_at
        FROM public.teacher_invitations
        WHERE is_used = FALSE AND expires_at > NOW()
        ORDER BY created_at DESC
    ) i;

    RETURN jsonb_build_object(
        'total_quizzes', COALESCE(v_stats.total_quizzes, 0),
        'total_attempts', COALESCE(v_stats.total_attempts, 0),
        'total_students', COALESCE(v_stats.total_students, 0),
        'average_score', COALESCE(v_stats.average_score, 0),
        'total_passed', COALESCE(v_stats.total_passed, 0),
        'total_failed', COALESCE(v_stats.total_failed, 0),
        'recent_attempts', COALESCE(v_recent_attempts, '[]'::JSONB),
        'pending_invitations', COALESCE(v_pending_invitations, '[]'::JSONB)
    );
END;
$$;
CREATE OR REPLACE FUNCTION public.validate_session(
    p_token TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_session RECORD;
    v_user RECORD;
    v_matched_session RECORD;
BEGIN
    -- Find session by token hash
    SELECT * INTO v_session
    FROM public.sessions
    WHERE expires_at > NOW()
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Check each session token (since we hash them, we need to verify)
    -- This is a simplified approach; in production you'd store token directly or use a different method
    SELECT s.*, u.* INTO v_matched_session
    FROM public.sessions s
    JOIN public.users u ON u.id = s.user_id
    WHERE s.expires_at > NOW()
    AND s.token_hash = crypt(p_token, s.token_hash)
    ORDER BY s.created_at DESC
    LIMIT 1;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Sesi tidak valid atau sudah kedaluwarsa';
    END IF;

    RETURN jsonb_build_object(
        'user', jsonb_build_object(
            'id', v_matched_session.id,
            'email', v_matched_session.email,
            'full_name', v_matched_session.full_name,
            'role', v_matched_session.role,
            'avatar_url', v_matched_session.avatar_url,
            'school_name', v_matched_session.school_name,
            'class_code', v_matched_session.class_code
        )
    );
END;
$$;

-- Function to logout (delete session)
CREATE OR REPLACE FUNCTION public.logout_user(
    p_token TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM public.sessions
    WHERE token_hash = crypt(p_token, token_hash);
END;
$$;

-- Function to create teacher invitation (admin only)
CREATE OR REPLACE FUNCTION public.create_teacher_invitation(
    p_code TEXT,
    p_email TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_invitation RECORD;
BEGIN
    INSERT INTO public.teacher_invitations (code, email)
    VALUES (p_code, p_email)
    RETURNING * INTO v_invitation;

    RETURN jsonb_build_object(
        'id', v_invitation.id,
        'code', v_invitation.code,
        'email', v_invitation.email,
        'is_used', v_invitation.is_used
    );
END;
$$;