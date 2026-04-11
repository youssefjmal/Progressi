'use client';

import { createContext, useContext, useState } from 'react';

type AuthView = 'login' | 'signup';

interface AuthModalContextType {
  isOpen: boolean;
  view: AuthView;
  openLogin: () => void;
  openSignup: () => void;
  close: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<AuthView>('login');

  const openLogin = () => { setView('login'); setIsOpen(true); };
  const openSignup = () => { setView('signup'); setIsOpen(true); };
  const close = () => setIsOpen(false);

  return (
    <AuthModalContext.Provider value={{ isOpen, view, openLogin, openSignup, close }}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error('useAuthModal must be used within AuthModalProvider');
  return ctx;
}
