// Система управления боссовыми миссиями: таймер, жизни, кулдаун

// Лимиты времени для каждого босса (в секундах)
const BOSS_TIME_LIMITS: Record<number, number> = {
  4:  80,   // Глава 1: Обход биометрии (простые переменные)
  7:  90,   // Глава 2: ИИ 'Цербер' (if/elif/else)
  10: 100,  // Глава 3: Подбор пароля (циклы + f-строки)
  13: 110,  // Глава 4: Извлечение данных (списки + циклы)
  15: 120,  // Глава 5: Отключение Левиафана (функции)
};

// Максимальное количество попыток
const MAX_ATTEMPTS = 5;

// Кулдауны между попытками (в секундах)
// Попытка 1 → 2: 0 сек (мгновенно)
// Попытка 2 → 3: 30 сек
// Попытка 3 → 4: 60 сек
// Попытка 4 → 5: 120 сек
// После 5 попыток: 8 часов (28800 сек)
const COOLDOWNS: Record<number, number> = {
  1: 0,      // Первая попытка — сразу
  2: 0,      // Вторая попытка — сразу (вторая жизнь)
  3: 30,     // Третья — подождать 30 сек
  4: 60,     // Четвёртая — подождать 1 мин
  5: 120,    // Пятая — подождать 2 мин
};

const FINAL_COOLDOWN = 28800; // 8 часов после 5 неудач

// --- Интерфейсы ---
export interface BossAttemptData {
  attempt: number;       // Текущая попытка (1-5)
  failedAt: number;      // Timestamp последнего провала
  completed: boolean;    // Пройден ли босс
}

// --- Получить лимит времени для босса ---
export const getBossTimeLimit = (lessonId: number): number => {
  return BOSS_TIME_LIMITS[lessonId] || 80;
};

// --- Получить данные о попытках босса ---
export const getBossAttemptData = (lessonId: number): BossAttemptData => {
  const key = `boss_attempt_${lessonId}`;
  const saved = localStorage.getItem(key);
  if (saved) {
    return JSON.parse(saved);
  }
  return { attempt: 1, failedAt: 0, completed: false };
};

// --- Сохранить данные о попытках ---
const saveBossAttemptData = (lessonId: number, data: BossAttemptData) => {
  const key = `boss_attempt_${lessonId}`;
  localStorage.setItem(key, JSON.stringify(data));
};

// --- Записать провал босса ---
export const recordBossFailure = (lessonId: number): {
  nextAttempt: number;
  cooldownSeconds: number;
  isLocked: boolean;
} => {
  const data = getBossAttemptData(lessonId);
  const now = Date.now();

  if (data.attempt >= MAX_ATTEMPTS) {
    // Все 5 попыток использованы — блокировка на 8 часов
    saveBossAttemptData(lessonId, {
      attempt: 1, // Сбросим для следующей серии
      failedAt: now,
      completed: false,
    });
    return {
      nextAttempt: 1,
      cooldownSeconds: FINAL_COOLDOWN,
      isLocked: true,
    };
  }

  const nextAttempt = data.attempt + 1;
  const cooldown = COOLDOWNS[nextAttempt] || 0;

  saveBossAttemptData(lessonId, {
    attempt: nextAttempt,
    failedAt: now,
    completed: false,
  });

  return {
    nextAttempt,
    cooldownSeconds: cooldown,
    isLocked: cooldown > 0,
  };
};

// --- Проверить, можно ли начать попытку ---
export const canAttemptBoss = (lessonId: number): boolean => {
  const data = getBossAttemptData(lessonId);
  if (data.completed) return true; // Уже пройден

  const remaining = getCooldownRemaining(lessonId);
  return remaining <= 0;
};

// --- Получить оставшееся время кулдауна (в секундах) ---
export const getCooldownRemaining = (lessonId: number): number => {
  const data = getBossAttemptData(lessonId);
  if (data.failedAt === 0) return 0;

  const cooldown = COOLDOWNS[data.attempt] || 0;
  const elapsed = (Date.now() - data.failedAt) / 1000;

  // Проверяем, не был ли использован финальный кулдаун (8 часов)
  // Если attempt === 1 и failedAt > 0, значит был сброс после 5 попыток
  if (data.attempt === 1 && data.failedAt > 0 && !data.completed) {
    const finalElapsed = (Date.now() - data.failedAt) / 1000;
    if (finalElapsed < FINAL_COOLDOWN) {
      return Math.ceil(FINAL_COOLDOWN - finalElapsed);
    }
    return 0;
  }

  if (elapsed >= cooldown) return 0;
  return Math.ceil(cooldown - elapsed);
};

// --- Получить общую длительность текущего кулдауна (в секундах) ---
export const getCooldownTotal = (lessonId: number): number => {
  const data = getBossAttemptData(lessonId);
  if (data.attempt === 1 && data.failedAt > 0 && !data.completed) {
    return FINAL_COOLDOWN;
  }
  return COOLDOWNS[data.attempt] || 0;
};

// --- Сбросить данные при успехе ---
export const resetBossOnSuccess = (lessonId: number) => {
  saveBossAttemptData(lessonId, {
    attempt: 1,
    failedAt: 0,
    completed: true,
  });
};

// --- Получить максимальное кол-во попыток ---
export const getMaxAttempts = (): number => MAX_ATTEMPTS;

// --- Форматировать время кулдауна для отображения ---
export const formatCooldown = (seconds: number): string => {
  if (seconds <= 0) return '0с';

  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}ч ${mins}м`;
  }
  if (mins > 0) {
    return `${mins}м ${secs}с`;
  }
  return `${secs}с`;
};
