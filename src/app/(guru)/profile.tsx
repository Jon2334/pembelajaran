import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { User, Mail, School, Shield, LogOut, Smartphone } from 'lucide-react-native';
import { useAuth } from '../../features/auth/AuthContext';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { ConfirmModal } from '../../components/ConfirmModal';
import { Colors } from '../../constants/colors';
import { BorderRadius, Shadows, Spacing } from '../../constants/theme';
import { isNeonConfigured } from '../../lib/config';

export default function GuruProfileScreen() {
  const { user, logout } = useAuth();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const handleLogout = async () => {
    await logout();
    setLogoutModalVisible(false);
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <Header title="Profil Guru" />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={[styles.profileCard, Shadows.card]}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <User size={36} color={Colors.primary} />
            </View>
          </View>
          <Text style={styles.fullName}>{user?.full_name || 'Budi Santoso, M.Kom.'}</Text>
          <Text style={styles.emailText}>{user?.email}</Text>
          <View style={styles.roleBadgeWrap}>
            <Badge label="GURU / PENGAJAR" variant="primary" size="md" />
          </View>
        </View>

        {/* Detailed Info */}
        <View style={[styles.infoSection, Shadows.card]}>
          <Text style={styles.infoTitle}>Informasi Kepegawaian</Text>

          <View style={styles.infoRow}>
            <School size={18} color={Colors.textSecondary} />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Sekolah / Instansi</Text>
              <Text style={styles.infoVal}>{user?.school_name || 'SMA Negeri Informatika Digital'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Mail size={18} color={Colors.textSecondary} />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Email Resmi</Text>
              <Text style={styles.infoVal}>{user?.email}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Shield size={18} color={Colors.textSecondary} />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Hak Akses Sistem</Text>
              <Text style={styles.infoVal}>Pendidik Terverifikasi (Akses Penuh Manajemen)</Text>
            </View>
          </View>
        </View>

        {/* Backend Status Box */}
        <View style={[styles.statusBox, Shadows.card]}>
          <View style={styles.statusBoxHeader}>
            <Smartphone size={18} color={Colors.primary} />
            <Text style={styles.statusBoxTitle}>Status Sinkronisasi Backend</Text>
          </View>
          <Text style={styles.statusBoxDesc}>
            {isNeonConfigured
              ? 'Terkoneksi ke Neon PostgreSQL Cloud Database.'
              : 'Berjalan dalam mode Offline-First Local Store (Data tersimpan di penyimpanan perangkat).'}
          </Text>
        </View>

        {/* Logout Button */}
        <Button
          title="Keluar dari Akun"
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
        title="Konfirmasi Keluar"
        message="Apakah Anda yakin ingin keluar dari akun Guru ini?"
        confirmLabel="Keluar"
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
  roleBadgeWrap: {
    marginTop: 2,
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
  statusBox: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xl,
  },
  statusBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  statusBoxTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  statusBoxDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  logoutBtn: {
    marginBottom: Spacing.xl,
  },
});
