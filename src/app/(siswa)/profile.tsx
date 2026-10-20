import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { User, Mail, School, LogOut, CheckCircle2, BookOpen } from 'lucide-react-native';
import { useAuth } from '../../features/auth/AuthContext';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { ConfirmModal } from '../../components/ConfirmModal';
import { Colors } from '../../constants/colors';
import { BorderRadius, Shadows, Spacing } from '../../constants/theme';
import { isNeonConfigured } from '../../lib/config';

export default function SiswaProfileScreen() {
  const { user, logout } = useAuth();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const handleLogout = async () => {
    await logout();
    setLogoutModalVisible(false);
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <Header title="Profil Siswa" />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={[styles.profileCard, Shadows.card]}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <User size={36} color={Colors.primary} />
            </View>
          </View>
          <Text style={styles.fullName}>{user?.full_name || 'Ahmad Fauzi'}</Text>
          <Text style={styles.emailText}>{user?.email}</Text>
          <View style={styles.badgeRow}>
            <Badge label="SISWA" variant="success" size="md" />
            <Badge
              label={`KELAS: ${user?.class_code || 'X-RPL-1'}`}
              variant="primary"
              size="md"
            />
          </View>
        </View>

        {/* Academic Profile Details */}
        <View style={[styles.infoSection, Shadows.card]}>
          <Text style={styles.infoTitle}>Informasi Akademik</Text>

          <View style={styles.infoRow}>
            <School size={18} color={Colors.textSecondary} />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Sekolah</Text>
              <Text style={styles.infoVal}>{user?.school_name || 'SMA Negeri Informatika Digital'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Mail size={18} color={Colors.textSecondary} />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Email Siswa</Text>
              <Text style={styles.infoVal}>{user?.email}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <BookOpen size={18} color={Colors.textSecondary} />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Program Keahlian</Text>
              <Text style={styles.infoVal}>Informatika & Rekayasa Perangkat Lunak</Text>
            </View>
          </View>
        </View>

        {/* System & Storage Info */}
        <View style={[styles.infoSection, Shadows.card]}>
          <Text style={styles.infoTitle}>Status Akun & Keamanan</Text>
          <View style={styles.infoRow}>
            <CheckCircle2 size={18} color={Colors.success} />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Status Autentikasi</Text>
              <Text style={styles.infoVal}>
                {isNeonConfigured
                  ? 'Terautentikasi Neon Auth (RPC Server-side)'
                  : 'Sesi Aktif di Perangkat (Offline-First Store)'}
              </Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <Button
          title="Keluar dari Akun Siswa"
          variant="danger"
          size="lg"
          onPress={() => setLogoutModalVisible(true)}
          icon={<LogOut size={18} color={Colors.textInverse} />}
          style={styles.logoutBtn}
        />
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        visible={logoutModalVisible}
        title="Keluar dari Akun?"
        message="Sesi belajar Anda akan diakhiri. Anda dapat masuk kembali kapan saja."
        confirmLabel="Ya, Keluar"
        cancelLabel="Batal"
        confirmVariant="danger"
        onConfirm={handleLogout}
        onCancel={() => setLogoutModalVisible(false)}
      />
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
  profileCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  avatarWrap: {
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullName: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  infoSection: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  infoVal: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  logoutBtn: {
    marginBottom: Spacing.xl,
  },
});
