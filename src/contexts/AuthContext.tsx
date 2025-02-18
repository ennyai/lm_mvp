import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { message } from 'antd';
import { supabase } from '../utils/supabase';
import { AuthContextType, AuthProviderProps, AuthState } from '../types/auth';
import { userService } from '../services/userService';
import { UserProfile } from '../types/user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const loadProfile = async (user: User) => {
    try {
      let userProfile = await userService.getProfile(user.id);
      
      // If no profile exists and user is confirmed, create one
      if (!userProfile && user.email_confirmed_at) {
        userProfile = await userService.createProfile(user.id, user.email || '');
      }
      
      if (userProfile) {
        setProfile(userProfile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  useEffect(() => {
    // Check active sessions and subscribe to auth changes
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(prev => ({
        ...prev,
        user: session?.user ?? null,
        loading: false,
      }));
      setToken(session?.access_token ?? null);
      if (session?.user) {
        loadProfile(session.user);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user);
      
      setState(prev => ({
        ...prev,
        user: session?.user ?? null,
        loading: false,
      }));
      setToken(session?.access_token ?? null);
      
      if (session?.user) {
        await loadProfile(session.user);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthError = (error: AuthError | Error) => {
    console.error('Auth error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    message.error(errorMessage);
    setState(prev => ({ ...prev, error: error instanceof Error ? error : new Error(errorMessage) }));
    throw error;
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        await loadProfile(data.user);
        return data.user;
      }
    } catch (error) {
      handleAuthError(error as AuthError);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Don't create profile here - wait for email confirmation
        return data.user;
      }
    } catch (error) {
      handleAuthError(error as AuthError);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear all auth state
      setState({
        user: null,
        loading: false,
        error: null
      });
      setProfile(null);
      setToken(null);
      
    } catch (error) {
      handleAuthError(error as AuthError);
    }
  };

  const value = {
    ...state,
    profile,
    token,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 