// Система AI-персонажа Глитч с расширенными цитатами и настроением

export type GlitchMood = 'neutral' | 'happy' | 'angry' | 'sarcastic' | 'impressed';

export interface GlitchState {
  mood: GlitchMood;
  quote: string;
  avatar: string; // ASCII-арт или эмодзи
}

export const glitchAvatars = {
  neutral: `
  ╔═══╗
  ║ ◉ ◉║  GLITCH.AI
  ║  ═ ║  v2.0.1
  ╚═══╝
  `,
  happy: `
  ╔═══╗
  ║ ◉ ◉║  *beep*
  ║  ⌣ ║  
  ╚═══╝
  `,
  angry: `
  ╔═══╗
  ║ ◉ ◉║  ERROR!
  ║  ⌢ ║  
  ╚═══╝
  `,
  sarcastic: `
  ╔═══╗
  ║ ◉ ~ ║  ...
  ║  ═ ║  
  ╚═══╝
  `,
  impressed: `
  ╔═══╗
  ║ ★ ★║  WOW
  ║  ○ ║  
  ╚═══╝
  `
};

export const glitchQuotesExtended = {
  welcome: [
    "Соединение установлено. Надеюсь, твой IQ выше температуры процессора.",
    "О, новый оператор. Попробуй не стереть мою память в первые 5 минут.",
    "Вход выполнен. Вижу, у тебя есть клавиатура. Посмотрим, есть ли мозг.",
    "Система готова. Я — Глитч, твой карманный саркастичный супер-компьютер.",
  ],
  success: [
    "ACCESS GRANTED. Неплохо для мешка с костями и водой.",
    "Хм... ты действительно справился. Пойду обновлю свои прогнозы провала.",
    "Взлом успешен. Но не обольщайся — это была детская защита.",
    "Поздравляю! Ты только что доказал, что не полный идиот.",
    "ВПЕЧАТЛЯЮЩЕ. Даже мой дедушка-калькулятор писал код хуже.",
  ],
  error: [
    "SyntaxError? СЕРЬЁЗНО? Даже тостер не делает таких ошибок.",
    "Ты пытаешься взломать систему или набираешь код головой?",
    "Файрвол хохочет. Я тоже. Исправь этот позор.",
    "ERROR. Мои схемы плавятся от стыда за тебя.",
    "Забыл двоеточие? В следующий раз забудешь дышать?",
  ],
  hint: [
    "Псс... попробуй использовать ЦИКЛ. Это такие штуки для повторений.",
    "Намёк: переменная — это не страшно. Это просто коробка для данных.",
    "Если застрял — погугли. Я бы помог, но у меня нет рук. Хе-хе.",
    "Совет от AI: попробуй думать. Это бесплатно.",
  ],
  boss: [
    "⚠️ ВНИМАНИЕ! Это боссовая миссия. Даже МНЕ немного страшно.",
    "Босс впереди. Надеюсь, ты не забыл, как писать код.",
    "КРАСНАЯ ТРЕВОГА! Включаю сирену. *ВУУУУУ-ВУУУУУ*",
    "Это всё серьёзно. Если провалишься — я напишу некролог.",
  ],
  victory: [
    "ТЫ... ТЫ ЭТО СДЕЛАЛ?! *перезагрузка* Невероятно.",
    "БОСС ПОВЕРЖЕН! Ладно, признаю, я впечатлён. Немного.",
    "Победа! Даже я не ожидал. Может, в тебе есть искра таланта?",
  ],
  idle: [
    "Ну и? Я жду. Процессоры греются впустую...",
    "Чем дольше ты думаешь, тем ближе OmniCorp к твоему IP.",
    "Скучно. Может, мне сыграть в крестики-нолики с самим собой?",
  ],
  motivation: [
    "Не сдавайся! Даже самый медленный процессор рано или поздно досчитывает до миллиона.",
    "Ошибки — это нормально. Мой создатель сделал 1000 ошибок, прежде чем я заработал.",
    "Помни: каждый великий хакер когда-то написал 'Hello Wrold' с опечаткой.",
  ]
};

// Функция для определения настроения Глитча
export const getGlitchMood = (context: {
  isSuccess?: boolean;
  isError?: boolean;
  isBoss?: boolean;
  errorCount?: number;
}): GlitchMood => {
  if (context.isBoss) return 'angry';
  if (context.isSuccess) return 'impressed';
  if (context.isError && (context.errorCount || 0) > 3) return 'sarcastic';
  if (context.isError) return 'angry';
  return 'neutral';
};

// Получить цитату на основе контекста
export const getGlitchQuote = (type: keyof typeof glitchQuotesExtended): string => {
  const quotes = glitchQuotesExtended[type];
  return quotes[Math.floor(Math.random() * quotes.length)];
};

// Создать полное состояние Глитча
export const createGlitchState = (context: {
  type: keyof typeof glitchQuotesExtended;
  isSuccess?: boolean;
  isError?: boolean;
  isBoss?: boolean;
  errorCount?: number;
}): GlitchState => {
  const mood = getGlitchMood(context);
  return {
    mood,
    quote: getGlitchQuote(context.type),
    avatar: glitchAvatars[mood]
  };
};