export type UserRole = 'guru' | 'siswa' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string | null;
  phone_number?: string | null;
  school_name?: string | null;
  class_code?: string | null; // Kode kelas siswa saat mendaftar
  class_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  code: string;
  academic_year: string;
  description?: string | null;
  teacher_id: string;
  student_count?: number;
  created_at: string;
}

export interface ClassMember {
  id: string;
  class_id: string;
  student_id: string;
  joined_at: string;
  student?: Profile;
}

export interface TeacherInvitation {
  id: string;
  code: string;
  email?: string | null;
  is_used: boolean;
  used_by?: string | null;
  expires_at?: string | null;
  created_at: string;
}
