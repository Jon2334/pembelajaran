import { Profile, ClassRoom, ClassMember } from './auth';
import { LearningMaterial, MaterialProgress } from './materials';
import { Quiz, QuizQuestion, QuizOption, QuizAttempt, QuizAnswer } from './quizzes';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Profile, 'id'>>;
      };
      classes: {
        Row: ClassRoom;
        Insert: Omit<ClassRoom, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<ClassRoom, 'id'>>;
      };
      class_members: {
        Row: ClassMember;
        Insert: Omit<ClassMember, 'id' | 'joined_at'> & {
          id?: string;
          joined_at?: string;
        };
        Update: Partial<Omit<ClassMember, 'id'>>;
      };
      learning_materials: {
        Row: LearningMaterial;
        Insert: Omit<LearningMaterial, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<LearningMaterial, 'id'>>;
      };
      material_progress: {
        Row: MaterialProgress;
        Insert: Omit<MaterialProgress, 'id'> & {
          id?: string;
        };
        Update: Partial<Omit<MaterialProgress, 'id'>>;
      };
      quizzes: {
        Row: Quiz;
        Insert: Omit<Quiz, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Quiz, 'id'>>;
      };
      quiz_questions: {
        Row: QuizQuestion;
        Insert: Omit<QuizQuestion, 'id'> & {
          id?: string;
        };
        Update: Partial<Omit<QuizQuestion, 'id'>>;
      };
      quiz_options: {
        Row: QuizOption;
        Insert: Omit<QuizOption, 'id'> & {
          id?: string;
        };
        Update: Partial<Omit<QuizOption, 'id'>>;
      };
      quiz_attempts: {
        Row: QuizAttempt;
        Insert: Omit<QuizAttempt, 'id'> & {
          id?: string;
        };
        Update: Partial<Omit<QuizAttempt, 'id'>>;
      };
      quiz_answers: {
        Row: QuizAnswer;
        Insert: Omit<QuizAnswer, 'id'> & {
          id?: string;
        };
        Update: Partial<Omit<QuizAnswer, 'id'>>;
      };
    };
    Functions: {
      submit_and_grade_quiz: {
        Args: {
          p_quiz_id: string;
          p_student_id: string;
          p_answers: Json;
          p_duration_seconds: number;
        };
        Returns: {
          attempt_id: string;
          score: number;
          earned_points: number;
          total_points: number;
          is_passed: boolean;
        };
      };
    };
  };
}
