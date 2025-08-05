import React, { createContext, useContext, useState } from 'react';
import { loginUser, type User as DbUser, type Cadet } from '../lib/supabase';

interface User {
  id: string;
  name: string;
  role: 'cadet' | 'admin';
  platoon?: string;
  squad?: number;
  cadetId?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Аутентификация через базу данных
      const result = await loginUser(email, password);
      
      if (!result) {
        return false;
      }

      const { user: dbUser, cadet } = result;

      if (dbUser.role === 'admin') {
        setUser({
          id: dbUser.id,
          name: dbUser.name,
          role: 'admin'
        });
      } else if (dbUser.role === 'cadet' && cadet) {
        setUser({
          id: dbUser.id,
          name: dbUser.name,
          role: 'cadet',
          platoon: cadet.platoon,
          squad: cadet.squad,
          cadetId: cadet.id
        });
      } else {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};