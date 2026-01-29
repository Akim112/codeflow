export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (stats: { completedCount: number; completedIds: number[]; totalXP: number }) => boolean;
}

export const achievements: Achievement[] = [
  {
    id: 'first_hack',
    title: 'Первая кровь',
    description: 'Выполнили свою первую миссию',
    icon: '🔌',
    condition: (stats) => stats.completedCount >= 1,
  },
  {
    id: 'boss_slayer',
    title: 'Убийца Цербера',
    description: 'Взломали систему защиты Главы 1',
    icon: '💀',
    condition: (stats) => stats.completedIds.includes(4),
  },
  {
    id: 'xp_collector',
    title: 'Накопитель',
    description: 'Собрали более 1000 XP',
    icon: '💰',
    condition: (stats) => stats.totalXP >= 1000,
  }
];