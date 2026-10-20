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
  HelpCircle,
  Award,
  ChevronRight,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react-native';
import { useAuth } from '../../features/auth/AuthContext';
import { MaterialsService } from '../../features/materials/materialsService';
import { QuizzesService } from '../../features/quizzes/quizzesService';
import { LearningMaterial } from '../../types/materials';
import { Quiz, QuizAttempt } from '../../types/quizzes';
import { Colors } from '../../constants/colors';
import { BorderRadius, Shadows, Spacing } from '../../constants/theme';
import { ProgressBar } from '../../components/ProgressBar';
import { Badge } from '../../components/Badge';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export default function SiswaDashboardScreen() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStudentData = async () => {
    try {
      const studentId = user?.id || 'siswa-demo-001';
      const [mats, qzs, atts] = await Promise.all([
        MaterialsService.getAll({ publishedOnly: true }, studentId),
        QuizzesService.getAll({ publishedOnly: true }, studentId),
        QuizzesService.getAttemptsByStudentId(studentId),
      ]);

      setMaterials(mats);
      setQuizzes(qzs);
      setAttempts(atts);
    } catch (e) {
      console.error('Error loading student dashboard:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadStudentData();
    }, [user])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadStudentData();
  };

  if (loading && !refreshing) {
    return <LoadingSpinner message="Menyiapkan ruang belajarmu..." />;
  }

  const completedMaterialsCount = materials.filter((m) => m.is_completed).length;
  const progressPercent =
    materials.length > 0 ? (completedMaterialsCount / materials.length) * 100 : 0;

  const pendingQuizzes = quizzes.filter(
    (q) => q.user_best_score === undefined || q.user_best_score === null
  );

  const scores = attempts.map((a) => a.score);
  const averageScore =
    scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
  const latestAttempt = attempts.length > 0 ? attempts[0] : null;

  // Recommended materials: materials not completed yet
  const recommendedMaterials = materials
    .filter((m) => !m.is_completed)
    .slice(0, 3);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header Greeting Banner */}
      <View style={[styles.welcomeBanner, Shadows.card]}>
        <View style={styles.welcomeTextWrap}>
          <Text style={styles.classBadge}>{user?.class_code || 'X-RPL-1'}</Text>
          <Text style={styles.welcomeTitle}>Halo, {user?.full_name || 'Siswa'} 👋</Text>
          <Text style={styles.welcomeSubtitle}>
            Siap mempelajari materi informatika baru hari ini?
          </Text>
        </View>

        {/* Learning Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Progres Belajar Mandiri</Text>
            <Text style={styles.progressFraction}>
              {completedMaterialsCount} dari {materials.length} Selesai
            </Text>
          </View>
          <ProgressBar progress={progressPercent} height={10} color={Colors.primary} />
        </View>
      </View>

      {/* Stats Summary Row */}
      <View style={styles.quickStatsRow}>
        <View style={[styles.statBox, Shadows.card]}>
          <View style={[styles.statIcon, { backgroundColor: '#DCFCE7' }]}>
            <CheckCircle2 size={18} color={Colors.success} />
          </View>
          <Text style={styles.statValue}>{completedMaterialsCount}</Text>
          <Text style={styles.statLabel}>Materi Tuntas</Text>
        </View>

        <View style={[styles.statBox, Shadows.card]}>
          <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
            <HelpCircle size={18} color="#D97706" />
          </View>
          <Text style={styles.statValue}>{pendingQuizzes.length}</Text>
          <Text style={styles.statLabel}>Kuis Tersedia</Text>
        </View>

        <View style={[styles.statBox, Shadows.card]}>
          <View style={[styles.statIcon, { backgroundColor: '#EFF6FF' }]}>
            <Award size={18} color={Colors.primary} />
          </View>
          <Text style={styles.statValue}>{averageScore !== null ? averageScore : '-'}</Text>
          <Text style={styles.statLabel}>Rata-Rata Nilai</Text>
        </View>
      </View>

      {/* Latest Score Card */}
      {latestAttempt && (
        <View style={[styles.latestScoreCard, Shadows.card]}>
          <View style={styles.latestScoreLeft}>
            <Text style={styles.latestScoreTitle}>Nilai Kuis Terakhir</Text>
            <Text style={styles.latestScoreQuiz} numberOfLines={1}>
              {latestAttempt.quiz_title}
            </Text>
            <Text style={styles.latestScoreDate}>
              {new Date(latestAttempt.completed_at).toLocaleDateString('id-ID')}
            </Text>
          </View>
          <View style={styles.latestScoreRight}>
            <Text
              style={[
                styles.latestScoreVal,
                { color: latestAttempt.is_passed ? Colors.successText : Colors.dangerText },
              ]}
            >
              {latestAttempt.score}
            </Text>
            <Badge
              label={latestAttempt.is_passed ? 'LULUS' : 'REMEDIAL'}
              isPassed={latestAttempt.is_passed}
              size="sm"
            />
          </View>
        </View>
      )}

      {/* Active / Pending Quizzes */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Kuis Tersedia</Text>
        <TouchableOpacity onPress={() => router.push('/(siswa)/quizzes')}>
          <Text style={styles.seeAllText}>Lihat Semua</Text>
        </TouchableOpacity>
      </View>

      {quizzes.slice(0, 2).map((quiz) => (
        <TouchableOpacity
          key={quiz.id}
          activeOpacity={0.75}
          onPress={() =>
            router.push({
              pathname: '/(siswa)/quizzes/[id]/start',
              params: { id: quiz.id },
            })
          }
          style={[styles.quizCard, Shadows.card]}
        >
          <View style={styles.quizCardTop}>
            <Badge label={quiz.category} category={quiz.category} size="sm" />
            {quiz.user_best_score !== undefined && quiz.user_best_score !== null ? (
              <Badge
                label={`Nilai: ${quiz.user_best_score}`}
                isPassed={quiz.user_has_passed}
                size="sm"
              />
            ) : (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingBadgeText}>Belum Dikerjakan</Text>
              </View>
            )}
          </View>

          <Text style={styles.quizTitle} numberOfLines={2}>
            {quiz.title}
          </Text>

          <View style={styles.quizMeta}>
            <View style={styles.quizMetaItem}>
              <Clock size={13} color={Colors.textSecondary} />
              <Text style={styles.quizMetaText}>{quiz.time_limit_minutes} Menit</Text>
            </View>
            <View style={styles.quizMetaItem}>
              <Award size={13} color={Colors.textSecondary} />
              <Text style={styles.quizMetaText}>KKM: {quiz.passing_grade}</Text>
            </View>
            <View style={styles.quizArrow}>
              <Text style={styles.startQuizText}>Mulai Kuis</Text>
              <ArrowRight size={14} color={Colors.primary} />
            </View>
          </View>
        </TouchableOpacity>
      ))}

      {/* Recommended Learning Materials */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Materi Rekomendasi Belajar</Text>
        <TouchableOpacity onPress={() => router.push('/(siswa)/materials')}>
          <Text style={styles.seeAllText}>Lihat Semua</Text>
        </TouchableOpacity>
      </View>

      {recommendedMaterials.map((mat) => (
        <TouchableOpacity
          key={mat.id}
          activeOpacity={0.75}
          onPress={() =>
            router.push({
              pathname: '/(siswa)/materials/[id]',
              params: { id: mat.id },
            })
          }
          style={[styles.matCard, Shadows.card]}
        >
          <View style={styles.matTop}>
            <Badge label={mat.category} category={mat.category} size="sm" />
            <Badge label={mat.difficulty} difficulty={mat.difficulty} size="sm" />
          </View>

          <Text style={styles.matTitle} numberOfLines={2}>
            {mat.title}
          </Text>

          <View style={styles.matFooter}>
            <View style={styles.metaRow}>
              <Clock size={13} color={Colors.textMuted} />
              <Text style={styles.timeText}>{mat.reading_time_minutes} mnt baca</Text>
            </View>
            <View style={styles.learnAction}>
              <Text style={styles.learnText}>Buka Materi</Text>
              <ChevronRight size={15} color={Colors.primary} />
            </View>
          </View>
        </TouchableOpacity>
      ))}
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
  welcomeBanner: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  welcomeTextWrap: {
    marginBottom: Spacing.md,
  },
  classBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  progressCard: {
    backgroundColor: Colors.secondaryLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  progressFraction: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  quickStatsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  latestScoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  latestScoreLeft: {
    flex: 1,
  },
  latestScoreTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  latestScoreQuiz: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginVertical: 2,
  },
  latestScoreDate: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  latestScoreRight: {
    alignItems: 'flex-end',
    marginLeft: Spacing.md,
  },
  latestScoreVal: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  quizCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  quizCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  pendingBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  pendingBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.primary,
  },
  quizTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  quizMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  quizMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: Spacing.md,
  },
  quizMetaText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  quizArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
  },
  startQuizText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  matCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  matTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  matTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 20,
    marginVertical: 4,
  },
  matFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  learnAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  learnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
});
