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

    -- 3. Loop setiap pertanyaan pada kuis untuk penilaian objektif
    FOR v_question IN
        SELECT id, question_type, points, correct_answer_text
        FROM public.quiz_questions
        WHERE quiz_id = p_quiz_id
        ORDER BY order_index ASC
    LOOP
        v_total_points := v_total_points + COALESCE(v_question.points, 20);
        v_is_correct := FALSE;
        v_points_earned := 0;

        -- Cari jawaban siswa dari JSON parameter
        SELECT elem INTO v_student_ans
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

    -- 4. Hitung Rumus Nilai Akhir:
    -- Nilai akhir = (Total bobot jawaban benar / Total bobot seluruh soal) * 100
    IF v_total_points > 0 THEN
        v_final_score := ROUND((v_earned_points::NUMERIC / v_total_points::NUMERIC) * 100);
    ELSE
        v_final_score := 0;
    END IF;

    -- 5. Cek kelulusan KKM
    IF v_final_score >= v_quiz.passing_grade THEN
        v_is_passed := TRUE;
    END IF;

    -- 6. Simpan hasil percobaan kuis
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
        v_final_score,
        v_earned_points,
        v_total_points,
        v_is_passed,
        p_duration_seconds,
        NOW() - (p_duration_seconds || ' seconds')::INTERVAL,
        NOW()
    );

    -- 7. Kembalikan hasil ringkasan ke client
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
