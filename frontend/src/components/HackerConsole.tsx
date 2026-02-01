import { useState, useRef, useEffect } from 'react';
import { Box, Text, TextInput, ScrollArea } from '@mantine/core';
import { sounds } from '../utils/audio';

interface CommandHistory {
  input: string;
  output: string;
  type: 'success' | 'error' | 'info';
}

export const HackerConsole = () => {
  const [history, setHistory] = useState<CommandHistory[]>([
    { input: '', output: '> Терминал активен. Введите "help" для списка команд.', type: 'info' }
  ]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Автоскролл вниз
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [history]);

  const handleCommand = (e: React.KeyboardEvent) => {
    // Навигация по истории команд
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

      // Расширенный список команд
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
          response = `drwxr-xr-x  secrets/
-rw-r--r--  firewall_config.py
-rw-r--r--  logs.db
-rw-r--r--  user_data.enc
-rw-r--r--  system.conf
-rwx------  backdoor.sh`;
          type = 'success';
          break;

        case 'cat':
          if (args[1] === 'firewall_config.py') {
            response = `# OmniCorp Firewall v3.2
ALLOWED_IPS = ["192.168.1.1"]
BLOCKED_PORTS = [22, 23, 3389]
ENCRYPTION = "AES-256"
# TODO: Fix security hole in port 8080`;
            type = 'success';
          } else if (args[1] === 'system.conf') {
            response = `SYSTEM_NAME=OmniCorp_MainFrame
VERSION=7.3.1
SECURITY_LEVEL=MAXIMUM
AI_ASSISTANT=GLITCH_v2.0`;
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
          const xp = localStorage.getItem('userXP') || '0';
          const rank = Number(xp) >= 2000 ? 'ROOT_ADMIN' : 
                       Number(xp) >= 1000 ? 'CYBER_GHOST' :
                       Number(xp) >= 500 ? 'OPERATOR' :
                       Number(xp) >= 200 ? 'CODER' : 'SCRIPT_KIDDIE';
          response = `╔════════════════════════════════╗
║ USER: OPERATIVE_${Math.floor(Math.random() * 9999)}
║ RANK: ${rank}
║ XP: ${xp}
║ STATUS: ACTIVE
║ CLEARANCE: LEVEL ${Math.floor(Number(xp) / 500) + 1}
╚════════════════════════════════╝`;
          type = 'success';
          break;
        }

        case 'status':
          response = `СИСТЕМА: Стабильна
ОБНАРУЖЕНИЕ: 0%
ШИФРОВАНИЕ: AES-256
ПОДКЛЮЧЕНИЕ: Безопасное
BACKDOOR: Активен
ВРЕМЯ СЕССИИ: ${Math.floor(Math.random() * 120)} мин`;
          type = 'success';
          break;

        case 'xp':
          response = `Ваш XP: ${localStorage.getItem('userXP') || '0'}`;
          type = 'success';
          sounds.success();
          break;

        case 'missions': {
          const completed = JSON.parse(localStorage.getItem('completedLessons') || '[]');
          response = `Пройдено миссий: ${completed.length}\nID: [${completed.join(', ') || 'нет данных'}]`;
          type = 'success';
          break;
        }

        case 'rank': {
          const currentXP = Number(localStorage.getItem('userXP') || '0');
          const ranks = [
            { name: 'SCRIPT_KIDDIE', min: 0 },
            { name: 'CODER', min: 200 },
            { name: 'OPERATOR', min: 500 },
            { name: 'CYBER_GHOST', min: 1000 },
            { name: 'ROOT_ADMIN', min: 2000 }
          ];
          const currentRank = ranks.filter(r => currentXP >= r.min).pop();
          const nextRank = ranks.find(r => r.min > currentXP);
          response = `Текущий ранг: ${currentRank?.name}
${nextRank ? `До ${nextRank.name}: ${nextRank.min - currentXP} XP` : 'Максимальный ранг достигнут!'}`;
          type = 'success';
          break;
        }

        case 'themes': {
          const themes = JSON.parse(localStorage.getItem('ownedThemes') || '["classic"]');
          const active = localStorage.getItem('activeTheme') || 'classic';
          response = `Куплено тем: ${themes.length}\nАктивная: ${active}\nВсе: [${themes.join(', ')}]`;
          type = 'success';
          break;
        }

        case 'ping':
          response = `Пингуем OmniCorp...
64 bytes from 10.0.0.1: icmp_seq=1 ttl=64 time=13.37 ms
64 bytes from 10.0.0.1: icmp_seq=2 ttl=64 time=4.20 ms
64 bytes from 10.0.0.1: icmp_seq=3 ttl=64 time=6.66 ms
--- Соединение стабильно ---`;
          type = 'success';
          break;

        case 'hack': {
          sounds.success();
          response = `[■■■■■■■■■■] 100%
ВЗЛОМ УСПЕШЕН! ...шутка. Это всего лишь терминал.
Но +10 XP за находчивость!`;
          const hackXP = Number(localStorage.getItem('userXP') || '0') + 10;
          localStorage.setItem('userXP', String(hackXP));
          type = 'success';
          break;
        }

        case 'matrix':
          response = `ИНИЦИАЛИЗАЦИЯ МАТРИЧНОГО ПРОТОКОЛА...
01001000 01000101 01001100 01001100 01001111
Красная или синяя таблетка? (это пасхалка)`;
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

      // Добавляем в историю команд
      setCommandHistory(prev => [...prev, input]);
      setHistoryIndex(-1);
      
      // Добавляем в вывод
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
            {item.input && (
              <Text c="cyan" style={{ fontFamily: 'monospace' }}>{item.input}</Text>
            )}
            <Text 
              c={item.type === 'success' ? 'green' : item.type === 'error' ? 'red' : 'dimmed'}
              style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}
            >
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
        styles={{ 
          input: { 
            color: '#00ff41', 
            padding: 0, 
            minHeight: 'auto',
            fontFamily: 'monospace',
            fontSize: '12px'
          } 
        }}
        leftSection={<Text c="green" size="xs">$</Text>}
      />
    </Box>
  );
};