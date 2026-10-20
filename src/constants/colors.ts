export const Colors = {
  primary: '#2563EB',       // Blue 600 - Main Brand
  primaryDark: '#1D4ED8',   // Blue 700 - Active / Pressed
  primaryLight: '#EFF6FF',  // Blue 50 - Background tint
  primaryBorder: '#BFDBFE', // Blue 200

  secondary: '#0F172A',     // Slate 900
  secondaryLight: '#F1F5F9',// Slate 100

  background: '#F8FAFC',    // Slate 50 - App background
  surface: '#FFFFFF',       // Card / Modal background
  surfaceSecondary: '#F1F5F9',

  text: '#0F172A',          // Slate 900
  textSecondary: '#64748B', // Slate 500
  textMuted: '#94A3B8',     // Slate 400
  textInverse: '#FFFFFF',

  border: '#E2E8F0',        // Slate 200
  borderDark: '#CBD5E1',    // Slate 300

  success: '#10B981',       // Emerald 500
  successLight: '#ECFDF5',  // Emerald 50
  successText: '#065F46',   // Emerald 800

  warning: '#F59E0B',       // Amber 500
  warningLight: '#FFFBEB',  // Amber 50
  warningText: '#92400E',   // Amber 800

  danger: '#EF4444',        // Red 500
  dangerLight: '#FEF2F2',   // Red 50
  dangerText: '#991B1B',    // Red 800

  info: '#3B82F6',
  infoLight: '#EFF6FF',
  infoText: '#1E40AF',

  // Category specific accent colors
  categoryColors: {
    'Dasar-Dasar Informatika': { bg: '#DBEAFE', text: '#1E40AF', border: '#93C5FD' },
    'Berpikir Komputasional': { bg: '#FCE7F3', text: '#9D174D', border: '#F472B6' },
    'Algoritma dan Pemrograman': { bg: '#DCFCE7', text: '#166534', border: '#86EFAC' },
    'Sistem Komputer': { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' },
    'Jaringan Komputer dan Internet': { bg: '#E0E7FF', text: '#3730A3', border: '#A5B4FC' },
    'Basis Data': { bg: '#EDE9FE', text: '#5B21B6', border: '#C4B5FD' },
    'Keamanan Digital': { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' },
    'Analisis Data': { bg: '#CCFBF1', text: '#115E59', border: '#5EEAD4' },
    'Kecerdasan Buatan': { bg: '#FAE8FF', text: '#86198F', border: '#F0ABFC' },
  },
} as const;
