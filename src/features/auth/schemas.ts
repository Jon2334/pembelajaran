import { z } from 'zod';
import { APP_CONFIG } from '../../lib/config';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
  password: z
    .string()
    .min(6, 'Password minimal 6 karakter'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSiswaSchema = z
  .object({
    full_name: z
      .string()
      .min(3, 'Nama lengkap minimal 3 karakter')
      .max(60, 'Nama lengkap maksimal 60 karakter'),
    email: z
      .string()
      .min(1, 'Email wajib diisi')
      .email('Format email tidak valid'),
    class_code: z
      .string()
      .min(3, 'Kode kelas minimal 3 karakter')
      .toUpperCase(),
    password: z
      .string()
      .min(6, 'Password minimal 6 karakter'),
    confirmPassword: z
      .string()
      .min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  });

export type RegisterSiswaFormData = z.infer<typeof registerSiswaSchema>;

export const registerGuruSchema = z
  .object({
    full_name: z
      .string()
      .min(3, 'Nama lengkap minimal 3 karakter')
      .max(60, 'Nama lengkap maksimal 60 karakter'),
    school_name: z
      .string()
      .min(3, 'Nama sekolah/institusi minimal 3 karakter'),
    email: z
      .string()
      .min(1, 'Email wajib diisi')
      .email('Format email tidak valid'),
    invite_code: z
      .string()
      .min(4, 'Kode undangan guru wajib diisi')
      .refine(
        (code) => code.trim().toUpperCase() === APP_CONFIG.teacherInviteCode,
        {
          message: 'Kode undangan guru tidak valid atau belum disetujui admin',
        }
      ),
    password: z
      .string()
      .min(6, 'Password minimal 6 karakter'),
    confirmPassword: z
      .string()
      .min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  });

export type RegisterGuruFormData = z.infer<typeof registerGuruSchema>;
