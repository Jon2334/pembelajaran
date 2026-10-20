import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { BorderRadius, Spacing } from '../constants/theme';

export type AlertType = 'info' | 'success' | 'warning' | 'danger';

interface AlertBannerProps {
  type?: AlertType;
  title?: string;
  message: string;
  style?: ViewStyle;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  type = 'info',
  title,
  message,
  style,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} color={Colors.successText} />;
      case 'warning':
        return <AlertTriangle size={20} color={Colors.warningText} />;
      case 'danger':
        return <AlertCircle size={20} color={Colors.dangerText} />;
      case 'info':
      default:
        return <Info size={20} color={Colors.infoText} />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return { bg: Colors.successLight, border: '#A7F3D0', text: Colors.successText };
      case 'warning':
        return { bg: Colors.warningLight, border: '#FDE68A', text: Colors.warningText };
      case 'danger':
        return { bg: Colors.dangerLight, border: '#FECACA', text: Colors.dangerText };
      case 'info':
      default:
        return { bg: Colors.infoLight, border: Colors.primaryBorder, text: Colors.infoText };
    }
  };

  const c = getColors();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: c.bg, borderColor: c.border },
        style,
      ]}
    >
      <View style={styles.iconWrapper}>{getIcon()}</View>
      <View style={styles.content}>
        {title ? (
          <Text style={[styles.title, { color: c.text }]}>{title}</Text>
        ) : null}
        <Text style={[styles.message, { color: c.text }]}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginVertical: Spacing.xs,
  },
  iconWrapper: {
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
  },
});
