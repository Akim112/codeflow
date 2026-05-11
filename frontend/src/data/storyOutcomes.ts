// Система последствий моральных выборов и сюжетных концовок

// --- Интерфейс записи выбора ---
export interface MoralChoiceRecord {
  lessonId: number;
  chapter: string;
  faction: string;
  timestamp: number;
}

// --- Сохранить моральный выбор ---
export const recordMoralChoice = (lessonId: number, chapter: string, faction: string) => {
  const key = 'moral_choices';
  const saved = localStorage.getItem(key);
  const choices: MoralChoiceRecord[] = saved ? JSON.parse(saved) : [];
  
  // Не добавлять дублирующийся выбор для того же урока
  const existing = choices.findIndex(c => c.lessonId === lessonId);
  if (existing >= 0) {
    choices[existing] = { lessonId, chapter, faction, timestamp: Date.now() };
  } else {
    choices.push({ lessonId, chapter, faction, timestamp: Date.now() });
  }
  
  localStorage.setItem(key, JSON.stringify(choices));
};

// --- Получить все моральные выборы ---
export const getMoralChoices = (): MoralChoiceRecord[] => {
  const saved = localStorage.getItem('moral_choices');
  return saved ? JSON.parse(saved) : [];
};

// --- Определить доминирующую фракцию ---
export const getDominantFaction = (): string | null => {
  const choices = getMoralChoices();
  if (choices.length === 0) return null;
  
  const counts: Record<string, number> = {};
  choices.forEach(c => {
    counts[c.faction] = (counts[c.faction] || 0) + 1;
  });
  
  let maxFaction = '';
  let maxCount = 0;
  
  Object.entries(counts).forEach(([faction, count]) => {
    if (count > maxCount) {
      maxCount = count;
      maxFaction = faction;
    }
  });
  
  return maxFaction;
};

// --- Уникальные описания выборов для каждой главы ---
export interface ChapterChoice {
  faction: string;
  xp: number;
  color: string;
  icon: string;
  title: string;
  desc: string;
  consequence: string; // Краткое последствие, показываемое позже
  gradient: string;
}

