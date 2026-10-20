import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing } from '../../constants/theme';
import { INFORMATIKA_CATEGORIES } from '../../constants/categories';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { LearningMaterial, MaterialCategory, DifficultyLevel } from '../../types/materials';

interface MaterialFormProps {
  initialValues?: Partial<LearningMaterial>;
  onSubmit: (values: Omit<LearningMaterial, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const DIFFICULTIES: DifficultyLevel[] = ['Pemula', 'Menengah', 'Mahir'];

export const MaterialForm: React.FC<MaterialFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [title, setTitle] = useState(initialValues?.title || '');
  const [category, setCategory] = useState<MaterialCategory>(
    initialValues?.category || 'Dasar-Dasar Informatika'
  );
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(
    initialValues?.difficulty || 'Pemula'
  );
  const [readingTime, setReadingTime] = useState(
    initialValues?.reading_time_minutes ? String(initialValues.reading_time_minutes) : '10'
  );
  const [description, setDescription] = useState(initialValues?.description || '');
  const [content, setContent] = useState(initialValues?.content || '');
  const [coverImageUrl, setCoverImageUrl] = useState(initialValues?.cover_image_url || '');
  const [isPublished, setIsPublished] = useState(initialValues?.status === 'published');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Judul materi wajib diisi';
    if (!description.trim()) errs.description = 'Deskripsi singkat wajib diisi';
    if (!content.trim()) errs.content = 'Isi konten materi pembelajaran wajib diisi';
    if (isNaN(Number(readingTime)) || Number(readingTime) <= 0) {
      errs.readingTime = 'Estimasi waktu baca harus berupa angka lebih dari 0';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    await onSubmit({
      teacher_id: initialValues?.teacher_id || 'guru-demo-001',
      title: title.trim(),
      slug: title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category,
      difficulty,
      reading_time_minutes: parseInt(readingTime, 10) || 10,
      description: description.trim(),
      content: content.trim(),
      cover_image_url: coverImageUrl.trim() || null,
      status: isPublished ? 'published' : 'draft',
      order_index: initialValues?.order_index || 1,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Input
        label="Judul Materi Pembelajaran *"
        placeholder="Contoh: Arsitektur Von Neumann & CPU"
        value={title}
        onChangeText={setTitle}
        error={errors.title}
      />

      <View style={styles.section}>
        <Text style={styles.label}>Topik Kategori Informatika *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {INFORMATIKA_CATEGORIES.map((c) => {
            const isSelected = category === c.name;
            return (
              <TouchableOpacity
                key={c.name}
                onPress={() => setCategory(c.name)}
                style={[
                  styles.categoryChip,
                  isSelected && styles.categoryChipSelected,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    isSelected && styles.chipTextSelected,
                  ]}
                >
                  {c.shortName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Tingkat Kesulitan *</Text>
        <View style={styles.row}>
          {DIFFICULTIES.map((d) => {
            const isSelected = difficulty === d;
            return (
              <TouchableOpacity
                key={d}
                onPress={() => setDifficulty(d)}
                style={[
                  styles.diffChip,
                  isSelected && styles.diffChipSelected,
                ]}
              >
                <Text
                  style={[
                    styles.diffText,
                    isSelected && styles.diffTextSelected,
                  ]}
                >
                  {d}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <Input
        label="Estimasi Waktu Membaca (Menit) *"
        placeholder="10"
        value={readingTime}
        onChangeText={setReadingTime}
        keyboardType="numeric"
        error={errors.readingTime}
      />

      <Input
        label="URL Gambar Sampul (Opsional)"
        placeholder="https://images.unsplash.com/photo-..."
        value={coverImageUrl}
        onChangeText={setCoverImageUrl}
      />

      <Input
        label="Deskripsi Singkat / Ringkasan *"
        placeholder="Tuliskan rangkuman 1-2 kalimat tentang materi ini..."
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
        style={{ minHeight: 70, textAlignVertical: 'top' }}
        error={errors.description}
      />

      <Input
        label="Isi Konten Materi (Mendukung Markdown) *"
        placeholder="# Judul Bagian&#10;&#10;Penjelasan materi...&#10;&#10;## Sub-bab&#10;- Poin penting&#10;- Poin kedua"
        value={content}
        onChangeText={setContent}
        multiline
        numberOfLines={12}
        style={{ minHeight: 220, textAlignVertical: 'top' }}
        error={errors.content}
      />

      <View style={styles.publishBox}>
        <View style={styles.publishInfo}>
          <Text style={styles.publishTitle}>Status Publikasi</Text>
          <Text style={styles.publishDesc}>
            {isPublished
              ? 'Materi langsung dapat dilihat & dipelajari oleh siswa'
              : 'Disimpan sebagai draf (hanya dapat dilihat oleh guru)'}
          </Text>
        </View>
        <Switch
          value={isPublished}
          onValueChange={setIsPublished}
          trackColor={{ false: Colors.border, true: Colors.primary }}
          thumbColor={Colors.surface}
        />
      </View>

      <View style={styles.buttonRow}>
        <Button
          title="Batal"
          variant="outline"
          onPress={onCancel}
          disabled={loading}
          style={styles.btn}
        />
        <Button
          title={isPublished ? 'Simpan & Publikasikan' : 'Simpan Draf'}
          variant="primary"
          onPress={handleSubmit}
          loading={loading}
          style={styles.btn}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl * 2,
  },
  section: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  chipScroll: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  categoryChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: Colors.textInverse,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  diffChip: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  diffChipSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  diffText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  diffTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  publishBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginVertical: Spacing.md,
  },
  publishInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  publishTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  publishDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  btn: {
    flex: 1,
  },
});
