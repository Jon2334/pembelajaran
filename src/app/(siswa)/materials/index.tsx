import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Search } from 'lucide-react-native';
import { useAuth } from '../../../features/auth/AuthContext';
import { MaterialsService } from '../../../features/materials/materialsService';
import { MaterialCard } from '../../../features/materials/MaterialCard';
import { LearningMaterial, MaterialCategory, DifficultyLevel } from '../../../types/materials';
import { INFORMATIKA_CATEGORIES } from '../../../constants/categories';
import { Colors } from '../../../constants/colors';
import { BorderRadius, Spacing } from '../../../constants/theme';
import { Input } from '../../../components/Input';
import { EmptyState } from '../../../components/EmptyState';
import { LoadingSpinner } from '../../../components/LoadingSpinner';

export default function SiswaMaterialsScreen() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MaterialCategory | 'ALL'>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMaterials = async () => {
    try {
      const studentId = user?.id || 'siswa-demo-001';
      const list = await MaterialsService.getAll(
        {
          publishedOnly: true,
          search,
          category: selectedCategory,
          difficulty: selectedDifficulty,
        },
        studentId
      );
      setMaterials(list);
    } catch (e) {
      console.error('Error fetching student materials', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMaterials();
    }, [search, selectedCategory, selectedDifficulty])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadMaterials();
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Materi Informatika</Text>
        <Text style={styles.headerSubtitle}>
          Pelajari modul terstruktur untuk memperkuat kompetensi digitalmu
        </Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchBox}>
        <Input
          placeholder="Cari materi (misal: Algoritma, Basis Data)..."
          value={search}
          onChangeText={setSearch}
          containerStyle={{ marginBottom: 0 }}
          leftIcon={<Search size={18} color={Colors.textSecondary} />}
        />
      </View>

      {/* 9 Category Filter Pills */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          <TouchableOpacity
            onPress={() => setSelectedCategory('ALL')}
            style={[
              styles.filterChip,
              selectedCategory === 'ALL' && styles.filterChipActive,
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedCategory === 'ALL' && styles.filterChipTextActive,
              ]}
            >
              Semua Topik
            </Text>
          </TouchableOpacity>
          {INFORMATIKA_CATEGORIES.map((c) => {
            const isSel = selectedCategory === c.name;
            return (
              <TouchableOpacity
                key={c.name}
                onPress={() => setSelectedCategory(c.name)}
                style={[styles.filterChip, isSel && styles.filterChipActive]}
              >
                <Text style={[styles.filterChipText, isSel && styles.filterChipTextActive]}>
                  {c.shortName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Difficulty Sub-filter */}
      <View style={styles.diffBar}>
        {(['ALL', 'Pemula', 'Menengah', 'Mahir'] as const).map((diff) => {
          const isAct = selectedDifficulty === diff;
          const label = diff === 'ALL' ? 'Semua Level' : diff;
          return (
            <TouchableOpacity
              key={diff}
              onPress={() => setSelectedDifficulty(diff)}
              style={[styles.diffTab, isAct && styles.diffTabActive]}
            >
              <Text style={[styles.diffTabText, isAct && styles.diffTabTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Materials List */}
      {loading && !refreshing ? (
        <LoadingSpinner message="Memuat materi pelajaran..." />
      ) : materials.length === 0 ? (
        <EmptyState
          title="Materi Tidak Ditemukan"
          description="Coba ubah kata kunci pencarian atau kategori filter."
        />
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {materials.map((item) => (
            <MaterialCard
              key={item.id}
              material={item}
              isStudentView
              onPress={() =>
                router.push({
                  pathname: '/(siswa)/materials/[id]',
                  params: { id: item.id },
                })
              }
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  searchBox: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  filterBar: {
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  categoryScroll: {
    paddingHorizontal: Spacing.lg,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.secondaryLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.textInverse,
  },
  diffBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
  },
  diffTab: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  diffTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  diffTabText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  diffTabTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl * 2,
  },
});