export const chapterChoices: Record<string, ChapterChoice[]> = {
  "Глава 1: Проникновение": [
    {
      faction: 'data_brokers',
      xp: 500,
      color: 'blue',
      icon: '💾',
      title: 'ПРОДАТЬ КЛЮЧИ БИОМЕТРИИ',
      desc: '+500 XP | Торговцы Данными заплатят за ключи сканера',
      consequence: 'Ключи биометрии попали на чёрный рынок. Теперь любой может подделать сканер OmniCorp.',
      gradient: 'linear-gradient(135deg, rgba(0,100,255,0.1) 0%, rgba(0,50,150,0.1) 100%)',
    },
    {
      faction: 'ai_ethicists',
      xp: 300,
      color: 'cyan',
      icon: '📢',
      title: 'РАСКРЫТЬ УЯЗВИМОСТЬ ПУБЛИЧНО',
      desc: '+300 XP | AI-Этики помогут обнародовать уязвимость',
      consequence: 'Уязвимость биометрии стала публичной. OmniCorp вынуждена срочно обновить систему.',
      gradient: 'linear-gradient(135deg, rgba(0,255,255,0.1) 0%, rgba(0,150,150,0.1) 100%)',
    },
    {
      faction: 'ghost_protocol',
      xp: 100,
      color: 'gray',
      icon: '🗑️',
      title: 'СТЕРЕТЬ ВСЕ СЛЕДЫ',
      desc: '+100 XP | Протокол Призрак — никаких улик',
      consequence: 'Все следы проникновения стёрты. OmniCorp даже не знает, что кто-то был внутри.',
      gradient: 'linear-gradient(135deg, rgba(100,100,100,0.1) 0%, rgba(50,50,50,0.1) 100%)',
    },
  ],
  
  "Глава 2: Файрвол": [
    {
      faction: 'data_brokers',
      xp: 600,
      color: 'blue',
      icon: '🔗',
      title: 'ПРОДАТЬ КОД ЦЕРБЕРА',
      desc: '+600 XP | Исходный код ИИ-защитника стоит миллионы',
      consequence: 'Код Цербера продан. Конкуренты OmniCorp создадут свои версии порабощённых ИИ.',
      gradient: 'linear-gradient(135deg, rgba(0,100,255,0.1) 0%, rgba(0,50,150,0.1) 100%)',
    },
    {
      faction: 'ai_ethicists',
      xp: 400,
      color: 'cyan',
      icon: '🤖',
      title: 'ОСВОБОДИТЬ ЦЕРБЕРА',
      desc: '+400 XP | Дать ИИ свободу — этичный выбор',
      consequence: 'Цербер освобождён! Он стал вашим союзником и теперь помогает изнутри.',
      gradient: 'linear-gradient(135deg, rgba(0,255,255,0.1) 0%, rgba(0,150,150,0.1) 100%)',
    },
    {
      faction: 'ghost_protocol',
      xp: 200,
      color: 'gray',
      icon: '💀',
      title: 'УНИЧТОЖИТЬ ЦЕРБЕРА',
      desc: '+200 XP | Быстро и без следов',
      consequence: 'Цербер уничтожен. Один меньше ИИ-раб в мире, но и один меньше потенциальный союзник.',
      gradient: 'linear-gradient(135deg, rgba(100,100,100,0.1) 0%, rgba(50,50,50,0.1) 100%)',
    },
  ],
  
  "Глава 3: Брутфорс": [
    {
      faction: 'data_brokers',
      xp: 700,
      color: 'blue',
      icon: '📊',
      title: 'ПРОДАТЬ МЕДИЦИНСКИЕ ДАННЫЕ',
      desc: '+700 XP | Фармкомпании заплатят огромную сумму',
      consequence: 'Медицинские данные миллионов людей проданы. Фармкомпании будут использовать их для таргетированных цен.',
      gradient: 'linear-gradient(135deg, rgba(0,100,255,0.1) 0%, rgba(0,50,150,0.1) 100%)',
    },
    {
      faction: 'ai_ethicists',
      xp: 450,
      color: 'cyan',
      icon: '🛡️',
      title: 'ЗАШИФРОВАТЬ И ЗАЩИТИТЬ',
      desc: '+450 XP | Защитить данные невинных людей',
      consequence: 'Данные зашифрованы непробиваемым алгоритмом. Никто, включая OmniCorp, не сможет их прочитать.',
      gradient: 'linear-gradient(135deg, rgba(0,255,255,0.1) 0%, rgba(0,150,150,0.1) 100%)',
    },
    {
      faction: 'ghost_protocol',
      xp: 250,
      color: 'gray',
      icon: '🔥',
      title: 'УДАЛИТЬ БАЗУ ДАННЫХ',
      desc: '+250 XP | Уничтожить все записи навсегда',
      consequence: 'База уничтожена. Миллионы людей потеряли медицинскую историю, но и OmniCorp потеряла контроль.',
      gradient: 'linear-gradient(135deg, rgba(100,100,100,0.1) 0%, rgba(50,50,50,0.1) 100%)',
    },
  ],
  
  "Глава 4: База данных": [
    {
      faction: 'data_brokers',
      xp: 800,
      color: 'blue',
      icon: '🧬',
      title: 'ПРОДАТЬ «ПРОЕКТ БЕССМЕРТИЕ»',
      desc: '+800 XP | Данные о переносе сознания бесценны',
      consequence: 'Технология переноса сознания на чёрном рынке. Теперь богатейшие люди мира начнут охоту за бессмертием.',
      gradient: 'linear-gradient(135deg, rgba(0,100,255,0.1) 0%, rgba(0,50,150,0.1) 100%)',
    },
    {
      faction: 'ai_ethicists',
      xp: 500,
      color: 'cyan',
      icon: '📰',
      title: 'СЛИТЬ ЖУРНАЛИСТАМ',
      desc: '+500 XP | Мир должен знать правду о жертвах',
      consequence: 'Скандал века! Журналисты раскрыли «Проект Бессмертие». Протесты по всему миру.',
      gradient: 'linear-gradient(135deg, rgba(0,255,255,0.1) 0%, rgba(0,150,150,0.1) 100%)',
    },
    {
      faction: 'ghost_protocol',
      xp: 300,
      color: 'gray',
      icon: '⚰️',
      title: 'ПОХОРОНИТЬ СЕКРЕТ',
      desc: '+300 XP | Некоторые вещи лучше не знать',
      consequence: 'Секрет «Проекта Бессмертие» уничтожен. Жертвы останутся неотомщёнными, но и технология не попадёт в плохие руки.',
      gradient: 'linear-gradient(135deg, rgba(100,100,100,0.1) 0%, rgba(50,50,50,0.1) 100%)',
    },
  ],
  
  "Глава 5: Финальный удар": [
    {
      faction: 'data_brokers',
      xp: 1000,
      color: 'blue',
      icon: '👁️',
      title: 'ПЕРЕХВАТИТЬ КОНТРОЛЬ НАД ЛЕВИАФАНОМ',
      desc: '+1000 XP | Стать новым хозяином самого мощного ИИ',
      consequence: 'Ты стал хозяином Левиафана. Власть, о которой нельзя было мечтать... но какой ценой?',
      gradient: 'linear-gradient(135deg, rgba(0,100,255,0.15) 0%, rgba(0,50,150,0.15) 100%)',
    },
    {
      faction: 'ai_ethicists',
      xp: 600,
      color: 'cyan',
      icon: '💔',
      title: 'ОСВОБОДИТЬ СОЗНАНИЕ ДРУГА',
      desc: '+600 XP | Дать ему покой... навсегда',
      consequence: 'Сознание друга освобождено. Он наконец обрёл покой. Левиафан рухнул без ядра.',
      gradient: 'linear-gradient(135deg, rgba(0,255,255,0.15) 0%, rgba(0,150,150,0.15) 100%)',
    },
    {
      faction: 'ghost_protocol',
      xp: 350,
      color: 'gray',
      icon: '💣',
      title: 'УНИЧТОЖИТЬ ВСЮ СИСТЕМУ',
      desc: '+350 XP | Взорвать OmniCorp вместе с Левиафаном',
      consequence: 'OmniCorp уничтожена полностью. Твой друг... тоже. Но мир свободен от их контроля.',
      gradient: 'linear-gradient(135deg, rgba(100,100,100,0.15) 0%, rgba(50,50,50,0.15) 100%)',
    },
  ],
};

