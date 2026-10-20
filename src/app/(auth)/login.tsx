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
import { router, useLocalSearchParams } from 'expo-router';
import { Mail, Lock, GraduationCap, Laptop, AlertCircle } from 'lucide-react-native';
import { useAuth } from '../../features/auth/AuthContext';
import { UserRole } from '../../types/auth';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing } from '../../constants/theme';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Header } from '../../components/Header';
import { SEED_TEACHER, SEED_STUDENT } from '../../lib/seed-data';

export default function LoginScreen() {
  const params = useLocalSearchParams<{ defaultRole?: string }>();
  const initialRole: UserRole = params.defaultRole === 'guru' ? 'guru' : 'siswa';

  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
  };

  const handleFillDemo = () => {
    if (selectedRole === 'guru') {
      setEmail(SEED_TEACHER.email);
      setPassword('guru123456');
    } else {
      setEmail(SEED_STUDENT.email);
      setPassword('siswa123456');
    }
    setErrorMessage(null);
  };

  const handleLogin = async () => {
    setErrorMessage(null);
    if (!email.trim()) {
      setErrorMessage('Email wajib diisi');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Kata sandi wajib diisi');
      return;
    }

    setLoading(true);
    const result = await login(email.trim(), password, selectedRole);
    setLoading(false);

    if (result.success) {
      if (selectedRole === 'guru') {
        router.replace('/(guru)');
      } else {
        router.replace('/(siswa)');
      }
    } else {
      setErrorMessage(result.error || 'Gagal masuk. Periksa kembali kredensial Anda.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header title="Masuk Akun" showBack onBack={() => router.replace('/')} />

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Role Selector Segmented Control */}
        <View style={styles.roleSelectorBox}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleRoleChange('siswa')}
            style={[
              styles.roleTab,
              selectedRole === 'siswa' && styles.roleTabActive,
            ]}
          >
            <GraduationCap
              size={18}
              color={selectedRole === 'siswa' ? Colors.primary : Colors.textSecondary}
            />
            <Text
              style={[
                styles.roleTabText,
                selectedRole === 'siswa' && styles.roleTabTextActive,
              ]}
            >
              Role Siswa
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleRoleChange('guru')}
            style={[
              styles.roleTab,
              selectedRole === 'guru' && styles.roleTabActive,
            ]}
          >
            <Laptop
              size={18}
              color={selectedRole === 'guru' ? Colors.primary : Colors.textSecondary}
            />
            <Text
              style={[
                styles.roleTabText,
                selectedRole === 'guru' && styles.roleTabTextActive,
              ]}
            >
              Role Guru
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formHeader}>
          <Text style={styles.greetingTitle}>
            Masuk sebagai {selectedRole === 'guru' ? 'Guru' : 'Siswa'}
          </Text>
          <Text style={styles.greetingSubtitle}>
            {selectedRole === 'guru'
              ? 'Kelola pembelajaran informatika dan evaluasi siswa'
              : 'Mulai belajar dan selesaikan kuis informatika hari ini'}
          </Text>
        </View>

        {errorMessage ? (
          <View style={styles.errorBox}>
            <AlertCircle size={18} color={Colors.dangerText} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <Input
          label="Alamat Email"
          placeholder="nama@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          leftIcon={<Mail size={18} color={Colors.textSecondary} />}
        />

        <Input
          label="Kata Sandi"
          placeholder="Minimal 6 karakter"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          leftIcon={<Lock size={18} color={Colors.textSecondary} />}
        />

        <View style={styles.quickFillRow}>
          <TouchableOpacity onPress={handleFillDemo} style={styles.quickFillBtn}>
            <Text style={styles.quickFillText}>
              Gunakan Akun Demo {selectedRole === 'guru' ? 'Guru' : 'Siswa'}
            </Text>
          </TouchableOpacity>
        </View>

        <Button
          title={`Masuk sebagai ${selectedRole === 'guru' ? 'Guru' : 'Siswa'}`}
          onPress={handleLogin}
          loading={loading}
          size="lg"
          style={styles.submitBtn}
        />

        {/* Links to register */}
        <View style={styles.registerLinks}>
          {selectedRole === 'siswa' ? (
            <View style={styles.linkRow}>
              <Text style={styles.regularText}>Siswa baru belum punya akun? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register-siswa')}>
                <Text style={styles.highlightText}>Daftar Siswa</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.linkRow}>
              <Text style={styles.regularText}>Guru baru dengan kode undangan? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register-guru')}>
                <Text style={styles.highlightText}>Daftar Guru</Text>
              </TouchableOpacity>
            </View>
          )}
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
  roleSelectorBox: {
    flexDirection: 'row',
    backgroundColor: Colors.secondaryLight,
    padding: 4,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    gap: 8,
  },
  roleTabActive: {
    backgroundColor: Colors.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  roleTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  roleTabTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  formHeader: {
    marginBottom: Spacing.xl,
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  greetingSubtitle: {
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
  quickFillRow: {
    alignItems: 'flex-end',
    marginBottom: Spacing.lg,
  },
  quickFillBtn: {
    paddingVertical: 4,
  },
  quickFillText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  submitBtn: {
    marginBottom: Spacing.xl,
  },
  registerLinks: {
    alignItems: 'center',
  },
  linkRow: {
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
