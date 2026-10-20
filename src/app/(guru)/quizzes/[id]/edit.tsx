import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { QuizzesService } from '../../../../features/quizzes/quizzesService';
import { QuizForm } from '../../../../features/quizzes/QuizForm';
import { Header } from '../../../../components/Header';
import { LoadingSpinner } from '../../../../components/LoadingSpinner';
import { Quiz, QuizQuestion } from '../../../../types/quizzes';
import { Colors } from '../../../../constants/colors';

export default function EditQuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loadingFetch, setLoadingFetch] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadQuizAndQuestions = async (quizId: string) => {
    try {
      const qData = await QuizzesService.getById(quizId);
      const qQuestions = await QuizzesService.getQuestions(quizId, false);
      setQuiz(qData);
      setQuestions(qQuestions);
    } catch (e) {
      console.error('Error fetching quiz and questions', e);
    } finally {
      setLoadingFetch(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadQuizAndQuestions(id);
    }
  }, [id]);

  const handleUpdate = async (
    quizData: Omit<Quiz, 'id' | 'created_at' | 'updated_at'>,
    updatedQuestions: QuizQuestion[]
  ) => {
    if (!id) return;
    setSaving(true);
    try {
      await QuizzesService.saveQuiz(
        {
          ...quizData,
          id,
        },
        updatedQuestions
      );
      router.back();
    } catch (e: any) {
      Alert.alert('Gagal', e.message || 'Gagal memperbarui kuis');
    } finally {
      setSaving(false);
    }
  };

  if (loadingFetch) {
    return <LoadingSpinner message="Memuat kuis dan butir soal..." />;
  }

  if (!quiz) {
    return (
      <View style={styles.container}>
        <Header title="Edit Kuis" showBack onBack={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Edit Kuis & Butir Soal" showBack onBack={() => router.back()} />
      <QuizForm
        initialQuiz={quiz}
        initialQuestions={questions}
        onSubmit={handleUpdate}
        onCancel={() => router.back()}
        loading={saving}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
