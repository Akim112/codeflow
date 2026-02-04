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
        var course = new Course
        {
            Id = 1,
            Title = "Операция 'Тихий Шторм'",
            Description = "Проникни в ядро OmniCorp и уничтожь Левиафана. Полный курс Python с интерактивными туториалами.",
            Level = "Сюжетная кампания",
            Color = "green",
            TotalLessons = 15
        };
        db.Courses.Add(course);
        db.Courses.Add(new Course
        {
            Id = 2,
            Title = "Сетевые протоколы (DLC)",
            Description = "Дополнительные задачи на работу со словарями и кортежами. [COMING SOON]",
            Level = "Сложный",
            Color = "blue",
            TotalLessons = 0
        });

        // Lessons (from frontend lessons.ts)
        var lessons = new List<Lesson>
        {
            new() { Id = 1, CourseId = 1, Chapter = "Глава 1: Проникновение", Title = "Миссия 1: Точка входа", Description = "Мы подключились к внешнему узлу OmniCorp. Чтобы подтвердить стабильность канала связи, необходимо отправить идентификационный пакет `CONNECTION_STABLE`.", Task = "Используй print(), чтобы вывести: CONNECTION_STABLE", InitialCode = "# Введи команду вывода ниже:\n", ExpectedOutput = "CONNECTION_STABLE", Xp = 50, HasDebugger = true, Hint = "Тебе нужна функция для вывода текста в консоль.", Hint2 = "Используй: print('ТВОЙ_ТЕКСТ')" },
            new() { Id = 2, CourseId = 1, Chapter = "Глава 1: Проникновение", Title = "Миссия 2: Энергосеть", Description = "Для активации дешифратора нужно сложить мощности двух подстанций: 1024 и 2048.", Task = "Выведи результат сложения 1024 + 2048.", InitialCode = "# Сложи числа внутри функции вывода\n", ExpectedOutput = "3072", Xp = 100, HasDebugger = true, Hint = "Python может считать прямо внутри print().", Hint2 = "Пример: print(5 + 5)" },
            new() { Id = 3, CourseId = 1, Chapter = "Глава 1: Проникновение", Title = "Миссия 3: Переменные доступа", Description = "Система запрашивает ключ. Глитч нашёл код: 777. Сохрани его в переменную `key`.", Task = "Создай переменную key = 777 и выведи её на экран.", InitialCode = "# Создай переменную и выведи её\n", ExpectedOutput = "777", Xp = 150, HasDebugger = true, Hint = "Сначала присвой значение переменной, а потом передай её имя в print().", Hint2 = "x = 10\nprint(x)" },
            new() { Id = 4, CourseId = 1, IsBoss = true, Chapter = "Глава 1: Проникновение", Title = "⚠️ БОСС: Обход биометрии", Description = "ВНИМАНИЕ! Сработал сканер. Нужно отправить два параметра: `admin` и `123`.", Task = "Создай user = 'admin', pass_code = 123. Выведи сначала user, затем pass_code.", InitialCode = "# Взломай биометрию за 60 секунд!\n", ExpectedOutput = "admin\n123", Xp = 500, Hint = "Тебе нужно создать две переменные и дважды вызвать функцию вывода.", Hint2 = "Для текста используй кавычки, для чисел — нет." },
            new() { Id = 5, CourseId = 1, Chapter = "Глава 2: Файрвол", Title = "Миссия 5: Логический фильтр", Description = "Файрвол пропускает пакеты только если `x` больше 100.", Task = "Задай x = 150. Если x > 100, выведи 'OPEN'.", InitialCode = "x = 150\n# Напиши условие ниже:\n", ExpectedOutput = "OPEN", Xp = 200, HasDebugger = true, Hint = "Используй оператор сравнения '>' внутри блока if.", Hint2 = "if x > 50:\n    print('Да')" },
            new() { Id = 6, CourseId = 1, Chapter = "Глава 2: Файрвол", Title = "Миссия 6: Двойная проверка", Description = "Если статус 'active' — выведи 'READY', иначе — 'ERROR'.", Task = "Задай status = 'active'. Используй if-else.", InitialCode = "status = 'active'\n", ExpectedOutput = "READY", Xp = 250, HasDebugger = true, Hint = "Тебе понадобится блок else для обработки случая, когда условие неверно.", Hint2 = "if status == '...':\n    ...\nelse:\n    ..." },
            new() { Id = 7, CourseId = 1, IsBoss = true, Chapter = "Глава 2: Файрвол", Title = "⚠️ БОСС: ИИ 'Цербер'", Description = "Цербер требует уровень 3. Выведи 'HIGH'.", Task = "Задай level = 3. Используй if-elif-else, чтобы вывести 'HIGH' для уровня 3.", InitialCode = "level = 3\n", ExpectedOutput = "HIGH", Xp = 600, Hint = "Используй elif для проверки нескольких условий подряд.", Hint2 = "if l == 1: ...\nelif l == 3: ...\nelse: ..." },
            new() { Id = 8, CourseId = 1, Chapter = "Глава 3: Брутфорс", Title = "Миссия 8: Цикличный взлом", Description = "Нужно 5 раз отправить сигнал 'HACK'.", Task = "Используй цикл for и range(5), чтобы 5 раз вывести слово 'HACK'.", InitialCode = "# Повтори вывод 5 раз\n", ExpectedOutput = "HACK\nHACK\nHACK\nHACK\nHACK", Xp = 300, HasDebugger = true, Hint = "Цикл for i in range(N) выполнит код N раз.", Hint2 = "for i in range(5):\n    print('...')" },
            new() { Id = 9, CourseId = 1, Chapter = "Глава 3: Брутфорс", Title = "Миссия 9: Обратный отсчёт", Description = "Запусти обратный отсчёт: 3, 2, 1.", Task = "Используй цикл, чтобы вывести числа 3, 2, 1.", InitialCode = "# Используй range с тремя параметрами\n", ExpectedOutput = "3\n2\n1", Xp = 350, HasDebugger = true, Hint = "range(start, stop, step) позволяет считать в обратном порядке.", Hint2 = "range(3, 0, -1) считает от 3 до 1." },
            new() { Id = 10, CourseId = 1, IsBoss = true, Chapter = "Глава 3: Брутфорс", Title = "⚠️ БОСС: Подбор пароля", Description = "Выведи попытки 'Try: 0' до 'Try: 3'.", Task = "Используй цикл, чтобы вывести:\nTry: 0\nTry: 1\nTry: 2\nTry: 3", InitialCode = "", ExpectedOutput = "Try: 0\nTry: 1\nTry: 2\nTry: 3", Xp = 700, Hint = "Используй f-строки или запятую в print для объединения текста и числа.", Hint2 = "print(f'Try: {i}')" },
            new() { Id = 11, CourseId = 1, Chapter = "Глава 4: База данных", Title = "Миссия 11: Список сотрудников", Description = "Извлеки первое имя из списка ['Alice', 'Bob', 'Charlie'].", Task = "Создай список names и выведи элемент с индексом 0.", InitialCode = "names = ['Alice', 'Bob', 'Charlie']\n", ExpectedOutput = "Alice", Xp = 400, HasDebugger = true, Hint = "Доступ к элементу списка осуществляется через квадратные скобки [].", Hint2 = "print(my_list[0])" },
            new() { Id = 12, CourseId = 1, Chapter = "Глава 4: База данных", Title = "Миссия 12: Длина архива", Description = "Посчитай количество файлов в списке [1, 2, 3, 4, 5].", Task = "Выведи длину списка files с помощью функции len().", InitialCode = "files = [1, 2, 3, 4, 5]\n", ExpectedOutput = "5", Xp = 450, HasDebugger = true, Hint = "Функция len() возвращает размер (длину) объекта.", Hint2 = "print(len(my_list))" },
            new() { Id = 13, CourseId = 1, IsBoss = true, Chapter = "Глава 4: База данных", Title = "⚠️ БОСС: Извлечение данных", Description = "Выведи все ID из списка ['ID1', 'ID2'] по одному.", Task = "Используй цикл for, чтобы вывести каждый элемент списка на новой строке.", InitialCode = "ids = ['ID1', 'ID2']\n", ExpectedOutput = "ID1\nID2", Xp = 800, Hint = "Цикл for может проходить прямо по элементам списка.", Hint2 = "for item in ids:\n    print(item)" },
            new() { Id = 14, CourseId = 1, Chapter = "Глава 5: Финальный удар", Title = "Миссия 14: Вирусная функция", Description = "Создай функцию `attack`, которая выводит 'STRIKE'.", Task = "Определи функцию и вызови её.", InitialCode = "# Объяви функцию через def\n", ExpectedOutput = "STRIKE", Xp = 500, HasDebugger = true, Hint = "Сначала напиши определение функции, а затем вызови её по имени со скобками.", Hint2 = "def func():\n    ...\nfunc()" },
            new() { Id = 15, CourseId = 1, IsBoss = true, Chapter = "Глава 5: Финальный удар", Title = "🔥 ФИНАЛ: Отключение Левиафана", Description = "Передай функции `shutdown` аргумент 'confirm'.", Task = "Напиши функцию shutdown(msg), которая выводит msg. Вызови её с текстом 'confirm'.", InitialCode = "def shutdown(msg):\n    # Твой код тут\n", ExpectedOutput = "confirm", Xp = 2000, Hint = "Функция должна принимать один параметр и печатать его.", Hint2 = "shutdown('confirm')" }
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
