import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Clock, HelpCircle, Award, CheckCircle, AlertTriangle, Play } from 'lucide-react-native';
import { QuizzesService } from '../../../../features/quizzes/quizzesService';
import { Header } from '../../../../components/Header';
import { Badge } from '../../../../components/Badge';
import { Button } from '../../../../components/Button';
import { LoadingSpinner } from '../../../../components/LoadingSpinner';
import { Quiz } from '../../../../types/quizzes';
import { Colors } from '../../../../constants/colors';
import { BorderRadius, Shadows, Spacing } from '../../../../constants/theme';

export default function StartQuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);

  const loadQuiz = async (quizId: string) => {
    try {
      const data = await QuizzesService.getById(quizId);
      setQuiz(data);
    } catch (e) {
      console.error('Error fetching quiz info', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadQuiz(id);
    }
  }, [id]);

  if (loading) {
    return <LoadingSpinner message="Menyiapkan lembar evaluasi..." />;
  }

  if (!quiz) {
    return (
      <View style={styles.container}>
        <Header title="Mulai Kuis" showBack onBack={() => router.back()} />
        <Text style={{ padding: Spacing.xl, textAlign: 'center' }}>Kuis tidak ditemukan.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Aturan & Petunjuk Kuis" showBack onBack={() => router.back()} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Quiz Info Header Card */}
        <View style={[styles.mainCard, Shadows.card]}>
          <Badge label={quiz.category} category={quiz.category} size="sm" />
          <Text style={styles.title}>{quiz.title}</Text>
          <Text style={styles.desc}>{quiz.description}</Text>

          {/* Quick Metrics */}
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Clock size={20} color={Colors.primary} />
              <Text style={styles.metricVal}>{quiz.time_limit_minutes} Menit</Text>
              <Text style={styles.metricLabel}>Batas Waktu</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.metricItem}>
              <HelpCircle size={20} color="#7C3AED" />
              <Text style={styles.metricVal}>{quiz.questions_count || 5} Soal</Text>
              <Text style={styles.metricLabel}>Jumlah Butir</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.metricItem}>
              <Award size={20} color={Colors.success} />
              <Text style={styles.metricVal}>{quiz.passing_grade}</Text>
              <Text style={styles.metricLabel}>Nilai KKM</Text>
            </View>
          </View>
        </View>

        {/* Rules & Integrity Notice */}
        <View style={[styles.rulesCard, Shadows.card]}>
          <Text style={styles.rulesHeading}>Aturan Pengerjaan Kuis:</Text>

          <View style={styles.ruleRow}>
            <CheckCircle size={16} color={Colors.success} style={{ marginTop: 2 }} />
            <Text style={styles.ruleText}>
              Waktu hitung mundur akan berjalan secara otomatis saat kuis dimulai.
            </Text>
          </View>

          <View style={styles.ruleRow}>
            <CheckCircle size={16} color={Colors.success} style={{ marginTop: 2 }} />
            <Text style={styles.ruleText}>
              Jawaban sementara akan tersimpan secara otomatis jika Anda berpindah soal.
            </Text>
          </View>

          <View style={styles.ruleRow}>
            <CheckCircle size={16} color={Colors.success} style={{ marginTop: 2 }} />
            <Text style={styles.ruleText}>
              Jawaban akan dikoreksi dan dinilai secara otomatis di sisi server.
            </Text>
          </View>

          <View style={styles.ruleRow}>
            <AlertTriangle size={16} color="#D97706" style={{ marginTop: 2 }} />
            <Text style={styles.ruleText}>
              Jika waktu habis, lembar jawaban Anda akan otomatis dikumpulkan dan dinilai.
            </Text>
          </View>
        </View>

        {/* Action Button */}
        <Button
          title="Mulai Kerjakan Sekarang"
          size="lg"
          variant="primary"
          onPress={() =>
            router.push({
              pathname: '/(siswa)/quizzes/[id]/take',
              params: { id: quiz.id },
            })
          }
          icon={<Play size={18} color={Colors.textInverse} />}
          style={styles.startBtn}
        />
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
  mainCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    lineHeight: 28,
    marginVertical: Spacing.sm,
  },
  desc: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: Colors.secondaryLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 4,
  },
  metricLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.border,
  },
  rulesCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xl,
  },
  rulesHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  ruleText: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 18,
    flex: 1,
  },
  startBtn: {
    marginBottom: Spacing.xl,
  },
});
