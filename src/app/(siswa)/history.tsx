import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { useAuth } from '../../features/auth/AuthContext';
import { QuizzesService } from '../../features/quizzes/quizzesService';
import { ScoreChart } from '../../features/results/ScoreChart';
import { Header } from '../../components/Header';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { QuizAttempt } from '../../types/quizzes';
import { Colors } from '../../constants/colors';
import { BorderRadius, Shadows, Spacing } from '../../constants/theme';

export default function SiswaHistoryScreen() {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = async () => {
    try {
      const studentId = user?.id || 'siswa-demo-001';
      const list = await QuizzesService.getAttemptsByStudentId(studentId);
      setAttempts(list);
    } catch (e) {
      console.error('Error fetching student quiz history', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [user])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  if (loading && !refreshing) {
    return <LoadingSpinner message="Memuat riwayat nilai kuis..." />;
  }

  return (
    <View style={styles.container}>
      <Header title="Riwayat & Grafik Nilai" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {attempts.length === 0 ? (
          <EmptyState
            title="Belum Ada Riwayat Kuis"
            description="Kamu belum menyelesaikan kuis apapun. Kerjakan kuis untuk melihat grafik perkembangan nilaimu di sini!"
            actionLabel="Lihat Kuis Tersedia"
            onAction={() => router.push('/(siswa)/quizzes')}
          />
        ) : (
          <>
            {/* Visual Performance Chart */}
            <ScoreChart attempts={attempts} />

            <Text style={styles.listHeader}>Daftar Hasil Pengerjaan ({attempts.length})</Text>

            {attempts.map((att) => (
              <TouchableOpacity
                key={att.id}
                activeOpacity={0.75}
                onPress={() =>
                  router.push({
                    pathname: '/(siswa)/quizzes/[id]/result',
                    params: { id: att.quiz_id, attemptId: att.id },
                  })
                }
                style={[styles.historyCard, Shadows.card]}
              >
                <View style={styles.cardLeft}>
                  <Text style={styles.quizTitle} numberOfLines={1}>
                    {att.quiz_title}
                  </Text>
                  <Text style={styles.quizDate}>
                    {new Date(att.completed_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}{' '}
                    • {Math.round(att.duration_seconds / 60)} menit
                  </Text>
                </View>

                <View style={styles.cardRight}>
                  <Text
                    style={[
                      styles.scoreText,
                      { color: att.is_passed ? Colors.successText : Colors.dangerText },
                    ]}
                  >
                    {att.score}
                  </Text>
                  <Badge
                    label={att.is_passed ? 'Lulus' : 'Remedial'}
                    isPassed={att.is_passed}
                    size="sm"
                  />
                  <ChevronRight size={16} color={Colors.textMuted} style={{ marginLeft: 6 }} />
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
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
  listHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  historyCard: {
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
  cardLeft: {
    flex: 1,
    marginRight: Spacing.md,
  },
  quizTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  quizDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '800',
    marginRight: 6,
  },
});
