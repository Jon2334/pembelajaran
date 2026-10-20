import { queryOne, queryMany, querySingle, execute, rawQuery, getNeonClient } from '../../lib/neon';
import { isNeonConfigured } from '../../lib/config';
import { LocalDataStore } from '../../lib/storage';
import {
  Quiz,
  QuizQuestion,
  QuizAttempt,
  QuizAnswer,
  QuizOption,
} from '../../types/quizzes';
import { MaterialCategory } from '../../types/materials';

export interface QuizFilter {
  category?: MaterialCategory | 'ALL';
  publishedOnly?: boolean;
  teacherId?: string;
  search?: string;
}

export interface StudentSubmission {
  question_id: string;
  selected_option_id?: string | null;
  short_answer_text?: string | null;
}

export const QuizzesService = {
  async getAll(filter?: QuizFilter, studentId?: string): Promise<Quiz[]> {
    if (!isNeonConfigured) {
      const list = await LocalDataStore.getQuizzes();
      let filteredList = list;
      if (filter?.publishedOnly) filteredList = filteredList.filter((q) => q.status === 'published');
      if (filter?.teacherId) filteredList = filteredList.filter((q) => q.teacher_id === filter.teacherId);
      if (filter?.category && filter.category !== 'ALL') filteredList = filteredList.filter((q) => q.category === filter.category);
      if (filter?.search && filter.search.trim().length > 0) {
        const query = filter.search.toLowerCase();
        filteredList = filteredList.filter((q) => q.title.toLowerCase().includes(query) || q.description.toLowerCase().includes(query) || q.category.toLowerCase().includes(query));
      }
      if (studentId) {
        const attempts = await LocalDataStore.getAttempts(studentId);
        filteredList = filteredList.map((quiz) => {
          const quizAttempts = attempts.filter((a) => a.quiz_id === quiz.id);
          const best = quizAttempts.length > 0 ? Math.max(...quizAttempts.map((a) => a.score)) : null;
          const hasPassed = quizAttempts.some((a) => a.is_passed);
          return { ...quiz, user_best_score: best, user_has_passed: hasPassed, attempts_count: quizAttempts.length };
        });
      }
      return filteredList;
    }

    const conditions: string[] = [];
    const values: unknown[] = [];

    if (filter?.publishedOnly) {
      conditions.push('status = \'published\'');
    }
    if (filter?.teacherId) {
      values.push(filter.teacherId);
      conditions.push(`teacher_id = $${values.length}`);
    }
    if (filter?.category && filter.category !== 'ALL') {
      values.push(filter.category);
      conditions.push(`category = $${values.length}`);
    }
    if (filter?.search && filter.search.trim().length > 0) {
      values.push(`%${filter.search.toLowerCase()}%`);
      conditions.push(`(LOWER(title) LIKE $${values.length} OR LOWER(description) LIKE $${values.length} OR LOWER(category) LIKE $${values.length})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    const query = `
      SELECT 
        id, teacher_id, material_id, title, description, category, time_limit_minutes,
        passing_grade, start_date, end_date, randomize_questions, randomize_options,
        status, created_at, updated_at,
        (SELECT COUNT(*) FROM public.quiz_questions WHERE quiz_id = q.id) as questions_count,
        (SELECT COALESCE(SUM(points), 0) FROM public.quiz_questions WHERE quiz_id = q.id) as total_points
      FROM public.quizzes q
      ${whereClause}
      ORDER BY created_at DESC
    `;

    const quizzes = await rawQuery<Quiz>(query, values);

    if (studentId && quizzes.length > 0) {
      const quizIds = quizzes.map(q => `'${q.id}'`).join(',');
      const attemptsQuery = `
        SELECT a.quiz_id, a.score, a.is_passed
        FROM public.quiz_attempts a
        WHERE a.student_id = $1 AND a.quiz_id IN (${quizIds})
      `;
      const attempts = await rawQuery<{ quiz_id: string; score: number; is_passed: boolean }>(attemptsQuery, [studentId]);
      
      return quizzes.map(quiz => {
        const quizAttempts = attempts.filter(a => a.quiz_id === quiz.id);
        const best = quizAttempts.length > 0 ? Math.max(...quizAttempts.map(a => a.score)) : null;
        const hasPassed = quizAttempts.some(a => a.is_passed);
        return { ...quiz, user_best_score: best, user_has_passed: hasPassed, attempts_count: quizAttempts.length };
      });
    }

    return quizzes;
  },

  async getById(id: string): Promise<Quiz | null> {
    if (!isNeonConfigured) {
      return LocalDataStore.getQuizById(id);
    }

    const result = await queryMany<Quiz>`
      SELECT 
        id, teacher_id, material_id, title, description, category, time_limit_minutes,
        passing_grade, start_date, end_date, randomize_questions, randomize_options,
        status, created_at, updated_at,
        (SELECT COUNT(*) FROM public.quiz_questions WHERE quiz_id = q.id) as questions_count,
        (SELECT COALESCE(SUM(points), 0) FROM public.quiz_questions WHERE quiz_id = q.id) as total_points
      FROM public.quizzes q
      WHERE id = ${id}
    `;
    return result[0] || null;
  },

  async getQuestions(quizId: string, hideCorrectAnswers: boolean = false): Promise<QuizQuestion[]> {
    if (!isNeonConfigured) {
      const questions = await LocalDataStore.getQuestions(quizId);
      if (hideCorrectAnswers) {
        return questions.map(q => ({
          ...q,
          explanation: null,
          correct_answer_text: null,
          options: q.options?.map(opt => ({ ...opt, is_correct: false })),
        }));
      }
      return questions;
    }

    const questions = await queryMany<QuizQuestion>`
      SELECT 
        id, quiz_id, question_text, question_type, points, order_index,
        explanation, correct_answer_text
      FROM public.quiz_questions
      WHERE quiz_id = ${quizId}
      ORDER BY order_index ASC
    `;

    if (questions.length === 0) return [];

    const questionIds = questions.map(q => `'${q.id}'`).join(',');
    const options = await rawQuery<QuizOption>(`
      SELECT id, question_id, option_key, option_text, is_correct, order_index
      FROM public.quiz_options
      WHERE question_id IN (${questionIds})
      ORDER BY question_id, order_index
    `);

    const optionsByQuestion = new Map<string, QuizOption[]>();
    for (const opt of options) {
      const arr = optionsByQuestion.get(opt.question_id) || [];
      arr.push(opt);
      optionsByQuestion.set(opt.question_id, arr);
    }

    let result = questions.map(q => ({
      ...q,
      options: optionsByQuestion.get(q.id) || [],
    }));

    if (hideCorrectAnswers) {
      result = result.map(q => ({
        ...q,
        explanation: null,
        correct_answer_text: null,
        options: q.options?.map(opt => ({ ...opt, is_correct: false })),
      }));
    }

    return result;
  },

  async submitAndGradeQuiz(
    quizId: string,
    studentId: string,
    studentName: string,
    submissions: StudentSubmission[],
    durationSeconds: number
  ): Promise<{ attempt: QuizAttempt; answers: QuizAnswer[] }> {
    if (!isNeonConfigured) {
      const quiz = await LocalDataStore.getQuizById(quizId);
      if (!quiz) throw new Error('Kuis tidak ditemukan');
      const questions = await LocalDataStore.getQuestions(quizId);
      if (questions.length === 0) throw new Error('Soal kuis tidak ditemukan');

      let totalPoints = 0;
      let earnedPoints = 0;
      const evaluatedAnswers: QuizAnswer[] = [];
      const attemptId = `att-${Date.now()}`;

      for (const q of questions) {
        const qPoints = q.points || 10;
        totalPoints += qPoints;
        const sub = submissions.find(s => s.question_id === q.id);
        let isCorrect = false;

        if (q.question_type === 'multiple_choice' || q.question_type === 'true_false') {
          const correctOpt = q.options?.find(o => o.is_correct);
          if (correctOpt && sub?.selected_option_id === correctOpt.id) isCorrect = true;
        } else if (q.question_type === 'short_answer') {
          const cleanAnswer = (sub?.short_answer_text || '').trim().toLowerCase();
          const expected = (q.correct_answer_text || '').split(',').map(item => item.trim().toLowerCase());
          if (cleanAnswer.length > 0 && expected.includes(cleanAnswer)) isCorrect = true;
        }

        const pointsEarned = isCorrect ? qPoints : 0;
        earnedPoints += pointsEarned;
        evaluatedAnswers.push({
          id: `ans-${Date.now()}-${q.id}`,
          attempt_id: attemptId,
          question_id: q.id,
          selected_option_id: sub?.selected_option_id || null,
          short_answer_text: sub?.short_answer_text || null,
          is_correct: isCorrect,
          points_earned: pointsEarned,
          question: q,
          selected_option: q.options?.find(o => o.id === sub?.selected_option_id),
        });
      }

      const calculatedScore = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
      const isPassed = calculatedScore >= quiz.passing_grade;

      const attempt: QuizAttempt = {
        id: attemptId,
        quiz_id: quizId,
        student_id: studentId,
        score: calculatedScore,
        earned_points: earnedPoints,
        total_points: totalPoints,
        is_passed: isPassed,
        started_at: new Date(Date.now() - durationSeconds * 1000).toISOString(),
        completed_at: new Date().toISOString(),
        duration_seconds: durationSeconds,
        quiz_title: quiz.title,
        quiz_category: quiz.category,
        student_name: studentName,
        passing_grade: quiz.passing_grade,
      };

      await LocalDataStore.saveAttempt(attempt, evaluatedAnswers);
      return { attempt, answers: evaluatedAnswers };
    }

    // Use Neon RPC for secure server-side grading
    const client = getNeonClient();
    const rpcResult = await client`
      SELECT * FROM public.submit_and_grade_quiz(
        ${quizId}::uuid,
        ${studentId}::uuid,
        ${JSON.stringify(submissions)},
        ${durationSeconds}
      )
    ` as { attempt_id: string; score: number; earned_points: number; total_points: number; is_passed: boolean; started_at: string; completed_at: string; duration_seconds: number }[];

    const result = rpcResult;

    if (!result || result.length === 0) {
      throw new Error('Grading failed');
    }

    const graded = result[0];

    // Fetch the full attempt with answers for review
    const attemptDetails = await queryOne<QuizAttempt>`
      SELECT 
        a.id, a.quiz_id, a.student_id, a.score, a.earned_points, a.total_points,
        a.is_passed, a.started_at, a.completed_at, a.duration_seconds,
        q.title as quiz_title, q.category as quiz_category,
        u.full_name as student_name, q.passing_grade
      FROM public.quiz_attempts a
      JOIN public.quizzes q ON q.id = a.quiz_id
      JOIN public.users u ON u.id = a.student_id
      WHERE a.id = ${graded.attempt_id}::uuid
    `;

    const answers = await queryMany<QuizAnswer>`
      SELECT 
        qa.id, qa.attempt_id, qa.question_id, qa.selected_option_id,
        qa.short_answer_text, qa.is_correct, qa.points_earned
      FROM public.quiz_answers qa
      WHERE qa.attempt_id = ${graded.attempt_id}::uuid
    `;

    return {
      attempt: attemptDetails || {
        id: graded.attempt_id,
        quiz_id: quizId,
        student_id: studentId,
        score: graded.score,
        earned_points: graded.earned_points,
        total_points: graded.total_points,
        is_passed: graded.is_passed,
        started_at: graded.started_at,
        completed_at: graded.completed_at,
        duration_seconds: graded.duration_seconds,
        quiz_title: '',
        quiz_category: undefined,
        student_name: studentName,
        passing_grade: 0,
      },
      answers,
    };
  },

  async getAttemptById(attemptId: string): Promise<{ attempt: QuizAttempt | null; answers: QuizAnswer[] }> {
    if (!isNeonConfigured) {
      const attempt = await LocalDataStore.getAttemptById(attemptId);
      const answers = await LocalDataStore.getAttemptAnswers(attemptId);
      return { attempt, answers };
    }

    const attempt = await queryOne<QuizAttempt>`
      SELECT 
        a.id, a.quiz_id, a.student_id, a.score, a.earned_points, a.total_points,
        a.is_passed, a.started_at, a.completed_at, a.duration_seconds,
        q.title as quiz_title, q.category as quiz_category,
        u.full_name as student_name, q.passing_grade
      FROM public.quiz_attempts a
      JOIN public.quizzes q ON q.id = a.quiz_id
      JOIN public.users u ON u.id = a.student_id
      WHERE a.id = ${attemptId}
    `;

    const answers = await queryMany<QuizAnswer>`
      SELECT 
        qa.id, qa.attempt_id, qa.question_id, qa.selected_option_id,
        qa.short_answer_text, qa.is_correct, qa.points_earned
      FROM public.quiz_answers qa
      WHERE qa.attempt_id = ${attemptId}
    `;

    return { attempt, answers };
  },

  async getAttemptsByQuizId(quizId: string): Promise<QuizAttempt[]> {
    if (!isNeonConfigured) {
      return LocalDataStore.getAttempts(undefined, quizId);
    }

    return queryMany<QuizAttempt>`
      SELECT 
        a.id, a.quiz_id, a.student_id, a.score, a.earned_points, a.total_points,
        a.is_passed, a.started_at, a.completed_at, a.duration_seconds,
        q.title as quiz_title, q.category as quiz_category,
        u.full_name as student_name, q.passing_grade
      FROM public.quiz_attempts a
      JOIN public.quizzes q ON q.id = a.quiz_id
      JOIN public.users u ON u.id = a.student_id
      WHERE a.quiz_id = ${quizId}
      ORDER BY a.completed_at DESC
    `;
  },

  async getAttemptsByStudentId(studentId: string): Promise<QuizAttempt[]> {
    if (!isNeonConfigured) {
      return LocalDataStore.getAttempts(studentId);
    }

    return queryMany<QuizAttempt>`
      SELECT 
        a.id, a.quiz_id, a.student_id, a.score, a.earned_points, a.total_points,
        a.is_passed, a.started_at, a.completed_at, a.duration_seconds,
        q.title as quiz_title, q.category as quiz_category,
        u.full_name as student_name, q.passing_grade
      FROM public.quiz_attempts a
      JOIN public.quizzes q ON q.id = a.quiz_id
      JOIN public.users u ON u.id = a.student_id
      WHERE a.student_id = ${studentId}
      ORDER BY a.completed_at DESC
    `;
  },

  async saveQuiz(
    quiz: Omit<Quiz, 'id' | 'created_at' | 'updated_at' | 'questions_count' | 'total_points'> & { id?: string },
    questions: QuizQuestion[]
  ): Promise<Quiz> {
    if (!isNeonConfigured) {
      const quizId = quiz.id || `quiz-${Date.now()}`;
      const fullQuiz: Quiz = {
        ...quiz,
        id: quizId,
        questions_count: questions.length,
        total_points: questions.reduce((sum, q) => sum + (q.points || 10), 0),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await LocalDataStore.saveQuiz(fullQuiz, questions);
      return fullQuiz;
    }

    // Start transaction by using a single query block
    const quizId = quiz.id || `quiz-${Date.now()}`;

    // Insert quiz
    const newQuiz = await querySingle<Quiz>`
      INSERT INTO public.quizzes (
        id, teacher_id, material_id, title, description, category,
        time_limit_minutes, passing_grade, start_date, end_date,
        randomize_questions, randomize_options, status
      ) VALUES (
        ${quizId}, ${quiz.teacher_id}, ${quiz.material_id ?? null},
        ${quiz.title}, ${quiz.description}, ${quiz.category},
        ${quiz.time_limit_minutes}, ${quiz.passing_grade},
        ${quiz.start_date ?? null}, ${quiz.end_date ?? null},
        ${quiz.randomize_questions}, ${quiz.randomize_options}, ${quiz.status}
      )
      RETURNING 
        id, teacher_id, material_id, title, description, category,
        time_limit_minutes, passing_grade, start_date, end_date,
        randomize_questions, randomize_options, status,
        created_at, updated_at,
        (SELECT COUNT(*) FROM public.quiz_questions WHERE quiz_id = q.id) as questions_count,
        (SELECT COALESCE(SUM(points), 0) FROM public.quiz_questions WHERE quiz_id = q.id) as total_points
    `;

    // Insert questions with options
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const questionId = q.id || `qq-${Date.now()}-${i}`;

      const newQuestion = await querySingle<QuizQuestion>`
        INSERT INTO public.quiz_questions (
          id, quiz_id, question_text, question_type, points, order_index,
          explanation, correct_answer_text
        ) VALUES (
          ${questionId}, ${quizId}, ${q.question_text}, ${q.question_type},
          ${q.points}, ${q.order_index}, ${q.explanation ?? null}, ${q.correct_answer_text ?? null}
        )
        RETURNING id, quiz_id, question_text, question_type, points, order_index, explanation, correct_answer_text
      `;

      // Insert options if multiple choice or true/false
      if (q.options && (q.question_type === 'multiple_choice' || q.question_type === 'true_false')) {
        for (let j = 0; j < q.options.length; j++) {
          const opt = q.options[j];
          await execute`
            INSERT INTO public.quiz_options (
              question_id, option_key, option_text, is_correct, order_index
            ) VALUES (
              ${newQuestion.id}, ${opt.option_key}, ${opt.option_text},
              ${opt.is_correct}, ${opt.order_index ?? j}
            )
          `;
        }
      }
    }

    return newQuiz;
  },

  async deleteQuiz(id: string): Promise<void> {
    if (!isNeonConfigured) {
      await LocalDataStore.deleteQuiz(id);
      return;
    }
    await execute`DELETE FROM public.quizzes WHERE id = ${id}`;
  },
};