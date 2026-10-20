import { MaterialCategory } from './materials';

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer';

export type QuizStatus = 'draft' | 'published';

export interface QuizOption {
  id: string;
  question_id: string;
  option_key: string; // 'A', 'B', 'C', 'D' or 'true', 'false'
  option_text: string;
  is_correct: boolean;
  order_index: number;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: QuestionType;
  points: number;
  order_index: number;
  explanation?: string | null;
  // For short answer
  correct_answer_text?: string | null; // e.g. "Array", comma-separated variations
  // Joined options
  options?: QuizOption[];
}

export interface Quiz {
  id: string;
  teacher_id: string;
  material_id?: string | null;
  title: string;
  description: string;
  category: MaterialCategory;
  time_limit_minutes: number;
  passing_grade: number; // e.g. 75
  start_date?: string | null;
  end_date?: string | null;
  randomize_questions: boolean;
  randomize_options: boolean;
  status: QuizStatus;
  created_at: string;
  updated_at: string;
  // Computed / joined
  questions_count?: number;
  total_points?: number;
  teacher_name?: string;
  attempts_count?: number;
  user_best_score?: number | null;
  user_has_passed?: boolean;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  student_id: string;
  score: number; // 0 - 100
  earned_points: number;
  total_points: number;
  is_passed: boolean;
  started_at: string;
  completed_at: string;
  duration_seconds: number;
  // Joined
  quiz_title?: string;
  quiz_category?: MaterialCategory;
  student_name?: string;
  student_email?: string;
  passing_grade?: number;
}

export interface QuizAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_option_id?: string | null;
  short_answer_text?: string | null;
  is_correct: boolean;
  points_earned: number;
  // Joined for review
  question?: QuizQuestion;
  selected_option?: QuizOption;
}

export interface QuizSummaryStats {
  total_students: number;
  total_materials: number;
  total_quizzes: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  passed_count: number;
  failed_count: number;
}
