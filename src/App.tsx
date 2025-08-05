import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import ErrorBoundary from './components/ErrorBoundary';
import NotificationToast from './components/NotificationToast';
import HomePage from './pages/HomePage';
import RatingPage from './pages/RatingPage';
import CadetProfile from './pages/CadetProfile';
import NewsPage from './pages/NewsPage';
import TasksPage from './pages/TasksPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen gradient-bg">
      <Header />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/rating" element={<RatingPage />} />
          <Route path="/cadet/:id" element={<CadetProfile />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <NotificationProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </NotificationProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;