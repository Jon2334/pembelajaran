import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Clock,
  ChevronLeft,
  Send,
  CheckCircle2,
  Circle,
} from 'lucide-react-native';
import { useAuth } from '../../../../features/auth/AuthContext';
import { QuizzesService, StudentSubmission } from '../../../../features/quizzes/quizzesService';
import { Header } from '../../../../components/Header';
import { Button } from '../../../../components/Button';
import { ConfirmModal } from '../../../../components/ConfirmModal';
import { LoadingSpinner } from '../../../../components/LoadingSpinner';
import { Quiz, QuizQuestion } from '../../../../types/quizzes';
import { Colors } from '../../../../constants/colors';
import { BorderRadius, Shadows, Spacing } from '../../../../constants/theme';

export default function TakeQuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, StudentSubmission>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(15 * 60);
  const [durationPassed, setDurationPassed] = useState<number>(0);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  const timerRef = useRef<any>(null);

  const startTimer = (initialSeconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);

    let currentSec = initialSeconds;
    let passed = 0;

    timerRef.current = setInterval(() => {
      currentSec -= 1;
      passed += 1;
      setSecondsRemaining(currentSec);
      setDurationPassed(passed);

      if (currentSec <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        handleForceSubmit();
      }
    }, 1000);
  };

  const loadQuizAndQuestions = async (quizId: string) => {
    try {
      const q = await QuizzesService.getById(quizId);
      // NOTE: Passing true explicitly hides the correct answers from the client during taking!
      const qList = await QuizzesService.getQuestions(quizId, true);

      setQuiz(q);
      setQuestions(qList);

      const totalSec = (q?.time_limit_minutes || 15) * 60;
      setSecondsRemaining(totalSec);

      startTimer(totalSec);
    } catch (e) {
      console.error('Error initializing quiz', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadQuizAndQuestions(id);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [id]);

  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        question_id: questionId,
        selected_option_id: optionId,
      },
    }));
  };

  const handleTextAnswerChange = (questionId: string, text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        question_id: questionId,
        short_answer_text: text,
      },
    }));
  };

  const handleForceSubmit = async () => {
    Alert.alert('Waktu Habis!', 'Batas waktu ujian telah berakhir. Jawaban Anda akan dikumpulkan.');
    await executeSubmission();
  };

  const executeSubmission = async () => {
    if (submitting || !quiz) return;
    setSubmitting(true);

    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const studentId = user?.id || 'siswa-demo-001';
      const studentName = user?.full_name || 'Siswa';
      const submissionList: StudentSubmission[] = questions.map((q) => {
        return (
          answers[q.id] || {
            question_id: q.id,
            selected_option_id: null,
            short_answer_text: null,
          }
        );
      });

      const { attempt } = await QuizzesService.submitAndGradeQuiz(
        quiz.id,
        studentId,
        studentName,
        submissionList,
        durationPassed || 60
      );

      setConfirmModalVisible(false);
      router.replace({
        pathname: '/(siswa)/quizzes/[id]/result',
        params: { id: quiz.id, attemptId: attempt.id },
      });
    } catch (err: any) {
      Alert.alert('Gagal Mengumpulkan', err.message || 'Terjadi kesalahan saat menilai.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Menyiapkan lembar soal..." />;
  }

  if (!quiz || questions.length === 0) {
    return (
      <View style={styles.container}>
        <Header title="Pengerjaan Kuis" showBack onBack={() => router.back()} />
        <Text style={{ padding: Spacing.xl, textAlign: 'center' }}>Soal kuis tidak tersedia.</Text>
      </View>
    );
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const isLastQuestion = currentIndex === questions.length - 1;

  // Format timer MM:SS
  const mins = Math.floor(Math.max(0, secondsRemaining) / 60);
  const secs = Math.max(0, secondsRemaining) % 60;
  const timerStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const isTimeRunningLow = secondsRemaining < 120; // less than 2 minutes

  return (
    <View style={styles.container}>
      {/* Top Bar with Timer and Progress */}
      <View style={styles.topBar}>
        <View style={styles.quizInfoMini}>
          <Text style={styles.miniTitle} numberOfLines={1}>
            {quiz.title}
          </Text>
          <Text style={styles.miniProgress}>
            Soal {currentIndex + 1} dari {questions.length} • Terjawab {answeredCount}/{questions.length}
          </Text>
        </View>

        {/* Timer Box */}
        <View style={[styles.timerPill, isTimeRunningLow && styles.timerPillDanger]}>
          <Clock size={15} color={isTimeRunningLow ? Colors.dangerText : Colors.primary} />
          <Text style={[styles.timerText, isTimeRunningLow && styles.timerTextDanger]}>
            {timerStr}
          </Text>
        </View>
      </View>

      {/* Question Numbers Quick Bar */}
      <View style={styles.numberBarContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.numberBarScroll}>
          {questions.map((q, idx) => {
            const isAnswered = Boolean(answers[q.id]);
            const isCurrent = idx === currentIndex;
            return (
              <TouchableOpacity
                key={q.id}
                onPress={() => setCurrentIndex(idx)}
                style={[
                  styles.numButton,
                  isAnswered && styles.numButtonAnswered,
                  isCurrent && styles.numButtonCurrent,
                ]}
              >
                <Text
                  style={[
                    styles.numButtonText,
                    isAnswered && styles.numButtonTextAnswered,
                    isCurrent && styles.numButtonTextCurrent,
                  ]}
                >
                  {idx + 1}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Question Card */}
      <ScrollView style={styles.mainScroll} contentContainerStyle={styles.mainContent}>
        <View style={[styles.questionCard, Shadows.card]}>
          <View style={styles.questionHeader}>
            <View style={styles.qBadge}>
              <Text style={styles.qBadgeText}>Nomor {currentIndex + 1}</Text>
            </View>
            <Text style={styles.pointsText}>Bobot: {currentQuestion.points || 20} Poin</Text>
          </View>

          <Text style={styles.questionPrompt}>{currentQuestion.question_text}</Text>

          {/* Multiple Choice Options */}
          {currentQuestion.question_type === 'multiple_choice' && currentQuestion.options && (
            <View style={styles.optionsList}>
              {currentQuestion.options.map((opt) => {
                const isSelected = answers[currentQuestion.id]?.selected_option_id === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    activeOpacity={0.8}
                    onPress={() => handleSelectOption(currentQuestion.id, opt.id)}
                    style={[
                      styles.optionCard,
                      isSelected && styles.optionCardSelected,
                    ]}
                  >
                    <View
                      style={[
                        styles.optionKeyCircle,
                        isSelected && styles.optionKeyCircleSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionKeyText,
                          isSelected && styles.optionKeyTextSelected,
                        ]}
                      >
                        {opt.option_key}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.optionLabel,
                        isSelected && styles.optionLabelSelected,
                      ]}
                    >
                      {opt.option_text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* True / False Options */}
          {currentQuestion.question_type === 'true_false' && currentQuestion.options && (
            <View style={styles.tfContainer}>
              {currentQuestion.options.map((opt) => {
                const isSelected = answers[currentQuestion.id]?.selected_option_id === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    activeOpacity={0.8}
                    onPress={() => handleSelectOption(currentQuestion.id, opt.id)}
                    style={[
                      styles.tfButton,
                      isSelected && styles.tfButtonSelected,
                    ]}
                  >
                    {isSelected ? (
                      <CheckCircle2 size={20} color={Colors.primary} />
                    ) : (
                      <Circle size={20} color={Colors.textMuted} />
                    )}
                    <Text
                      style={[
                        styles.tfButtonText,
                        isSelected && styles.tfButtonTextSelected,
                      ]}
                    >
                      {opt.option_text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Short Answer Input */}
          {currentQuestion.question_type === 'short_answer' && (
            <View style={styles.shortAnswerContainer}>
              <Text style={styles.inputHelper}>Ketikkan jawaban singkat Anda di bawah ini:</Text>
              <TextInput
                placeholder="Tuliskan jawaban Anda di sini..."
                value={answers[currentQuestion.id]?.short_answer_text || ''}
                onChangeText={(text) => handleTextAnswerChange(currentQuestion.id, text)}
                style={styles.shortAnswerInput}
                autoCapitalize="none"
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Navigation Footer */}
      <View style={styles.navFooter}>
        <Button
          title="Sebelumnya"
          variant="outline"
          size="sm"
          onPress={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          icon={<ChevronLeft size={16} color={Colors.primary} />}
          style={styles.navBtn}
        />

        {isLastQuestion ? (
          <Button
            title="Kumpulkan"
            variant="primary"
            size="sm"
            onPress={() => setConfirmModalVisible(true)}
            icon={<Send size={15} color={Colors.textInverse} />}
            style={styles.navBtn}
          />
        ) : (
          <Button
            title="Selanjutnya"
            variant="primary"
            size="sm"
            onPress={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
            style={styles.navBtn}
          />
        )}
      </View>

      {/* Submission Confirmation Modal */}
      <ConfirmModal
        visible={confirmModalVisible}
        title="Kumpulkan Lembar Kuis?"
        message={`Anda telah menjawab ${answeredCount} dari ${questions.length} soal. Apakah Anda yakin ingin mengumpulkan jawaban Anda sekarang?`}
        confirmLabel="Ya, Kumpulkan Jawaban"
        cancelLabel="Periksa Lagi"
        confirmVariant="primary"
        onConfirm={executeSubmission}
        onCancel={() => setConfirmModalVisible(false)}
        loading={submitting}
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
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  quizInfoMini: {
    flex: 1,
    marginRight: Spacing.md,
  },
  miniTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  miniProgress: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primaryBorder,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  timerPillDanger: {
    backgroundColor: Colors.dangerLight,
    borderColor: '#FECACA',
  },
  timerText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  timerTextDanger: {
    color: Colors.dangerText,
  },
  numberBarContainer: {
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  numberBarScroll: {
    paddingHorizontal: Spacing.lg,
    gap: 8,
  },
  numButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.secondaryLight,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numButtonAnswered: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  numButtonCurrent: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  numButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  numButtonTextAnswered: {
    color: Colors.successText,
    fontWeight: '700',
  },
  numButtonTextCurrent: {
    color: Colors.textInverse,
    fontWeight: '800',
  },
  mainScroll: {
    flex: 1,
  },
  mainContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl * 2,
  },
  questionCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  qBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  qBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  questionPrompt: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  optionsList: {
    gap: Spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  optionCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  optionKeyCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  optionKeyCircleSelected: {
    backgroundColor: Colors.primary,
  },
  optionKeyText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  optionKeyTextSelected: {
    color: Colors.textInverse,
  },
  optionLabel: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
    lineHeight: 20,
  },
  optionLabelSelected: {
    fontWeight: '600',
    color: Colors.primary,
  },
  tfContainer: {
    gap: Spacing.md,
  },
  tfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  tfButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  tfButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  tfButtonTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  shortAnswerContainer: {
    marginTop: Spacing.xs,
  },
  inputHelper: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  shortAnswerInput: {
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 15,
    color: Colors.text,
  },
  navFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.md,
  },
  navBtn: {
    flex: 1,
  },
});
