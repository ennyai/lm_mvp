import { supabase } from '../utils/supabase';
import { UserProfile } from '../types/user';

export const userService = {
  async createProfile(userId: string, email: string): Promise<UserProfile | null> {
    const clientId = `client_${Date.now()}`; // Simple client_id generation
    console.log('Creating profile for user:', { userId, email, clientId });
    
    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          user_id: userId,
          client_id: clientId,
          email,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      return null;
    }

    console.log('Profile created successfully:', data);
    return data;
  },

  async getProfile(userId: string): Promise<UserProfile | null> {
    console.log('Fetching profile for user:', userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    console.log('Profile fetched:', data);
    return data;
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    console.log('Updating profile for user:', { userId, updates });
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }

    console.log('Profile updated successfully:', data);
    return data;
  },
}; 