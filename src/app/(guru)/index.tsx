import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import {
  Users,
  BookOpen,
  HelpCircle,
  Award,
  ChevronRight,
  CheckCircle2,
  XCircle,
} from 'lucide-react-native';
import { useAuth } from '../../features/auth/AuthContext';
import { LocalDataStore } from '../../lib/storage';
import { QuizSummaryStats, QuizAttempt } from '../../types/quizzes';
import { Colors } from '../../constants/colors';
import { BorderRadius, Shadows, Spacing } from '../../constants/theme';
import { StatCard } from '../../components/StatCard';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export default function GuruDashboardScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState<QuizSummaryStats | null>(null);
  const [recentAttempts, setRecentAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      const summary = await LocalDataStore.getTeacherStats(user?.id || 'guru-demo-001');
      const attempts = await LocalDataStore.getAttempts();
      setStats(summary);
      setRecentAttempts(attempts.slice(0, 5));
    } catch (e) {
      console.error('Error loading teacher stats:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [user])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  if (loading && !refreshing) {
    return <LoadingSpinner message="Memuat ringkasan guru..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header Greeting */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.badgeRole}>PORTAL GURU</Text>
          <Text style={styles.greetingTitle}>Selamat Datang,</Text>
          <Text style={styles.userName}>{user?.full_name || 'Bapak/Ibu Guru'}</Text>
          <Text style={styles.schoolName}>{user?.school_name || 'SMA Informatika'}</Text>
        </View>
      </View>

      {/* Quick Action Buttons */}
      <View style={styles.quickActionsRow}>
        <Button
          title="+ Materi Baru"
          variant="primary"
          size="sm"
          onPress={() => router.push('/(guru)/materials/new')}
          style={styles.actionBtn}
        />
        <Button
          title="+ Buat Kuis"
          variant="secondary"
          size="sm"
          onPress={() => router.push('/(guru)/quizzes/new')}
          style={styles.actionBtn}
        />
      </View>

      {/* Statistics Cards */}
      <Text style={styles.sectionTitle}>Ringkasan Pembelajaran</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statsRow}>
          <StatCard
            label="Total Siswa"
            value={stats?.total_students || 32}
            sublabel="2 Rombel Kelas"
            icon={<Users size={22} color={Colors.primary} />}
            iconBgColor={Colors.primaryLight}
          />
          <StatCard
            label="Total Materi"
            value={stats?.total_materials || 0}
            sublabel="Informatika"
            icon={<BookOpen size={22} color="#059669" />}
            iconBgColor="#DCFCE7"
          />
        </View>
        <View style={styles.statsRow}>
          <StatCard
            label="Total Kuis"
            value={stats?.total_quizzes || 0}
            sublabel="Evaluasi Aktif"
            icon={<HelpCircle size={22} color="#7C3AED" />}
            iconBgColor="#EDE9FE"
          />
          <StatCard
            label="Rata-Rata Nilai"
            value={stats?.average_score ? `${stats.average_score}` : '-'}
            sublabel={`${stats?.passed_count || 0} Siswa Lulus KKM`}
            icon={<Award size={22} color="#D97706" />}
            iconBgColor="#FEF3C7"
          />
        </View>
      </View>

      {/* Passing Performance Banner */}
      <View style={[styles.performanceCard, Shadows.card]}>
        <View style={styles.perfHeader}>
          <Text style={styles.perfTitle}>Kelulusan Evaluasi Siswa</Text>
          <Text style={styles.perfRatio}>
            {stats && stats.passed_count + stats.failed_count > 0
              ? `${Math.round((stats.passed_count / (stats.passed_count + stats.failed_count)) * 100)}%`
              : '100%'}
          </Text>
        </View>
        <View style={styles.perfBarTrack}>
          <View
            style={[
              styles.perfBarFill,
              {
                width:
                  stats && stats.passed_count + stats.failed_count > 0
                    ? `${(stats.passed_count / (stats.passed_count + stats.failed_count)) * 100}%`
                    : '100%',
              },
            ]}
          />
        </View>
        <View style={styles.perfLegend}>
          <View style={styles.legendItem}>
            <CheckCircle2 size={14} color={Colors.success} />
            <Text style={styles.legendText}>Lulus: {stats?.passed_count || 0} pengerjaan</Text>
          </View>
          <View style={styles.legendItem}>
            <XCircle size={14} color={Colors.danger} />
            <Text style={styles.legendText}>Remedial: {stats?.failed_count || 0} pengerjaan</Text>
          </View>
        </View>
      </View>

      {/* Recent Student Quiz Activity */}
      <View style={styles.recentSection}>
        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>Aktivitas Pengerjaan Kuis Terbaru</Text>
          <TouchableOpacity onPress={() => router.push('/(guru)/quizzes')}>
            <Text style={styles.seeAllText}>Semua Kuis</Text>
          </TouchableOpacity>
        </View>

        {recentAttempts.length === 0 ? (
          <View style={styles.emptyRecent}>
            <Text style={styles.emptyRecentText}>Belum ada pengerjaan kuis dari siswa.</Text>
          </View>
        ) : (
          recentAttempts.map((attempt) => (
            <TouchableOpacity
              key={attempt.id}
              activeOpacity={0.7}
              onPress={() =>
                router.push({
                  pathname: '/(guru)/quizzes/[id]/results',
                  params: { id: attempt.quiz_id },
                })
              }
              style={[styles.attemptItem, Shadows.card]}
            >
              <View style={styles.attemptInfo}>
                <Text style={styles.attemptStudent}>{attempt.student_name || 'Siswa'}</Text>
                <Text style={styles.attemptQuiz} numberOfLines={1}>
                  {attempt.quiz_title}
                </Text>
                <Text style={styles.attemptTime}>
                  Durasi: {Math.round(attempt.duration_seconds / 60)} menit
                </Text>
              </View>

              <View style={styles.attemptScoreBox}>
                <Text
                  style={[
                    styles.attemptScore,
                    { color: attempt.is_passed ? Colors.successText : Colors.dangerText },
                  ]}
                >
                  {attempt.score}
                </Text>
                <View
                  style={[
                    styles.passTag,
                    {
                      backgroundColor: attempt.is_passed
                        ? Colors.successLight
                        : Colors.dangerLight,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.passTagText,
                      { color: attempt.is_passed ? Colors.successText : Colors.dangerText },
                    ]}
                  >
                    {attempt.is_passed ? 'LULUS' : 'REMEDIAL'}
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} color={Colors.textMuted} style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          ))
        )}
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
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxxl * 2,
  },
  header: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  headerText: {},
  badgeRole: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  greetingTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  schoolName: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  actionBtn: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  statsGrid: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  performanceCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  perfHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  perfTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  perfRatio: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.success,
  },
  perfBarTrack: {
    height: 8,
    backgroundColor: Colors.dangerLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  perfBarFill: {
    height: '100%',
    backgroundColor: Colors.success,
    borderRadius: 4,
  },
  perfLegend: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  recentSection: {
    marginBottom: Spacing.xl,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  emptyRecent: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  emptyRecentText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  attemptItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  attemptInfo: {
    flex: 1,
  },
  attemptStudent: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  attemptQuiz: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginVertical: 2,
  },
  attemptTime: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  attemptScoreBox: {
    alignItems: 'flex-end',
    marginLeft: Spacing.sm,
  },
  attemptScore: {
    fontSize: 18,
    fontWeight: '800',
  },
  passTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginTop: 2,
  },
  passTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
