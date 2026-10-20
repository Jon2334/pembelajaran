import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Clock, Edit3, BookOpen } from 'lucide-react-native';
import { MaterialsService } from '../../../../features/materials/materialsService';
import { Header } from '../../../../components/Header';
import { Badge } from '../../../../components/Badge';
import { LoadingSpinner } from '../../../../components/LoadingSpinner';
import { LearningMaterial } from '../../../../types/materials';
import { Colors } from '../../../../constants/colors';
import { BorderRadius, Spacing } from '../../../../constants/theme';

export default function PreviewMaterialScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [material, setMaterial] = useState<LearningMaterial | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMaterial = async (matId: string) => {
    try {
      const data = await MaterialsService.getById(matId);
      setMaterial(data);
    } catch (e) {
      console.error('Error fetching material', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadMaterial(id);
    }
  }, [id]);

  if (loading) {
    return <LoadingSpinner message="Memuat pratinjau materi..." />;
  }

  if (!material) {
    return (
      <View style={styles.container}>
        <Header title="Pratinjau Materi" showBack onBack={() => router.back()} />
        <Text style={{ padding: Spacing.xl, textAlign: 'center' }}>Materi tidak ditemukan</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Pratinjau Materi"
        showBack
        onBack={() => router.back()}
        rightAction={
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: '/(guru)/materials/[id]/edit',
                params: { id: material.id },
              })
            }
            style={styles.editBtn}
          >
            <Edit3 size={18} color={Colors.primary} />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Banner Preview Mode */}
        <View style={styles.previewNotice}>
          <Text style={styles.previewNoticeText}>
            Mode Pratinjau Guru: Tampilan ini merefleksikan apa yang akan dibaca oleh siswa.
          </Text>
        </View>

        {/* Badges */}
        <View style={styles.badgeRow}>
          <Badge label={material.category} category={material.category} size="md" />
          <Badge label={material.difficulty} difficulty={material.difficulty} size="md" />
          <Badge
            label={material.status === 'published' ? 'Terbit' : 'Draf'}
            status={material.status}
            size="md"
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>{material.title}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Clock size={15} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{material.reading_time_minutes} menit estimasi baca</Text>
          </View>
          <View style={styles.metaItem}>
            <BookOpen size={15} color={Colors.textSecondary} />
            <Text style={styles.metaText}>Informatika SMA/SMK</Text>
          </View>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Ringkasan:</Text>
          <Text style={styles.summaryContent}>{material.description}</Text>
        </View>

        {/* Content Body */}
        <View style={styles.bodyCard}>
          <Text style={styles.bodyText}>{material.content}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl * 2,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  previewNotice: {
    backgroundColor: Colors.warningLight,
    borderColor: '#FDE68A',
    borderWidth: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  previewNoticeText: {
    fontSize: 12,
    color: Colors.warningText,
    fontWeight: '500',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    lineHeight: 30,
    marginBottom: Spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  summaryCard: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primaryBorder,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  summaryContent: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 18,
  },
  bodyCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.text,
  },
});
