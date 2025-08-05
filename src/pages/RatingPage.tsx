import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Filter, Trophy, Medal, Target, Users, TrendingUp, TrendingDown } from 'lucide-react';
import SVGBackground from '../components/SVGBackground';
import LoadingSpinner from '../components/LoadingSpinner';
import { getCadets, getCadetScores, type Cadet, type Score } from '../lib/supabase';

interface CadetWithScores extends Cadet {
  scores: {
    study: number;
    discipline: number;
    events: number;
    total: number;
  };
}

const RatingPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'total' | 'study' | 'discipline' | 'events'>('total');
  const [selectedPlatoon, setSelectedPlatoon] = useState<string>('all');
  const [selectedSquad, setSelectedSquad] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [cadets, setCadets] = useState<CadetWithScores[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const platoons = ['7-1', '7-2', '8-1', '8-2', '9-1', '9-2', '10-1', '10-2', '11-1', '11-2'];
  const squads = [1, 2, 3];

  useEffect(() => {
    const fetchCadets = async () => {
      try {
        setLoading(true);
        const cadetsData = await getCadets();
        
        // Получаем баллы для каждого кадета
        const cadetsWithScores = await Promise.all(
          cadetsData.map(async (cadet) => {
            try {
              const scores = await getCadetScores(cadet.id);
              return {
                ...cadet,
                scores: {
                  study: scores?.study_score || 0,
                  discipline: scores?.discipline_score || 0,
                  events: scores?.events_score || 0,
                  total: cadet.total_score
                }
              };
            } catch (error) {
              console.error(`Error fetching scores for cadet ${cadet.id}:`, error);
              return {
                ...cadet,
                scores: {
                  study: 0,
                  discipline: 0,
                  events: 0,
                  total: cadet.total_score
                }
              };
            }
          })
        );
        
        setCadets(cadetsWithScores);
      } catch (err) {
        console.error('Error fetching cadets:', err);
        setError('Ошибка загрузки данных кадетов');
      } finally {
        setLoading(false);
      }
    };

    fetchCadets();
  }, []);

  const categories = [
    { key: 'total', name: 'Общий рейтинг', icon: Trophy, color: 'from-yellow-500 to-orange-500' },
    { key: 'study', name: 'Учёба', icon: Medal, color: 'from-blue-500 to-cyan-500' },
    { key: 'discipline', name: 'Дисциплина', icon: Target, color: 'from-red-500 to-pink-500' },
    { key: 'events', name: 'Мероприятия', icon: Users, color: 'from-green-500 to-emerald-500' },
  ];

  const filteredCadets = cadets.filter(cadet => {
    const matchesSearch = cadet.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatoon = selectedPlatoon === 'all' || cadet.platoon === selectedPlatoon;
    const matchesSquad = selectedSquad === 'all' || cadet.squad.toString() === selectedSquad;
    return matchesSearch && matchesPlatoon && matchesSquad;
  });

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600';
    if (rank === 2) return 'from-gray-300 to-gray-500';
    if (rank === 3) return 'from-orange-400 to-orange-600';
    return 'from-blue-500 to-blue-700';
  };

  const getScoreChange = (cadet: CadetWithScores) => {
    // Mock data for score changes
    const changes = [5, -2, 8, 3, -1, 12, 0, 4, -3, 7];
    return changes[parseInt(cadet.id.slice(-1)) % changes.length] || 0;
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
          <h1 className="text-4xl font-bold text-white mb-4">Рейтинг кадетов</h1>
          <p className="text-xl text-blue-200">Следите за успехами и достижениями лучших кадетов корпуса</p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="relative z-20">
            <LoadingSpinner message="Загрузка данных кадетов..." />
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
              onClick={() => setSelectedCategory(key as any)}
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

        {/* Filters */}
        {!loading && !error && (
          <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8 relative z-20"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 h-4 w-4" />
              <input
                type="text"
                placeholder="Поиск кадета..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            {/* Platoon Filter */}
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

            {/* Squad Filter */}
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
        )}

        {/* Rating List */}
        {!loading && !error && (
          <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4 relative z-20"
        >
          {filteredCadets.map((cadet, index) => (
            <motion.div
              key={cadet.id}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <Link to={`/cadet/${cadet.id}`}>
                <div className="bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 hover:border-yellow-400/50 rounded-xl p-6 transition-all duration-300 hover:scale-102 hover:shadow-2xl">
                  <div className="flex items-center space-x-6">
                    {/* Rank */}
                    <div className={`flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br ${getRankColor(cadet.rank)} flex items-center justify-center font-bold text-white text-lg shadow-lg`}>
                      {getRankIcon(cadet.rank)}
                    </div>

                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <img
                        src={cadet.avatar_url || 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?w=200'}
                        alt={cadet.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-white/30 group-hover:border-yellow-400/70 transition-colors"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold text-white group-hover:text-yellow-300 transition-colors">
                        {cadet.name}
                      </h3>
                      <p className="text-blue-300">
                        {cadet.platoon} взвод, {cadet.squad} отделение
                      </p>
                    </div>

                    {/* Scores */}
                    <div className="flex-shrink-0 grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="flex items-center justify-center space-x-1">
                          <span className="text-2xl font-bold text-white">{cadet.scores.total}</span>
                          {(() => {
                            const change = getScoreChange(cadet);
                            if (change > 0) {
                              return <TrendingUp className="h-4 w-4 text-green-400" />;
                            } else if (change < 0) {
                              return <TrendingDown className="h-4 w-4 text-red-400" />;
                            }
                            return null;
                          })()}
                        </div>
                        <div className="text-xs text-blue-300">Общий</div>
                        {(() => {
                          const change = getScoreChange(cadet);
                          if (change !== 0) {
                            return (
                              <div className={`text-xs ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {change > 0 ? '+' : ''}{change}
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-blue-300">{cadet.scores.study}</div>
                        <div className="text-xs text-blue-400">Учёба</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-red-300">{cadet.scores.discipline}</div>
                        <div className="text-xs text-red-400">Дисциплина</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-green-300">{cadet.scores.events}</div>
                        <div className="text-xs text-green-400">Мероприятия</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default RatingPage;