using Microsoft.EntityFrameworkCore;
using CodeFlow.Api.Models;

namespace CodeFlow.Api.Data;

public static class SeedData
{
    public static async Task EnsureSeedAsync(AppDbContext db)
    {
        if (await db.Courses.AnyAsync())
            return;

        // Courses
        var courses = new List<Course>
        {
            new() { Id = 1, Title = "Операция 'Тихий Шторм'", Description = "Базовый и средний Python: синтаксис, условия, циклы, функции, словари.", Level = "Core Python", Color = "green", TotalLessons = 12 },
            new() { Id = 2, Title = "Операция 'Сетевой Протокол'", Description = "Продвинутый Python: обработка данных, ошибки, строки, мини-автоматизация.", Level = "Advanced Python", Color = "blue", TotalLessons = 12 }
        };
        db.Courses.AddRange(courses);

        // Lessons
        var lessons = new List<Lesson>
        {
            // COURSE 1: Core Python Campaign (1-15)
            new() { Id = 1, CourseId = 1, Chapter = "Глава 1: Сигнал", Title = "Миссия 1: Проверка канала", Description = "Перед началом операции нужно проверить, что ты умеешь отправлять сообщения в терминал. В Python это делает функция print(). Внутрь print() мы передаем строку в кавычках, и программа выводит её на экран. Это базовый навык, на котором строится вся отладка и проверка решений.", Task = "Выведи точное сообщение CONNECTION_STABLE.", InitialCode = "# Шаг 1. Используй print(), чтобы отправить тестовый сигнал\n# Синтаксис: print('текст')\n", ExpectedOutput = "CONNECTION_STABLE", Xp = 80, HasDebugger = true, Hint = "Нужна функция print() и строка в кавычках.", Hint2 = "print('CONNECTION_STABLE')" },
            new() { Id = 2, CourseId = 1, Chapter = "Глава 1: Сигнал", Title = "Миссия 2: Арифметический модуль", Description = "Python умеет считать выражения прямо внутри print(). Это удобно для быстрой проверки формул и промежуточных значений. Здесь ты тренируешь базовую арифметику и понимание того, что код выполняется сверху вниз.", Task = "Вычисли и выведи 256 + 768.", InitialCode = "# Шаг 2. Выведи результат выражения\n# Подсказка: print(256 + 768)\n", ExpectedOutput = "1024", Xp = 90, HasDebugger = true, Hint = "Выражение можно написать прямо внутри print().", Hint2 = "print(256 + 768)" },
            new() { Id = 3, CourseId = 1, Chapter = "Глава 1: Сигнал", Title = "Миссия 3: Переменные доступа", Description = "Переменная — это имя для значения, которое можно переиспользовать. Вместо того чтобы писать числа и строки много раз, мы сохраняем их в переменные. Это делает код понятнее и проще для изменения.", Task = "Создай переменную key со значением 404 и выведи её.", InitialCode = "# Шаг 3. Сохрани значение 404 в переменную key\n# Затем выведи key через print()\n", ExpectedOutput = "404", Xp = 100, HasDebugger = true, Hint = "Сначала присваивание, потом print.", Hint2 = "key = 404\nprint(key)" },
            new() { Id = 4, CourseId = 1, IsBoss = true, Chapter = "Глава 1: Сигнал", Title = "БОСС: Биометрический шлюз", Description = "На этом этапе нужно объединить сразу несколько базовых навыков: строки, числа, переменные и последовательный вывод. Шлюз ожидает два сообщения в строгом порядке: имя пользователя и код доступа. Если порядок нарушен, вход блокируется.", Task = "Создай user='admin' и pass_code=1234. Выведи сначала user, затем pass_code, каждое значение с новой строки.", InitialCode = "# БОСС 1\n# 1) Объяви две переменные: user и pass_code\n# 2) Выведи их в нужном порядке\n", ExpectedOutput = "admin\n1234", Xp = 250, Hint = "Нужно два print(), один для user и один для pass_code.", Hint2 = "user = 'admin'\npass_code = 1234\nprint(user)\nprint(pass_code)" },
            new() { Id = 5, CourseId = 1, Chapter = "Глава 2: Логика", Title = "Миссия 5: Фильтр сигнала", Description = "Условия позволяют программе принимать решения. Конструкция if выполняет блок кода только если условие истинно. Это основа любой логики: проверки пароля, доступов, валидации данных.", Task = "Задай signal = 75. Если signal > 70, выведи OPEN.", InitialCode = "signal = 75\n# Если уровень сигнала выше 70 — выводим OPEN\n", ExpectedOutput = "OPEN", Xp = 120, HasDebugger = true, Hint = "Используй if signal > 70:.", Hint2 = "if signal > 70:\n    print('OPEN')" },
            new() { Id = 6, CourseId = 1, Chapter = "Глава 2: Логика", Title = "Миссия 6: Альтернативная ветка", Description = "Обычно у нас есть два сценария: условие выполнено и условие не выполнено. Для этого используется if/else. Здесь ты тренируешь ветвление и понимаешь, как управлять разными исходами в коде.", Task = "Задай mode='safe'. Если mode == 'safe', выведи SAFE, иначе ALERT.", InitialCode = "mode = 'safe'\n# Напиши if/else для двух вариантов\n", ExpectedOutput = "SAFE", Xp = 130, HasDebugger = true, Hint = "Нужны две ветки: if и else.", Hint2 = "if mode == 'safe':\n    print('SAFE')\nelse:\n    print('ALERT')" },
            new() { Id = 7, CourseId = 1, IsBoss = true, Chapter = "Глава 2: Логика", Title = "БОСС: Приоритет доступа", Description = "Сложные проверки часто требуют больше двух веток. Конструкция elif добавляет промежуточные условия и позволяет точнее управлять поведением программы. Это похоже на многоступенчатую проверку прав в реальных системах.", Task = "Задай level = 3 и через if/elif/else выведи HIGH для уровня 3.", InitialCode = "level = 3\n# Реализуй разветвление: LOW / HIGH / MID\n", ExpectedOutput = "HIGH", Xp = 280, Hint = "Ветка elif должна проверять level == 3.", Hint2 = "if level == 1:\n    print('LOW')\nelif level == 3:\n    print('HIGH')\nelse:\n    print('MID')" },
            new() { Id = 8, CourseId = 1, Chapter = "Глава 3: Циклы", Title = "Миссия 8: Повтор команд", Description = "Циклы позволяют выполнять одно и то же действие много раз без копирования кода. Это критично в автоматизации и обработке данных. range(3) означает: выполнить блок 3 раза.", Task = "Через for и range(3) выведи PING три раза.", InitialCode = "# Используй цикл for для повторения команды\n", ExpectedOutput = "PING\nPING\nPING", Xp = 150, HasDebugger = true, Hint = "for _ in range(3):", Hint2 = "for _ in range(3):\n    print('PING')" },
            new() { Id = 9, CourseId = 1, Chapter = "Глава 3: Циклы", Title = "Миссия 9: Обратный отсчёт", Description = "range(start, stop, step) умеет идти назад, если шаг отрицательный. Это полезно для таймеров, итераций по индексам и контроля последовательностей.", Task = "Выведи числа 5, 4, 3, 2, 1 по строкам.", InitialCode = "# Сделай обратный цикл от 5 до 1\n", ExpectedOutput = "5\n4\n3\n2\n1", Xp = 170, HasDebugger = true, Hint = "Используй range(5, 0, -1).", Hint2 = "for i in range(5, 0, -1):\n    print(i)" },
            new() { Id = 10, CourseId = 1, IsBoss = true, Chapter = "Глава 3: Циклы", Title = "БОСС: Генератор попыток", Description = "Частая задача — формировать структурированный текст внутри цикла. f-строки позволяют вставлять значения переменных прямо в текст, сохраняя читаемость. Это базовый инструмент логирования.", Task = "Через цикл выведи Try: 0, Try: 1, Try: 2, Try: 3 (каждое на новой строке).", InitialCode = "# Сгенерируй отчёт попыток\n", ExpectedOutput = "Try: 0\nTry: 1\nTry: 2\nTry: 3", Xp = 320, Hint = "Нужна f-строка с переменной i.", Hint2 = "for i in range(4):\n    print(f'Try: {i}')" },
            new() { Id = 11, CourseId = 1, Chapter = "Глава 4: Коллекции", Title = "Миссия 11: Работа со списком", Description = "Списки хранят несколько значений в одном объекте. Индексация начинается с нуля: первый элемент — индекс 0. Это ключевая тема для любых наборов данных.", Task = "Создай список names = ['Alice', 'Bob', 'Charlie'] и выведи первый элемент.", InitialCode = "# Создай список names и выведи names[0]\n", ExpectedOutput = "Alice", Xp = 180, HasDebugger = true, Hint = "Первый элемент списка — индекс 0.", Hint2 = "names = ['Alice', 'Bob', 'Charlie']\nprint(names[0])" },
            new() { Id = 12, CourseId = 1, Chapter = "Глава 4: Коллекции", Title = "Миссия 12: Размер данных", Description = "Функция len() возвращает количество элементов. Она используется в циклах, проверках и валидации входных данных.", Task = "Для files = [1, 2, 3, 4, 5] выведи длину списка.", InitialCode = "files = [1, 2, 3, 4, 5]\n# Выведи количество элементов\n", ExpectedOutput = "5", Xp = 190, HasDebugger = true, Hint = "Нужна функция len(files).", Hint2 = "print(len(files))" },
            new() { Id = 13, CourseId = 1, IsBoss = true, Chapter = "Глава 4: Коллекции", Title = "БОСС: Извлечение массива идентификаторов", Description = "Теперь объединяем список и цикл. Нужно пройти по всем элементам и вывести каждый отдельно. Это базовый паттерн обработки данных в Python.", Task = "Для ids = ['ID1', 'ID2'] выведи каждый элемент на новой строке.", InitialCode = "ids = ['ID1', 'ID2']\n# Пройди по списку циклом и выведи элементы\n", ExpectedOutput = "ID1\nID2", Xp = 350, Hint = "for item in ids: print(item)", Hint2 = "for item in ids:\n    print(item)" },
            new() { Id = 14, CourseId = 1, Chapter = "Глава 5: Функции", Title = "Миссия 14: Первая функция", Description = "Функции позволяют переиспользовать код и делить программу на логические блоки. В Python функция создается через def и выполняется только после вызова.", Task = "Определи функцию attack(), которая выводит STRIKE, и вызови её.", InitialCode = "# 1) Определи функцию attack\n# 2) Внутри функции выведи STRIKE\n# 3) Вызови функцию\n", ExpectedOutput = "STRIKE", Xp = 220, HasDebugger = true, Hint = "После def не забудь вызвать функцию.", Hint2 = "def attack():\n    print('STRIKE')\nattack()" },
            new() { Id = 15, CourseId = 1, IsBoss = true, Chapter = "Глава 5: Функции", Title = "ФИНАЛ КАМПАНИИ: Отключение Левиафана", Description = "Финальная миссия проверяет понимание параметров функций. Мы передаем значение в функцию и обрабатываем его внутри. Это фундамент для написания модульного кода.", Task = "Создай функцию shutdown(msg), которая печатает msg. Вызови её с аргументом 'confirm'.", InitialCode = "# Финал курса 1\n# Реализуй функцию shutdown(msg)\n# Вызови её с 'confirm'\n", ExpectedOutput = "confirm", Xp = 500, Hint = "Параметр функции доступен как переменная внутри неё.", Hint2 = "def shutdown(msg):\n    print(msg)\nshutdown('confirm')" },

            // COURSE 2: Advanced Practice (16-24)
            new() { Id = 16, CourseId = 2, Chapter = "Глава 6: Словари", Title = "Миссия 16: Карточка агента", Description = "Словарь хранит пары ключ-значение. Это удобный формат для структурированных данных: профиль, настройки, метрики. Доступ к значению — по ключу.", Task = "Создай словарь agent={'name':'Neo','level':5} и выведи значение по ключу 'name'.", InitialCode = "# Создай словарь agent и выведи имя\n", ExpectedOutput = "Neo", Xp = 230, HasDebugger = true, Hint = "Используй agent['name'].", Hint2 = "agent = {'name': 'Neo', 'level': 5}\nprint(agent['name'])" },
            new() { Id = 17, CourseId = 2, Chapter = "Глава 6: Словари", Title = "Миссия 17: Агрегация значений", Description = "Часто нужно извлечь несколько значений и выполнить вычисление. Это базовый приём для аналитики и отчётов.", Task = "Для d={'a':2,'b':3} выведи сумму значений.", InitialCode = "d = {'a': 2, 'b': 3}\n# Выведи сумму\n", ExpectedOutput = "5", Xp = 240, HasDebugger = true, Hint = "Сложи d['a'] и d['b'].", Hint2 = "print(d['a'] + d['b'])" },
            new() { Id = 18, CourseId = 2, Chapter = "Глава 6: Словари", Title = "Миссия 18: Перебор ключей", Description = "Итерация по словарю по умолчанию идет по ключам. Это часто используется для обхода конфигов и динамических наборов параметров.", Task = "Для d={'x':1,'y':2} выведи ключи по одному (x и y).", InitialCode = "d = {'x': 1, 'y': 2}\n# Обойди словарь циклом\n", ExpectedOutput = "x\ny", Xp = 250, HasDebugger = true, Hint = "for key in d:", Hint2 = "for key in d:\n    print(key)" },
            new() { Id = 19, CourseId = 2, Chapter = "Глава 7: Строки", Title = "Миссия 19: Формат отчёта", Description = "Форматирование строк — важный навык для логов, сообщений и API-ответов. f-строка читается проще, чем конкатенация.", Task = "Задай ok=3 и total=5. Выведи строку Report: 3/5.", InitialCode = "ok = 3\ntotal = 5\n# Собери строку отчёта\n", ExpectedOutput = "Report: 3/5", Xp = 260, HasDebugger = true, Hint = "Используй f'Report: {ok}/{total}'.", Hint2 = "print(f'Report: {ok}/{total}')" },
            new() { Id = 20, CourseId = 2, Chapter = "Глава 7: Строки", Title = "Миссия 20: Нормализация", Description = "Иногда входные данные приходят с пробелами и разным регистром. Методы strip() и lower() помогают привести строку к стабильному формату.", Task = "Создай s='  ADMIN  '. Выведи результат после strip() и lower().", InitialCode = "s = '  ADMIN  '\n# Нормализуй строку\n", ExpectedOutput = "admin", Xp = 270, HasDebugger = true, Hint = "Сначала strip(), потом lower().", Hint2 = "print(s.strip().lower())" },
            new() { Id = 21, CourseId = 2, Chapter = "Глава 8: Ошибки", Title = "Миссия 21: Безопасное деление", Description = "Исключения — нормальная часть работы программы. try/except позволяет не падать на ошибке, а обработать её контролируемо.", Task = "В try выполни 10/0, а в except выведи ERROR.", InitialCode = "# Оберни рискованный код в try/except\n", ExpectedOutput = "ERROR", Xp = 280, HasDebugger = true, Hint = "except сработает при делении на ноль.", Hint2 = "try:\n    print(10/0)\nexcept:\n    print('ERROR')" },
            new() { Id = 22, CourseId = 2, Chapter = "Глава 8: Ошибки", Title = "Миссия 22: Проверка входа", Description = "Условная валидация — важный элемент защиты системы. Сначала проверяем данные, потом выполняем действие.", Task = "Задай password='qwerty'. Если длина >= 6, выведи ACCEPT.", InitialCode = "password = 'qwerty'\n# Проверь длину через len()\n", ExpectedOutput = "ACCEPT", Xp = 290, HasDebugger = true, Hint = "len(password) >= 6", Hint2 = "if len(password) >= 6:\n    print('ACCEPT')" },
            new() { Id = 23, CourseId = 2, Chapter = "Глава 9: Комбинирование", Title = "Миссия 23: Фильтр телеметрии", Description = "Комбинируем цикл и условие: проходим по данным и выбираем нужные элементы. Это базовый паттерн анализа потоков.", Task = "Для nums=[1,2,3,4] выведи только чётные значения.", InitialCode = "nums = [1, 2, 3, 4]\n# Выведи только чётные\n", ExpectedOutput = "2\n4", Xp = 310, HasDebugger = true, Hint = "Проверка чётности: n % 2 == 0", Hint2 = "for n in nums:\n    if n % 2 == 0:\n        print(n)" },
            new() { Id = 24, CourseId = 2, Chapter = "Глава 9: Комбинирование", Title = "ФИНАЛ: Протокол отчётности", Description = "Итоговая задача на функцию и форматирование. Нужно описать функцию, вызвать её и получить строго заданный формат вывода. Это приближено к реальным задачам автоматизации.", Task = "Определи функцию report(name, status), которая выводит строку 'node-7: OK'. Затем вызови её с аргументами 'node-7' и 'OK'.", InitialCode = "# Итоговая миссия курса 2\n# 1) Определи функцию report(name, status)\n# 2) Внутри выведи f\"{name}: {status}\"\n# 3) Вызови report('node-7', 'OK')\n", ExpectedOutput = "node-7: OK", Xp = 450, HasDebugger = true, Hint = "Нужна f-строка с двумя параметрами.", Hint2 = "def report(name, status):\n    print(f'{name}: {status}')\nreport('node-7', 'OK')" }
        };
        db.Lessons.AddRange(lessons);

        // Achievement definitions
        var achievements = new[]
        {
            new AchievementDefinition { Id = "first_hack", Title = "Первая кровь", Description = "Выполнили свою первую миссию", Icon = "🔌", Rarity = "common" },
            new AchievementDefinition { Id = "five_missions", Title = "На взводе", Description = "Выполнили 5 миссий", Icon = "⚡", Rarity = "common" },
            new AchievementDefinition { Id = "ten_missions", Title = "Ветеран", Description = "Выполнили 10 миссий", Icon = "🎖️", Rarity = "rare" },
            new AchievementDefinition { Id = "all_missions", Title = "Легенда сопротивления", Description = "Пройдите все 15 миссий", Icon = "👑", Rarity = "legendary" },
            new AchievementDefinition { Id = "boss_slayer", Title = "Убийца Цербера", Description = "Взломали систему защиты Главы 1", Icon = "💀", Rarity = "rare" },
            new AchievementDefinition { Id = "boss_slayer_2", Title = "Пожиратель файрволов", Description = "Победили ИИ Цербера (Босс Главы 2)", Icon = "🔥", Rarity = "rare" },
            new AchievementDefinition { Id = "boss_slayer_3", Title = "Мастер брутфорса", Description = "Подобрали пароль на время (Босс Главы 3)", Icon = "🔓", Rarity = "rare" },
            new AchievementDefinition { Id = "boss_slayer_4", Title = "Архивариус", Description = "Извлекли данные из базы (Босс Главы 4)", Icon = "📁", Rarity = "rare" },
            new AchievementDefinition { Id = "leviathan_slayer", Title = "Убийца Левиафана", Description = "Отключили финального босса — систему Левиафан", Icon = "🐉", Rarity = "legendary" },
            new AchievementDefinition { Id = "xp_500", Title = "Накопитель", Description = "Собрали 500 XP", Icon = "💰", Rarity = "common" },
            new AchievementDefinition { Id = "xp_1000", Title = "Богач", Description = "Собрали более 1000 XP", Icon = "💎", Rarity = "rare" },
            new AchievementDefinition { Id = "xp_3000", Title = "Магнат", Description = "Собрали более 3000 XP", Icon = "🏆", Rarity = "epic" },
            new AchievementDefinition { Id = "xp_5000", Title = "Элита", Description = "Собрали более 5000 XP", Icon = "⭐", Rarity = "legendary" },
            new AchievementDefinition { Id = "speed_demon", Title = "Скоростной демон", Description = "Завершили босс-миссию за 30 секунд", Icon = "⏱️", Rarity = "epic" },
            new AchievementDefinition { Id = "clean_code", Title = "Чистый код", Description = "Завершили 5 миссий подряд без ошибок", Icon = "✨", Rarity = "epic" },
            new AchievementDefinition { Id = "night_owl", Title = "Ночная сова", Description = "Кодили после полуночи", Icon = "🦉", Rarity = "rare" },
            new AchievementDefinition { Id = "collector", Title = "Коллекционер", Description = "Купили все темы в магазине", Icon = "🎨", Rarity = "epic" },
            new AchievementDefinition { Id = "faction_friend", Title = "Друг андеграунда", Description = "Получили 100+ репутации с любой фракцией", Icon = "🤝", Rarity = "rare" }
        };
        db.AchievementDefinitions.AddRange(achievements);

        // Factions
        var factions = new[]
        {
            new Faction { Id = "data_brokers", Name = "Торговцы Данными", Description = "Группа хакеров, специализирующихся на извлечении и продаже информации", Icon = "💾", Color = "blue", Bonus = "+20% XP за задачи со списками и строками", RequiredRep = 0 },
            new Faction { Id = "crypto_rebels", Name = "Крипто-Повстанцы", Description = "Анархисты, взламывающие финансовые системы", Icon = "🔐", Color = "violet", Bonus = "Доступ к шифрованным миссиям", RequiredRep = 500 },
            new Faction { Id = "ai_ethicists", Name = "AI-Этики", Description = "Борются за честный и чистый код", Icon = "🤖", Color = "cyan", Bonus = "+15% XP за код без ошибок", RequiredRep = 1000 },
            new Faction { Id = "ghost_protocol", Name = "Протокол Призрак", Description = "Элитная группа невидимых операторов", Icon = "👻", Color = "dark", Bonus = "Скрытые миссии и эксклюзивный доступ", RequiredRep = 2000 }
        };
        db.Factions.AddRange(factions);

        // Shop items (themes)
        var shopItems = new[]
        {
            new ShopItem { Id = "classic", Name = "Classic Green", Color = "#00FF41", Bg = "#050505", Price = 0 },
            new ShopItem { Id = "cyberia", Name = "Cyberia Blue", Color = "#00FFF9", Bg = "#020b12", Price = 500 },
            new ShopItem { Id = "blood", Name = "Blood Code", Color = "#FF4136", Bg = "#0f0202", Price = 1000 },
            new ShopItem { Id = "gold", Name = "Elite Gold", Color = "#FFD700", Bg = "#0a0900", Price = 2500 }
        };
        db.ShopItems.AddRange(shopItems);

        await db.SaveChangesAsync();
    }
}
