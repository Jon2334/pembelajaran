import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Clock, CheckCircle2, User, Check } from 'lucide-react-native';
import { useAuth } from '../../../features/auth/AuthContext';
import { MaterialsService } from '../../../features/materials/materialsService';
import { Header } from '../../../components/Header';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { LearningMaterial } from '../../../types/materials';
import { Colors } from '../../../constants/colors';
import { BorderRadius, Shadows, Spacing } from '../../../constants/theme';

export default function SiswaMaterialDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [material, setMaterial] = useState<LearningMaterial | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const loadDetail = async (matId: string) => {
    try {
      const studentId = user?.id || 'siswa-demo-001';
      const data = await MaterialsService.getById(matId, studentId);
      setMaterial(data);
      if (data?.is_completed) {
        setIsCompleted(true);
      }
    } catch (e) {
      console.error('Error fetching material detail', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadDetail(id);
    }
  }, [id]);

  const handleMarkCompleted = async () => {
    if (!material) return;
    setMarking(true);
    try {
      const studentId = user?.id || 'siswa-demo-001';
      await MaterialsService.markAsCompleted(studentId, material.id);
      setIsCompleted(true);
      Alert.alert(
        'Selamat!',
        'Kamu telah menyelesaikan materi ini. Progres belajarmu telah tersimpan.'
      );
    } catch (e: any) {
      Alert.alert('Gagal', e.message || 'Gagal menandai materi');
    } finally {
      setMarking(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Menyiapkan materi bacaan..." />;
  }

  if (!material) {
    return (
      <View style={styles.container}>
        <Header title="Detail Materi" showBack onBack={() => router.back()} />
        <Text style={{ padding: Spacing.xl, textAlign: 'center' }}>Materi tidak ditemukan.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Materi Pembelajaran" showBack onBack={() => router.back()} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Badges Row */}
        <View style={styles.badgeRow}>
          <Badge label={material.category} category={material.category} size="md" />
          <Badge label={material.difficulty} difficulty={material.difficulty} size="md" />
        </View>

        {/* Title */}
        <Text style={styles.title}>{material.title}</Text>

        {/* Meta details */}
        <View style={styles.metaBox}>
          <View style={styles.metaItem}>
            <Clock size={14} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{material.reading_time_minutes} Menit Baca</Text>
          </View>
          <View style={styles.metaItem}>
            <User size={14} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{material.teacher_name || 'Guru Informatika'}</Text>
          </View>
        </View>

        {/* Summary callout */}
        <View style={styles.summaryCallout}>
          <Text style={styles.summaryTitle}>Tujuan Pembelajaran:</Text>
          <Text style={styles.summaryDesc}>{material.description}</Text>
        </View>

        {/* Formatted Content */}
        <View style={[styles.contentCard, Shadows.card]}>
          <Text style={styles.contentBody}>{material.content}</Text>
        </View>

        {/* Mark Completed Action Box */}
        <View style={[styles.completionBox, Shadows.card]}>
          <View style={styles.completionInfo}>
            <Text style={styles.completionHeading}>
              {isCompleted ? 'Materi Telah Selesai' : 'Selesai Membaca?'}
            </Text>
            <Text style={styles.completionSub}>
              {isCompleted
                ? 'Progres tercatat di dasbor belajarmu.'
                : 'Tandai selesai untuk memperbarui persentase kompetensimu.'}
            </Text>
          </View>

          <Button
            title={isCompleted ? 'Sudah Selesai' : 'Tandai Selesai'}
            variant={isCompleted ? 'secondary' : 'primary'}
            onPress={handleMarkCompleted}
            disabled={isCompleted}
            loading={marking}
            icon={
              isCompleted ? (
                <CheckCircle2 size={18} color={Colors.success} />
              ) : (
                <Check size={18} color={Colors.textInverse} />
              )
            }
          />
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
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    lineHeight: 30,
    marginBottom: Spacing.md,
  },
  metaBox: {
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
    fontWeight: '500',
  },
  summaryCallout: {
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
  summaryDesc: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 18,
  },
  contentCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xl,
  },
  contentBody: {
    fontSize: 15,
    lineHeight: 25,
    color: Colors.text,
  },
  completionBox: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xl,
  },
  completionInfo: {
    marginBottom: Spacing.md,
  },
  completionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  completionSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
