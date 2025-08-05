import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LogIn, Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SVGBackground from '../components/SVGBackground';
import { testDatabaseConnection } from '../lib/supabase';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Test database connection on component mount
  useEffect(() => {
    testDatabaseConnection();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    console.log('LoginPage: Attempting login with:', { email, password: '***' });
    try {
      const success = await login(email, password);
      console.log('LoginPage: Login result:', success);
      
      if (success) {
        console.log('LoginPage: Login successful, redirecting...');
        navigate('/');
      } else {
        console.log('LoginPage: Login failed');
        setError('Неверный email или пароль');
      }
    } catch (err) {
      console.error('LoginPage: Login error:', err);
      setError('Произошла ошибка при входе');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative"
    >
      <SVGBackground />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-blue-900/95 to-slate-800/95 z-10"></div>
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center relative z-20"
        >
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-6">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Вход в систему</h2>
          <p className="text-blue-200">Новороссийский казачий кадетский корпус</p>
        </motion.div>

        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20 relative z-20"
          onSubmit={handleSubmit}
        >
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                placeholder="Введите ваш email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Пароль
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                placeholder="Введите ваш пароль"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-2 text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-3"
              >
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-3 px-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-blue-900 font-bold rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-900"></div>
              ) : (
                <>
                  <LogIn className="h-5 w-5 mr-2" />
                  Войти
                </>
              )}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-white/20">
            <div className="text-sm text-blue-200">
              <p className="mb-2 font-semibold">Тестовые учетные записи:</p>
              <div className="space-y-2 text-xs">
                <div className="bg-white/5 rounded p-2">
                  <strong>Администратор:</strong><br />
                  Email: admin@nkkk.ru<br />
                  Пароль: password123
                </div>
                <div className="bg-white/5 rounded p-2">
                  <strong>Кадеты:</strong><br />
                  ivanov@nkkk.ru / password123<br />
                  petrov@nkkk.ru / password123<br />
                  sidorov@nkkk.ru / password123<br />
                  kozlov@nkkk.ru / password123<br />
                  morozov@nkkk.ru / password123
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-2 mt-2">
                  <strong className="text-yellow-400">Отладка:</strong><br />
                  <span className="text-xs">Откройте консоль браузера (F12) для просмотра логов входа</span>
                </div>
              </div>
            </div>
          </div>
        </motion.form>
      </div>
    </motion.div>
  );
};

export default LoginPage;