import AsyncStorage from '@react-native-async-storage/async-storage';
import { LearningMaterial, MaterialProgress } from '../types/materials';
import { Quiz, QuizQuestion, QuizAttempt, QuizAnswer, QuizSummaryStats } from '../types/quizzes';
import { Profile } from '../types/auth';
import {
  SEED_MATERIALS,
  SEED_QUIZZES,
  SEED_QUESTIONS,
  SEED_ATTEMPTS,
  SEED_TEACHER,
  SEED_STUDENT,
  SEED_CLASSES,
} from './seed-data';

const KEYS = {
  MATERIALS: '@edu_materials_v1',
  QUIZZES: '@edu_quizzes_v1',
  QUESTIONS: '@edu_questions_v1',
  ATTEMPTS: '@edu_attempts_v1',
  ANSWERS: '@edu_answers_v1',
  PROGRESS: '@edu_progress_v1',
  CURRENT_USER: '@edu_current_user_v1',
  USERS: '@edu_users_v1',
  SESSION_TOKEN: '@edu_session_token_v1',
  INITIALIZED: '@edu_storage_initialized_v1',
};

export class LocalDataStore {
  private static isInitialized = false;

  static async initialize() {
    if (this.isInitialized) return;
    try {
      const initFlag = await AsyncStorage.getItem(KEYS.INITIALIZED);
      if (!initFlag) {
        // Seed initial data
        await AsyncStorage.setItem(KEYS.MATERIALS, JSON.stringify(SEED_MATERIALS));
        await AsyncStorage.setItem(KEYS.QUIZZES, JSON.stringify(SEED_QUIZZES));
        await AsyncStorage.setItem(KEYS.QUESTIONS, JSON.stringify(SEED_QUESTIONS));
        await AsyncStorage.setItem(KEYS.ATTEMPTS, JSON.stringify(SEED_ATTEMPTS));
        await AsyncStorage.setItem(KEYS.USERS, JSON.stringify([SEED_TEACHER, SEED_STUDENT]));
        await AsyncStorage.setItem(KEYS.PROGRESS, JSON.stringify([]));
        await AsyncStorage.setItem(KEYS.INITIALIZED, 'true');
      }
      this.isInitialized = true;
    } catch (e) {
      console.error('Failed to initialize local storage', e);
    }
  }

  // --- Auth / User Store ---
  static async getCurrentUser(): Promise<Profile | null> {
    const raw = await AsyncStorage.getItem(KEYS.CURRENT_USER);
    return raw ? JSON.parse(raw) : null;
  }

  static async setCurrentUser(user: Profile | null): Promise<void> {
    if (user) {
      await AsyncStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem(KEYS.CURRENT_USER);
    }
  }

  static async getSessionToken(): Promise<string | null> {
    return await AsyncStorage.getItem(KEYS.SESSION_TOKEN);
  }

  static async setSessionToken(token: string | null): Promise<void> {
    if (token) {
      await AsyncStorage.setItem(KEYS.SESSION_TOKEN, token);
    } else {
      await AsyncStorage.removeItem(KEYS.SESSION_TOKEN);
    }
  }

  static async getUsers(): Promise<Profile[]> {
    await this.initialize();
    const raw = await AsyncStorage.getItem(KEYS.USERS);
    return raw ? JSON.parse(raw) : [SEED_TEACHER, SEED_STUDENT];
  }

