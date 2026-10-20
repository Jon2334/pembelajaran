import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { School, GraduationCap, Copy, Check } from 'lucide-react-native';
import { LocalDataStore } from '../../../lib/storage';
import { Header } from '../../../components/Header';
import { Badge } from '../../../components/Badge';
import { Profile, ClassRoom } from '../../../types/auth';
import { Colors } from '../../../constants/colors';
import { BorderRadius, Shadows, Spacing } from '../../../constants/theme';
import { LoadingSpinner } from '../../../components/LoadingSpinner';

export default function GuruStudentsScreen() {
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const cls = await LocalDataStore.getClasses();
      const users = await LocalDataStore.getUsers();
      const stds = users.filter((u) => u.role === 'siswa');
      setClasses(cls);
      setStudents(stds);
    } catch (e) {
      console.error('Error fetching students', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopyCode = (code: string) => {
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return <LoadingSpinner message="Memuat data kelas & siswa..." />;
  }

  return (
    <View style={styles.container}>
      <Header title="Daftar Siswa & Kelas" />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Classes Card Section */}
        <Text style={styles.sectionTitle}>Kode Kelas Pembelajaran</Text>
        <Text style={styles.sectionSubtitle}>
          Bagikan kode kelas berikut kepada siswa saat mereka mendaftar akun baru:
        </Text>

        {classes.map((c) => (
          <View key={c.id} style={[styles.classCard, Shadows.card]}>
            <View style={styles.classInfo}>
              <View style={styles.classIcon}>
                <School size={22} color={Colors.primary} />
              </View>
              <View style={styles.classText}>
                <Text style={styles.className}>{c.name}</Text>
                <Text style={styles.classDesc}>
                  Tahun Ajaran {c.academic_year} • {c.student_count || 30} Siswa
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleCopyCode(c.code)}
              style={styles.codePill}
            >
              <Text style={styles.codeText}>{c.code}</Text>
              {copiedCode === c.code ? (
                <Check size={16} color={Colors.success} />
              ) : (
                <Copy size={16} color={Colors.primary} />
              )}
            </TouchableOpacity>
          </View>
        ))}

        {/* Students List */}
        <View style={styles.studentsHeader}>
          <Text style={styles.sectionTitle}>Siswa Terdaftar ({students.length})</Text>
          <Badge label="Aktif" variant="success" size="sm" />
        </View>

        {students.map((student, idx) => (
          <View key={student.id || idx} style={[styles.studentCard, Shadows.card]}>
            <View style={styles.avatarCircle}>
              <GraduationCap size={20} color={Colors.primary} />
            </View>
            <View style={styles.studentDetails}>
              <Text style={styles.studentName}>{student.full_name}</Text>
              <Text style={styles.studentEmail}>{student.email}</Text>
            </View>
            <Badge
              label={student.class_code || 'X-RPL-1'}
              variant="primary"
              size="sm"
            />
          </View>
        ))}
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  classCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  classInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  classIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  classText: {
    flex: 1,
  },
  className: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  classDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  codePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
  },
  codeText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  studentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  studentEmail: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
