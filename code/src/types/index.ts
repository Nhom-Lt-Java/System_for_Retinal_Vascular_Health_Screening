export type UserRole = 'PATIENT' | 'DOCTOR' | 'CLINIC_ADMIN' | 'SYSTEM_ADMIN';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}