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
import { Plus, Search, Trash2, Edit3, Eye } from 'lucide-react-native';
import { MaterialsService } from '../../../features/materials/materialsService';
import { LearningMaterial, MaterialCategory } from '../../../types/materials';
import { INFORMATIKA_CATEGORIES } from '../../../constants/categories';
import { Colors } from '../../../constants/colors';
import { BorderRadius, Shadows, Spacing } from '../../../constants/theme';
import { Input } from '../../../components/Input';
import { Button } from '../../../components/Button';
import { Badge } from '../../../components/Badge';
import { ConfirmModal } from '../../../components/ConfirmModal';
import { EmptyState } from '../../../components/EmptyState';
import { LoadingSpinner } from '../../../components/LoadingSpinner';

export default function GuruMaterialsScreen() {
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MaterialCategory | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'published' | 'draft'>('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Delete modal state
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<LearningMaterial | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadMaterials = async () => {
    try {
      const list = await MaterialsService.getAll({
        search,
        category: selectedCategory,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      });
      setMaterials(list);
    } catch (e) {
      console.error('Error fetching materials:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMaterials();
    }, [search, selectedCategory, statusFilter])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadMaterials();
  };

  const handleDeletePrompt = (mat: LearningMaterial) => {
    setSelectedMaterial(mat);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedMaterial) return;
    setDeleting(true);
    try {
      await MaterialsService.delete(selectedMaterial.id);
      setDeleteModalVisible(false);
      setSelectedMaterial(null);
      loadMaterials();
    } catch (e) {
      console.error('Failed to delete material', e);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.titleWrap}>
          <Text style={styles.pageTitle}>Manajemen Materi</Text>
          <Text style={styles.pageSubtitle}>Kelola {materials.length} modul pembelajaran</Text>
        </View>
        <Button
          title="Tambah"
          size="sm"
          onPress={() => router.push('/(guru)/materials/new')}
          icon={<Plus size={16} color={Colors.textInverse} />}
        />
      </View>

      {/* Search Input */}
      <View style={styles.searchBox}>
        <Input
          placeholder="Cari judul materi..."
          value={search}
          onChangeText={setSearch}
          containerStyle={{ marginBottom: 0 }}
          leftIcon={<Search size={18} color={Colors.textSecondary} />}
        />
      </View>

      {/* Category Pills Filter */}
      <View style={styles.categoryFilterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          <TouchableOpacity
            onPress={() => setSelectedCategory('ALL')}
            style={[
              styles.catChip,
              selectedCategory === 'ALL' && styles.catChipActive,
            ]}
          >
            <Text
              style={[
                styles.catChipText,
                selectedCategory === 'ALL' && styles.catChipTextActive,
              ]}
            >
              Semua Kategori
            </Text>
          </TouchableOpacity>
          {INFORMATIKA_CATEGORIES.map((c) => {
            const isSel = selectedCategory === c.name;
            return (
              <TouchableOpacity
                key={c.name}
                onPress={() => setSelectedCategory(c.name)}
                style={[styles.catChip, isSel && styles.catChipActive]}
              >
                <Text style={[styles.catChipText, isSel && styles.catChipTextActive]}>
                  {c.shortName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Status Filter (Draft vs Published) */}
      <View style={styles.statusFilterRow}>
        {(['ALL', 'published', 'draft'] as const).map((st) => {
          const isAct = statusFilter === st;
          const label = st === 'ALL' ? 'Semua Status' : st === 'published' ? 'Terbit' : 'Draf';
          return (
            <TouchableOpacity
              key={st}
              onPress={() => setStatusFilter(st)}
              style={[styles.statusTab, isAct && styles.statusTabActive]}
            >
              <Text style={[styles.statusTabText, isAct && styles.statusTabTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Materials List */}
      {loading && !refreshing ? (
        <LoadingSpinner message="Memuat daftar materi..." />
      ) : materials.length === 0 ? (
        <EmptyState
          title="Tidak Ada Materi Ditemukan"
          description="Belum ada materi pembelajaran yang cocok dengan filter pencarian ini."
          actionLabel="+ Tambah Materi Baru"
          onAction={() => router.push('/(guru)/materials/new')}
        />
      ) : (
        <ScrollView
          style={styles.listContainer}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {materials.map((item) => (
            <View key={item.id} style={[styles.card, Shadows.card]}>
              <View style={styles.cardHeader}>
                <Badge label={item.category} category={item.category} size="sm" />
                <View style={styles.badgesRight}>
                  <Badge label={item.difficulty} difficulty={item.difficulty} size="sm" />
                  <Badge
                    label={item.status === 'published' ? 'Terbit' : 'Draf'}
                    status={item.status}
                    size="sm"
                    style={{ marginLeft: 6 }}
                  />
                </View>
              </View>

              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc} numberOfLines={2}>
                {item.description}
              </Text>

              <View style={styles.cardFooter}>
                <Text style={styles.timeText}>{item.reading_time_minutes} menit baca</Text>

                <View style={styles.actionIcons}>
                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: '/(guru)/materials/[id]/preview',
                        params: { id: item.id },
                      })
                    }
                    style={styles.iconBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Eye size={18} color={Colors.primary} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: '/(guru)/materials/[id]/edit',
                        params: { id: item.id },
                      })
                    }
                    style={styles.iconBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Edit3 size={18} color={Colors.textSecondary} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleDeletePrompt(item)}
                    style={styles.iconBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Trash2 size={18} color={Colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        visible={deleteModalVisible}
        title="Hapus Materi Pembelajaran?"
        message={`Materi "${selectedMaterial?.title}" akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus Permanen"
        cancelLabel="Batal"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
        loading={deleting}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  titleWrap: {},
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  pageSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  searchBox: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    backgroundColor: Colors.surface,
  },
  categoryFilterContainer: {
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  categoryScroll: {
    paddingHorizontal: Spacing.lg,
    gap: 8,
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.secondaryLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  catChipTextActive: {
    color: Colors.textInverse,
  },
  statusFilterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
  },
  statusTab: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  statusTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  statusTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  statusTabTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl * 2,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  badgesRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  timeText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  actionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconBtn: {
    padding: 4,
  },
});
