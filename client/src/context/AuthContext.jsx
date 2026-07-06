import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading' | 'authenticated' | 'anonymous'

  const loadCurrentUser = useCallback(async () => {
    if (!api.tokens.isAuthenticated()) {
      setUser(null);
      setStatus('anonymous');
      return;
    }
    try {
      const { user: currentUser } = await api.auth.me();
      setUser(currentUser);
      setStatus('authenticated');
    } catch {
      api.tokens.clear();
      setUser(null);
      setStatus('anonymous');
    }
  }, []);

  useEffect(() => {
    // Any 401 anywhere in the app means the token is dead - drop it and
    // bounce back to the anonymous state so protected routes redirect.
    api.client.setUnauthorizedHandler(() => {
      api.tokens.clear();
      setUser(null);
      setStatus('anonymous');
    });
    loadCurrentUser();
  }, [loadCurrentUser]);

  const login = useCallback(async ({ email, password }) => {
    const { user: loggedInUser, token } = await api.auth.login({ email, password });
    api.tokens.set(token);
    setUser(loggedInUser);
    setStatus('authenticated');
    return loggedInUser;
  }, []);

  const register = useCallback(async ({ name, email, password }) => {
    const { user: newUser, token } = await api.auth.register({ name, email, password });
    api.tokens.set(token);
    setUser(newUser);
    setStatus('authenticated');
    return newUser;
  }, []);

  const logout = useCallback(() => {
    api.tokens.clear();
    setUser(null);
    setStatus('anonymous');
  }, []);

  const updatePreferences = useCallback(async (prefs) => {
    const { user: updated } = await api.auth.updatePreferences(prefs);
    setUser(updated);
    return updated;
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: status === 'authenticated',
      isLoading: status === 'loading',
      login,
      register,
      logout,
      updatePreferences,
    }),
    [user, status, login, register, logout, updatePreferences]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
