import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Award, 
  Newspaper, 
  CheckSquare,
  Settings,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Search,
  Filter,
  Eye,
  UserCheck,
  Medal,
  BarChart3,
  Calendar,
  Bell,
  MessageSquare,
  TrendingUp,
  Shield,
  FileText,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import SVGBackground from '../components/SVGBackground';

const AdminPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { success, error, info } = useNotifications();
  const [activeTab, setActiveTab] = useState('cadets');
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatoon, setSelectedPlatoon] = useState('all');
  const [selectedSquad, setSelectedSquad] = useState('all');
  const [newNewsTitle, setNewNewsTitle] = useState('');
  const [newNewsContent, setNewNewsContent] = useState('');
  const [newNewsAuthor, setNewNewsAuthor] = useState('');
  const [isMainNews, setIsMainNews] = useState(false);

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Settings className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Доступ запрещен</h2>
          <p className="text-blue-200">У вас нет прав для доступа к административной панели</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'cadets', name: 'Кадеты', icon: Users },
    { key: 'scores', name: 'Баллы', icon: Award },
    { key: 'news', name: 'Новости', icon: Newspaper },
    { key: 'tasks', name: 'Задания', icon: CheckSquare },
    { key: 'achievements', name: 'Достижения', icon: Medal },
    { key: 'analytics', name: 'Аналитика', icon: BarChart3 },
    { key: 'notifications', name: 'Уведомления', icon: Bell },
  ];

  const mockCadets = [
    { id: '1', name: 'Иванов Александр Дмитриевич', platoon: '10-1', squad: 1, totalScore: 275, email: 'ivanov@nkkk.ru', phone: '+7 (918) 123-45-67' },
    { id: '2', name: 'Петров Михаил Андреевич', platoon: '10-1', squad: 2, totalScore: 271, email: 'petrov@nkkk.ru', phone: '+7 (918) 234-56-78' },
    { id: '3', name: 'Сидоров Дмитрий Владимирович', platoon: '9-2', squad: 1, totalScore: 267, email: 'sidorov@nkkk.ru', phone: '+7 (918) 345-67-89' },
    { id: '4', name: 'Козлов Артём Сергеевич', platoon: '11-1', squad: 3, totalScore: 266, email: 'kozlov@nkkk.ru', phone: '+7 (918) 456-78-90' },
    { id: '5', name: 'Морозов Владислав Игоревич', platoon: '8-1', squad: 2, totalScore: 261, email: 'morozov@nkkk.ru', phone: '+7 (918) 567-89-01' },
  ];

  const mockNews = [
    { id: '1', title: 'Торжественное построение', isMain: true, date: '2024-02-23', author: 'Администрация', views: 245, likes: 32, comments: 8 },
    { id: '2', title: 'Победа в соревнованиях', isMain: false, date: '2024-02-20', author: 'Спортивный отдел', views: 189, likes: 28, comments: 5 },
    { id: '3', title: 'Открытие библиотеки', isMain: false, date: '2024-02-15', author: 'Библиотека', views: 156, likes: 15, comments: 3 },
  ];

  const platoons = ['7-1', '7-2', '8-1', '8-2', '9-1', '9-2', '10-1', '10-2', '11-1', '11-2'];
  const squads = [1, 2, 3];

  const filteredCadets = mockCadets.filter(cadet => {
    const matchesSearch = cadet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cadet.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatoon = selectedPlatoon === 'all' || cadet.platoon === selectedPlatoon;
    const matchesSquad = selectedSquad === 'all' || cadet.squad.toString() === selectedSquad;
    return matchesSearch && matchesPlatoon && matchesSquad;
  });

  const handleCreateNews = () => {
    if (!newNewsTitle.trim() || !newNewsContent.trim() || !newNewsAuthor.trim()) {
      error('Ошибка', 'Заполните все обязательные поля');
      return;
    }
    
    success('Новость создана!', `Новость "${newNewsTitle}" успешно опубликована`);
    setNewNewsTitle('');
    setNewNewsContent('');
    setNewNewsAuthor('');
    setIsMainNews(false);
  };

  const handleSendNotification = (type: 'all' | 'platoon' | 'individual', message: string) => {
    success('Уведомление отправлено!', `Уведомление отправлено: ${type === 'all' ? 'всем кадетам' : type === 'platoon' ? 'взводу' : 'выбранным кадетам'}`);
  };

  const renderCadetsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Управление кадетами</h3>
        <button className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 hover:scale-105 transition-transform">
          <Plus className="h-4 w-4" />
          <span>Добавить кадета</span>
        </button>
      </div>

      {/* Search and Filters */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 h-4 w-4" />
            <input
              type="text"
              placeholder="Поиск по имени или email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 h-4 w-4" />
            <select
              value={selectedPlatoon}
              onChange={(e) => setSelectedPlatoon(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="all">Все взводы</option>
              {platoons.map(platoon => (
                <option key={platoon} value={platoon}>{platoon} взвод</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={selectedSquad}
              onChange={(e) => setSelectedSquad(e.target.value)}
              className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="all">Все отделения</option>
              {squads.map(squad => (
                <option key={squad} value={squad.toString()}>{squad} отделение</option>
              ))}
            </select>
          </div>
          <div className="text-white font-semibold flex items-center justify-center">
            Найдено: {filteredCadets.length}
          </div>
        </div>
      </motion.div>
      <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                  Кадет
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                  Взвод/Отделение
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                  Контакты
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                  Баллы
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredCadets.map((cadet) => (
                <motion.tr 
                  key={cadet.id} 
                  className="hover:bg-white/5 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-white">{cadet.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-blue-200">
                    {cadet.platoon}-{cadet.squad}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-blue-200">
                    <div className="text-sm">
                      <div>{cadet.email}</div>
                      <div className="text-xs text-blue-300">{cadet.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-yellow-400 font-bold">
                    {cadet.totalScore}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-green-400 hover:text-green-300"
                      >
                        <Eye className="h-4 w-4" />
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Edit className="h-4 w-4" />
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const handleAwardPoints = (category: string, cadetName: string, points: number, description: string) => {
    if (!cadetName.trim() || !points || !description.trim()) {
      error('Ошибка', 'Заполните все поля');
      return;
    }
    
    success(
      'Баллы начислены!', 
      `${cadetName} получил ${points > 0 ? '+' : ''}${points} баллов за "${description}"`
    );
  };

  const renderScoresTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Управление баллами</h3>
        <button className="bg-gradient-to-r from-yellow-500 to-orange-500 text-blue-900 px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 hover:scale-105 transition-transform">
          <Plus className="h-4 w-4" />
          <span>Начислить баллы</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6"
          whileHover={{ scale: 1.02, y: -5 }}
        >
          {/* Учёба форма */}
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">Учёба</h4>
            <Award className="h-8 w-8 text-blue-200" />
          </div>
          <div className="space-y-2">
            <input
              id="study-cadet"
              type="text"
              placeholder="Имя кадета"
              className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded text-white placeholder-blue-200 text-sm"
            />
            <input
              id="study-points"
              type="number"
              placeholder="Баллы"
              className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded text-white placeholder-blue-200 text-sm"
            />
            <input
              id="study-description"
              type="text"
              placeholder="Описание"
              className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded text-white placeholder-blue-200 text-sm"
            />
            <button 
              onClick={() => {
                const cadet = (document.getElementById('study-cadet') as HTMLInputElement)?.value;
                const points = parseInt((document.getElementById('study-points') as HTMLInputElement)?.value);
                const description = (document.getElementById('study-description') as HTMLInputElement)?.value;
                handleAwardPoints('study', cadet, points, description);
              }}
              className="w-full bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded font-semibold transition-colors"
            >
              Начислить
            </button>
          </div>
        </motion.div>

        <motion.div 
          className="bg-gradient-to-br from-red-600 to-red-800 rounded-xl p-6"
          whileHover={{ scale: 1.02, y: -5 }}
        >
          {/* Дисциплина форма */}
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">Дисциплина</h4>
            <Award className="h-8 w-8 text-red-200" />
          </div>
          <div className="space-y-2">
            <input
              id="discipline-cadet"
              type="text"
              placeholder="Имя кадета"
              className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded text-white placeholder-red-200 text-sm"
            />
            <input
              id="discipline-points"
              type="number"
              placeholder="Баллы"
              className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded text-white placeholder-red-200 text-sm"
            />
            <input
              id="discipline-description"
              type="text"
              placeholder="Описание"
              className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded text-white placeholder-red-200 text-sm"
            />
            <button 
              onClick={() => {
                const cadet = (document.getElementById('discipline-cadet') as HTMLInputElement)?.value;
                const points = parseInt((document.getElementById('discipline-points') as HTMLInputElement)?.value);
                const description = (document.getElementById('discipline-description') as HTMLInputElement)?.value;
                handleAwardPoints('discipline', cadet, points, description);
              }}
              className="w-full bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded font-semibold transition-colors"
            >
              Начислить
            </button>
          </div>
        </motion.div>

        <motion.div 
          className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-6"
          whileHover={{ scale: 1.02, y: -5 }}
        >
          {/* Мероприятия форма */}
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">Мероприятия</h4>
            <Award className="h-8 w-8 text-green-200" />
          </div>
          <div className="space-y-2">
            <input
              id="events-cadet"
              type="text"
              placeholder="Имя кадета"
              className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded text-white placeholder-green-200 text-sm"
            />
            <input
              id="events-points"
              type="number"
              placeholder="Баллы"
              className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded text-white placeholder-green-200 text-sm"
            />
            <input
              id="events-description"
              type="text"
              placeholder="Описание"
              className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded text-white placeholder-green-200 text-sm"
            />
            <button 
              onClick={() => {
                const cadet = (document.getElementById('events-cadet') as HTMLInputElement)?.value;
                const points = parseInt((document.getElementById('events-points') as HTMLInputElement)?.value);
                const description = (document.getElementById('events-description') as HTMLInputElement)?.value;
                handleAwardPoints('events', cadet, points, description);
              }}
              className="w-full bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded font-semibold transition-colors"
            >
              Начислить
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderNewsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Управление новостями</h3>
      </div>

      {/* Create News Form */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6"
      >
        <h4 className="text-lg font-semibold text-white mb-4">Создать новость</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Заголовок новости"
            value={newNewsTitle}
            onChange={(e) => setNewNewsTitle(e.target.value)}
            className="px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <input
            type="text"
            placeholder="Автор"
            value={newNewsAuthor}
            onChange={(e) => setNewNewsAuthor(e.target.value)}
            className="px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>
        <textarea
          placeholder="Содержание новости..."
          value={newNewsContent}
          onChange={(e) => setNewNewsContent(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none mb-4"
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2 text-white">
            <input
              type="checkbox"
              checked={isMainNews}
              onChange={(e) => setIsMainNews(e.target.checked)}
              className="rounded"
            />
            <span>Главная новость</span>
          </label>
          <button
            onClick={handleCreateNews}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-2 rounded-lg font-semibold flex items-center space-x-2 transition-all duration-300"
          >
            <Plus className="h-4 w-4" />
            <span>Опубликовать</span>
          </button>
        </div>
      </motion.div>

      {/* News List */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                  Заголовок
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                  Автор
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                  Статистика
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                  Тип
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                  Дата
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {mockNews.map((news) => (
                <tr key={news.id} className="hover:bg-white/5">
                  <td className="px-6 py-4 whitespace-nowrap text-white font-medium">{news.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-blue-200">{news.author}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-4 text-sm">
                      <span className="text-blue-300">👁 {news.views}</span>
                      <span className="text-red-300">❤ {news.likes}</span>
                      <span className="text-green-300">💬 {news.comments}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      news.isMain ? 'bg-yellow-400 text-black' : 'bg-blue-400/20 text-blue-300'
                    }`}>
                      {news.isMain ? 'Главная' : 'Обычная'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-blue-200">{news.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-green-400 hover:text-green-300"
                      >
                        <Eye className="h-4 w-4" />
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Edit className="h-4 w-4" />
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Аналитика системы</h3>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div 
          className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-center"
          whileHover={{ scale: 1.02, y: -5 }}
        >
          <Users className="h-8 w-8 text-blue-200 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">450</div>
          <div className="text-blue-200">Всего кадетов</div>
          <div className="text-xs text-green-300 mt-1">+12 за месяц</div>
        </motion.div>

        <motion.div 
          className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-6 text-center"
          whileHover={{ scale: 1.02, y: -5 }}
        >
          <TrendingUp className="h-8 w-8 text-green-200 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">87%</div>
          <div className="text-green-200">Активность</div>
          <div className="text-xs text-green-300 mt-1">+5% за неделю</div>
        </motion.div>

        <motion.div 
          className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6 text-center"
          whileHover={{ scale: 1.02, y: -5 }}
        >
          <FileText className="h-8 w-8 text-purple-200 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">156</div>
          <div className="text-purple-200">Заданий выполнено</div>
          <div className="text-xs text-green-300 mt-1">+23 за неделю</div>
        </motion.div>

        <motion.div 
          className="bg-gradient-to-br from-orange-600 to-orange-800 rounded-xl p-6 text-center"
          whileHover={{ scale: 1.02, y: -5 }}
        >
          <Medal className="h-8 w-8 text-orange-200 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">89</div>
          <div className="text-orange-200">Достижений выдано</div>
          <div className="text-xs text-green-300 mt-1">+7 за неделю</div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
      >
        <h4 className="text-lg font-semibold text-white mb-4">Последняя активность</h4>
        <div className="space-y-3">
          {[
            { action: 'Новый кадет зарегистрирован', user: 'Смирнов А.В.', time: '5 мин назад', type: 'user' },
            { action: 'Задание выполнено', user: 'Иванов А.Д.', time: '15 мин назад', type: 'task' },
            { action: 'Достижение получено', user: 'Петров М.А.', time: '1 час назад', type: 'achievement' },
            { action: 'Новость опубликована', user: 'Администратор', time: '2 часа назад', type: 'news' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${
                activity.type === 'user' ? 'bg-blue-400' :
                activity.type === 'task' ? 'bg-green-400' :
                activity.type === 'achievement' ? 'bg-yellow-400' : 'bg-purple-400'
              }`}></div>
              <div className="flex-grow">
                <div className="text-white font-medium">{activity.action}</div>
                <div className="text-blue-300 text-sm">{activity.user}</div>
              </div>
              <div className="text-blue-400 text-xs">{activity.time}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Система уведомлений</h3>
      </div>

      {/* Send Notification */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
      >
        <h4 className="text-lg font-semibold text-white mb-4">Отправить уведомление</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            onClick={() => handleSendNotification('all', 'Общее уведомление для всех кадетов')}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-4 rounded-lg text-center transition-all duration-300"
          >
            <Users className="h-6 w-6 mx-auto mb-2" />
            <div className="font-semibold">Всем кадетам</div>
            <div className="text-xs text-blue-200">Массовое уведомление</div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            onClick={() => handleSendNotification('platoon', 'Уведомление для взвода')}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white p-4 rounded-lg text-center transition-all duration-300"
          >
            <Shield className="h-6 w-6 mx-auto mb-2" />
            <div className="font-semibold">По взводам</div>
            <div className="text-xs text-green-200">Выборочно по взводам</div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            onClick={() => handleSendNotification('individual', 'Персональное уведомление')}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white p-4 rounded-lg text-center transition-all duration-300"
          >
            <UserCheck className="h-6 w-6 mx-auto mb-2" />
            <div className="font-semibold">Индивидуально</div>
            <div className="text-xs text-purple-200">Конкретным кадетам</div>
          </motion.button>
        </div>
      </motion.div>

      {/* Notification History */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
      >
        <h4 className="text-lg font-semibold text-white mb-4">История уведомлений</h4>
        <div className="space-y-3">
          {[
            { message: 'Напоминание о предстоящем мероприятии', type: 'all', time: '2 часа назад', status: 'delivered' },
            { message: 'Изменение в расписании занятий', type: 'platoon', time: '1 день назад', status: 'delivered' },
            { message: 'Поздравление с достижением', type: 'individual', time: '2 дня назад', status: 'read' },
          ].map((notification, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex-grow">
                <div className="text-white font-medium">{notification.message}</div>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    notification.type === 'all' ? 'bg-blue-500/20 text-blue-300' :
                    notification.type === 'platoon' ? 'bg-green-500/20 text-green-300' :
                    'bg-purple-500/20 text-purple-300'
                  }`}>
                    {notification.type === 'all' ? 'Всем' : notification.type === 'platoon' ? 'Взвод' : 'Личное'}
                  </span>
                  <span className="text-blue-400 text-xs">{notification.time}</span>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs ${
                notification.status === 'delivered' ? 'bg-green-500/20 text-green-300' : 'bg-blue-500/20 text-blue-300'
              }`}>
                {notification.status === 'delivered' ? 'Доставлено' : 'Прочитано'}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  const renderTasksTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Управление заданиями</h3>
        <button className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 hover:scale-105 transition-transform">
          <Plus className="h-4 w-4" />
          <span>Создать задание</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div 
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
          whileHover={{ scale: 1.02, y: -5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">На проверке</h4>
            <div className="bg-orange-400/20 text-orange-400 px-3 py-1 rounded-full text-sm font-semibold">
              3
            </div>
          </div>
          <p className="text-blue-200 mb-4">Задания, ожидающие проверки администратором</p>
          <button 
            onClick={() => info('Проверка заданий', 'Переход к проверке заданий кадетов')}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            Проверить
          </button>
        </motion.div>

        <motion.div 
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
          whileHover={{ scale: 1.02, y: -5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">Активные</h4>
            <div className="bg-blue-400/20 text-blue-400 px-3 py-1 rounded-full text-sm font-semibold">
              12
            </div>
          </div>
          <p className="text-blue-200 mb-4">Задания, доступные для выполнения кадетами</p>
          <button 
            onClick={() => info('Управление заданиями', 'Переход к управлению активными заданиями')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            Управлять
          </button>
        </motion.div>

        <motion.div 
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
          whileHover={{ scale: 1.02, y: -5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">Завершенные</h4>
            <div className="bg-green-400/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
              48
            </div>
          </div>
          <p className="text-blue-200 mb-4">Успешно выполненные задания</p>
          <button 
            onClick={() => info('Архив заданий', 'Просмотр завершенных заданий')}
            className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            Просмотреть
          </button>
        </motion.div>
      </div>
    </div>
  );

  const renderAchievementsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Управление достижениями</h3>
        <button 
          onClick={() => info('Создание достижения', 'Функция создания нового достижения')}
          className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 hover:scale-105 transition-transform"
        >
          <Plus className="h-4 w-4" />
          <span>Создать достижение</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
          whileHover={{ scale: 1.02, y: -5 }}
        >
          <h4 className="text-lg font-semibold text-white mb-4">Выдать достижение</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-white font-semibold mb-2">Кадет</label>
              <select className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded text-white">
                <option value="">Выберите кадета</option>
                {mockCadets.map(cadet => (
                  <option key={cadet.id} value={cadet.id}>{cadet.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-white font-semibold mb-2">Название достижения</label>
              <input
                type="text"
                placeholder="Например: Лучший в учёбе"
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded text-white placeholder-blue-300"
              />
            </div>
            <div>
              <label className="block text-white font-semibold mb-2">Описание</label>
              <textarea
                placeholder="Описание достижения..."
                rows={3}
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded text-white placeholder-blue-300 resize-none"
              />
            </div>
            <div>
              <label className="block text-white font-semibold mb-2">Категория</label>
              <select className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded text-white">
                <option value="study">Учёба</option>
                <option value="discipline">Дисциплина</option>
                <option value="events">Мероприятия</option>
                <option value="leadership">Лидерство</option>
                <option value="sports">Спорт</option>
              </select>
            </div>
            <button 
              onClick={() => {
                success('Достижение выдано!', 'Достижение успешно присвоено кадету');
              }}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-lg font-semibold transition-all"
            >
              Выдать достижение
            </button>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
          whileHover={{ scale: 1.02, y: -5 }}
        >
          <h4 className="text-lg font-semibold text-white mb-4">Последние достижения</h4>
          <div className="space-y-3">
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-semibold">Лучший в учёбе</span>
                <span className="text-xs text-blue-300">2024-03-15</span>
              </div>
              <p className="text-blue-200 text-sm">Иванов Александр Дмитриевич</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-semibold">Командир месяца</span>
                <span className="text-xs text-blue-300">2024-03-10</span>
              </div>
              <p className="text-blue-200 text-sm">Петров Михаил Андреевич</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-semibold">Спортивные достижения</span>
                <span className="text-xs text-blue-300">2024-03-08</span>
              </div>
              <p className="text-blue-200 text-sm">Сидоров Дмитрий Владимирович</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'cadets': return renderCadetsTab();
      case 'scores': return renderScoresTab();
      case 'news': return renderNewsTab();
      case 'tasks': return renderTasksTab();
      case 'achievements': return renderAchievementsTab();
      case 'analytics': return renderAnalyticsTab();
      case 'notifications': return renderNotificationsTab();
      default: return renderCadetsTab();
    }
  };

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
          <h1 className="text-4xl font-bold text-white mb-4">Административная панель</h1>
          <p className="text-xl text-blue-200">Управление системой рейтинга кадетов</p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2 mb-8 overflow-x-auto relative z-20"
        >
          {tabs.map(({ key, name, icon: Icon }) => (
            <motion.button
              key={key}
              onClick={() => setActiveTab(key)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === key
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-blue-900 shadow-lg scale-105'
                  : 'bg-white/10 text-white hover:bg-white/20 hover:scale-102'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{name}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative z-20"
        >
          {renderTabContent()}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminPage;