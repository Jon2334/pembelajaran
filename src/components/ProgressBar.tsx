import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../constants/colors';

interface ProgressBarProps {
  progress: number; // 0 to 100
  color?: string;
  trackColor?: string;
  height?: number;
  showLabel?: boolean;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = Colors.primary,
  trackColor = Colors.border,
  height = 8,
  showLabel = false,
  style,
}) => {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <View style={style}>
      {showLabel && (
        <View style={styles.labelRow}>
          <Text style={styles.labelText}>Progres Belajar</Text>
          <Text style={styles.percentText}>{Math.round(clamped)}%</Text>
        </View>
      )}
      <View
        style={[
          styles.track,
          { height, backgroundColor: trackColor, borderRadius: height / 2 },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              width: `${clamped}%`,
              backgroundColor: color,
              borderRadius: height / 2,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  labelText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  percentText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