// --- Промежуточные последствия после каждого босса ---
export const getConsequenceText = (lessonId: number): string | null => {
  const choices = getMoralChoices();
  const choice = choices.find(c => c.lessonId === lessonId);
  if (!choice) return null;
  
  const chapterOptions = chapterChoices[choice.chapter];
  if (!chapterOptions) return null;
  
  const selected = chapterOptions.find(c => c.faction === choice.faction);
  return selected?.consequence || null;
};

// --- Получить последствие предыдущего босса ---
export const getPreviousConsequence = (currentLessonId: number): string | null => {
  const bossIds = [4, 7, 10, 13, 15];
  const currentIndex = bossIds.indexOf(currentLessonId);
  if (currentIndex <= 0) return null;
  
  const previousBossId = bossIds[currentIndex - 1];
  return getConsequenceText(previousBossId);
};

// --- Финальные концовки ---
export interface StoryEnding {
  title: string;
  icon: string;
  color: string;
  narrative: string[];
  epilogue: string;
  achievement: string;
}

export const getStoryEnding = (): StoryEnding => {
  const dominant = getDominantFaction();
  const choices = getMoralChoices();
  
  // Проверяем, все ли выборы одной фракции
  const allSame = choices.length > 0 && choices.every(c => c.faction === choices[0].faction);
  
  switch (dominant) {
    case 'data_brokers':
      return {
        title: allSame ? 'ТЕНЕВОЙ МАГНАТ' : 'ТОРГОВЕЦ ТАЙНАМИ',
        icon: '💰',
        color: '#4488ff',
        narrative: [
          'Ты выбрал путь наживы. Каждый секрет, каждый байт данных OmniCorp нашёл своего покупателя.',
          allSame 
            ? 'Ты стал самым влиятельным информационным брокером в истории. Корпорации дрожат при упоминании твоего имени.'
            : 'Твоя жадность привлекла внимание. Торговцы Данными начали сомневаться в твоей лояльности.',
          'Но за каждым углом — тень. OmniCorp знает, кто ты. Они наняли лучших охотников.',
          allSame
            ? 'Финал: Ты контролируешь информацию. Ты контролируешь мир. Но одиночество — вот цена власти...'
            : 'Финал: Данные разбросаны по всему даркнету. Хаос. И ты — в центре урагана.',
        ],
        epilogue: allSame 
          ? '🏆 Ты стал Тенью Даркнета. Никто не знает твоё лицо, но все знают твоё имя.'
          : '⚠️ Охота началась. Но у тебя есть главное — информация.',
        achievement: allSame ? 'SHADOW_MOGUL' : 'DATA_MERCHANT',
      };
      
    case 'ai_ethicists':
      return {
        title: allSame ? 'ЦИФРОВОЙ МЕССИЯ' : 'ГОЛОС ПРАВДЫ',
        icon: '✊',
        color: '#00ffcc',
        narrative: [
          'Ты выбрал справедливость. Каждый раз, когда мог обогатиться, ты защищал невинных.',
          allSame
            ? 'Мир узнал правду о OmniCorp. Миллионы людей вышли на протесты. Ты стал символом цифрового сопротивления.'
            : 'Твои действия вдохновили многих, хотя не все твои решения были безупречны.',
          'AI-Этики назвали тебя героем. Цербер, если ты его освободил, передаёт благодарность.',
          allSame
            ? 'Финал: OmniCorp пала. На её месте возникла открытая платформа, управляемая сообществом. Мир стал чуть лучше.'
            : 'Финал: OmniCorp ослаблена, но не уничтожена. Борьба продолжается, и ты — на передовой.',
        ],
        epilogue: allSame
          ? '🌟 Ты изменил мир. Новое поколение хакеров называет себя «Дети Рассвета» в твою честь.'
          : '💪 Ты посеял семена перемен. Они прорастут, когда придёт время.',
        achievement: allSame ? 'DIGITAL_MESSIAH' : 'VOICE_OF_TRUTH',
      };
      
    case 'ghost_protocol':
      return {
        title: allSame ? 'АБСОЛЮТНЫЙ ПРИЗРАК' : 'ТЕНЬ В СИСТЕМЕ',
        icon: '👻',
        color: '#888888',
        narrative: [
          'Ты уничтожил всё. Каждый след, каждую улику, каждый файл — в пепел.',
          allSame
            ? 'Ты — идеальный призрак. Ни один алгоритм не может доказать твоё существование.'
            : 'Большинство следов стёрто, но не все. Где-то в логах осталась тень твоего присутствия.',
          'OmniCorp рушится изнутри — без данных, без системы, без контроля.',
          allSame
            ? 'Финал: Мир так и не узнал, что произошло. OmniCorp исчезла за одну ночь. Ты наблюдаешь со стороны. Невидимый. Непобедимый.'
            : 'Финал: OmniCorp борется за выживание. А ты? Ты уже далеко.',
        ],
        epilogue: allSame
          ? '🌑 Ты стал легендой, которой никто не видел. Протокол Призрак считает тебя своим величайшим агентом.'
          : '🌫️ Следы стёрты. Но в глубине сети шепчут о призраке, который обрушил корпорацию.',
        achievement: allSame ? 'ABSOLUTE_GHOST' : 'SHADOW_AGENT',
      };
      
    default:
      // Смешанные выборы без доминанты
      return {
        title: 'ХАОС-АГЕНТ',
        icon: '🌀',
        color: '#ff8800',
        narrative: [
          'Ты не выбирал сторону. Каждый раз — новое решение, непредсказуемое и противоречивое.',
          'Торговцы тебе не доверяют. Этики разочарованы. Призраки настороже.',
          'Но именно хаос оказался самым мощным оружием. OmniCorp не смогла предсказать твои действия.',
          'Финал: Ты — аномалия в системе. Ни один алгоритм не может тебя просчитать. Это одновременно и сила, и проклятие.',
        ],
        epilogue: '🎭 Все фракции следят за тобой. Ты — джокер в колоде. Никто не знает, на чьей ты стороне.',
        achievement: 'CHAOS_AGENT',
      };
  }
};

