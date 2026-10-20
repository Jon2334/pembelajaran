import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, CheckCircle2, ChevronRight } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Shadows, Spacing } from '../../constants/theme';
import { Badge } from '../../components/Badge';
import { LearningMaterial } from '../../types/materials';

interface MaterialCardProps {
  material: LearningMaterial;
  onPress: () => void;
  showStatus?: boolean; // For teacher dashboard
  isStudentView?: boolean;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({
  material,
  onPress,
  showStatus = false,
  isStudentView = false,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[styles.card, Shadows.card]}
    >
      <View style={styles.topRow}>
        <Badge label={material.category} category={material.category} size="sm" />
        <View style={styles.badgesRight}>
          <Badge label={material.difficulty} difficulty={material.difficulty} size="sm" />
          {showStatus && (
            <Badge
              label={material.status === 'published' ? 'Terbit' : 'Draft'}
              status={material.status}
              size="sm"
              style={{ marginLeft: 6 }}
            />
          )}
        </View>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {material.title}
      </Text>

      <Text style={styles.description} numberOfLines={2}>
        {material.description}
      </Text>

      <View style={styles.footerRow}>
        <View style={styles.metaLeft}>
          <Clock size={14} color={Colors.textSecondary} />
          <Text style={styles.metaText}>{material.reading_time_minutes} mnt baca</Text>
        </View>

        {isStudentView && material.is_completed ? (
          <View style={styles.completedBadge}>
            <CheckCircle2 size={15} color={Colors.success} />
            <Text style={styles.completedText}>Selesai</Text>
          </View>
        ) : (
          <View style={styles.readAction}>
            <Text style={styles.readText}>Pelajari</Text>
            <ChevronRight size={16} color={Colors.primary} />
          </View>
        )}
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  badgesRight: {
    flexDirection: 'row',
    alignItems: 'center',
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
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.successText,
  },
  readAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  readText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
});
