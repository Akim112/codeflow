import '@mantine/core/styles.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MantineProvider, createTheme } from '@mantine/core';
import { useEffect, useState } from 'react';

// Импорты страниц
import HomePage from './pages/HomePage';
import CoursesPage from './pages/CoursesPage';
import LessonPage from './pages/LessonPage';
import ProfilePage from './pages/ProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';
import ShopPage from './pages/ShopPage';

// Импорт данных магазина
import { terminalThemes } from './data/shopItems';

// Маппинг для Mantine
const getPrimaryColor = (id: string) => {
  switch (id) {
    case 'blood': return 'red';
    case 'cyberia': return 'blue';
    case 'gold': return 'yellow';
    default: return 'green';
  }
};

// Создаем базовую тему
const createAppTheme = (primaryColor: string) => createTheme({
  fontFamily: 'JetBrains Mono, monospace',
  primaryColor,
  defaultRadius: 0,
  colors: {
    green: [ '#EBFBEE', '#D3F9D8', '#B2F2BB', '#8CE99A', '#69DB7C', '#51CF66', '#40C057', '#37B24D', '#2F9E44', '#2B8A3E' ],
    red: [ '#FFF5F5', '#FFE3E3', '#FFC9C9', '#FFA8A8', '#FF8787', '#FF6B6B', '#FA5252', '#F03E3E', '#E03131', '#C92A2A' ],
    blue: [ '#E7F5FF', '#D0EBFF', '#A5D8FF', '#74C0FC', '#4DABF7', '#339AF0', '#228BE6', '#1C7ED6', '#1971C2', '#1864AB' ],
    yellow: [ '#FFF9DB', '#FFF3BF', '#FFEC99', '#FFE066', '#FFD43B', '#FCC419', '#FAB005', '#F59F00', '#F08C00', '#E67700' ],
  }
});

function App() {
  const [activeThemeId, setActiveThemeId] = useState(localStorage.getItem('activeTheme') || 'classic');
  const currentThemeData = terminalThemes.find(t => t.id === activeThemeId) || terminalThemes[0];
  const [theme, setTheme] = useState(createAppTheme(getPrimaryColor(activeThemeId)));

  // Обновляем тему при изменении localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const newThemeId = localStorage.getItem('activeTheme') || 'classic';
      setActiveThemeId(newThemeId);
      setTheme(createAppTheme(getPrimaryColor(newThemeId)));
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Также слушаем кастомное событие для обновления в том же окне
    window.addEventListener('theme-changed', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('theme-changed', handleStorageChange);
    };
  }, []);

  // Обновляем CSS-переменные при монтировании и смене темы
  useEffect(() => {
    const neonColor = currentThemeData.color;
    const bgColor = currentThemeData.bg;

    // Обновляем CSS-переменные
    document.documentElement.style.setProperty('--neon-green', neonColor);
    document.documentElement.style.setProperty('--terminal-green', neonColor);
    document.documentElement.style.setProperty('--dark-bg', bgColor);
    
    // Обновляем фон body
    document.body.style.background = bgColor;

    // Обновляем цвет курсора в SVG
    const cursorSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Ctext x='0' y='20' font-family='monospace' font-size='20' fill='${encodeURIComponent(neonColor)}'%3E▸%3C/text%3E%3C/svg%3E`;
    document.documentElement.style.setProperty('--cursor-svg', `url("${cursorSvg}")`);
  }, [currentThemeData]);

  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/lesson/:id" element={<LessonPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/shop" element={<ShopPage />} />
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;