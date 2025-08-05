import React, { createContext, useContext, useState } from 'react';
import { supabase } from '../lib/supabase';

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

  // Тестовые пользователи
  const testUsers = [
    { email: 'admin@nkkk.ru', password: 'admin123', role: 'admin', name: 'Администратор Иванов И.И.' },
    { email: 'ivanov@nkkk.ru', password: 'ivanov123', role: 'cadet', name: 'Иванов Александр Дмитриевич', platoon: '10-1', squad: 1, cadetId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' },
    { email: 'petrov@nkkk.ru', password: 'petrov123', role: 'cadet', name: 'Петров Михаил Андреевич', platoon: '10-1', squad: 2, cadetId: 'b1ffdc99-9c0b-4ef8-bb6d-6bb9bd380a22' },
    { email: 'sidorov@nkkk.ru', password: 'sidorov123', role: 'cadet', name: 'Сидоров Дмитрий Владимирович', platoon: '9-2', squad: 1, cadetId: 'c2ggec99-9c0b-4ef8-bb6d-6bb9bd380a33' },
    { email: 'kozlov@nkkk.ru', password: 'kozlov123', role: 'cadet', name: 'Козлов Артём Сергеевич', platoon: '11-1', squad: 3, cadetId: 'd3hhfc99-9c0b-4ef8-bb6d-6bb9bd380a44' },
    { email: 'morozov@nkkk.ru', password: 'morozov123', role: 'cadet', name: 'Морозов Владислав Игоревич', platoon: '8-1', squad: 2, cadetId: 'e4iigc99-9c0b-4ef8-bb6d-6bb9bd380a55' },
  ];

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Проверяем тестовых пользователей
      const testUser = testUsers.find(u => u.email === email && u.password === password);
      if (testUser) {
        return mockLogin(email, password);
      }

      // Попытка входа через Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError || !authData.user) {
        // Fallback на mock данные для демонстрации
        return mockLogin(email, password);
      }

      if (authData.user) {
        // Получаем данные кадета из базы
        const { data: cadetData, error: cadetError } = await supabase
          .from('cadets')
          .select('*')
          .eq('auth_user_id', authData.user.id)
          .single();

        if (!cadetError && cadetData) {
          setUser({
            id: authData.user.id,
            name: cadetData.name,
            role: 'cadet',
            platoon: cadetData.platoon,
            squad: cadetData.squad,
            cadetId: cadetData.id
          });
          return true;
        }
      }

      // If Supabase auth succeeded but no cadet data found, try mock login
      return mockLogin(email, password);
    } catch (error) {
      console.error('Login error:', error);
      return mockLogin(email, password);
    }
  };

  const mockLogin = (email: string, password: string): boolean => {
    const testUser = testUsers.find(u => u.email === email && u.password === password);
    if (testUser) {
      if (testUser.role === 'admin') {
        setUser({
          id: '1',
          name: testUser.name,
          role: 'admin'
        });
      } else {
        setUser({
          id: testUser.cadetId!,
          name: testUser.name,
          role: 'cadet',
          platoon: testUser.platoon,
          squad: testUser.squad,
          cadetId: testUser.cadetId
        });
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    // Выход из Supabase Auth
    supabase.auth.signOut().catch(console.error);
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};