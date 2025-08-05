import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckSquare, 
  Clock, 
  Star, 
  AlertCircle, 
  Trophy,
  BookOpen,
  Users,
  Target,
  Calendar,
  Filter,
  SortAsc
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SVGBackground from '../components/SVGBackground';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  getTasks, 
  getTaskSubmissions, 
  takeTask, 
  submitTask, 
  abandonTask,
  type Task,
  type TaskSubmission
} from '../lib/supabase';

interface TaskWithSubmission extends Task {
  submission?: TaskSubmission;
  userStatus: 'available' | 'taken' | 'submitted' | 'completed' | 'rejected';
}

const TasksPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'deadline' | 'points' | 'difficulty'>('deadline');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [tasks, setTasks] = useState<TaskWithSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user?.cadetId) return;
      
      try {
        setLoading(true);
        
        // Получаем все активные задания
        const tasksData = await getTasks();
        
        // Получаем сдачи заданий текущего кадета
        const submissionsData = await getTaskSubmissions(user.cadetId);
        
        // Объединяем данные
        const tasksWithSubmissions: TaskWithSubmission[] = tasksData.map(task => {
          const submission = submissionsData.find(s => s.task_id === task.id);
          return {
            ...task,
            submission,
            userStatus: submission ? submission.status : 'available'
          };
        });
        
        setTasks(tasksWithSubmissions);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Ошибка загрузки заданий');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user?.cadetId]);

  const categories = [
    { key: 'all', name: 'Все задания', icon: CheckSquare, color: 'from-gray-600 to-gray-800' },
    { key: 'study', name: 'Учёба', icon: BookOpen, color: 'from-blue-600 to-blue-800' },
    { key: 'discipline', name: 'Дисциплина', icon: Target, color: 'from-red-600 to-red-800' },
    { key: 'events', name: 'Мероприятия', icon: Users, color: 'from-green-600 to-green-800' },
  ];

  const filteredTasks = selectedCategory === 'all' 
    ? tasks 
    : tasks.filter(task => task.category === selectedCategory);

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'deadline':
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      case 'points':
        return b.points - a.points;
      case 'difficulty':
        const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
        return difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty];
      default:
        return 0;
    }
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'hard': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-blue-400 bg-blue-400/20';
      case 'taken': return 'text-yellow-400 bg-yellow-400/20';
      case 'submitted': return 'text-orange-400 bg-orange-400/20';
      case 'completed': return 'text-green-400 bg-green-400/20';
      case 'rejected': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusText = (userStatus: string) => {
    switch (userStatus) {
      case 'available': return 'Доступно';
      case 'taken': return 'Взято';
      case 'submitted': return 'На проверке';
      case 'completed': return 'Выполнено';
      case 'rejected': return 'Отклонено';
      default: return userStatus;
    }
  };

  const handleTakeTask = async (taskId: string) => {
    if (!user?.cadetId) return;
    
    try {
      await takeTask(taskId, user.cadetId);
      // Обновляем список заданий
      setTasks(tasks.map(task => 
        task.id === taskId 
          ? { ...task, userStatus: 'taken' }
          : task
      ));
    } catch (error) {
      console.error('Error taking task:', error);
      alert('Ошибка при взятии задания');
    }
  };

  const handleSubmitTask = async (taskId: string) => {
    if (!user?.cadetId) return;
    
    try {
      await submitTask(taskId, user.cadetId, submissionText);
      // Обновляем список заданий
      setTasks(tasks.map(task => 
        task.id === taskId 
          ? { ...task, userStatus: 'submitted' }
          : task
      ));
      setSelectedTask(null);
      setSubmissionText('');
    } catch (error) {
      console.error('Error submitting task:', error);
      alert('Ошибка при сдаче задания');
    }
  };

  const handleAbandonTask = async (taskId: string) => {
    if (!user?.cadetId) return;
    
    try {
      await abandonTask(taskId, user.cadetId);
      // Обновляем список заданий
      setTasks(tasks.map(task => 
        task.id === taskId 
          ? { ...task, userStatus: 'available' }
          : task
      ));
    } catch (error) {
      console.error('Error abandoning task:', error);
      alert('Ошибка при отказе от задания');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Требуется авторизация</h2>
          <p className="text-blue-200">Войдите в систему, чтобы просматривать и выполнять задания</p>
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
          className="text-center mb-12 relative z-20"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Задания</h1>
          <p className="text-xl text-blue-200">Выполняйте задания и получайте баллы рейтинга</p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="relative z-20">
            <LoadingSpinner message="Загрузка заданий..." />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12 relative z-20">
            <p className="text-red-400 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Попробовать снова
            </button>
          </div>
        )}

        {/* Categories */}
        {!loading && !error && (
          <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 relative z-20"
        >
          {categories.map(({ key, name, icon: Icon, color }) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`relative overflow-hidden p-4 rounded-xl transition-all duration-300 ${
                selectedCategory === key
                  ? 'scale-105 shadow-2xl'
                  : 'hover:scale-102 opacity-80 hover:opacity-100'
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${color} ${
                selectedCategory === key ? 'opacity-100' : 'opacity-60'
              }`}></div>
              <div className="relative flex flex-col items-center text-white">
                <Icon className="h-8 w-8 mb-2" />
                <span className="font-semibold text-sm">{name}</span>
              </div>
            </button>
          ))}
        </motion.div>
        )}

        {/* Filters and Sort */}
        {!loading && !error && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8 relative z-20"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <Filter className="h-5 w-5 text-blue-300" />
                <span className="text-white font-semibold">Фильтры:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-blue-200 text-sm">Всего заданий: {filteredTasks.length}</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <SortAsc className="h-5 w-5 text-blue-300" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-white/20 border border-white/30 rounded-lg text-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="deadline">По дедлайну</option>
                  <option value="points">По баллам</option>
                  <option value="difficulty">По сложности</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tasks Grid */}
        {!loading && !error && (
          <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-20"
        >
          {sortedTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 * index }}
              className={`bg-white/10 backdrop-blur-sm rounded-xl p-6 border transition-all duration-300 hover:scale-102 ${
                task.userStatus === 'completed' 
                  ? 'border-green-400/50 bg-green-400/5' 
                  : task.userStatus === 'taken'
                  ? 'border-yellow-400/50 bg-yellow-400/5'
                  : 'border-white/20 hover:border-yellow-400/50'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(task.userStatus)}`}>
                    {getStatusText(task.userStatus)}
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(task.difficulty)}`}>
                    {task.difficulty === 'easy' ? 'Легко' : task.difficulty === 'medium' ? 'Средне' : 'Сложно'}
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-yellow-400">
                  <Star className="h-4 w-4" />
                  <span className="font-bold">{task.points}</span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-3 line-clamp-2">{task.title}</h3>
              <p className="text-blue-200 mb-4 line-clamp-3">{task.description}</p>

              <div className="flex items-center justify-between text-sm text-blue-300 mb-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>До {new Date(task.deadline).toLocaleDateString('ru-RU')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    {Math.ceil((new Date(task.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} дн.
                  </span>
                </div>
              </div>

              <div className="flex space-x-2">
                {task.userStatus === 'available' && (
                  <button
                    onClick={() => handleTakeTask(task.id)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300"
                  >
                    Взять задание
                  </button>
                )}
                {task.userStatus === 'taken' && (
                  <>
                    <button
                      onClick={() => setSelectedTask(task)}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300"
                    >
                      Сдать
                    </button>
                    <button
                      onClick={() => handleAbandonTask(task.id)}
                      className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300"
                    >
                      Отказаться
                    </button>
                  </>
                )}
                {task.userStatus === 'completed' && (
                  <div className="flex-1 flex items-center justify-center text-green-400 font-semibold">
                    <Trophy className="h-4 w-4 mr-2" />
                    Выполнено
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
        )}

        {/* Submit Task Modal */}
        {selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedTask(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gradient-to-br from-blue-900 to-slate-900 rounded-2xl max-w-2xl w-full p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-white mb-4">Сдача задания</h2>
              <h3 className="text-lg text-blue-200 mb-6">{selectedTask.title}</h3>
              
              <div className="mb-6">
                <label className="block text-white font-semibold mb-2">
                  Отчет о выполнении:
                </label>
                <textarea
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Опишите, как вы выполнили задание..."
                  rows={6}
                  className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => handleSubmitTask(selectedTask.id)}
                  disabled={!submissionText.trim()}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
                >
                  Отправить на проверку
                </button>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Отмена
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default TasksPage;