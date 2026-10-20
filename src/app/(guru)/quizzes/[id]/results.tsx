import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Award,
  CheckCircle2,
  XCircle,
  ChevronRight,
  TrendingUp,
  X,
} from 'lucide-react-native';
import { QuizzesService } from '../../../../features/quizzes/quizzesService';
import { Header } from '../../../../components/Header';
import { StatCard } from '../../../../components/StatCard';
import { Badge } from '../../../../components/Badge';
import { LoadingSpinner } from '../../../../components/LoadingSpinner';
import { EmptyState } from '../../../../components/EmptyState';
import { Quiz, QuizAttempt, QuizAnswer } from '../../../../types/quizzes';
import { Colors } from '../../../../constants/colors';
import { BorderRadius, Shadows, Spacing } from '../../../../constants/theme';

export default function QuizResultsAnalyticsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  // Student answer detail modal
  const [selectedAttempt, setSelectedAttempt] = useState<QuizAttempt | null>(null);
  const [attemptAnswers, setAttemptAnswers] = useState<QuizAnswer[]>([]);
  const [loadingAnswers, setLoadingAnswers] = useState(false);

  const loadResults = async (quizId: string) => {
    try {
      const q = await QuizzesService.getById(quizId);
      const atts = await QuizzesService.getAttemptsByQuizId(quizId);
      setQuiz(q);
      setAttempts(atts);
    } catch (e) {
      console.error('Error fetching quiz results:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadResults(id);
    }
  }, [id]);

  const handleOpenStudentDetail = async (att: QuizAttempt) => {
    setSelectedAttempt(att);
    setLoadingAnswers(true);
    try {
      const { answers } = await QuizzesService.getAttemptById(att.id);
      setAttemptAnswers(answers);
    } catch (e) {
      console.error('Error fetching attempt answers:', e);
    } finally {
      setLoadingAnswers(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Menghitung statistik penilaian otomatis..." />;
  }

  if (!quiz) {
    return (
      <View style={styles.container}>
        <Header title="Hasil Evaluasi Kuis" showBack onBack={() => router.back()} />
        <Text style={{ padding: Spacing.xl, textAlign: 'center' }}>Kuis tidak ditemukan.</Text>
      </View>
    );
  }

  const scores = attempts.map((a) => a.score);
  const averageScore =
    scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;
  const passedStudents = attempts.filter((a) => a.is_passed).length;
  const failedStudents = attempts.length - passedStudents;
  const passRate =
    attempts.length > 0 ? Math.round((passedStudents / attempts.length) * 100) : 0;

  return (
    <View style={styles.container}>
      <Header title="Analisis Hasil Kuis" subtitle={quiz.title} showBack onBack={() => router.back()} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Quiz Banner */}
        <View style={[styles.quizBanner, Shadows.card]}>
          <View style={styles.badgeRow}>
            <Badge label={quiz.category} category={quiz.category} size="sm" />
            <Badge label={`KKM: ${quiz.passing_grade}`} variant="primary" size="sm" />
          </View>
          <Text style={styles.bannerTitle}>{quiz.title}</Text>
          <Text style={styles.bannerDesc}>{quiz.description}</Text>
        </View>

        {/* Statistical Summary Grid */}
        <Text style={styles.sectionTitle}>Statistik Penilaian Otomatis</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatCard
              label="Rata-Rata Kelas"
              value={averageScore}
              sublabel={`Dari ${attempts.length} pengerjaan`}
              icon={<TrendingUp size={22} color={Colors.primary} />}
              iconBgColor={Colors.primaryLight}
            />
            <StatCard
              label="Tingkat Kelulusan"
              value={`${passRate}%`}
              sublabel={`${passedStudents} Lulus / ${failedStudents} Remedial`}
              icon={<CheckCircle2 size={22} color={Colors.success} />}
              iconBgColor={Colors.successLight}
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              label="Nilai Tertinggi"
              value={highestScore}
              sublabel="Skor maksimum"
              icon={<Award size={22} color="#D97706" />}
              iconBgColor="#FEF3C7"
            />
            <StatCard
              label="Nilai Terendah"
              value={lowestScore}
              sublabel="Skor minimum"
              icon={<XCircle size={22} color={Colors.danger} />}
              iconBgColor={Colors.dangerLight}
            />
          </View>
        </View>

        {/* Student Attempts Table */}
        <View style={styles.tableHeader}>
          <Text style={styles.sectionTitle}>Hasil Pengerjaan Siswa ({attempts.length})</Text>
        </View>

        {attempts.length === 0 ? (
          <EmptyState
            title="Belum Ada Hasil"
            description="Belum ada siswa yang mengumpulkan jawaban untuk kuis ini."
          />
        ) : (
          attempts.map((att, idx) => (
            <TouchableOpacity
              key={att.id || idx}
              activeOpacity={0.7}
              onPress={() => handleOpenStudentDetail(att)}
              style={[styles.attemptCard, Shadows.card]}
            >
              <View style={styles.attemptLeft}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>#{idx + 1}</Text>
                </View>
                <View style={styles.studentWrap}>
                  <Text style={styles.studentName}>{att.student_name || 'Siswa'}</Text>
                  <Text style={styles.attemptMeta}>
                    Selesai pada: {new Date(att.completed_at).toLocaleDateString('id-ID')} •{' '}
                    {Math.round(att.duration_seconds / 60)} menit
                  </Text>
                </View>
              </View>

              <View style={styles.attemptRight}>
                <Text
                  style={[
                    styles.studentScore,
                    { color: att.is_passed ? Colors.successText : Colors.dangerText },
                  ]}
                >
                  {att.score}
                </Text>
                <View
                  style={[
                    styles.passPill,
                    {
                      backgroundColor: att.is_passed
                        ? Colors.successLight
                        : Colors.dangerLight,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.passPillText,
                      { color: att.is_passed ? Colors.successText : Colors.dangerText },
                    ]}
                  >
                    {att.is_passed ? 'LULUS' : 'REMEDIAL'}
                  </Text>
                </View>
                <ChevronRight size={16} color={Colors.textMuted} style={{ marginLeft: 6 }} />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Student Detailed Answer Breakdown Modal */}
      <Modal
        visible={Boolean(selectedAttempt)}
        animationType="slide"
        onRequestClose={() => setSelectedAttempt(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Detail Jawaban Siswa</Text>
              <Text style={styles.modalSubtitle}>{selectedAttempt?.student_name}</Text>
            </View>
            <TouchableOpacity
              onPress={() => setSelectedAttempt(null)}
              style={styles.closeBtn}
            >
              <X size={22} color={Colors.text} />
            </TouchableOpacity>
          </View>

          {loadingAnswers ? (
            <LoadingSpinner message="Mengambil butir jawaban siswa..." />
          ) : (
            <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalContent}>
              <View style={styles.summaryBar}>
                <View style={styles.summaryBox}>
                  <Text style={styles.summaryLabel}>Nilai Akhir</Text>
                  <Text
                    style={[
                      styles.summaryValue,
                      {
                        color: selectedAttempt?.is_passed
                          ? Colors.successText
                          : Colors.dangerText,
                      },
                    ]}
                  >
                    {selectedAttempt?.score}
                  </Text>
                </View>
                <View style={styles.summaryBox}>
                  <Text style={styles.summaryLabel}>Total Poin</Text>
                  <Text style={styles.summaryValue}>
                    {selectedAttempt?.earned_points} / {selectedAttempt?.total_points}
                  </Text>
                </View>
                <View style={styles.summaryBox}>
                  <Text style={styles.summaryLabel}>Status</Text>
                  <Text
                    style={[
                      styles.summaryValue,
                      {
                        color: selectedAttempt?.is_passed
                          ? Colors.successText
                          : Colors.dangerText,
                      },
                    ]}
                  >
                    {selectedAttempt?.is_passed ? 'LULUS' : 'REMEDIAL'}
                  </Text>
                </View>
              </View>

              <Text style={styles.breakdownHeader}>Evaluasi Per Butir Soal:</Text>

              {attemptAnswers.map((ans, aIdx) => (
                <View key={ans.id || aIdx} style={styles.ansCard}>
                  <View style={styles.ansHeader}>
                    <View style={styles.ansNumberPill}>
                      <Text style={styles.ansNumberText}>Soal {aIdx + 1}</Text>
                    </View>
                    <View style={styles.ansStatusBadge}>
                      {ans.is_correct ? (
                        <CheckCircle2 size={16} color={Colors.success} />
                      ) : (
                        <XCircle size={16} color={Colors.danger} />
                      )}
                      <Text
                        style={[
                          styles.ansStatusText,
                          { color: ans.is_correct ? Colors.successText : Colors.dangerText },
                        ]}
                      >
                        {ans.is_correct ? `+${ans.points_earned} Poin (Benar)` : '0 Poin (Salah)'}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.qText}>{ans.question?.question_text}</Text>

                  {/* Student Answer */}
                  <View style={styles.ansBox}>
                    <Text style={styles.ansBoxLabel}>Jawaban Siswa:</Text>
                    <Text
                      style={[
                        styles.ansBoxValue,
                        { color: ans.is_correct ? Colors.successText : Colors.dangerText },
                      ]}
                    >
                      {ans.short_answer_text ||
                        ans.selected_option?.option_text ||
                        '(Tidak dijawab)'}
                    </Text>
                  </View>

                  {/* Explanation if available */}
                  {ans.question?.explanation ? (
                    <View style={styles.explanationBox}>
                      <Text style={styles.explanationTitle}>Pembahasan Kunci:</Text>
                      <Text style={styles.explanationText}>{ans.question.explanation}</Text>
                    </View>
                  ) : null}
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl * 2,
  },
  quizBanner: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  bannerDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  statsGrid: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  attemptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  attemptLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  studentWrap: {
    flex: 1,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  attemptMeta: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  attemptRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentScore: {
    fontSize: 18,
    fontWeight: '800',
    marginRight: 6,
  },
  passPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  passPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  modalSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  modalScroll: {
    flex: 1,
  },
  modalContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl * 2,
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  summaryBox: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  breakdownHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  ansCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  ansHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  ansNumberPill: {
    backgroundColor: Colors.secondaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  ansNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  ansStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ansStatusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  qText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  ansBox: {
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  ansBoxLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  ansBoxValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  explanationBox: {
    backgroundColor: Colors.primaryLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  explanationTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 2,
  },
  explanationText: {
    fontSize: 12,
    color: Colors.text,
    lineHeight: 17,
  },
});
