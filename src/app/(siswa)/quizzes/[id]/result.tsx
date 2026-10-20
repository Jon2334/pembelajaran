import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  BookOpen,
} from 'lucide-react-native';
import { QuizzesService } from '../../../../features/quizzes/quizzesService';
import { Header } from '../../../../components/Header';
import { Button } from '../../../../components/Button';
import { Badge } from '../../../../components/Badge';
import { LoadingSpinner } from '../../../../components/LoadingSpinner';
import { QuizAttempt, QuizAnswer } from '../../../../types/quizzes';
import { Colors } from '../../../../constants/colors';
import { BorderRadius, Shadows, Spacing } from '../../../../constants/theme';

export default function QuizResultScreen() {
  const { attemptId } = useLocalSearchParams<{ id: string; attemptId: string }>();
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAttemptData = async (attId: string) => {
    try {
      const data = await QuizzesService.getAttemptById(attId);
      setAttempt(data.attempt);
      setAnswers(data.answers);
    } catch (e) {
      console.error('Error fetching quiz result', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (attemptId) {
      loadAttemptData(attemptId);
    }
  }, [attemptId]);

  if (loading) {
    return <LoadingSpinner message="Menampilkan lembar hasil penilaian..." />;
  }

  if (!attempt) {
    return (
      <View style={styles.container}>
        <Header title="Hasil Evaluasi" showBack onBack={() => router.replace('/(siswa)/quizzes')} />
        <Text style={{ padding: Spacing.xl, textAlign: 'center' }}>Data hasil tidak ditemukan.</Text>
      </View>
    );
  }

  const correctAnswersCount = answers.filter((a) => a.is_correct).length;
  const incorrectAnswersCount = answers.length - correctAnswersCount;

  return (
    <View style={styles.container}>
      <Header
        title="Hasil Evaluasi Kuis"
        showBack
        onBack={() => router.replace('/(siswa)/quizzes')}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Score Hero Card */}
        <View style={[styles.scoreHeroCard, Shadows.card]}>
          <View
            style={[
              styles.scoreCircle,
              { borderColor: attempt.is_passed ? Colors.success : Colors.danger },
            ]}
          >
            <Text
              style={[
                styles.scoreNumber,
                { color: attempt.is_passed ? Colors.successText : Colors.dangerText },
              ]}
            >
              {attempt.score}
            </Text>
            <Text style={styles.scoreMax}>dari 100</Text>
          </View>

          <Text style={styles.resultTitle}>
            {attempt.is_passed
              ? 'Selamat! Anda Lulus Kuis'
              : 'Belum Mencapai Nilai Kelulusan'}
          </Text>

          <Text style={styles.resultSubtitle}>
            {attempt.is_passed
              ? 'Pemahaman Anda pada materi ini sudah sangat baik.'
              : `Nilai KKM kelulusan adalah ${attempt.passing_grade || 75}. Pelajari materi kembali dan coba lagi.`}
          </Text>

          <View style={styles.badgeRow}>
            <Badge
              label={attempt.is_passed ? 'STATUS: LULUS' : 'STATUS: REMEDIAL'}
              isPassed={attempt.is_passed}
              size="md"
            />
          </View>

          {/* Quick Metrics */}
          <View style={styles.metricsBar}>
            <View style={styles.metricItem}>
              <CheckCircle2 size={16} color={Colors.success} />
              <Text style={styles.metricVal}>{correctAnswersCount} Benar</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <XCircle size={16} color={Colors.danger} />
              <Text style={styles.metricVal}>{incorrectAnswersCount} Salah</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Clock size={16} color={Colors.primary} />
              <Text style={styles.metricVal}>
                {Math.round(attempt.duration_seconds / 60)} Menit
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsRow}>
          <Button
            title="Ulangi Kuis"
            variant="outline"
            size="md"
            onPress={() =>
              router.replace({
                pathname: '/(siswa)/quizzes/[id]/start',
                params: { id: attempt.quiz_id },
              })
            }
            icon={<RotateCcw size={16} color={Colors.primary} />}
            style={styles.actionBtn}
          />
          <Button
            title="Pelajari Materi Terkait"
            variant="primary"
            size="md"
            onPress={() => router.push('/(siswa)/materials')}
            icon={<BookOpen size={16} color={Colors.textInverse} />}
            style={styles.actionBtn}
          />
        </View>

        {/* Question Review & Explanations */}
        <Text style={styles.sectionHeading}>Pembahasan Butir Soal & Kunci Jawaban:</Text>

        {answers.map((ans, idx) => (
          <View key={ans.id || idx} style={[styles.reviewCard, Shadows.card]}>
            <View style={styles.reviewHeader}>
              <View style={styles.qNumBox}>
                <Text style={styles.qNumText}>No. {idx + 1}</Text>
              </View>

              <View
                style={[
                  styles.statusPill,
                  {
                    backgroundColor: ans.is_correct
                      ? Colors.successLight
                      : Colors.dangerLight,
                  },
                ]}
              >
                {ans.is_correct ? (
                  <CheckCircle2 size={14} color={Colors.successText} />
                ) : (
                  <XCircle size={14} color={Colors.dangerText} />
                )}
                <Text
                  style={[
                    styles.statusPillText,
                    { color: ans.is_correct ? Colors.successText : Colors.dangerText },
                  ]}
                >
                  {ans.is_correct ? `Benar (+${ans.points_earned} Poin)` : 'Salah (0 Poin)'}
                </Text>
              </View>
            </View>

            <Text style={styles.reviewQuestion}>{ans.question?.question_text}</Text>

            <View style={styles.ansCompareBox}>
              <Text style={styles.ansCompareLabel}>Jawaban Anda:</Text>
              <Text
                style={[
                  styles.ansCompareValue,
                  { color: ans.is_correct ? Colors.successText : Colors.dangerText },
                ]}
              >
                {ans.short_answer_text ||
                  ans.selected_option?.option_text ||
                  '(Tidak dijawab)'}
              </Text>
            </View>

            {/* Explanation */}
            {ans.question?.explanation ? (
              <View style={styles.explanationBox}>
                <Text style={styles.explanationTitle}>Pembahasan Guru:</Text>
                <Text style={styles.explanationText}>{ans.question.explanation}</Text>
              </View>
            ) : null}
          </View>
        ))}
      </ScrollView>
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
  scoreHeroCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  scoreCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  scoreNumber: {
    fontSize: 36,
    fontWeight: '800',
  },
  scoreMax: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: -2,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
    marginBottom: Spacing.md,
  },
  badgeRow: {
    marginBottom: Spacing.lg,
  },
  metricsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    backgroundColor: Colors.secondaryLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricVal: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  metricDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.border,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  actionBtn: {
    flex: 1,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  reviewCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  qNumBox: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  qNumText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  reviewQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  ansCompareBox: {
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  ansCompareLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  ansCompareValue: {
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
    lineHeight: 18,
  },
});
