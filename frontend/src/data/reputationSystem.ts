// Система репутации в андеграунде

export interface Faction {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  bonus: string;
  requiredRep: number;
}

export const factions: Faction[] = [
  {
    id: 'data_brokers',
    name: 'Торговцы Данными',
    description: 'Группа хакеров, специализирующихся на извлечении и продаже информации',
    icon: '💾',
    color: 'blue',
    bonus: '+20% XP за задачи со списками и строками',
    requiredRep: 0
  },
  {
    id: 'crypto_rebels',
    name: 'Крипто-Повстанцы',
    description: 'Анархисты, взламывающие финансовые системы',
    icon: '🔐',
    color: 'violet',
    bonus: 'Доступ к шифрованным миссиям',
    requiredRep: 500
  },
  {
    id: 'ai_ethicists',
    name: 'AI-Этики',
    description: 'Борются за честный и чистый код',
    icon: '🤖',
    color: 'cyan',
    bonus: '+15% XP за код без ошибок',
    requiredRep: 1000
  },
  {
    id: 'ghost_protocol',
    name: 'Протокол Призрак',
    description: 'Элитная группа невидимых операторов',
    icon: '👻',
    color: 'dark',
    bonus: 'Скрытые миссии и эксклюзивный доступ',
    requiredRep: 2000
  }
];

export interface ReputationState {
  [factionId: string]: number;
}

// Получить репутацию с фракцией
export const getReputation = (factionId: string): number => {
  const saved = localStorage.getItem('reputation');
  if (!saved) return 0;
  const rep: ReputationState = JSON.parse(saved);
  return rep[factionId] || 0;
};

// Добавить репутацию
export const addReputation = (factionId: string, amount: number) => {
  const saved = localStorage.getItem('reputation');
  const rep: ReputationState = saved ? JSON.parse(saved) : {};
  rep[factionId] = (rep[factionId] || 0) + amount;
  localStorage.setItem('reputation', JSON.stringify(rep));
};

// Проверить, доступна ли фракция
export const isFactionUnlocked = (faction: Faction): boolean => {
  const totalXP = Number(localStorage.getItem('userXP')) || 0;
  return totalXP >= faction.requiredRep;
};

// Получить бонусный множитель XP от фракций
export const getXPMultiplier = (): number => {
  let multiplier = 1.0;
  
  // Проверяем репутацию с каждой фракцией
  if (getReputation('data_brokers') >= 100) {
    multiplier += 0.2; // +20% от Торговцев
  }
  
  if (getReputation('ai_ethicists') >= 150) {
    multiplier += 0.15; // +15% от AI-Этиков
  }
  
  return multiplier;
};

// Наградить репутацией за выполнение миссии
export const awardMissionReputation = (lessonId: number, wasCleanCode: boolean) => {
  // Логика: разные миссии дают репу разным фракциям
  if (lessonId >= 11 && lessonId <= 13) {
    // Задачи со списками -> Data Brokers
    addReputation('data_brokers', 10);
  }
  
  if (wasCleanCode) {
    // Чистый код -> AI Ethicists
    addReputation('ai_ethicists', 5);
  }
  
  // Боссы дают репу всем
  const lesson = [4, 7, 10, 13, 15];
  if (lesson.includes(lessonId)) {
    addReputation('crypto_rebels', 15);
    addReputation('ghost_protocol', 10);
  }
};