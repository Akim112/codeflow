import { useState, useRef, useEffect } from 'react';
import { Box, Text, TextInput, ScrollArea } from '@mantine/core';
import { sounds } from '../utils/audio';
import { api } from '../api';

interface CommandHistory {
  input: string;
  output: string;
  type: 'success' | 'error' | 'info';
}

interface Snapshot {
  xp: number;
  completed: number[];
  themes: string[];
  activeTheme: string;
}

export const HackerConsole = () => {
  const [history, setHistory] = useState<CommandHistory[]>([
    { input: '', output: '> Терминал активен. Введите "help" для списка команд.', type: 'info' }
  ]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [snapshot, setSnapshot] = useState<Snapshot>({ xp: 0, completed: [], themes: ['classic'], activeTheme: 'classic' });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      const [me, progress, items] = await Promise.all([
        api.getMe().catch(() => null),
        api.getMyProgress().catch(() => null),
        api.getMyShopItems().catch(() => [])
      ]);

      setSnapshot({
        xp: me?.totalXp ?? progress?.totalXp ?? 0,
        completed: progress?.completedLessonIds ?? [],
        themes: Array.from(new Set(['classic', ...items.map(i => i.id)])),
        activeTheme: localStorage.getItem('activeTheme') || 'classic',
      });
    };

    load().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [history]);

  const handleCommand = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
      return;
    }

    if (e.key === 'Enter' && input.trim()) {
      const cmd = input.toLowerCase().trim();
      const args = cmd.split(' ');
      const mainCmd = args[0];
      let response = '';
      let type: 'success' | 'error' | 'info' = 'info';

      switch (mainCmd) {
        case 'help':
          response = `╔════════════════════════════════════════╗
║         ДОСТУПНЫЕ КОМАНДЫ              ║
╠════════════════════════════════════════╣
║ ls          - Список файлов            ║
║ cat <file>  - Прочитать файл           ║
║ whoami      - Информация о пользователе║
║ status      - Статус системы           ║
║ xp          - Показать XP              ║
║ missions    - Пройденные миссии        ║
║ rank        - Текущий ранг             ║
║ themes      - Купленные темы           ║
║ ping        - Проверка соединения      ║
║ hack        - Секретная команда        ║
║ matrix      - 🔴 ОПАСНО                ║
║ clear       - Очистить терминал        ║
║ exit        - Закрыть сессию           ║
╚════════════════════════════════════════╝`;
          type = 'success';
          break;
        case 'ls':
          response = `drwxr-xr-x  secrets/\n-rw-r--r--  firewall_config.py\n-rw-r--r--  logs.db\n-rw-r--r--  user_data.enc\n-rw-r--r--  system.conf\n-rwx------  backdoor.sh`;
          type = 'success';
          break;
        case 'cat':
          if (args[1] === 'firewall_config.py') {
            response = `# OmniCorp Firewall v3.2\nALLOWED_IPS = ["192.168.1.1"]\nBLOCKED_PORTS = [22, 23, 3389]\nENCRYPTION = "AES-256"\n# TODO: Fix security hole in port 8080`;
            type = 'success';
          } else if (args[1] === 'system.conf') {
            response = `SYSTEM_NAME=OmniCorp_MainFrame\nVERSION=7.3.1\nSECURITY_LEVEL=MAXIMUM\nAI_ASSISTANT=GLITCH_v2.0`;
            type = 'success';
          } else if (args[1]) {
            response = `cat: ${args[1]}: Permission denied`;
            type = 'error';
          } else {
            response = 'Использование: cat <filename>';
            type = 'error';
          }
          break;
        case 'whoami': {
          const xp = snapshot.xp;
          const rank = xp >= 2000 ? 'ROOT_ADMIN' : xp >= 1000 ? 'CYBER_GHOST' : xp >= 500 ? 'OPERATOR' : xp >= 200 ? 'CODER' : 'SCRIPT_KIDDIE';
          response = `╔════════════════════════════════╗\n║ USER: OPERATIVE_${Math.floor(Math.random() * 9999)}\n║ RANK: ${rank}\n║ XP: ${xp}\n║ STATUS: ACTIVE\n║ CLEARANCE: LEVEL ${Math.floor(xp / 500) + 1}\n╚════════════════════════════════╝`;
          type = 'success';
          break;
        }
        case 'status':
          response = `СИСТЕМА: Стабильна\nОБНАРУЖЕНИЕ: 0%\nШИФРОВАНИЕ: AES-256\nПОДКЛЮЧЕНИЕ: Безопасное\nBACKDOOR: Активен\nВРЕМЯ СЕССИИ: ${Math.floor(Math.random() * 120)} мин`;
          type = 'success';
          break;
        case 'xp':
          response = `Ваш XP: ${snapshot.xp}`;
          type = 'success';
          sounds.success();
          break;
        case 'missions':
          response = `Пройдено миссий: ${snapshot.completed.length}\nID: [${snapshot.completed.join(', ') || 'нет данных'}]`;
          type = 'success';
          break;
        case 'rank': {
          const currentXP = snapshot.xp;
          const ranks = [{ name: 'SCRIPT_KIDDIE', min: 0 }, { name: 'CODER', min: 200 }, { name: 'OPERATOR', min: 500 }, { name: 'CYBER_GHOST', min: 1000 }, { name: 'ROOT_ADMIN', min: 2000 }];
          const currentRank = ranks.filter(r => currentXP >= r.min).pop();
          const nextRank = ranks.find(r => r.min > currentXP);
          response = `Текущий ранг: ${currentRank?.name}\n${nextRank ? `До ${nextRank.name}: ${nextRank.min - currentXP} XP` : 'Максимальный ранг достигнут!'}`;
          type = 'success';
          break;
        }
        case 'themes':
          response = `Куплено тем: ${snapshot.themes.length}\nАктивная: ${snapshot.activeTheme}\nВсе: [${snapshot.themes.join(', ')}]`;
          type = 'success';
          break;
        case 'ping':
          response = `Пингуем OmniCorp...\n64 bytes from 10.0.0.1: icmp_seq=1 ttl=64 time=13.37 ms\n64 bytes from 10.0.0.1: icmp_seq=2 ttl=64 time=4.20 ms\n64 bytes from 10.0.0.1: icmp_seq=3 ttl=64 time=6.66 ms\n--- Соединение стабильно ---`;
          type = 'success';
          break;
        case 'hack':
          sounds.success();
          response = `[■■■■■■■■■■] 100%\nВЗЛОМ УСПЕШЕН! ...шутка. Это всего лишь терминал.\nНаграды выдаются только сервером.`;
          type = 'success';
          break;
        case 'matrix':
          response = `ИНИЦИАЛИЗАЦИЯ МАТРИЧНОГО ПРОТОКОЛА...\n01001000 01000101 01001100 01001100 01001111\nКрасная или синяя таблетка? (это пасхалка)`;
          type = 'success';
          break;
        case 'clear':
          setHistory([]);
          setInput('');
          return;
        case 'exit':
          response = 'Сессия завершена. До связи, оператор.';
          type = 'info';
          break;
        case 'sudo':
          response = 'Хорошая попытка, но здесь это не работает 😏';
          type = 'error';
          sounds.error();
          break;
        case 'rm':
          response = 'ДОСТУП ЗАПРЕЩЁН. Удаление файлов заблокировано.';
          type = 'error';
          sounds.error();
          break;
        default:
          response = `Команда "${cmd}" не найдена. Введите "help" для справки.`;
          type = 'error';
          sounds.error();
      }

      setCommandHistory(prev => [...prev, input]);
      setHistoryIndex(-1);
      setHistory(prev => [...prev, { input: `> ${input}`, output: response, type }]);
      setInput('');
      sounds.click();
    }
  };

  return (
    <Box p="xs" style={{ fontFamily: 'monospace', fontSize: '12px', height: '100%' }}>
      <ScrollArea h={120} viewportRef={scrollRef}>
        {history.map((item, i) => (
          <Box key={i} mb={4}>
            {item.input && <Text c="cyan" style={{ fontFamily: 'monospace' }}>{item.input}</Text>}
            <Text c={item.type === 'success' ? 'green' : item.type === 'error' ? 'red' : 'dimmed'} style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
              {item.output}
            </Text>
          </Box>
        ))}
      </ScrollArea>
      <TextInput
        variant="unstyled"
        placeholder="Введите команду..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleCommand}
        styles={{ input: { color: '#00ff41', padding: 0, minHeight: 'auto', fontFamily: 'monospace', fontSize: '12px' } }}
        leftSection={<Text c="green" size="xs">$</Text>}
      />
    </Box>
  );
};
