import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { User, Mail, Lock, KeyRound, Building2, AlertCircle, ShieldAlert } from 'lucide-react-native';
import { useAuth } from '../../features/auth/AuthContext';
import { registerGuruSchema } from '../../features/auth/schemas';
import { APP_CONFIG } from '../../lib/config';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing } from '../../constants/theme';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Header } from '../../components/Header';

export default function RegisterGuruScreen() {
  const [fullName, setFullName] = useState('');
  const [schoolName, setSchoolName] = useState('SMA Negeri 1 Informatika');
  const [email, setEmail] = useState('');
  const [inviteCode, setInviteCode] = useState(APP_CONFIG.teacherInviteCode);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { registerGuru } = useAuth();

  const handleRegister = async () => {
    setErrors({});
    setGeneralError(null);

    const validation = registerGuruSchema.safeParse({
      full_name: fullName,
      school_name: schoolName,
      email,
      invite_code: inviteCode,
      password,
      confirmPassword,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const result = await registerGuru(validation.data);
    setLoading(false);

    if (result.success) {
      router.replace('/(guru)');
    } else {
      setGeneralError(result.error || 'Gagal mendaftarkan akun guru');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header title="Pendaftaran Guru" showBack onBack={() => router.back()} />

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Registrasi Akun Pengajar</Text>
          <Text style={styles.subtitle}>
            Portal khusus guru membutuhkan kode undangan resmi untuk verifikasi hak akses pendidik.
          </Text>
        </View>

        {/* Security Info Box */}
        <View style={styles.securityBox}>
          <ShieldAlert size={20} color="#B45309" />
          <View style={styles.securityTextWrap}>
            <Text style={styles.securityTitle}>Verifikasi Hak Akses Guru</Text>
            <Text style={styles.securityDesc}>
              Siswa tidak diizinkan mendaftar sebagai guru. Kode undangan diperoleh dari admin sekolah.
            </Text>
          </View>
        </View>

        {generalError ? (
          <View style={styles.errorBox}>
            <AlertCircle size={18} color={Colors.dangerText} />
            <Text style={styles.errorText}>{generalError}</Text>
          </View>
        ) : null}

        <Input
          label="Nama Lengkap Beserta Gelar *"
          placeholder="Contoh: Budi Santoso, M.Kom."
          value={fullName}
          onChangeText={setFullName}
          error={errors.full_name}
          leftIcon={<User size={18} color={Colors.textSecondary} />}
        />

        <Input
          label="Instansi / Sekolah *"
          placeholder="Contoh: SMA Negeri 1 Informatika"
          value={schoolName}
          onChangeText={setSchoolName}
          error={errors.school_name}
          leftIcon={<Building2 size={18} color={Colors.textSecondary} />}
        />

        <Input
          label="Alamat Email Guru *"
          placeholder="budi.santoso@guru.sch.id"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
          leftIcon={<Mail size={18} color={Colors.textSecondary} />}
        />

        <Input
          label="Kode Undangan Resmi Guru *"
          placeholder="GURU-INFORMATIKA-2026"
          value={inviteCode}
          onChangeText={setInviteCode}
          autoCapitalize="characters"
          error={errors.invite_code}
          helper={`Kode undangan default pengujian: ${APP_CONFIG.teacherInviteCode}`}
          leftIcon={<KeyRound size={18} color={Colors.textSecondary} />}
        />

        <Input
          label="Kata Sandi *"
          placeholder="Minimal 6 karakter"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          error={errors.password}
          leftIcon={<Lock size={18} color={Colors.textSecondary} />}
        />

        <Input
          label="Konfirmasi Kata Sandi *"
          placeholder="Ketik ulang kata sandi"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          error={errors.confirmPassword}
          leftIcon={<Lock size={18} color={Colors.textSecondary} />}
        />

        <Button
          title="Verifikasi & Daftarkan Guru"
          onPress={handleRegister}
          loading={loading}
          size="lg"
          style={styles.submitBtn}
        />

        <View style={styles.loginLink}>
          <Text style={styles.regularText}>Sudah memiliki akun guru? </Text>
          <TouchableOpacity onPress={() => router.push({ pathname: '/(auth)/login', params: { defaultRole: 'guru' } })}>
            <Text style={styles.highlightText}>Masuk di sini</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl * 2,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  securityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
    borderWidth: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  securityTextWrap: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },
  securityDesc: {
    fontSize: 12,
    color: '#B45309',
    marginTop: 2,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.dangerLight,
    borderColor: '#FECACA',
    borderWidth: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontSize: 13,
    color: Colors.dangerText,
    flex: 1,
  },
  submitBtn: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  loginLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  regularText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  highlightText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
});