  static async saveUser(user: Profile): Promise<void> {
    const users = await this.getUsers();
    const index = users.findIndex((u) => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    await AsyncStorage.setItem(KEYS.USERS, JSON.stringify(users));
  }

  // --- Materials ---
  static async getMaterials(): Promise<LearningMaterial[]> {
    await this.initialize();
    const raw = await AsyncStorage.getItem(KEYS.MATERIALS);
    return raw ? JSON.parse(raw) : SEED_MATERIALS;
  }

  static async getMaterialById(id: string): Promise<LearningMaterial | null> {
    const list = await this.getMaterials();
    return list.find((m) => m.id === id) || null;
  }

  static async saveMaterial(material: LearningMaterial): Promise<void> {
    const list = await this.getMaterials();
    const index = list.findIndex((m) => m.id === material.id);
    if (index >= 0) {
      list[index] = { ...material, updated_at: new Date().toISOString() };
    } else {
      list.unshift({ ...material, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    }
    await AsyncStorage.setItem(KEYS.MATERIALS, JSON.stringify(list));
  }

  static async deleteMaterial(id: string): Promise<void> {
    const list = await this.getMaterials();
    const filtered = list.filter((m) => m.id !== id);
    await AsyncStorage.setItem(KEYS.MATERIALS, JSON.stringify(filtered));
  }

  // --- Material Progress ---
  static async getMaterialProgress(studentId: string): Promise<MaterialProgress[]> {
    await this.initialize();
    const raw = await AsyncStorage.getItem(KEYS.PROGRESS);
    const list: MaterialProgress[] = raw ? JSON.parse(raw) : [];
    return list.filter((p) => p.student_id === studentId);
  }

  static async markMaterialCompleted(studentId: string, materialId: string): Promise<MaterialProgress> {
    await this.initialize();
    const raw = await AsyncStorage.getItem(KEYS.PROGRESS);
    const list: MaterialProgress[] = raw ? JSON.parse(raw) : [];
    const index = list.findIndex((p) => p.student_id === studentId && p.material_id === materialId);
    
    let item: MaterialProgress;
    if (index >= 0) {
      item = {
        ...list[index],
        is_completed: true,
        completed_at: new Date().toISOString(),
        last_accessed_at: new Date().toISOString(),
      };
      list[index] = item;
    } else {
      item = {
        id: `prog-${Date.now()}`,
        student_id: studentId,
        material_id: materialId,
        is_completed: true,
        completed_at: new Date().toISOString(),
        last_accessed_at: new Date().toISOString(),
      };
      list.push(item);
    }
    await AsyncStorage.setItem(KEYS.PROGRESS, JSON.stringify(list));
    return item;
  }

  // --- Quizzes ---
  static async getQuizzes(): Promise<Quiz[]> {
    await this.initialize();
    const raw = await AsyncStorage.getItem(KEYS.QUIZZES);
    return raw ? JSON.parse(raw) : SEED_QUIZZES;
  }

  static async getQuizById(id: string): Promise<Quiz | null> {
    const list = await this.getQuizzes();
    return list.find((q) => q.id === id) || null;
  }

  static async saveQuiz(quiz: Quiz, questions?: QuizQuestion[]): Promise<void> {
    const list = await this.getQuizzes();
    const index = list.findIndex((q) => q.id === quiz.id);
    if (index >= 0) {
      list[index] = { ...quiz, updated_at: new Date().toISOString() };
    } else {
      list.unshift({ ...quiz, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    }
    await AsyncStorage.setItem(KEYS.QUIZZES, JSON.stringify(list));

    if (questions) {
      await this.saveQuestions(quiz.id, questions);
    }
  }

  static async deleteQuiz(id: string): Promise<void> {
    const list = await this.getQuizzes();
    const filtered = list.filter((q) => q.id !== id);
    await AsyncStorage.setItem(KEYS.QUIZZES, JSON.stringify(filtered));
  }

  // --- Quiz Questions ---
  static async getQuestions(quizId: string): Promise<QuizQuestion[]> {
    await this.initialize();
    const raw = await AsyncStorage.getItem(KEYS.QUESTIONS);
    const map: Record<string, QuizQuestion[]> = raw ? JSON.parse(raw) : SEED_QUESTIONS;
    return map[quizId] || [];
  }

  static async saveQuestions(quizId: string, questions: QuizQuestion[]): Promise<void> {
    await this.initialize();
    const raw = await AsyncStorage.getItem(KEYS.QUESTIONS);
    const map: Record<string, QuizQuestion[]> = raw ? JSON.parse(raw) : SEED_QUESTIONS;
    map[quizId] = questions;
    await AsyncStorage.setItem(KEYS.QUESTIONS, JSON.stringify(map));
  }

  // --- Quiz Attempts & Answers ---
  static async getAttempts(studentId?: string, quizId?: string): Promise<QuizAttempt[]> {
    await this.initialize();
    const raw = await AsyncStorage.getItem(KEYS.ATTEMPTS);
    let list: QuizAttempt[] = raw ? JSON.parse(raw) : SEED_ATTEMPTS;
    if (studentId) {
      list = list.filter((a) => a.student_id === studentId);
    }
    if (quizId) {
      list = list.filter((a) => a.quiz_id === quizId);
    }
    return list.sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
  }

  static async getAttemptById(attemptId: string): Promise<QuizAttempt | null> {
    const list = await this.getAttempts();
    return list.find((a) => a.id === attemptId) || null;
  }

  static async saveAttempt(attempt: QuizAttempt, answers: QuizAnswer[]): Promise<void> {
    const list = await this.getAttempts();
    list.unshift(attempt);
    await AsyncStorage.setItem(KEYS.ATTEMPTS, JSON.stringify(list));

    // Save answers
    const rawAnswers = await AsyncStorage.getItem(KEYS.ANSWERS);
    const allAnswers: Record<string, QuizAnswer[]> = rawAnswers ? JSON.parse(rawAnswers) : {};
    allAnswers[attempt.id] = answers;
    await AsyncStorage.setItem(KEYS.ANSWERS, JSON.stringify(allAnswers));
  }

  static async getAttemptAnswers(attemptId: string): Promise<QuizAnswer[]> {
    const raw = await AsyncStorage.getItem(KEYS.ANSWERS);
    const allAnswers: Record<string, QuizAnswer[]> = raw ? JSON.parse(raw) : {};
    return allAnswers[attemptId] || [];
  }

  // --- Teacher Analytics / Stats ---
  static async getTeacherStats(teacherId: string): Promise<QuizSummaryStats> {
    const materials = await this.getMaterials();
    const quizzes = await this.getQuizzes();
    const attempts = await this.getAttempts();
    const users = await this.getUsers();
    const students = users.filter((u) => u.role === 'siswa');

    const totalStudents = Math.max(students.length, 32);
    const totalMaterials = materials.length;
    const totalQuizzes = quizzes.length;

    if (attempts.length === 0) {
      return {
        total_students: totalStudents,
        total_materials: totalMaterials,
        total_quizzes: totalQuizzes,
        average_score: 0,
        highest_score: 0,
        lowest_score: 0,
        passed_count: 0,
        failed_count: 0,
      };
    }

    const scores = attempts.map((a) => a.score);
    const totalScore = scores.reduce((acc, curr) => acc + curr, 0);
    const averageScore = Math.round(totalScore / scores.length);
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    const passedCount = attempts.filter((a) => a.is_passed).length;
    const failedCount = attempts.length - passedCount;

    return {
      total_students: totalStudents,
      total_materials: totalMaterials,
      total_quizzes: totalQuizzes,
      average_score: averageScore,
      highest_score: highestScore,
      lowest_score: lowestScore,
      passed_count: passedCount,
      failed_count: failedCount,
    };
  }

  static async getClasses() {
    return SEED_CLASSES;
  }
}
