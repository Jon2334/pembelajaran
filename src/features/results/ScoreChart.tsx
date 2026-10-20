import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing } from '../../constants/theme';
import { QuizAttempt } from '../../types/quizzes';

interface ScoreChartProps {
  attempts: QuizAttempt[];
}

export const ScoreChart: React.FC<ScoreChartProps> = ({ attempts }) => {
  if (attempts.length === 0) {
    return null;
  }

  // Take the latest 6 attempts in chronological order for the chart
  const recentAttempts = [...attempts]
    .slice(0, 6)
    .reverse();

  const scores = attempts.map((a) => a.score);
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const max = Math.max(...scores);

  return (
    <View style={styles.container}>
      <View style={styles.statSummaryRow}>
        <View style={styles.statItem}>
          <Text style={styles.statVal}>{avg}</Text>
          <Text style={styles.statLbl}>Rata-Rata Nilai</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statVal}>{max}</Text>
          <Text style={styles.statLbl}>Nilai Tertinggi</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statVal}>{attempts.length}</Text>
          <Text style={styles.statLbl}>Total Kuis</Text>
        </View>
      </View>

      <Text style={styles.chartTitle}>Grafik Perkembangan Nilai Terakhir</Text>

      <View style={styles.chartArea}>
        {/* Baseline 75 passing grade line */}
        <View style={styles.kkmLine} />
        <Text style={styles.kkmLabel}>KKM 75</Text>

        <View style={styles.barsContainer}>
          {recentAttempts.map((att, i) => {
            const barHeightPct = Math.max(10, Math.min(100, att.score));
            const isPassed = att.score >= (att.passing_grade || 75);

            return (
              <View key={att.id || i} style={styles.barCol}>
                <Text style={styles.scoreText}>{att.score}</Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${barHeightPct}%`,
                        backgroundColor: isPassed ? Colors.success : Colors.danger,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.quizLabel} numberOfLines={1}>
                  Kuis {i + 1}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  statSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statVal: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.primary,
  },
  statLbl: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.border,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  chartArea: {
    height: 160,
    position: 'relative',
    justifyContent: 'flex-end',
    paddingTop: 24,
  },
  kkmLine: {
    position: 'absolute',
    top: 40, // Represents ~75% line
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.borderDark,
    borderStyle: 'dashed',
  },
  kkmLabel: {
    position: 'absolute',
    top: 24,
    right: 0,
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
  },
  barCol: {
    alignItems: 'center',
    flex: 1,
  },
  scoreText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  barTrack: {
    width: 22,
    height: 80,
    backgroundColor: Colors.secondaryLight,
    borderRadius: BorderRadius.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: BorderRadius.sm,
  },
  quizLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 6,
  },
});
