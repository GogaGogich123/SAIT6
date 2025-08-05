import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { 
  Award, 
  Trophy, 
  Target, 
  Calendar, 
  TrendingUp,
  Star,
  Medal,
  BookOpen,
  Users,
  Crown,
  Zap,
  CheckCircle,
  Flame,
  Shield,
  Sparkles,
  AlertCircle,
  Heart
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import SVGBackground from '../components/SVGBackground';
import LoadingSpinner from '../components/LoadingSpinner';
import ProgressBar from '../components/ProgressBar';
import { 
  getCadetById, 
  getCadetScores, 
  getCadetAchievements, 
  getAutoAchievements,
  getScoreHistory,
  type Cadet, 
  type Score, 
  type CadetAchievement, 
  type AutoAchievement,
  type ScoreHistory
} from '../lib/supabase';

const CadetProfile: React.FC = () => {
  const { id } = useParams();
  const [cadet, setCadet] = useState<Cadet | null>(null);
  const [scores, setScores] = useState<Score | null>(null);
  const [achievements, setAchievements] = useState<CadetAchievement[]>([]);
  const [autoAchievements, setAutoAchievements] = useState<AutoAchievement[]>([]);
  const [scoreHistory, setScoreHistory] = useState<ScoreHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCadetData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Получаем данные кадета
        const cadetData = await getCadetById(id);
        
        if (!cadetData) {
          setError('Cadet not found');
          return;
        }
        
        setCadet(cadetData);
        
        // Получаем баллы кадета
        const scoresData = await getCadetScores(id);
        setScores(scoresData);
        
        // Получаем достижения кадета
        const achievementsData = await getCadetAchievements(id);
        setAchievements(achievementsData);
        
        // Получаем все автоматические достижения
        const autoAchievementsData = await getAutoAchievements();
        setAutoAchievements(autoAchievementsData);
        
        // Получаем историю баллов
        const historyData = await getScoreHistory(id);
        setScoreHistory(historyData);
        
      } catch (err) {
        console.error('Error fetching cadet data:', err);
        setError('Ошибка загрузки данных кадета');
      } finally {
        setLoading(false);
      }
    };

    fetchCadetData();
  }, [id]);

  const scoreHistoryMock = [
    { month: 'Сен', study: 85, discipline: 80, events: 78, total: 243 },
    { month: 'Окт', study: 87, discipline: 82, events: 81, total: 250 },
    { month: 'Ноя', study: 90, discipline: 84, events: 85, total: 259 },
    { month: 'Дек', study: 92, discipline: 86, events: 88, total: 266 },
    { month: 'Янв', study: 94, discipline: 87, events: 90, total: 271 },
    { month: 'Мар', study: 95, discipline: 88, events: 92, total: 275 },
  ];

  // Получаем достижения от администратора
  const adminAchievements = achievements.filter(a => a.achievement);
  
  // Получаем автоматические достижения кадета
  const cadetAutoAchievements = achievements.filter(a => a.auto_achievement);
  const cadetAutoAchievementIds = cadetAutoAchievements.map(a => a.auto_achievement_id);

  // Функция для получения иконки по названию
  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      CheckCircle, Zap, Star, Shield, Users, Flame, BookOpen, Crown, Trophy, Heart
    };
    return icons[iconName] || Star;
  };

  // Функция для вычисления прогресса автоматических достижений
  const calculateProgress = (achievement: AutoAchievement) => {
    if (!scores || !cadet) return 0;
    
    let currentValue = 0;
    if (achievement.requirement_type === 'total_score') {
      currentValue = cadet.total_score;
    } else if (achievement.requirement_type === 'category_score') {
      if (achievement.requirement_category === 'study') {
        currentValue = scores.study_score;
      } else if (achievement.requirement_category === 'discipline') {
        currentValue = scores.discipline_score;
      } else if (achievement.requirement_category === 'events') {
        currentValue = scores.events_score;
      }
    }
    
    return Math.min(Math.round((currentValue / achievement.requirement_value) * 100), 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Загрузка профиля кадета..." size="lg" />
      </div>
    );
  }

  if (error || !cadet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Ошибка загрузки</h2>
          <p className="text-blue-200">{error || 'Кадет не найден'}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen py-8 relative"
    >
      <SVGBackground />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-blue-900/95 to-slate-800/95 z-10"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-r from-blue-800 to-blue-900 rounded-2xl p-8 mb-8 shadow-2xl relative z-20"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="relative"
            >
              <img
                src={cadet.avatar_url || 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?w=400'}
                alt={cadet.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-yellow-400 shadow-lg"
              />
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-blue-900 rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg shadow-lg">
                #{cadet.rank}
              </div>
            </motion.div>

            <div className="flex-grow">
              <motion.h1
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold text-white mb-2"
              >
                {cadet.name}
              </motion.h1>
              <motion.p
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-blue-200 text-lg mb-4"
              >
                {cadet.platoon} взвод, {cadet.squad} отделение
              </motion.p>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-4"
              >
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5 text-yellow-400" />
                    <span className="text-white font-semibold">{cadet.total_score} баллов</span>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-blue-300" />
                    <span className="text-white">В корпусе с {new Date(cadet.join_date).toLocaleDateString('ru-RU')}</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-20">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Score Chart */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
            >
              <div className="flex items-center space-x-3 mb-6">
                <TrendingUp className="h-6 w-6 text-green-400" />
                <h2 className="text-xl font-bold text-white">Динамика баллов</h2>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={scoreHistoryMock}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }}
                    />
                    <Line type="monotone" dataKey="total" stroke="#F59E0B" strokeWidth={3} dot={{ fill: '#F59E0B', strokeWidth: 2, r: 6 }} />
                    <Line type="monotone" dataKey="study" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6', r: 4 }} />
                    <Line type="monotone" dataKey="discipline" stroke="#EF4444" strokeWidth={2} dot={{ fill: '#EF4444', r: 4 }} />
                    <Line type="monotone" dataKey="events" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Auto Achievements (Ачивки) */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
            >
              <div className="flex items-center space-x-3 mb-6">
                <Sparkles className="h-6 w-6 text-purple-400" />
                <h2 className="text-xl font-bold text-white">Ачивки</h2>
                <span className="text-sm text-blue-300">({autoAchievements.filter(a => cadetAutoAchievementIds.includes(a.id)).length}/{autoAchievements.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {autoAchievements.map((achievement, index) => {
                  const unlocked = cadetAutoAchievementIds.includes(achievement.id);
                  const progress = unlocked ? 100 : calculateProgress(achievement);
                  const IconComponent = getIconComponent(achievement.icon);
                  
                  return (
                  <motion.div
                    key={achievement.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 * index }}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                      unlocked 
                        ? `bg-gradient-to-r ${achievement.color} border-transparent shadow-lg` 
                        : 'bg-gray-800/50 border-gray-600 opacity-60'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <IconComponent className={`h-6 w-6 flex-shrink-0 mt-0.5 ${
                        unlocked ? 'text-white' : 'text-gray-400'
                      }`} />
                      <div className="flex-grow">
                        <h3 className={`font-bold mb-1 ${
                          unlocked ? 'text-white' : 'text-gray-400'
                        }`}>
                          {achievement.title}
                        </h3>
                        <p className={`text-sm mb-2 ${
                          unlocked ? 'text-white/90' : 'text-gray-500'
                        }`}>
                          {achievement.description}
                        </p>
                        {!unlocked && (
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                            <span className="text-xs text-gray-400 mt-1 block">
                              {progress}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                  );
                })}
              </div>
            </motion.div>
            {/* Recent Score History */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
            >
              <div className="flex items-center space-x-3 mb-6">
                <Calendar className="h-6 w-6 text-blue-400" />
                <h2 className="text-xl font-bold text-white">История начислений</h2>
              </div>
              <div className="space-y-4">
                {scoreHistory.map((score, index) => (
                  <motion.div
                    key={score.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex-grow">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          score.category === 'study' ? 'bg-blue-500/20 text-blue-300' :
                          score.category === 'discipline' ? 'bg-red-500/20 text-red-300' :
                          'bg-green-500/20 text-green-300'
                        }`}>
                          {score.category === 'study' ? 'Учёба' : 
                           score.category === 'discipline' ? 'Дисциплина' : 'Мероприятия'}
                        </span>
                        <span className="text-sm text-blue-200">
                          {new Date(score.created_at).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                      <p className="text-white mt-1">{score.description}</p>
                    </div>
                    <div className={`text-lg font-bold ${score.points > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {score.points > 0 ? '+' : ''}{score.points}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Current Scores */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
            >
              <div className="flex items-center space-x-3 mb-6">
                <Target className="h-6 w-6 text-yellow-400" />
                <h2 className="text-xl font-bold text-white">Текущие баллы</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <BookOpen className="h-5 w-5 text-blue-200" />
                    <span className="text-white font-semibold">Учёба</span>
                  </div>
                  <span className="text-xl font-bold text-white">{scores?.study_score || 0}</span>
                  <div className="mt-2">
                    <ProgressBar 
                      value={scores?.study_score || 0} 
                      max={100} 
                      color="from-blue-500 to-blue-700"
                      showPercentage={false}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-600 to-red-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Target className="h-5 w-5 text-red-200" />
                    <span className="text-white font-semibold">Дисциплина</span>
                  </div>
                  <div>
                    <span className="text-lg font-semibold text-red-300">{scores?.discipline_score || 0}</span>
                    <div className="text-xs text-red-400">Дисциплина</div>
                    <div className="mt-2">
                      <ProgressBar 
                        value={scores?.discipline_score || 0} 
                        max={100} 
                        color="from-red-500 to-red-700"
                        showPercentage={false}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-600 to-green-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-green-200" />
                    <span className="text-white font-semibold">Мероприятия</span>
                  </div>
                  <div>
                    <span className="text-lg font-semibold text-green-300">{scores?.events_score || 0}</span>
                    <div className="text-xs text-green-400">Мероприятия</div>
                    <div className="mt-2">
                      <ProgressBar 
                        value={scores?.events_score || 0} 
                        max={100} 
                        color="from-green-500 to-green-700"
                        showPercentage={false}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Admin Achievements */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.0 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
            >
              <div className="flex items-center space-x-3 mb-6">
                <Award className="h-6 w-6 text-yellow-400" />
                <h2 className="text-xl font-bold text-white">Достижения</h2>
              </div>
              <div className="space-y-4">
                {adminAchievements.map((achievement, index) => {
                  const achievementData = achievement.achievement!;
                  const IconComponent = getIconComponent(achievementData.icon);
                  
                  return (
                  <motion.div
                    key={achievement.id}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 * index }}
                    className={`p-4 bg-gradient-to-r ${achievementData.color} rounded-lg shadow-lg`}
                  >
                    <div className="flex items-start space-x-3">
                      <IconComponent className="h-6 w-6 text-white flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-bold text-white mb-1">{achievementData.title}</h3>
                        <p className="text-white/90 text-sm mb-2">{achievementData.description}</p>
                        <span className="text-white/70 text-xs">
                          {new Date(achievement.awarded_date).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                  );
                })}
                {adminAchievements.length === 0 && (
                  <p className="text-blue-300 text-center py-4">Пока нет достижений от администрации</p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CadetProfile;