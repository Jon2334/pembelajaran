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
import { Plus, HelpCircle, BarChart3, Edit3, Trash2, Clock, Award } from 'lucide-react-native';
import { QuizzesService } from '../../../features/quizzes/quizzesService';
import { Quiz } from '../../../types/quizzes';
import { Colors } from '../../../constants/colors';
import { BorderRadius, Shadows, Spacing } from '../../../constants/theme';
import { Button } from '../../../components/Button';
import { Badge } from '../../../components/Badge';
import { ConfirmModal } from '../../../components/ConfirmModal';
import { EmptyState } from '../../../components/EmptyState';
import { LoadingSpinner } from '../../../components/LoadingSpinner';

export default function GuruQuizzesScreen() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Delete modal state
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadQuizzes = async () => {
    try {
      const list = await QuizzesService.getAll();
      setQuizzes(list);
    } catch (e) {
      console.error('Error fetching quizzes', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadQuizzes();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadQuizzes();
  };

  const handleDeletePrompt = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedQuiz) return;
    setDeleting(true);
    try {
      await QuizzesService.deleteQuiz(selectedQuiz.id);
      setDeleteModalVisible(false);
      setSelectedQuiz(null);
      loadQuizzes();
    } catch (e) {
      console.error('Failed to delete quiz', e);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.titleWrap}>
          <Text style={styles.pageTitle}>Manajemen Kuis</Text>
          <Text style={styles.pageSubtitle}>
            Evaluasi pembelajaran & penilaian otomatis ({quizzes.length} kuis)
          </Text>
        </View>
        <Button
          title="Buat Kuis"
          size="sm"
          onPress={() => router.push('/(guru)/quizzes/new')}
          icon={<Plus size={16} color={Colors.textInverse} />}
        />
      </View>

      {loading && !refreshing ? (
        <LoadingSpinner message="Memuat daftar kuis..." />
      ) : quizzes.length === 0 ? (
        <EmptyState
          title="Belum Ada Kuis"
          description="Buat paket kuis dan soal evaluasi untuk menguji pemahaman siswa informatika."
          actionLabel="+ Buat Kuis Baru"
          onAction={() => router.push('/(guru)/quizzes/new')}
        />
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {quizzes.map((quiz) => (
            <View key={quiz.id} style={[styles.card, Shadows.card]}>
              <View style={styles.cardHeader}>
                <Badge label={quiz.category} category={quiz.category} size="sm" />
                <Badge
                  label={quiz.status === 'published' ? 'Terbit' : 'Draf'}
                  status={quiz.status}
                  size="sm"
                />
              </View>

              <Text style={styles.title}>{quiz.title}</Text>
              <Text style={styles.description} numberOfLines={2}>
                {quiz.description}
              </Text>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Clock size={14} color={Colors.textSecondary} />
                  <Text style={styles.metaText}>{quiz.time_limit_minutes} Menit</Text>
                </View>
                <View style={styles.metaItem}>
                  <HelpCircle size={14} color={Colors.textSecondary} />
                  <Text style={styles.metaText}>{quiz.questions_count || 5} Butir Soal</Text>
                </View>
                <View style={styles.metaItem}>
                  <Award size={14} color={Colors.textSecondary} />
                  <Text style={styles.metaText}>KKM: {quiz.passing_grade}</Text>
                </View>
              </View>

              <View style={styles.cardActions}>
                <Button
                  title="Lihat Hasil Siswa"
                  variant="outline"
                  size="sm"
                  onPress={() =>
                    router.push({
                      pathname: '/(guru)/quizzes/[id]/results',
                      params: { id: quiz.id },
                    })
                  }
                  icon={<BarChart3 size={15} color={Colors.primary} />}
                  style={{ flex: 1 }}
                />

                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: '/(guru)/quizzes/[id]/edit',
                      params: { id: quiz.id },
                    })
                  }
                  style={styles.iconBtn}
                >
                  <Edit3 size={18} color={Colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleDeletePrompt(quiz)}
                  style={styles.iconBtn}
                >
                  <Trash2 size={18} color={Colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        visible={deleteModalVisible}
        title="Hapus Paket Kuis?"
        message={`Kuis "${selectedQuiz?.title}" beserta seluruh data butir soal dan riwayat nilai siswa terkait akan dihapus secara permanen.`}
        confirmLabel="Hapus Kuis"
        cancelLabel="Batal"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
        loading={deleting}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  titleWrap: {},
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  pageSubtitle: {
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
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconBtn: {
    padding: 8,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.secondaryLight,
  },
});
