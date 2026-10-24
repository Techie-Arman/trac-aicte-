'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { User } from '@/types';
import { dataStore } from '@/lib/store';
import { useRouter, usePathname } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  isLoading: boolean;
  isDataLoading: boolean;
  dataError: string | null;
  dataVersion: number;
  login: (email: string, password: string) => Promise<string | null>;
  enterDemoMode: () => Promise<string | null>;
  logout: () => Promise<boolean>;
  retryDataLoad: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<string | null>;
  updatePassword: (password: string) => Promise<string | null>;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_PATHS = [
  '/login',
  '/forgot-password',
  '/reset-password',
  '/auth/callback',
  '/session-expired',
  '/access-denied',
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [dataVersion, setDataVersion] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    let isActive = true;
    const supabase = createClient();
    const updateUser = (authUser: SupabaseUser | null) => {
      if (!isActive) return;

      if (!authUser) {
        dataStore.logout();
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      const fullName = authUser.user_metadata?.full_name;
      const storedProfile = dataStore.getCurrentUser();
      const hasStoredProfile = storedProfile.id === authUser.id;
      const appUser: User = {
        id: authUser.id,
        name: hasStoredProfile
          ? storedProfile.name
          : typeof fullName === 'string' && fullName.trim()
          ? fullName
          : authUser.email ?? 'Official',
        email: authUser.email ?? '',
        role: hasStoredProfile ? storedProfile.role : 'other_official',
        ...(hasStoredProfile && {
          bureau_id: storedProfile.bureau_id,
          bureau_code: storedProfile.bureau_code,
          region: storedProfile.region,
        }),
      };

      dataStore.setCurrentUser(appUser);
      setUser(appUser);
      setIsAuthenticated(true);
    };

    void (async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (!isActive) return;
        if (sessionError) {
          console.error('Unable to read the Supabase session:', sessionError);
          showToast('Unable to read your session. Please sign in again.');
          updateUser(null);
        } else if (!sessionData.session) {
          updateUser(null);
        } else {
          const { data, error } = await supabase.auth.getUser();
          if (!isActive) return;
          if (error) {
            console.error('Unable to verify the Supabase session:', error);
            showToast('Unable to verify your session. Please sign in again.');
            updateUser(null);
          } else {
            updateUser(data.user);
          }
        }
      } catch (error) {
        if (!isActive) return;
        console.error('Unable to restore the Supabase session:', error);
        showToast('Unable to restore your session. Please sign in again.');
        updateUser(null);
      } finally {
        if (isActive) setIsLoading(false);
      }
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isActive) return;
      updateUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, []);

  const retryDataLoad = async () => {
    setIsDataLoading(true);
    setDataError(null);
    try {
      await dataStore.loadFromSupabase();
      setUser(dataStore.getCurrentUser());
      setDataVersion(dataStore.getRevision());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load dashboard data.';
      console.error('Unable to load dashboard data from Supabase:', error);
      setDataError(message);
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      setIsDataLoading(false);
      setDataError(null);
      return;
    }
    void retryDataLoad();
  }, [isAuthenticated, isLoading, user?.id]);

  // Guard: redirect unauthenticated users to login
  useEffect(() => {
    const isPublic = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p));
    if (!isLoading && !isAuthenticated && !isPublic) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  const login = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return 'Supabase sign-in is not configured. Set the Supabase URL and publishable key.';
    }

    try {
      const { data, error } = await createClient().auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.toLowerCase().includes('email not confirmed')) {
          return 'This account’s email is not confirmed. In Supabase Dashboard, open Authentication → Users, select the account, and confirm its email (or resend the confirmation email), then try again.';
        }
        return error.message;
      }
      if (!data.user) return 'Supabase did not return a signed-in user.';

      const fullName = data.user.user_metadata?.full_name;
      const loggedIn: User = {
        id: data.user.id,
        name: typeof fullName === 'string' && fullName.trim()
          ? fullName
          : data.user.email ?? 'Official',
        email: data.user.email ?? email,
        role: 'other_official',
      };
      dataStore.setCurrentUser(loggedIn);
      setUser(loggedIn);
      setIsAuthenticated(true);
      showToast(`Signed in successfully as ${loggedIn.name}`);
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : 'Unable to sign in. Please try again.';
    }
  };

  const enterDemoMode = async () => {
    if (!isSupabaseConfigured) {
      return 'Supabase demo sign-in is not configured. Set the Supabase URL and publishable key.';
    }

    try {
      const response = await fetch('/api/demo-login', { method: 'POST' });
      const result = await response.json() as { error?: string };
      if (!response.ok) {
        return result.error ?? 'Unable to start the demo session.';
      }

      const { data, error } = await createClient().auth.getUser();
      if (error) {
        return `Unable to verify the demo account: ${error.message}`;
      }
      if (!data.user) {
        return 'Supabase did not return a signed-in demo user.';
      }

      const fullName = data.user.user_metadata?.full_name;
      const demoUser: User = {
        id: data.user.id,
        name: typeof fullName === 'string' && fullName.trim()
          ? fullName
          : data.user.email ?? 'Demo User',
        email: data.user.email ?? '',
        role: 'other_official',
      };
      setIsDemoMode(true);
      setIsDataLoading(true);
      setDataError(null);
      dataStore.setCurrentUser(demoUser);
      setUser(demoUser);
      setIsAuthenticated(true);
      showToast('Demo session started');
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : 'Unable to start the demo session.';
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      try {
        const { error } = await createClient().auth.signOut(
          isDemoMode ? { scope: 'local' } : undefined,
        );
        if (error) {
          showToast(`Unable to sign out: ${error.message}`);
          return false;
        }
      } catch (error) {
        showToast(error instanceof Error ? `Unable to sign out: ${error.message}` : 'Unable to sign out.');
        return false;
      }
    }

    setIsDemoMode(false);
    dataStore.logout();
    setUser(null);
    setIsAuthenticated(false);
    showToast('Signed out successfully');
    router.push('/login');
    return true;
  };

  const requestPasswordReset = async (email: string) => {
    if (!isSupabaseConfigured) {
      return 'Supabase password recovery is not configured.';
    }

    try {
      const { error } = await createClient().auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=%2Freset-password`,
      });
      return error?.message ?? null;
    } catch (error) {
      return error instanceof Error ? error.message : 'Unable to send a password recovery link.';
    }
  };

  const updatePassword = async (password: string) => {
    if (!isSupabaseConfigured) {
      return 'Supabase password updates are not configured.';
    }

    try {
      const { error } = await createClient().auth.updateUser({ password });
      return error?.message ?? null;
    } catch (error) {
      return error instanceof Error ? error.message : 'Unable to update your password.';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isDemoMode,
        isLoading,
        isDataLoading,
        dataError,
        dataVersion,
        login,
        enterDemoMode,
        logout,
        retryDataLoad,
        requestPasswordReset,
        updatePassword,
        toastMessage,
        showToast,
      }}
    >
      {children}
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-[9999] px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 animate-fade-in-up"
          style={{
            background: 'rgba(30,30,30,0.95)',
            border: '1px solid rgba(255,255,255,0.15)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            color: '#f5f5f7',
          }}>
          <span className="w-1.5 h-1.5 rounded-full bg-white/70 flex-shrink-0"></span>
          <span>{toastMessage}</span>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
