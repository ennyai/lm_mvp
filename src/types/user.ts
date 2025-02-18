import { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  client_id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface UserWithProfile extends User {
  profile?: UserProfile;
} 