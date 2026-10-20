import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, HelpCircle, Award, ChevronRight, CheckCircle2, XCircle } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Shadows, Spacing } from '../../constants/theme';
import { Badge } from '../../components/Badge';
import { Quiz } from '../../types/quizzes';

interface QuizCardProps {
  quiz: Quiz;
  onPress: () => void;
  showTeacherControls?: boolean;
}

export const QuizCard: React.FC<QuizCardProps> = ({
  quiz,
  onPress,
  showTeacherControls = false,
}) => {
  const hasAttempted = quiz.user_best_score !== undefined && quiz.user_best_score !== null;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[styles.card, Shadows.card]}
    >
      <View style={styles.headerRow}>
        <Badge label={quiz.category} category={quiz.category} size="sm" />
        {showTeacherControls ? (
          <Badge
            label={quiz.status === 'published' ? 'Terbit' : 'Draft'}
            status={quiz.status}
            size="sm"
          />
        ) : hasAttempted ? (
          <View
            style={[
              styles.scorePill,
              quiz.user_has_passed ? styles.passedPill : styles.failedPill,
            ]}
          >
            {quiz.user_has_passed ? (
              <CheckCircle2 size={13} color={Colors.successText} />
            ) : (
              <XCircle size={13} color={Colors.dangerText} />
            )}
            <Text
              style={[
                styles.scorePillText,
                quiz.user_has_passed ? styles.passedText : styles.failedText,
              ]}
            >
              Nilai: {quiz.user_best_score}
            </Text>
          </View>
        ) : (
          <View style={styles.newPill}>
            <Text style={styles.newPillText}>Belum Dikerjakan</Text>
          </View>
        )}
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {quiz.title}
      </Text>

      <Text style={styles.description} numberOfLines={2}>
        {quiz.description}
      </Text>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Clock size={14} color={Colors.textSecondary} />
          <Text style={styles.metaText}>{quiz.time_limit_minutes} menit</Text>
        </View>

        <View style={styles.metaItem}>
          <HelpCircle size={14} color={Colors.textSecondary} />
          <Text style={styles.metaText}>{quiz.questions_count || 5} soal</Text>
        </View>

        <View style={styles.metaItem}>
          <Award size={14} color={Colors.textSecondary} />
          <Text style={styles.metaText}>KKM: {quiz.passing_grade}</Text>
        </View>

        <View style={styles.actionArrow}>
          <ChevronRight size={18} color={Colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerRow: {
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
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: Spacing.md,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  actionArrow: {
    marginLeft: 'auto',
  },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  passedPill: {
    backgroundColor: Colors.successLight,
  },
  failedPill: {
    backgroundColor: Colors.dangerLight,
  },
  scorePillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  passedText: {
    color: Colors.successText,
  },
  failedText: {
    color: Colors.dangerText,
  },
  newPill: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  newPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
});
