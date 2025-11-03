"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AuthAPI,
  clearAuthToken,
  getStoredToken,
  getTokenPersistence,
  setAuthToken,
} from '../lib/api';

const AuthContext = createContext({
  user: null,
  loading: true,
  setSession: () => {},
  logout: () => {},
  persist: true,
});

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [persistPreference, setPersistPreference] = useState(() => {
    const storage = getTokenPersistence();
    return storage === 'session' ? false : true;
  });
  const persistRef = useRef(persistPreference);

  useEffect(() => {
    let isMounted = true;

    const initialise = async () => {
      const storage = getTokenPersistence();
      if (storage) {
        const persist = storage !== 'session';
        persistRef.current = persist;
        if (isMounted) setPersistPreference(persist);
      }

      const token = getStoredToken();
      if (!token) {
        if (isMounted) setLoading(false);
        return;
      }

      setAuthToken(token);
      try {
        const response = await AuthAPI.me();
        if (!isMounted) return;
        if (response?.data?.user) {
          setUser(response.data.user);
        } else {
          clearAuthToken();
          setUser(null);
        }
      } catch (error) {
        clearAuthToken();
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initialise();

    return () => {
      isMounted = false;
    };
  }, []);

  const setSession = useCallback(
    ({ token, user: newUser, persist }) => {
      const effectivePersist =
        typeof persist === 'boolean' ? persist : persistRef.current;

      if (typeof persist === 'boolean' && persist !== persistRef.current) {
        persistRef.current = persist;
        setPersistPreference(persist);
      }

      if (token) {
        setAuthToken(token, { persist: effectivePersist });
      }
      setUser(newUser || null);
    },
    [setPersistPreference],
  );

  const logout = useCallback(() => {
    clearAuthToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      setSession,
      logout,
      persist: persistPreference,
    }),
    [user, loading, setSession, logout, persistPreference],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
