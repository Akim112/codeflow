export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (stats: any) => boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const achievements: Achievement[] = [
  {
    id: 'first_hack',
    title: 'Первая кровь',
    description: 'Выполнили свою первую миссию',
    icon: '🔌',
    condition: (stats) => stats.completedCount >= 1,
    rarity: 'common'
  },
  {
    id: 'five_missions',
    title: 'На взводе',
    description: 'Выполнили 5 миссий',
    icon: '⚡',
    condition: (stats) => stats.completedCount >= 5,
    rarity: 'common'
  },
  {
    id: 'ten_missions',
    title: 'Ветеран',
    description: 'Выполнили 10 миссий',
    icon: '🎖️',
    condition: (stats) => stats.completedCount >= 10,
    rarity: 'rare'
  },
  {
    id: 'all_missions',
    title: 'Легенда сопротивления',
    description: 'Пройдите все 15 миссий',
    icon: '👑',
    condition: (stats) => stats.completedCount >= 15,
    rarity: 'legendary'
  },
  {
    id: 'boss_slayer',
    title: 'Убийца Цербера',
    description: 'Взломали систему защиты Главы 1',
    icon: '💀',
    condition: (stats) => stats.completedIds.includes(4),
    rarity: 'rare'
  },
  {
    id: 'boss_slayer_2',
    title: 'Пожиратель файрволов',
    description: 'Победили ИИ Цербера (Босс Главы 2)',
    icon: '🔥',
    condition: (stats) => stats.completedIds.includes(7),
    rarity: 'rare'
  },
  {
    id: 'boss_slayer_3',
    title: 'Мастер брутфорса',
    description: 'Подобрали пароль на время (Босс Главы 3)',
    icon: '🔓',
    condition: (stats) => stats.completedIds.includes(10),
    rarity: 'rare'
  },
  {
    id: 'boss_slayer_4',
    title: 'Архивариус',
    description: 'Извлекли данные из базы (Босс Главы 4)',
    icon: '📁',
    condition: (stats) => stats.completedIds.includes(13),
    rarity: 'rare'
  },
  {
    id: 'leviathan_slayer',
    title: 'Убийца Левиафана',
    description: 'Отключили финального босса — систему Левиафан',
    icon: '🐉',
    condition: (stats) => stats.completedIds.includes(15),
    rarity: 'legendary'
  },
  {
    id: 'xp_500',
    title: 'Накопитель',
    description: 'Собрали 500 XP',
    icon: '💰',
    condition: (stats) => stats.totalXP >= 500,
    rarity: 'common'
  },
  {
    id: 'xp_1000',
    title: 'Богач',
    description: 'Собрали более 1000 XP',
    icon: '💎',
    condition: (stats) => stats.totalXP >= 1000,
    rarity: 'rare'
  },
  {
    id: 'xp_3000',
    title: 'Магнат',
    description: 'Собрали более 3000 XP',
    icon: '🏆',
    condition: (stats) => stats.totalXP >= 3000,
    rarity: 'epic'
  },
  {
    id: 'xp_5000',
    title: 'Элита',
    description: 'Собрали более 5000 XP',
    icon: '⭐',
    condition: (stats) => stats.totalXP >= 5000,
    rarity: 'legendary'
  },
  {
    id: 'speed_demon',
    title: 'Скоростной демон',
    description: 'Завершили босс-миссию за 30 секунд',
    icon: '⏱️',
    condition: (stats) => stats.fastBossKill === true,
    rarity: 'epic'
  },
  {
    id: 'clean_code',
    title: 'Чистый код',
    description: 'Завершили 5 миссий подряд без ошибок',
    icon: '✨',
    condition: (stats) => stats.cleanStreak >= 5,
    rarity: 'epic'
  },
  {
    id: 'night_owl',
    title: 'Ночная сова',
    description: 'Кодили после полуночи',
    icon: '🦉',
    condition: () => {
      const hour = new Date().getHours();
      return hour >= 0 && hour < 5;
    },
    rarity: 'rare'
  },
  {
    id: 'collector',
    title: 'Коллекционер',
    description: 'Купили все темы в магазине',
    icon: '🎨',
    condition: (stats) => stats.themesOwned >= 4,
    rarity: 'epic'
  },
  {
    id: 'faction_friend',
    title: 'Друг андеграунда',
    description: 'Получили 100+ репутации с любой фракцией',
    icon: '🤝',
    condition: (stats) => stats.maxFactionRep >= 100,
    rarity: 'rare'
  }
];

// Функция для расчёта статистики
export const calculateStats = () => {
  const completedIds: number[] = JSON.parse(localStorage.getItem('completedLessons') || '[]');
  const totalXP = Number(localStorage.getItem('userXP') || '0');
  const themesOwned = JSON.parse(localStorage.getItem('ownedThemes') || '["classic"]').length;
  
  // Получаем максимальную репутацию
  const reputation = JSON.parse(localStorage.getItem('reputation') || '{}');
  const maxFactionRep = Math.max(0, ...Object.values(reputation).map(v => Number(v) || 0));
  
  return {
    completedCount: completedIds.length,
    completedIds,
    totalXP,
    themesOwned,
    maxFactionRep,
    cleanStreak: Number(localStorage.getItem('cleanStreak') || '0'),
    fastBossKill: localStorage.getItem('fastBossKill') === 'true'
  };
};