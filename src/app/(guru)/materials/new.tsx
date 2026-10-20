import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../../features/auth/AuthContext';
import { MaterialsService } from '../../../features/materials/materialsService';
import { MaterialForm } from '../../../features/materials/MaterialForm';
import { Header } from '../../../components/Header';
import { LearningMaterial } from '../../../types/materials';
import { Colors } from '../../../constants/colors';

export default function NewMaterialScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    values: Omit<LearningMaterial, 'id' | 'created_at' | 'updated_at'>
  ) => {
    setLoading(true);
    try {
      await MaterialsService.create({
        ...values,
        teacher_id: user?.id || 'guru-demo-001',
      });
      router.back();
    } catch (e: any) {
      Alert.alert('Gagal', e.message || 'Gagal menyimpan materi baru');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Tambah Materi Baru" showBack onBack={() => router.back()} />
      <MaterialForm
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        loading={loading}
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
