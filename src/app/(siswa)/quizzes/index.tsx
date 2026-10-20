import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useAuth } from '../../../features/auth/AuthContext';
import { QuizzesService } from '../../../features/quizzes/quizzesService';
import { QuizCard } from '../../../features/quizzes/QuizCard';
import { Quiz } from '../../../types/quizzes';
import { Colors } from '../../../constants/colors';
import { Spacing } from '../../../constants/theme';
import { EmptyState } from '../../../components/EmptyState';
import { LoadingSpinner } from '../../../components/LoadingSpinner';

export default function SiswaQuizzesScreen() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadQuizzes = async () => {
    try {
      const studentId = user?.id || 'siswa-demo-001';
      const list = await QuizzesService.getAll({ publishedOnly: true }, studentId);
      setQuizzes(list);
    } catch (e) {
      console.error('Error fetching quizzes:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadQuizzes();
    }, [user])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadQuizzes();
  };

  if (loading && !refreshing) {
    return <LoadingSpinner message="Memuat daftar kuis evaluasi..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kuis & Evaluasi</Text>
        <Text style={styles.headerSubtitle}>
          Uji pemahaman topik informatika dan raih nilai terbaikmu
        </Text>
      </View>

      {quizzes.length === 0 ? (
        <EmptyState
          title="Tidak Ada Kuis Aktif"
          description="Saat ini belum ada paket kuis yang ditugaskan oleh guru."
        />
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {quizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              onPress={() =>
                router.push({
                  pathname: '/(siswa)/quizzes/[id]/start',
                  params: { id: quiz.id },
                })
              }
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl * 2,
  },
});
