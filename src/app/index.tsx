import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { BookOpen, GraduationCap, Sparkles, ShieldCheck, ArrowRight, Laptop } from 'lucide-react-native';
import { useAuth } from '../features/auth/AuthContext';
import { Colors } from '../constants/colors';
import { BorderRadius, Shadows, Spacing } from '../constants/theme';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';

export default function WelcomeScreen() {
  const { user, role, isLoading, switchRoleDemo } = useAuth();

  useEffect(() => {
    if (!isLoading && user && role) {
      if (role === 'guru') {
        router.replace('/(guru)');
      } else if (role === 'siswa') {
        router.replace('/(siswa)');
      }
    }
  }, [user, role, isLoading]);

  if (isLoading) {
    return <LoadingSpinner message="Menyiapkan aplikasi pembelajaran..." />;
  }

  const handleDemoLogin = async (targetRole: 'guru' | 'siswa') => {
    await switchRoleDemo(targetRole);
    if (targetRole === 'guru') {
      router.replace('/(guru)');
    } else {
      router.replace('/(siswa)');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Hero Header */}
      <View style={styles.heroSection}>
        <View style={styles.logoBadge}>
          <Laptop size={32} color={Colors.primary} />
        </View>
        <Text style={styles.brandTitle}>EduInformatika</Text>
        <Text style={styles.heroSubtitle}>
          Platform Pembelajaran Interaktif Mata Pelajaran Informatika SMA/SMK
        </Text>
      </View>

      {/* Feature Highlights */}
      <View style={styles.featuresBox}>
        <View style={styles.featureItem}>
          <View style={[styles.featureIcon, { backgroundColor: '#DBEAFE' }]}>
            <BookOpen size={20} color={Colors.primary} />
          </View>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>9 Topik Informatika Lengkap</Text>
            <Text style={styles.featureDesc}>
              Dari Berpikir Komputasional, Pemrograman, Basis Data hingga Kecerdasan Buatan.
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <View style={[styles.featureIcon, { backgroundColor: '#DCFCE7' }]}>
            <Sparkles size={20} color={Colors.success} />
          </View>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Kuis Interaktif & Penilaian Otomatis</Text>
            <Text style={styles.featureDesc}>
              Evaluasi dengan timer, beragam jenis soal, dan penilaian aman di server.
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <View style={[styles.featureIcon, { backgroundColor: '#EDE9FE' }]}>
            <ShieldCheck size={20} color="#7C3AED" />
          </View>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Dua Role: Guru & Siswa</Text>
            <Text style={styles.featureDesc}>
              Portal khusus guru untuk mengelola materi/kuis dan portal siswa untuk belajar.
            </Text>
          </View>
        </View>
      </View>

      {/* Auth Action Cards */}
      <View style={styles.authActions}>
        <Text style={styles.sectionTitle}>Pilih Peran untuk Masuk</Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push({ pathname: '/(auth)/login', params: { defaultRole: 'siswa' } })}
          style={[styles.roleCard, Shadows.card]}
        >
          <View style={[styles.roleIcon, { backgroundColor: Colors.primaryLight }]}>
            <GraduationCap size={28} color={Colors.primary} />
          </View>
          <View style={styles.roleInfo}>
            <Text style={styles.roleTitle}>Masuk sebagai Siswa</Text>
            <Text style={styles.roleSubtitle}>Akses materi pelajaran, kuis, dan pantau nilai</Text>
          </View>
          <ArrowRight size={20} color={Colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push({ pathname: '/(auth)/login', params: { defaultRole: 'guru' } })}
          style={[styles.roleCard, Shadows.card]}
        >
          <View style={[styles.roleIcon, { backgroundColor: '#FEF3C7' }]}>
            <Laptop size={28} color="#D97706" />
          </View>
          <View style={styles.roleInfo}>
            <Text style={styles.roleTitle}>Masuk sebagai Guru</Text>
            <Text style={styles.roleSubtitle}>Kelola materi, kuis, dan analisis hasil belajar</Text>
          </View>
          <ArrowRight size={20} color="#D97706" />
        </TouchableOpacity>
      </View>

      {/* Registration Link */}
      <View style={styles.registerPrompt}>
        <Text style={styles.registerPromptText}>Belum memiliki akun?</Text>
        <TouchableOpacity
          onPress={() => router.push('/(auth)/register-siswa')}
          style={{ paddingVertical: 4 }}
        >
          <Text style={styles.registerLink}>Daftar Akun Siswa Baru</Text>
        </TouchableOpacity>
      </View>

      {/* Instant Demo Access (Super useful for quick evaluation) */}
      <View style={styles.demoSection}>
        <Text style={styles.demoTitle}>— Akses Demo Cepat (Uji Langsung) —</Text>
        <View style={styles.demoBtnRow}>
          <Button
            title="Demo Guru"
            variant="outline"
            size="sm"
            onPress={() => handleDemoLogin('guru')}
            style={styles.demoBtn}
          />
          <Button
            title="Demo Siswa"
            variant="outline"
            size="sm"
            onPress={() => handleDemoLogin('siswa')}
            style={styles.demoBtn}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: Spacing.xl,
    paddingTop: Spacing.xxxl,
    paddingBottom: Spacing.xxxl * 2,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1.5,
    borderColor: Colors.primaryBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
  },
  featuresBox: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  featureDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  authActions: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  roleIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  roleSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  registerPrompt: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  registerPromptText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 2,
  },
  demoSection: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  demoBtnRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  demoBtn: {
    flex: 1,
  },
});
