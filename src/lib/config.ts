import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra as Record<string, string> | undefined;

// Get Neon URL from build-time extra or runtime env
const neonUrlFromExtra = extra?.EXPO_PUBLIC_NEON_DATABASE_URL || process.env.EXPO_PUBLIC_NEON_DATABASE_URL || '';

// Check if the URL has a real password (not masked with ***)
const hasRealPassword = Boolean(
  neonUrlFromExtra && 
  !neonUrlFromExtra.includes(':***@') && 
  neonUrlFromExtra.startsWith('postgres')
);

export const APP_CONFIG = {
  appName: 'EduInformatika',
  appVersion: '1.0.0',
  // Neon PostgreSQL - read from app.json extra (injected at build time)
  neonDatabaseUrl: hasRealPassword ? neonUrlFromExtra : '',
  // Default master teacher invitation code for teacher registration
  teacherInviteCode: extra?.EXPO_PUBLIC_TEACHER_INVITE_CODE || process.env.EXPO_PUBLIC_TEACHER_INVITE_CODE || 'GURU-INFORMATIKA-2026',
  // Default valid student class codes
  defaultClassCodes: ['X-RPL-1', 'X-TKJ-1', 'X-TKJ-2', 'XI-RPL-1', 'INFORMATIKA-10'],
};

export const isNeonConfigured = hasRealPassword;