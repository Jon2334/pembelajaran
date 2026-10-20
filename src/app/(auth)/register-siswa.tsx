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
import { User, Mail, Lock, School, AlertCircle } from 'lucide-react-native';
import { useAuth } from '../../features/auth/AuthContext';
import { registerSiswaSchema } from '../../features/auth/schemas';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing } from '../../constants/theme';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Header } from '../../components/Header';

export default function RegisterSiswaScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [classCode, setClassCode] = useState('X-RPL-1');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { registerSiswa } = useAuth();

  const handleRegister = async () => {
    setErrors({});
    setGeneralError(null);

    const validation = registerSiswaSchema.safeParse({
      full_name: fullName,
      email,
      class_code: classCode,
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
    const result = await registerSiswa(validation.data);
    setLoading(false);

    if (result.success) {
      router.replace('/(siswa)');
    } else {
      setGeneralError(result.error || 'Gagal mendaftarkan akun siswa');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header title="Pendaftaran Siswa" showBack onBack={() => router.back()} />

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Buat Akun Siswa</Text>
          <Text style={styles.subtitle}>
            Daftarkan akun untuk mulai mengakses materi pembelajaran dan kuis informatika.
          </Text>
        </View>

        {generalError ? (
          <View style={styles.errorBox}>
            <AlertCircle size={18} color={Colors.dangerText} />
            <Text style={styles.errorText}>{generalError}</Text>
          </View>
        ) : null}

        <Input
          label="Nama Lengkap *"
          placeholder="Contoh: Muhammad Rayhan"
          value={fullName}
          onChangeText={setFullName}
          error={errors.full_name}
          leftIcon={<User size={18} color={Colors.textSecondary} />}
        />

        <Input
          label="Alamat Email *"
          placeholder="rayhan@siswa.sch.id"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
          leftIcon={<Mail size={18} color={Colors.textSecondary} />}
        />

        <Input
          label="Kode Kelas Siswa *"
          placeholder="Contoh: X-RPL-1"
          value={classCode}
          onChangeText={setClassCode}
          autoCapitalize="characters"
          error={errors.class_code}
          helper="Diberikan oleh guru mata pelajaran Informatika Anda (misal: X-RPL-1, X-TKJ-1)"
          leftIcon={<School size={18} color={Colors.textSecondary} />}
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
          title="Daftar Sekarang"
          onPress={handleRegister}
          loading={loading}
          size="lg"
          style={styles.submitBtn}
        />

        <View style={styles.loginLink}>
          <Text style={styles.regularText}>Sudah memiliki akun? </Text>
          <TouchableOpacity onPress={() => router.push({ pathname: '/(auth)/login', params: { defaultRole: 'siswa' } })}>
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
    marginBottom: Spacing.xl,
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
