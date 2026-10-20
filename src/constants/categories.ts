import { MaterialCategory } from '../types/materials';

export interface CategoryInfo {
  name: MaterialCategory;
  shortName: string;
  description: string;
  iconName: string;
}

export const INFORMATIKA_CATEGORIES: CategoryInfo[] = [
  {
    name: 'Dasar-Dasar Informatika',
    shortName: 'Dasar Informatika',
    description: 'Konsep dasar teknologi informasi, etika digital, dan perkembangan komputasi.',
    iconName: 'BookOpen',
  },
  {
    name: 'Berpikir Komputasional',
    shortName: 'Komputasional',
    description: 'Dekomposisi, pengenalan pola, abstraksi, dan perancangan algoritma logika.',
    iconName: 'Brain',
  },
  {
    name: 'Algoritma dan Pemrograman',
    shortName: 'Pemrograman',
    description: 'Struktur kontrol, fungsi, tipe data, algoritma sorting/searching, dan coding.',
    iconName: 'Code',
  },
  {
    name: 'Sistem Komputer',
    shortName: 'Sistem Komputer',
    description: 'Perangkat keras (CPU, memori), perangkat lunak, sistem operasi, dan arsitektur.',
    iconName: 'Cpu',
  },
  {
    name: 'Jaringan Komputer dan Internet',
    shortName: 'Jaringan & Internet',
    description: 'Topologi, protokol TCP/IP, IP addressing, DNS, dan model jaringan OSI.',
    iconName: 'Wifi',
  },
  {
    name: 'Basis Data',
    shortName: 'Basis Data',
    description: 'Model relasional, query SQL, normalisasi, integritas data, dan manajemen database.',
    iconName: 'Database',
  },
  {
    name: 'Keamanan Digital',
    shortName: 'Keamanan Digital',
    description: 'Kriptografi, keamanan siber, pencegahan malware, phishing, dan privasi data.',
    iconName: 'ShieldCheck',
  },
  {
    name: 'Analisis Data',
    shortName: 'Analisis Data',
    description: 'Pengumpulan, pembersihan data, statistik deskriptif, dan visualisasi data.',
    iconName: 'BarChart2',
  },
  {
    name: 'Kecerdasan Buatan',
    shortName: 'AI & Machine Learning',
    description: 'Pengantar Artificial Intelligence, Machine Learning, Deep Learning, dan etika AI.',
    iconName: 'Sparkles',
  },
];

export const CATEGORY_NAMES: MaterialCategory[] = INFORMATIKA_CATEGORIES.map((c) => c.name);
