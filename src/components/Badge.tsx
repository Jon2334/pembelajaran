import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../constants/colors';
import { BorderRadius } from '../constants/theme';
import { MaterialCategory, DifficultyLevel, MaterialStatus } from '../types/materials';

interface BadgeProps {
  label: string;
  category?: MaterialCategory;
  difficulty?: DifficultyLevel;
  status?: MaterialStatus;
  isPassed?: boolean;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  category,
  difficulty,
  status,
  isPassed,
  variant,
  size = 'sm',
  style,
}) => {
  let bgColor: string = Colors.secondaryLight;
  let textColor: string = Colors.textSecondary;
  let borderColor: string = Colors.border;

  if (category && Colors.categoryColors[category]) {
    const catStyle = Colors.categoryColors[category];
    bgColor = catStyle.bg;
    textColor = catStyle.text;
    borderColor = catStyle.border;
  } else if (difficulty) {
    switch (difficulty) {
      case 'Pemula':
        bgColor = Colors.successLight;
        textColor = Colors.successText;
        borderColor = '#A7F3D0';
        break;
      case 'Menengah':
        bgColor = Colors.warningLight;
        textColor = Colors.warningText;
        borderColor = '#FDE68A';
        break;
      case 'Mahir':
        bgColor = Colors.dangerLight;
        textColor = Colors.dangerText;
        borderColor = '#FECACA';
        break;
    }
  } else if (status) {
    if (status === 'published') {
      bgColor = Colors.successLight;
      textColor = Colors.successText;
      borderColor = '#A7F3D0';
    } else {
      bgColor = Colors.secondaryLight;
      textColor = Colors.textSecondary;
      borderColor = Colors.border;
    }
  } else if (isPassed !== undefined) {
    if (isPassed) {
      bgColor = Colors.successLight;
      textColor = Colors.successText;
      borderColor = '#A7F3D0';
    } else {
      bgColor = Colors.dangerLight;
      textColor = Colors.dangerText;
      borderColor = '#FECACA';
    }
  } else if (variant) {
    switch (variant) {
      case 'primary':
        bgColor = Colors.primaryLight;
        textColor = Colors.primary;
        borderColor = Colors.primaryBorder;
        break;
      case 'success':
        bgColor = Colors.successLight;
        textColor = Colors.successText;
        borderColor = '#A7F3D0';
        break;
      case 'warning':
        bgColor = Colors.warningLight;
        textColor = Colors.warningText;
        borderColor = '#FDE68A';
        break;
      case 'danger':
        bgColor = Colors.dangerLight;
        textColor = Colors.dangerText;
        borderColor = '#FECACA';
        break;
      case 'neutral':
      default:
        bgColor = Colors.secondaryLight;
        textColor = Colors.textSecondary;
        borderColor = Colors.border;
        break;
    }
  }

  return (
    <View
      style={[
        styles.container,
        size === 'md' ? styles.mdContainer : styles.smContainer,
        { backgroundColor: bgColor, borderColor },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          size === 'md' ? styles.mdText : styles.smText,
          { color: textColor },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smContainer: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  mdContainer: {
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  text: {
    fontWeight: '600',
  },
  smText: {
    fontSize: 11,
  },
  mdText: {
    fontSize: 13,
  },
});
