import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../../features/auth/AuthContext';
import { QuizzesService } from '../../../features/quizzes/quizzesService';
import { QuizForm } from '../../../features/quizzes/QuizForm';
import { Header } from '../../../components/Header';
import { Quiz, QuizQuestion } from '../../../types/quizzes';
import { Colors } from '../../../constants/colors';

export default function NewQuizScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    quizData: Omit<Quiz, 'id' | 'created_at' | 'updated_at'>,
    questions: QuizQuestion[]
  ) => {
    setLoading(true);
    try {
      await QuizzesService.saveQuiz(
        {
          ...quizData,
          teacher_id: user?.id || 'guru-demo-001',
        },
        questions
      );
      router.back();
    } catch (e: any) {
      Alert.alert('Gagal', e.message || 'Gagal menyimpan kuis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Buat Paket Kuis Baru" showBack onBack={() => router.back()} />
      <QuizForm
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        loading={loading}
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
