import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Plus, Trash2, CheckCircle2, Circle, AlertCircle } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing } from '../../constants/theme';
import { INFORMATIKA_CATEGORIES } from '../../constants/categories';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Quiz, QuizQuestion, QuestionType, QuizOption } from '../../types/quizzes';
import { MaterialCategory } from '../../types/materials';

interface QuizFormProps {
  initialQuiz?: Partial<Quiz>;
  initialQuestions?: QuizQuestion[];
  teacherId: string;
  onSubmit: (quiz: Omit<Quiz, 'id' | 'created_at' | 'updated_at'>, questions: QuizQuestion[]) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const QuizForm: React.FC<QuizFormProps> = ({
  initialQuiz,
  initialQuestions = [],
  teacherId,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [title, setTitle] = useState(initialQuiz?.title || '');
  const [description, setDescription] = useState(initialQuiz?.description || '');
  const [category, setCategory] = useState<MaterialCategory>(
    initialQuiz?.category || 'Berpikir Komputasional'
  );
  const [timeLimit, setTimeLimit] = useState(
    initialQuiz?.time_limit_minutes ? String(initialQuiz.time_limit_minutes) : '15'
  );
  const [passingGrade, setPassingGrade] = useState(
    initialQuiz?.passing_grade ? String(initialQuiz.passing_grade) : '75'
  );
  const [isPublished, setIsPublished] = useState(initialQuiz?.status === 'published');
  const [randomizeQuestions, setRandomizeQuestions] = useState(
    Boolean(initialQuiz?.randomize_questions)
  );

  const [questions, setQuestions] = useState<QuizQuestion[]>(() => {
    if (initialQuestions.length > 0) return initialQuestions;
    return [
      {
        id: 'q-initial-1',
        quiz_id: '',
        question_text: '',
        question_type: 'multiple_choice',
        points: 20,
        order_index: 1,
        explanation: '',
        options: [
          { id: 'opt-init-1', question_id: 'q-initial-1', option_key: 'A', option_text: '', is_correct: true, order_index: 1 },
          { id: 'opt-init-2', question_id: 'q-initial-1', option_key: 'B', option_text: '', is_correct: false, order_index: 2 },
          { id: 'opt-init-3', question_id: 'q-initial-1', option_key: 'C', option_text: '', is_correct: false, order_index: 3 },
          { id: 'opt-init-4', question_id: 'q-initial-1', option_key: 'D', option_text: '', is_correct: false, order_index: 4 },
        ],
      },
    ];
  });

  const [formError, setFormError] = useState<string | null>(null);

  const addQuestion = (type: QuestionType) => {
    const newQId = `q-${Date.now()}-${questions.length + 1}`;
    let newOptions: QuizOption[] | undefined;

    if (type === 'multiple_choice') {
      newOptions = [
        { id: `opt-${Date.now()}-1`, question_id: newQId, option_key: 'A', option_text: '', is_correct: true, order_index: 1 },
        { id: `opt-${Date.now()}-2`, question_id: newQId, option_key: 'B', option_text: '', is_correct: false, order_index: 2 },
        { id: `opt-${Date.now()}-3`, question_id: newQId, option_key: 'C', option_text: '', is_correct: false, order_index: 3 },
        { id: `opt-${Date.now()}-4`, question_id: newQId, option_key: 'D', option_text: '', is_correct: false, order_index: 4 },
      ];
    } else if (type === 'true_false') {
      newOptions = [
        { id: `opt-${Date.now()}-1`, question_id: newQId, option_key: 'true', option_text: 'Benar', is_correct: true, order_index: 1 },
        { id: `opt-${Date.now()}-2`, question_id: newQId, option_key: 'false', option_text: 'Salah', is_correct: false, order_index: 2 },
      ];
    }

    setQuestions([
      ...questions,
      {
        id: newQId,
        quiz_id: '',
        question_text: '',
        question_type: type,
        points: 20,
        order_index: questions.length + 1,
        explanation: '',
        correct_answer_text: type === 'short_answer' ? '' : undefined,
        options: newOptions,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) {
      setFormError('Kuis harus memiliki minimal 1 soal');
      return;
    }
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const updateOptionText = (qIndex: number, optIndex: number, text: string) => {
    const updated = [...questions];
    const q = updated[qIndex];
    if (q.options) {
      q.options[optIndex].option_text = text;
      setQuestions([...updated]);
    }
  };

  const setCorrectOption = (qIndex: number, optIndex: number) => {
    const updated = [...questions];
    const q = updated[qIndex];
    if (q.options) {
      q.options.forEach((opt, idx) => {
        opt.is_correct = idx === optIndex;
      });
      setQuestions([...updated]);
    }
  };

  const handleSubmit = async () => {
    setFormError(null);
    if (!title.trim()) {
      setFormError('Judul kuis wajib diisi');
      return;
    }
    if (!description.trim()) {
      setFormError('Deskripsi kuis wajib diisi');
      return;
    }
    if (isNaN(Number(timeLimit)) || Number(timeLimit) <= 0) {
      setFormError('Batas waktu harus berupa angka lebih dari 0 menit');
      return;
    }
    if (isNaN(Number(passingGrade)) || Number(passingGrade) < 0 || Number(passingGrade) > 100) {
      setFormError('KKM / Passing grade harus antara 0 dan 100');
      return;
    }

    // Validate each question
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question_text.trim()) {
        setFormError(`Teks soal nomor ${i + 1} belum diisi`);
        return;
      }
      if (q.question_type === 'multiple_choice') {
        const hasEmptyOption = q.options?.some((o) => !o.option_text.trim());
        if (hasEmptyOption) {
          setFormError(`Pilihan jawaban soal nomor ${i + 1} belum lengkap`);
          return;
        }
        const hasCorrect = q.options?.some((o) => o.is_correct);
        if (!hasCorrect) {
          setFormError(`Pilih satu kunci jawaban benar untuk soal nomor ${i + 1}`);
          return;
        }
      } else if (q.question_type === 'short_answer') {
        if (!q.correct_answer_text?.trim()) {
          setFormError(`Kunci jawaban isian singkat untuk soal nomor ${i + 1} wajib diisi`);
          return;
        }
      }
    }

    await onSubmit(
          {
            teacher_id: teacherId,
            title: title.trim(),
            description: description.trim(),
            category,
            time_limit_minutes: parseInt(timeLimit, 10),
            passing_grade: parseInt(passingGrade, 10),
            randomize_questions: randomizeQuestions,
            randomize_options: false,
            status: isPublished ? 'published' : 'draft',
          },
          questions
        );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {formError ? (
        <View style={styles.errorBox}>
          <AlertCircle size={18} color={Colors.dangerText} />
          <Text style={styles.errorBoxText}>{formError}</Text>
        </View>
      ) : null}

      <Card variant="bordered" style={styles.card}>
        <Text style={styles.sectionHeader}>Informasi Umum Kuis</Text>

        <Input
          label="Judul Kuis *"
          placeholder="Contoh: Kuis Logika Algoritma & Struktur Kontrol"
          value={title}
          onChangeText={setTitle}
        />

        <View style={styles.section}>
          <Text style={styles.label}>Topik Informatika *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {INFORMATIKA_CATEGORIES.map((c) => {
              const isSelected = category === c.name;
              return (
                <TouchableOpacity
                  key={c.name}
                  onPress={() => setCategory(c.name)}
                  style={[
                    styles.chip,
                    isSelected && styles.chipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected && styles.chipTextSelected,
                    ]}
                  >
                    {c.shortName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.row}>
          <View style={styles.half}>
            <Input
              label="Batas Waktu (Menit) *"
              placeholder="15"
              value={timeLimit}
              onChangeText={setTimeLimit}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.half}>
            <Input
              label="Nilai KKM (0-100) *"
              placeholder="75"
              value={passingGrade}
              onChangeText={setPassingGrade}
              keyboardType="numeric"
            />
          </View>
        </View>

        <Input
          label="Deskripsi & Aturan Kuis *"
          placeholder="Jelaskan petunjuk pengerjaan dan materi yang dicakup..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={{ minHeight: 70, textAlignVertical: 'top' }}
        />

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Acak Urutan Soal untuk Siswa</Text>
          <Switch
            value={randomizeQuestions}
            onValueChange={setRandomizeQuestions}
            trackColor={{ false: Colors.border, true: Colors.primary }}
          />
        </View>

        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchLabel}>Status Publikasi</Text>
            <Text style={styles.switchSublabel}>
              {isPublished ? 'Tersedia untuk dikerjakan siswa' : 'Disimpan sebagai draf'}
            </Text>
          </View>
          <Switch
            value={isPublished}
            onValueChange={setIsPublished}
            trackColor={{ false: Colors.border, true: Colors.primary }}
          />
        </View>
      </Card>

      {/* Questions List */}
      <View style={styles.questionsHeader}>
        <Text style={styles.sectionHeader}>Daftar Butir Soal ({questions.length})</Text>
        <Text style={styles.subtext}>
          Total Bobot: {questions.reduce((sum, q) => sum + (q.points || 0), 0)} Poin
        </Text>
      </View>

      {questions.map((q, qIndex) => (
        <Card key={q.id} variant="bordered" style={styles.questionCard}>
          <View style={styles.questionCardHeader}>
            <View style={styles.qNumBadge}>
              <Text style={styles.qNumText}>No. {qIndex + 1}</Text>
            </View>
            <Text style={styles.qTypeLabel}>
              {q.question_type === 'multiple_choice'
                ? 'Pilihan Ganda'
                : q.question_type === 'true_false'
                ? 'Benar / Salah'
                : 'Isian Singkat'}
            </Text>
            <TouchableOpacity
              onPress={() => removeQuestion(qIndex)}
              style={styles.trashBtn}
            >
              <Trash2 size={18} color={Colors.danger} />
            </TouchableOpacity>
          </View>

          <Input
            label="Pertanyaan *"
            placeholder="Tuliskan pertanyaan soal..."
            value={q.question_text}
            onChangeText={(txt) => updateQuestion(qIndex, 'question_text', txt)}
            multiline
            style={{ minHeight: 60 }}
          />

          <View style={{ width: 140, marginBottom: Spacing.sm }}>
            <Input
              label="Bobot Poin"
              value={String(q.points || 20)}
              onChangeText={(pts) =>
                updateQuestion(qIndex, 'points', parseInt(pts, 10) || 0)
              }
              keyboardType="numeric"
            />
          </View>

          {/* Options for MCQ */}
          {q.question_type === 'multiple_choice' && q.options && (
            <View style={styles.optionsContainer}>
              <Text style={styles.optionsLabel}>
                Pilihan Jawaban (Pilih radio hijau untuk kunci jawaban):
              </Text>
              {q.options.map((opt, optIndex) => (
                <View key={opt.id} style={styles.optionRow}>
                  <TouchableOpacity
                    onPress={() => setCorrectOption(qIndex, optIndex)}
                    style={styles.radioBtn}
                  >
                    {opt.is_correct ? (
                      <CheckCircle2 size={22} color={Colors.success} />
                    ) : (
                      <Circle size={22} color={Colors.textMuted} />
                    )}
                  </TouchableOpacity>
                  <Text style={styles.optKeyText}>{opt.option_key}.</Text>
                  <Input
                    placeholder={`Teks pilihan ${opt.option_key}`}
                    value={opt.option_text}
                    onChangeText={(txt) => updateOptionText(qIndex, optIndex, txt)}
                    containerStyle={{ flex: 1, marginBottom: 0 }}
                  />
                </View>
              ))}
            </View>
          )}

          {/* Options for True / False */}
          {q.question_type === 'true_false' && q.options && (
            <View style={styles.tfContainer}>
              <Text style={styles.optionsLabel}>Kunci Jawaban Benar:</Text>
              <View style={styles.row}>
                {q.options.map((opt, optIndex) => (
                  <TouchableOpacity
                    key={opt.id}
                    onPress={() => setCorrectOption(qIndex, optIndex)}
                    style={[
                      styles.tfBtn,
                      opt.is_correct && styles.tfBtnSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tfBtnText,
                        opt.is_correct && styles.tfBtnTextSelected,
                      ]}
                    >
                      {opt.option_text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Short Answer */}
          {q.question_type === 'short_answer' && (
            <Input
              label="Kunci Jawaban Benar (Pisahkan dengan koma jika ada variasi) *"
              placeholder="Contoh: Binary Search, Algoritma Binary Search"
              value={q.correct_answer_text || ''}
              onChangeText={(txt) => updateQuestion(qIndex, 'correct_answer_text', txt)}
              helper="Sistem pencocokan bersifat case-insensitive (huruf besar/kecil diabaikan)"
            />
          )}

          <Input
            label="Pembahasan / Penjelasan Jawaban (Opsional)"
            placeholder="Penjelasan mengapa jawaban tersebut benar untuk ditampilkan setelah kuis selesai..."
            value={q.explanation || ''}
            onChangeText={(txt) => updateQuestion(qIndex, 'explanation', txt)}
            multiline
            numberOfLines={2}
          />
        </Card>
      ))}

      {/* Add question buttons */}
      <View style={styles.addSection}>
        <Text style={styles.addLabel}>+ Tambah Soal Baru:</Text>
        <View style={styles.addButtonsRow}>
          <Button
            title="Pilihan Ganda"
            variant="outline"
            size="sm"
            onPress={() => addQuestion('multiple_choice')}
            icon={<Plus size={16} color={Colors.primary} />}
            style={styles.addBtn}
          />
          <Button
            title="Benar/Salah"
            variant="outline"
            size="sm"
            onPress={() => addQuestion('true_false')}
            icon={<Plus size={16} color={Colors.primary} />}
            style={styles.addBtn}
          />
          <Button
            title="Isian Singkat"
            variant="outline"
            size="sm"
            onPress={() => addQuestion('short_answer')}
            icon={<Plus size={16} color={Colors.primary} />}
            style={styles.addBtn}
          />
        </View>
      </View>

      <View style={styles.submitRow}>
        <Button
          title="Batal"
          variant="outline"
          onPress={onCancel}
          disabled={loading}
          style={styles.submitBtn}
        />
        <Button
          title={isPublished ? 'Simpan & Publikasikan Kuis' : 'Simpan Draf Kuis'}
          variant="primary"
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitBtn}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl * 2,
  },
  card: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  section: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: Colors.textInverse,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  half: {
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: Spacing.xs,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  switchSublabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  questionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  subtext: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  questionCard: {
    marginBottom: Spacing.lg,
  },
  questionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  qNumBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  qNumText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  qTypeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  trashBtn: {
    padding: 6,
  },
  optionsContainer: {
    marginVertical: Spacing.xs,
  },
  optionsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  radioBtn: {
    padding: 6,
    marginRight: 4,
  },
  optKeyText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginRight: 6,
  },
  tfContainer: {
    marginBottom: Spacing.md,
  },
  tfBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  tfBtnSelected: {
    backgroundColor: Colors.successLight,
    borderColor: Colors.success,
  },
  tfBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tfBtnTextSelected: {
    color: Colors.successText,
    fontWeight: '700',
  },
  addSection: {
    marginVertical: Spacing.md,
  },
  addLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  addButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  addBtn: {
    flex: 1,
  },
  submitRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  submitBtn: {
    flex: 1,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.dangerLight,
    borderColor: '#FECACA',
    borderWidth: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  errorBoxText: {
    fontSize: 13,
    color: Colors.dangerText,
    flex: 1,
  },
});