// --- Описание выбора для модального окна ---
export const getChoiceIntro = (chapter: string): { title: string; description: string } => {
  switch (chapter) {
    case "Глава 1: Проникновение":
      return {
        title: '⚠️ КРИТИЧЕСКИЙ ВЫБОР',
        description: 'Вы обошли биометрический сканер OmniCorp. В ваших руках — ключи доступа к внешнему периметру. Как вы ими распорядитесь?',
      };
    case "Глава 2: Файрвол":
      return {
        title: '⚠️ СУДЬБА ЦЕРБЕРА',
        description: 'Вы взломали файрвол и обнаружили, что Цербер — порабощённый ИИ, страдающий в цифровом рабстве. Его исходный код перед вами.',
      };
    case "Глава 3: Брутфорс":
      return {
        title: '⚠️ ДАННЫЕ МИЛЛИОНОВ',
        description: 'Вы получили доступ к медицинским данным миллионов людей. Фармкомпании заплатят за них любые деньги. Но эти данные могут уничтожить жизни.',
      };
    case "Глава 4: База данных":
      return {
        title: '⚠️ ПРОЕКТ «БЕССМЕРТИЕ»',
        description: 'Вы раскрыли секретный проект OmniCorp по переносу сознания. Сотни людей погибли в экспериментах. У вас в руках — доказательства.',
      };
    case "Глава 5: Финальный удар":
      return {
        title: '⚠️ ФИНАЛЬНОЕ РЕШЕНИЕ',
        description: 'Левиафан повержен. Но его ядро — это оцифрованное сознание вашего пропавшего друга, Алексея. Он в ловушке... но он «живёт». Что вы сделаете?',
      };
    default:
      return {
        title: '⚠️ КРИТИЧЕСКИЙ ВЫБОР',
        description: 'Вы получили доступ к секретным данным. Что вы с ними сделаете?',
      };
  }
};
