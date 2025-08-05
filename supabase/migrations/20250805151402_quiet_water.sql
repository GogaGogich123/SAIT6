/*
  # Create test users and cadets

  1. New Data
    - Test admin user (admin@nkkk.ru)
    - Test cadet users with corresponding cadet records
    - Passwords are hashed using bcrypt

  2. Security
    - All passwords are properly hashed
    - Cadet records are linked to auth users

  3. Test Accounts
    - Admin: admin@nkkk.ru / password123
    - Cadets: ivanov@nkkk.ru, petrov@nkkk.ru, etc. / password123
*/

-- Insert test admin user
INSERT INTO users (email, password_hash, role, name) VALUES 
('admin@nkkk.ru', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'Администратор')
ON CONFLICT (email) DO NOTHING;

-- Insert test cadet users
INSERT INTO users (id, email, password_hash, role, name) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'ivanov@nkkk.ru', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'cadet', 'Иванов Александр Дмитриевич'),
('550e8400-e29b-41d4-a716-446655440002', 'petrov@nkkk.ru', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'cadet', 'Петров Михаил Андреевич'),
('550e8400-e29b-41d4-a716-446655440003', 'sidorov@nkkk.ru', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'cadet', 'Сидоров Дмитрий Владимирович'),
('550e8400-e29b-41d4-a716-446655440004', 'kozlov@nkkk.ru', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'cadet', 'Козлов Артём Сергеевич'),
('550e8400-e29b-41d4-a716-446655440005', 'morozov@nkkk.ru', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'cadet', 'Морозов Владислав Игоревич')
ON CONFLICT (email) DO NOTHING;

-- Update existing cadets to link with auth users
UPDATE cadets SET auth_user_id = '550e8400-e29b-41d4-a716-446655440001' WHERE email = 'ivanov@nkkk.ru';
UPDATE cadets SET auth_user_id = '550e8400-e29b-41d4-a716-446655440002' WHERE email = 'petrov@nkkk.ru';
UPDATE cadets SET auth_user_id = '550e8400-e29b-41d4-a716-446655440003' WHERE email = 'sidorov@nkkk.ru';
UPDATE cadets SET auth_user_id = '550e8400-e29b-41d4-a716-446655440004' WHERE email = 'kozlov@nkkk.ru';
UPDATE cadets SET auth_user_id = '550e8400-e29b-41d4-a716-446655440005' WHERE email = 'morozov@nkkk.ru';

-- Insert cadet records if they don't exist
INSERT INTO cadets (id, auth_user_id, name, email, platoon, squad, rank, total_score) VALUES 
('cadet-001', '550e8400-e29b-41d4-a716-446655440001', 'Иванов Александр Дмитриевич', 'ivanov@nkkk.ru', '10-1', 1, 1, 275),
('cadet-002', '550e8400-e29b-41d4-a716-446655440002', 'Петров Михаил Андреевич', 'petrov@nkkk.ru', '10-1', 2, 2, 271),
('cadet-003', '550e8400-e29b-41d4-a716-446655440003', 'Сидоров Дмитрий Владимирович', 'sidorov@nkkk.ru', '9-2', 1, 3, 267),
('cadet-004', '550e8400-e29b-41d4-a716-446655440004', 'Козлов Артём Сергеевич', 'kozlov@nkkk.ru', '11-1', 3, 4, 266),
('cadet-005', '550e8400-e29b-41d4-a716-446655440005', 'Морозов Владислав Игоревич', 'morozov@nkkk.ru', '8-1', 2, 5, 261)
ON CONFLICT (email) DO NOTHING;

-- Insert scores for cadets
INSERT INTO scores (cadet_id, study_score, discipline_score, events_score) VALUES 
('cadet-001', 95, 88, 92),
('cadet-002', 92, 87, 92),
('cadet-003', 90, 86, 91),
('cadet-004', 89, 85, 92),
('cadet-005', 87, 84, 90)
ON CONFLICT (cadet_id) DO UPDATE SET
  study_score = EXCLUDED.study_score,
  discipline_score = EXCLUDED.discipline_score,
  events_score = EXCLUDED.events_score;