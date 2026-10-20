import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  isNeonConfigured, 
  loginUser, 
  registerStudent, 
  registerTeacher,
  logoutUser,
  validateSession,
  LoginResult,
  RegisterResult,
  SessionResult
} from '../../lib/neon';
import { LocalDataStore } from '../../lib/storage';
import { Profile, UserRole } from '../../types/auth';
import { SEED_TEACHER, SEED_STUDENT } from '../../lib/seed-data';
import { RegisterSiswaFormData, RegisterGuruFormData } from './schemas';

interface AuthContextType {
  user: Profile | null;
  role: UserRole | null;
  isLoading: boolean;
  isConfigured: boolean;
  login: (email: string, password: string, selectedRole: UserRole) => Promise<{ success: boolean; error?: string }>;
  registerSiswa: (data: RegisterSiswaFormData) => Promise<{ success: boolean; error?: string }>;
  registerGuru: (data: RegisterGuruFormData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchRoleDemo: (targetRole: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadInitialSession = useCallback(async () => {
    setIsLoading(true);
    try {
      await LocalDataStore.initialize();

      if (isNeonConfigured) {
        // Check local session token
        const token = await LocalDataStore.getSessionToken();
        if (token) {
          try {
            const result = await validateSession(token);
            if (Array.isArray(result) && result.length > 0 && result[0].user) {
              const profile = mapNeonUserToProfile(result[0].user);
              setUser(profile);
              setIsLoading(false);
              return;
            }
          } catch (e) {
            console.error('Neon session validation failed:', e);
          }
        }
      }

      // Check local session
      const cached = await LocalDataStore.getCurrentUser();
      if (cached) {
        setUser(cached);
      }
    } catch (e) {
      console.error('Error loading session:', e);
    } finally {
      setIsLoading(false);
    }
  }, [isNeonConfigured]);

  useEffect(() => {
    loadInitialSession();
  }, [loadInitialSession]);

  // Helper to map Neon user to Profile type
  const mapNeonUserToProfile = (neonUser: LoginResult['user'] | SessionResult['user']): Profile => ({
    id: neonUser.id,
    email: neonUser.email,
    full_name: neonUser.full_name,
    role: neonUser.role,
    avatar_url: neonUser.avatar_url,
    school_name: neonUser.school_name,
    class_code: neonUser.class_code,
    created_at: neonUser.created_at,
    updated_at: neonUser.updated_at,
  });

  const login = async (
    email: string,
    password: string,
    selectedRole: UserRole
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (isNeonConfigured) {
        try {
          const result = await loginUser(email, password);
          
          if (Array.isArray(result) && result.length > 0) {
            const loginResult = result[0] as LoginResult;
            const neonUser = loginResult.user;
            const token = loginResult.token;
            
            if (neonUser.role !== selectedRole) {
              return {
                success: false,
                error: `Akun ini terdaftar sebagai ${neonUser.role.toUpperCase()}, bukan ${selectedRole.toUpperCase()}. Silakan pilih role yang sesuai.`,
              };
            }

            const profile = mapNeonUserToProfile(neonUser);
            setUser(profile);
            await LocalDataStore.setCurrentUser(profile);
            await LocalDataStore.setSessionToken(token);
            return { success: true };
          }
        } catch (e: any) {
          // Fall through to local/demo auth
          console.log('Neon login failed:', e.message);
        }
      }

      // Fallback / Offline / Demo mode authentication
      const users = await LocalDataStore.getUsers();
      const matched = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

      if (matched) {
        if (matched.role !== selectedRole) {
          return {
            success: false,
            error: `Akun terdaftar sebagai role ${matched.role.toUpperCase()}. Silakan pilih role yang sesuai.`,
          };
        }
        setUser(matched);
        await LocalDataStore.setCurrentUser(matched);
        return { success: true };
      }

      // If demo credentials match
      if (
        (selectedRole === 'guru' && email === SEED_TEACHER.email) ||
        (selectedRole === 'siswa' && email === SEED_STUDENT.email)
      ) {
        const target = selectedRole === 'guru' ? SEED_TEACHER : SEED_STUDENT;
        setUser(target);
        await LocalDataStore.setCurrentUser(target);
        return { success: true };
      }

      return {
        success: false,
        error: 'Email atau kata sandi salah. Silakan coba lagi.',
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Terjadi kesalahan saat masuk' };
    }
  };

  const registerSiswa = async (
    data: RegisterSiswaFormData
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (isNeonConfigured) {
        try {
          const result = await registerStudent(
            data.email,
            data.password,
            data.full_name,
            data.class_code.toUpperCase()
          );
          
          if (Array.isArray(result) && result.length > 0) {
            const regResult = result[0] as RegisterResult;
            const neonUser = regResult.user;
            const token = regResult.token;
            
            const profile = mapNeonUserToProfile(neonUser);
            setUser(profile);
            await LocalDataStore.setCurrentUser(profile);
            await LocalDataStore.setSessionToken(token);
            return { success: true };
          }
        } catch (e: any) {
          return { success: false, error: e.message || 'Gagal mendaftarkan akun siswa.' };
        }
      }

      // Local persistence
      const newProfile: Profile = {
        id: `siswa-${Date.now()}`,
        email: data.email,
        full_name: data.full_name,
        role: 'siswa',
        class_code: data.class_code,
        school_name: 'SMA Informatika',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await LocalDataStore.saveUser(newProfile);
      setUser(newProfile);
      await LocalDataStore.setCurrentUser(newProfile);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Gagal mendaftarkan akun siswa.' };
    }
  };

  const registerGuru = async (
    data: RegisterGuruFormData
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (isNeonConfigured) {
        try {
          const result = await registerTeacher(
            data.email,
            data.password,
            data.full_name,
            data.school_name,
            data.invite_code
          );
          
          if (Array.isArray(result) && result.length > 0) {
            const regResult = result[0] as RegisterResult;
            const neonUser = regResult.user;
            const token = regResult.token;
            
            const profile = mapNeonUserToProfile(neonUser);
            setUser(profile);
            await LocalDataStore.setCurrentUser(profile);
            await LocalDataStore.setSessionToken(token);
            return { success: true };
          }
        } catch (e: any) {
          return { success: false, error: e.message || 'Gagal mendaftarkan akun guru.' };
        }
      }

      // Local persistence
      const newProfile: Profile = {
        id: `guru-${Date.now()}`,
        email: data.email,
        full_name: data.full_name,
        role: 'guru',
        school_name: data.school_name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await LocalDataStore.saveUser(newProfile);
      setUser(newProfile);
      await LocalDataStore.setCurrentUser(newProfile);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Gagal mendaftarkan akun guru.' };
    }
  };

  const logout = async () => {
    try {
      if (isNeonConfigured) {
        const token = await LocalDataStore.getSessionToken();
        if (token) {
          try {
            await logoutUser(token);
          } catch (e) {
            console.error('Neon logout error:', e);
          }
        }
      }
      
      await LocalDataStore.setCurrentUser(null);
      await LocalDataStore.setSessionToken(null);
      setUser(null);
    } catch (e) {
      console.error('Logout error:', e);
      setUser(null);
    }
  };

  const switchRoleDemo = async (targetRole: UserRole) => {
    const target = targetRole === 'guru' ? SEED_TEACHER : SEED_STUDENT;
    setUser(target);
    await LocalDataStore.setCurrentUser(target);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        isLoading,
        isConfigured: isNeonConfigured,
        login,
        registerSiswa,
        registerGuru,
        logout,
        switchRoleDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};