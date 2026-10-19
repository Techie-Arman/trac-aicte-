'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { dataStore } from '@/lib/store';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, role?: string) => boolean;
  logout: () => void;
  switchRole: (user: User) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_PATHS = [
  '/login',
  '/forgot-password',
  '/reset-password',
  '/session-expired',
  '/access-denied',
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(dataStore.getSessionUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(dataStore.isAuthenticated());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Guard: redirect unauthenticated users to login
  useEffect(() => {
    const isPublic = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p));
    if (!isAuthenticated && !isPublic) {
      router.replace('/login');
    }
  }, [isAuthenticated, pathname, router]);

  const login = (email: string, role?: string) => {
    const loggedIn = dataStore.login(email, role);
    setUser(loggedIn);
    setIsAuthenticated(true);
    showToast(`Signed in successfully as ${loggedIn.name} (${loggedIn.role})`);
    return true;
  };

  const logout = () => {
    dataStore.logout();
    setUser(null);
    setIsAuthenticated(false);
    showToast('Signed out of demo session');
    router.push('/login');
  };

  const switchRole = (newUser: User) => {
    dataStore.setCurrentUser(newUser);
    setUser(newUser);
    setIsAuthenticated(true);
    showToast(`Switched preview perspective to ${newUser.name} (${newUser.role})`);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        switchRole,
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
