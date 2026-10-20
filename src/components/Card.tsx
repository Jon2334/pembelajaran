import React from 'react';
import { View, TouchableOpacity, ViewStyle } from 'react-native';
import { Colors } from '../constants/colors';
import { BorderRadius, Shadows, Spacing } from '../constants/theme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'elevated' | 'bordered' | 'flat';
  padding?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  variant = 'bordered',
  padding = Spacing.lg,
}) => {
  const cardStyle: ViewStyle = {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding,
    ...(variant === 'elevated'
      ? Shadows.card
      : variant === 'bordered'
      ? { borderWidth: 1, borderColor: Colors.border }
      : {}),
    ...style,
  };

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={cardStyle}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};
