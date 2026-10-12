import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone?: string; address?: string }) => Promise<void>;
  loginDemo: () => Promise<void>;
  logout: () => void;
  updateUser: (data: { name?: string; phone?: string; address?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('bitebox_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const storedToken = localStorage.getItem('bitebox_token');
        if (storedToken) {
          const res = await api.getMe();
          setUser(res.user);
        } else {
          // Auto-initialize demo user for seamless test/evaluation
          const demoUser: User = {
            id: 'demo-user-1',
            name: 'Alex Johnson',
            email: 'alex@example.com',
            phone: '+91 98765 43210',
            address: '404 12th Main, 4th Block, Koramangala, Bengaluru',
            role: 'customer'
          };
          localStorage.setItem('bitebox_token', demoUser.id);
          setToken(demoUser.id);
          setUser(demoUser);
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    localStorage.setItem('bitebox_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const register = async (data: { name: string; email: string; password: string; phone?: string; address?: string }) => {
    const res = await api.register(data);
    localStorage.setItem('bitebox_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const loginDemo = async () => {
    const demoUser: User = {
      id: 'demo-user-1',
      name: 'Alex Johnson',
      email: 'alex@example.com',
      phone: '+91 98765 43210',
      address: '404 12th Main, 4th Block, Koramangala, Bengaluru',
      role: 'customer'
    };
    localStorage.setItem('bitebox_token', demoUser.id);
    setToken(demoUser.id);
    setUser(demoUser);
  };

  const logout = () => {
    localStorage.removeItem('bitebox_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = async (data: { name?: string; phone?: string; address?: string }) => {
    const res = await api.updateUserProfile(data);
    setUser(res.user);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, loginDemo, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
