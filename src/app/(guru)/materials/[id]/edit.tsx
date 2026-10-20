import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialsService } from '../../../../features/materials/materialsService';
import { MaterialForm } from '../../../../features/materials/MaterialForm';
import { Header } from '../../../../components/Header';
import { LoadingSpinner } from '../../../../components/LoadingSpinner';
import { LearningMaterial } from '../../../../types/materials';
import { Colors } from '../../../../constants/colors';

export default function EditMaterialScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [material, setMaterial] = useState<LearningMaterial | null>(null);
  const [loadingFetch, setLoadingFetch] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadMaterial = async (matId: string) => {
    try {
      const data = await MaterialsService.getById(matId);
      setMaterial(data);
    } catch (e) {
      console.error('Error fetching material', e);
    } finally {
      setLoadingFetch(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadMaterial(id);
    }
  }, [id]);

  const handleUpdate = async (
    values: Omit<LearningMaterial, 'id' | 'created_at' | 'updated_at'>
  ) => {
    if (!id) return;
    setSaving(true);
    try {
      await MaterialsService.update(id, values);
      router.back();
    } catch (e: any) {
      Alert.alert('Gagal', e.message || 'Gagal memperbarui materi');
    } finally {
      setSaving(false);
    }
  };

  if (loadingFetch) {
    return <LoadingSpinner message="Memuat materi..." />;
  }

  if (!material) {
    return (
      <View style={styles.container}>
        <Header title="Edit Materi" showBack onBack={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Edit Materi Pembelajaran" showBack onBack={() => router.back()} />
      <MaterialForm
        initialValues={material}
        onSubmit={handleUpdate}
        onCancel={() => router.back()}
        loading={saving}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
