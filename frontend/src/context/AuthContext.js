import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { getErrorMessage } from '../utils/helpers';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('spendwise_user');
    const token  = localStorage.getItem('spendwise_token');
    if (stored && token) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('spendwise_token', data.token);
      localStorage.setItem('spendwise_user', JSON.stringify(data));
      setUser(data);
      toast.success(`Welcome back, ${data.name}!`);
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err));
      return false;
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('spendwise_token', data.token);
      localStorage.setItem('spendwise_user', JSON.stringify(data));
      setUser(data);
      toast.success(`Account created! Welcome, ${data.name}!`);
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err));
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('spendwise_token');
    localStorage.removeItem('spendwise_user');
    setUser(null);
    toast.info('Logged out.');
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
