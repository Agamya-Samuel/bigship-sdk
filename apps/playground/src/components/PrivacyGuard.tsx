'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'bigship-playground-privacy';

interface PrivacyGuardContextType {
  privacyEnabled: boolean;
  togglePrivacy: () => void;
}

const PrivacyGuardContext = createContext<PrivacyGuardContextType | null>(null);

function loadPrivacy(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return sessionStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function savePrivacy(enabled: boolean) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY, String(enabled));
  } catch {
    // ignore
  }
}

export function PrivacyGuardProvider({ children }: { children: ReactNode }) {
  const [privacyEnabled, setPrivacyEnabled] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPrivacyEnabled(loadPrivacy());
    setHydrated(true);
  }, []);

  const togglePrivacy = useCallback(() => {
    setPrivacyEnabled((prev) => {
      const next = !prev;
      savePrivacy(next);
      return next;
    });
  }, []);

  return (
    <PrivacyGuardContext.Provider value={{ privacyEnabled: hydrated && privacyEnabled, togglePrivacy }}>
      {children}
    </PrivacyGuardContext.Provider>
  );
}

export function usePrivacyGuard() {
  const ctx = useContext(PrivacyGuardContext);
  if (!ctx) throw new Error('usePrivacyGuard must be used within PrivacyGuardProvider');
  return ctx;
}
