import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, ChevronLeft, ChevronRight, Star, Share2, Heart, MessageCircle, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import SVGBackground from '../components/SVGBackground';
import LoadingSpinner from '../components/LoadingSpinner';
import { getNews, getNewsComments, addNewsComment, toggleNewsLike, type News, type NewsComment } from '../lib/supabase';

const NewsPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useNotifications();
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [comments, setComments] = useState<NewsComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [likes, setLikes] = useState<{ [key: string]: { count: number; liked: boolean } }>({});
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const newsData = await getNews();
        const newsWithCounts = newsData.map(item => ({
          ...item,
          likes_count: Math.floor(Math.random() * 50) + 5,
          comments_count: Math.floor(Math.random() * 10) + 1
        }));
        setNews(newsWithCounts);
        
        // Initialize likes state
        const likesState: { [key: string]: { count: number; liked: boolean } } = {};
        newsWithCounts.forEach(item => {
          likesState[item.id] = {
            count: item.likes_count || 0,
            liked: false
          };
        });
        setLikes(likesState);
      } catch (err) {
        console.error('Error fetching news:', err);
        setLoadingError('Ошибка загрузки новостей');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const mainNews = news.find(item => item.is_main);
  const regularNews = news.filter(item => !item.is_main);

  const openNewsModal = async (newsItem: News) => {
    setSelectedNews(newsItem);
    setCurrentImageIndex(0);
    setNewComment('');
    
    try {
      const newsComments = await getNewsComments(newsItem.id);
      setComments(newsComments);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setComments([]);
    }
  };

  const closeNewsModal = () => {
    setSelectedNews(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (selectedNews && currentImageIndex < selectedNews.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const handleLike = async (newsId: string) => {
    if (!user) {
      error('Требуется авторизация', 'Войдите в систему, чтобы ставить лайки');
      return;
    }

    try {
      const result = await toggleNewsLike(newsId, user.name);
      setLikes(prev => ({
        ...prev,
        [newsId]: result
      }));
      
      if (result.liked) {
        success('Лайк поставлен!');
      }
    } catch (err) {
      error('Ошибка', 'Не удалось поставить лайк');
    }
  };

  const handleAddComment = async () => {
    if (!user || !selectedNews || !newComment.trim()) return;

    try {
      const comment = await addNewsComment(selectedNews.id, user.name, newComment.trim());
      setComments(prev => [...prev, comment]);
      setNewComment('');
      success('Комментарий добавлен!');
      
      // Update comments count
      setNews(prev => prev.map(item => 
        item.id === selectedNews.id 
          ? { ...item, comments_count: (item.comments_count || 0) + 1 }
          : item
      ));
    } catch (err) {
      error('Ошибка', 'Не удалось добавить комментарий');
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
          <h1 className="text-4xl font-bold text-white mb-4">Новости корпуса</h1>
          <p className="text-xl text-blue-200">Актуальные события и достижения кадетов</p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="relative z-20">
            <LoadingSpinner message="Загрузка новостей..." />
          </div>
        )}

        {/* Error State */}
        {loadingError && (
          <div className="text-center py-12 relative z-20">
            <p className="text-red-400 mb-4">{loadingError}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Попробовать снова
            </button>
          </div>
        )}

        {/* Main News */}
        {!loading && !loadingError && mainNews && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <div 
              className="relative overflow-hidden rounded-2xl shadow-2xl cursor-pointer group"
              onClick={() => openNewsModal(mainNews)}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10"></div>
              {mainNews.background_image_url && (
                <img
                  src={mainNews.background_image_url}
                  alt={mainNews.title}
                  className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                />
              )}
              <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                <div className="flex items-center space-x-2 mb-4">
                  <Star className="h-5 w-5 text-yellow-400" />
                  <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                    ГЛАВНАЯ НОВОСТЬ
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4 group-hover:text-yellow-400 transition-colors">
                  {mainNews.title}
                </h2>
                <p className="text-blue-100 mb-4 line-clamp-3">{mainNews.content}</p>
                <div className="flex items-center space-x-6 text-blue-200">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm">{mainNews.author}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">{new Date(mainNews.created_at).toLocaleDateString('ru-RU')}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Regular News */}
        {!loading && !loadingError && (
          <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-20"
        >
          {regularNews.map((news, index) => (
            <motion.div
              key={news.id}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 * index }}
              className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer group"
              onClick={() => openNewsModal(news)}
            >
              {news.images[0] && (
                <div className="relative overflow-hidden">
                  <img
                    src={news.images[0]}
                    alt={news.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-yellow-400 transition-colors line-clamp-2">
                  {news.title}
                </h3>
                <p className="text-blue-200 mb-4 line-clamp-3">{news.content}</p>
                <div className="flex items-center justify-between text-sm text-blue-300">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{news.author}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(news.created_at).toLocaleDateString('ru-RU')}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-white/10">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleLike(news.id)}
                    className="flex items-center space-x-1 text-blue-300 hover:text-yellow-400 transition-colors"
                  >
                    <Heart className={`h-4 w-4 ${likes[news.id]?.liked ? 'fill-current text-red-400' : ''}`} />
                    <span className="text-sm">{likes[news.id]?.count || 0}</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex items-center space-x-1 text-blue-300 hover:text-yellow-400 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-sm">{news.comments_count || 0}</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex items-center space-x-1 text-blue-300 hover:text-yellow-400 transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        )}

        {/* News Modal */}
        {selectedNews && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeNewsModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gradient-to-br from-blue-900 to-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    {selectedNews.isMain && (
                      <div className="flex items-center space-x-2">
                        <Star className="h-5 w-5 text-yellow-400" />
                        <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                          ГЛАВНАЯ НОВОСТЬ
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={closeNewsModal}
                    className="text-white hover:text-yellow-400 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>

                <h2 className="text-3xl font-bold text-white mb-6">{selectedNews.title}</h2>

                <div className="flex items-center space-x-6 text-blue-200 mb-8">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{selectedNews.author}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(selectedNews.created_at).toLocaleDateString('ru-RU')}</span>
                  </div>
                </div>

                <div className="prose prose-invert max-w-none mb-8">
                  <p className="text-blue-100 text-lg leading-relaxed">{selectedNews.content}</p>
                </div>

                {/* Image Carousel */}
                {selectedNews.images && selectedNews.images.length > 0 && (
                  <div className="relative">
                    <div className="relative overflow-hidden rounded-xl">
                      <img
                        src={selectedNews.images[currentImageIndex]}
                        alt={`${selectedNews.title} ${currentImageIndex + 1}`}
                        className="w-full h-96 object-cover"
                      />
                      {selectedNews.images.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            disabled={currentImageIndex === 0}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronLeft className="h-6 w-6" />
                          </button>
                          <button
                            onClick={nextImage}
                            disabled={currentImageIndex === selectedNews.images.length - 1}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronRight className="h-6 w-6" />
                          </button>
                        </>
                      )}
                    </div>
                    {selectedNews.images && selectedNews.images.length > 1 && (
                      <div className="flex justify-center space-x-2 mt-4">
                        {selectedNews.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-3 h-3 rounded-full transition-colors ${
                              index === currentImageIndex ? 'bg-yellow-400' : 'bg-white/30'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Comments Section */}
                <div className="mt-8 border-t border-white/20 pt-6">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Комментарии ({comments.length})
                  </h3>
                  
                  {/* Add Comment */}
                  {user && (
                    <div className="mb-6">
                      <div className="flex space-x-3">
                        <div className="flex-grow">
                          <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Написать комментарий..."
                            rows={3}
                            className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                          />
                        </div>
                        <button
                          onClick={handleAddComment}
                          disabled={!newComment.trim()}
                          className="self-end bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-all duration-300"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Comments List */}
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-white">{comment.author_name}</span>
                          <span className="text-xs text-blue-300">
                            {new Date(comment.created_at).toLocaleString('ru-RU')}
                          </span>
                        </div>
                        <p className="text-blue-100">{comment.content}</p>
                      </motion.div>
                    ))}
                    
                    {comments.length === 0 && (
                      <p className="text-blue-300 text-center py-4">
                        Пока нет комментариев. Будьте первым!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default NewsPage;