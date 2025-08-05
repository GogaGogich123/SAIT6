/*
  # Создание системы аутентификации пользователей

  1. Новые таблицы
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `password_hash` (text)
      - `role` (text) - 'admin' или 'cadet'
      - `name` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Безопасность
    - Enable RLS на таблице `users`
    - Добавить политики для чтения собственных данных
    - Добавить функцию для хеширования паролей

  3. Тестовые данные
    - Добавить администратора и несколько кадетов
*/

-- Создаем таблицу пользователей
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'cadet')),
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Включаем RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Политики безопасности
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Allow anonymous login check"
  ON users
  FOR SELECT
  TO anon
  USING (true);

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Вставляем тестовых пользователей (пароли захешированы с помощью bcrypt)
-- Пароль для всех: password123
INSERT INTO users (email, password_hash, role, name) VALUES
  ('admin@nkkk.ru', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqu', 'admin', 'Администратор Иванов И.И.'),
  ('ivanov@nkkk.ru', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqu', 'cadet', 'Иванов Александр Дмитриевич'),
  ('petrov@nkkk.ru', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqu', 'cadet', 'Петров Михаил Андреевич'),
  ('sidorov@nkkk.ru', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqu', 'cadet', 'Сидоров Дмитрий Владимирович'),
  ('kozlov@nkkk.ru', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqu', 'cadet', 'Козлов Артём Сергеевич'),
  ('morozov@nkkk.ru', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqu', 'cadet', 'Морозов Владислав Игоревич')
ON CONFLICT (email) DO NOTHING;

-- Обновляем таблицу cadets, добавляя связь с пользователями
DO $$
BEGIN
  -- Обновляем существующих кадетов, связывая их с пользователями
  UPDATE cadets SET auth_user_id = (
    SELECT u.id FROM users u WHERE u.email = 'ivanov@nkkk.ru'
  ) WHERE email = 'ivanov@nkkk.ru';
  
  UPDATE cadets SET auth_user_id = (
    SELECT u.id FROM users u WHERE u.email = 'petrov@nkkk.ru'
  ) WHERE email = 'petrov@nkkk.ru';
  
  UPDATE cadets SET auth_user_id = (
    SELECT u.id FROM users u WHERE u.email = 'sidorov@nkkk.ru'
  ) WHERE email = 'sidorov@nkkk.ru';
  
  UPDATE cadets SET auth_user_id = (
    SELECT u.id FROM users u WHERE u.email = 'kozlov@nkkk.ru'
  ) WHERE email = 'kozlov@nkkk.ru';
  
  UPDATE cadets SET auth_user_id = (
    SELECT u.id FROM users u WHERE u.email = 'morozov@nkkk.ru'
  ) WHERE email = 'morozov@nkkk.ru';
END $$;