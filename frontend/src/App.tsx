import '@mantine/core/styles.css';
import './styles/globals.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MantineProvider, createTheme } from '@mantine/core';
import { useEffect, useState } from 'react';

import HomePage from './pages/HomePage';
import CoursesPage from './pages/CoursesPage';
import LessonPage from './pages/LessonPage';
import ProfilePage from './pages/ProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';
import ShopPage from './pages/ShopPage';
import { PageTransition } from './components/PageTransition';
import { CyberLoader } from './components/CyberLoader';
import { terminalThemes } from './data/shopItems';

const getPrimaryColor = (id: string) => {
  switch (id) {
    case 'blood': return 'red';
    case 'cyberia': return 'blue';
    case 'gold': return 'yellow';
    default: return 'green';
  }
};

const createAppTheme = (primaryColor: string) => createTheme({
  fontFamily: 'JetBrains Mono, monospace',
  headings: { fontFamily: 'Orbitron, sans-serif' },
  primaryColor,
  defaultRadius: 'sm',
  colors: {
    green: ['#EBFBEE','#D3F9D8','#B2F2BB','#8CE99A','#69DB7C','#51CF66','#40C057','#37B24D','#2F9E44','#2B8A3E'],
    red: ['#FFF5F5','#FFE3E3','#FFC9C9','#FFA8A8','#FF8787','#FF6B6B','#FA5252','#F03E3E','#E03131','#C92A2A'],
    blue: ['#E7F5FF','#D0EBFF','#A5D8FF','#74C0FC','#4DABF7','#339AF0','#228BE6','#1C7ED6','#1971C2','#1864AB'],
    yellow: ['#FFF9DB','#FFF3BF','#FFEC99','#FFE066','#FFD43B','#FCC419','#FAB005','#F59F00','#F08C00','#E67700'],
  }
});

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [activeThemeId, setActiveThemeId] = useState(localStorage.getItem('activeTheme') || 'classic');
  const currentThemeData = terminalThemes.find(t => t.id === activeThemeId) || terminalThemes[0];
  const [theme, setTheme] = useState(createAppTheme(getPrimaryColor(activeThemeId)));

  // Симуляция загрузки
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsLoading(false), 500);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Обновление темы
  useEffect(() => {
    const handleStorageChange = () => {
      const newThemeId = localStorage.getItem('activeTheme') || 'classic';
      setActiveThemeId(newThemeId);
      setTheme(createAppTheme(getPrimaryColor(newThemeId)));
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('theme-changed', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('theme-changed', handleStorageChange);
    };
  }, []);

  // Применение CSS-переменных темы
  useEffect(() => {
    document.documentElement.style.setProperty('--neon-green', currentThemeData.color);
    document.documentElement.style.setProperty('--terminal-green', currentThemeData.color);
    document.documentElement.style.setProperty('--dark-bg', currentThemeData.bg);
    document.body.style.background = currentThemeData.bg;
  }, [currentThemeData]);

  if (isLoading) {
    return (
      <MantineProvider theme={theme} defaultColorScheme="dark">
        <CyberLoader 
          progress={loadProgress} 
          text="CODEFLOW"
          subtext="Инициализация системы..."
          color={currentThemeData.color}
        />
      </MantineProvider>
    );
  }

  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <BrowserRouter>
        <PageTransition>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/lesson/:id" element={<LessonPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/shop" element={<ShopPage />} />
          </Routes>
        </PageTransition>
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;