import { neon, neonConfig, Pool } from '@neondatabase/serverless';
import { APP_CONFIG, isNeonConfigured } from './config';

// Configure neon for React Native / Expo environment
neonConfig.poolQueryViaFetch = true;
neonConfig.fetchConnectionCache = true;

let sql: ReturnType<typeof neon> | null = null;
let pool: Pool | null = null;

export function getNeonClient() {
  if (!isNeonConfigured) {
    throw new Error('Neon database URL not configured. Set EXPO_PUBLIC_NEON_DATABASE_URL in .env');
  }
  
  if (!sql) {
    sql = neon(APP_CONFIG.neonDatabaseUrl);
  }
  
  return sql;
}

function getPool() {
  if (!isNeonConfigured) {
    throw new Error('Neon database URL not configured. Set EXPO_PUBLIC_NEON_DATABASE_URL in .env');
  }
  
  if (!pool) {
    pool = new Pool({ connectionString: APP_CONFIG.neonDatabaseUrl });
  }
  
  return pool;
}

export { isNeonConfigured };

// Type for query results
type NeonQueryResult<T> = T[];

// Type-safe query helpers using tagged template literals
export async function queryOne<T>(strings: TemplateStringsArray, ...values: unknown[]): Promise<T | null> {
  const client = getNeonClient();
  const result = await client(strings, ...values) as NeonQueryResult<T>;
  return result.length > 0 ? result[0] : null;
}

export async function queryMany<T>(strings: TemplateStringsArray, ...values: unknown[]): Promise<T[]> {
  const client = getNeonClient();
  const result = await client(strings, ...values) as NeonQueryResult<T>;
  return result;
}

export async function querySingle<T>(strings: TemplateStringsArray, ...values: unknown[]): Promise<T> {
  const client = getNeonClient();
  const result = await client(strings, ...values) as NeonQueryResult<T>;
  if (result.length === 0) {
    throw new Error('No rows returned');
  }
  return result[0];
}

export async function execute(strings: TemplateStringsArray, ...values: unknown[]): Promise<void> {
  const client = getNeonClient();
  await client(strings, ...values);
}

// Raw query with parameterized values (for dynamically built queries)
export async function rawQuery<T>(query: string, params: unknown[] = []): Promise<T[]> {
  const p = getPool();
  const result = await p.query(query, params);
  return result.rows as T[];
}

// Specialized RPC functions using tagged template literals with type assertions
export async function loginUser(email: string, password: string): Promise<LoginResult[]> {
  const client = getNeonClient();
  const result = await client`SELECT * FROM public.login_user(${email.toLowerCase()}, ${password})`;
  return result as unknown as LoginResult[];
}

export async function registerStudent(email: string, password: string, fullName: string, classCode: string): Promise<RegisterResult[]> {
  const client = getNeonClient();
  const result = await client`SELECT * FROM public.register_student(${email.toLowerCase()}, ${password}, ${fullName}, ${classCode.toUpperCase()})`;
  return result as unknown as RegisterResult[];
}

export async function registerTeacher(email: string, password: string, fullName: string, schoolName: string, inviteCode: string): Promise<RegisterResult[]> {
  const client = getNeonClient();
  const result = await client`SELECT * FROM public.register_teacher(${email.toLowerCase()}, ${password}, ${fullName}, ${schoolName}, ${inviteCode})`;
  return result as unknown as RegisterResult[];
}

export async function logoutUser(token: string): Promise<void> {
  const client = getNeonClient();
  await client`SELECT public.logout_user(${token})`;
}

export async function validateSession(token: string): Promise<SessionResult[]> {
  const client = getNeonClient();
  const result = await client`SELECT * FROM public.validate_session(${token})`;
  return result as unknown as SessionResult[];
}

export async function createTeacherInvitation(code: string, email: string | null): Promise<InvitationResult[]> {
  const client = getNeonClient();
  const result = await client`SELECT * FROM public.create_teacher_invitation(${code}, ${email})`;
  return result as unknown as InvitationResult[];
}

// Define the return types for RPC functions
export interface LoginResult {
  user: {
    id: string;
    email: string;
    full_name: string;
    role: 'guru' | 'siswa' | 'admin';
    avatar_url: string | null;
    school_name: string | null;
    class_code: string | null;
    created_at: string;
    updated_at: string;
  };
  token: string;
}

export interface RegisterResult {
  user: {
    id: string;
    email: string;
    full_name: string;
    role: 'guru' | 'siswa' | 'admin';
    avatar_url: string | null;
    school_name: string | null;
    class_code: string | null;
    created_at: string;
    updated_at: string;
  };
  token: string;
}

export interface SessionResult {
  user: {
    id: string;
    email: string;
    full_name: string;
    role: 'guru' | 'siswa' | 'admin';
    avatar_url: string | null;
    school_name: string | null;
    class_code: string | null;
    created_at: string;
    updated_at: string;
  };
}

export interface InvitationResult {
  code: string;
  email: string | null;
  expires_at: string;
}