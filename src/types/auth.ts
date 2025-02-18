import { User } from '@supabase/supabase-js';
import { UserProfile } from './user';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

export interface AuthContextType extends AuthState {
  profile: UserProfile | null;
  signIn: (email: string, password: string) => Promise<User | undefined>;
  signUp: (email: string, password: string) => Promise<User | undefined>;
  signOut: () => Promise<void>;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}

// Extended User type to include access_token
export interface ExtendedUser extends User {
  access_token?: string;
} 