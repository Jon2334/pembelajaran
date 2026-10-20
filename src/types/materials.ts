export type MaterialCategory =
  | 'Dasar-Dasar Informatika'
  | 'Berpikir Komputasional'
  | 'Algoritma dan Pemrograman'
  | 'Sistem Komputer'
  | 'Jaringan Komputer dan Internet'
  | 'Basis Data'
  | 'Keamanan Digital'
  | 'Analisis Data'
  | 'Kecerdasan Buatan';

export type DifficultyLevel = 'Pemula' | 'Menengah' | 'Mahir';

export type MaterialStatus = 'draft' | 'published';

export interface LearningMaterial {
  id: string;
  teacher_id: string;
  title: string;
  slug: string;
  category: MaterialCategory;
  difficulty: DifficultyLevel;
  description: string;
  content: string; // Markdown / formatted text
  cover_image_url?: string | null;
  attachment_url?: string | null;
  attachment_name?: string | null;
  reading_time_minutes: number;
  status: MaterialStatus;
  order_index: number;
  created_at: string;
  updated_at: string;
  // Computed / joined fields
  teacher_name?: string;
  is_completed?: boolean;
}

export interface MaterialProgress {
  id: string;
  student_id: string;
  material_id: string;
  is_completed: boolean;
  completed_at?: string | null;
  last_accessed_at: string;
}
