import { useState } from 'react';
import { Box, Text, TextInput } from '@mantine/core';

export const HackerConsole = () => {
  const [history, setHistory] = useState<string[]>(['Конец связи... Ожидание команд.']);
  const [input, setInput] = useState('');

  const handleCommand = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const cmd = input.toLowerCase().trim();
      let response = '';

      switch (cmd) {
        case 'ls': response = 'secrets.txt, firewall_config.py, logs.db'; break;
        case 'help': response = 'Доступные команды: ls, help, whoami, clear, status'; break;
        case 'whoami': response = 'OPERATIVE_ID: ' + (localStorage.getItem('userXP') || '0'); break;
        case 'status': response = 'СИСТЕМА: Стабильна. Обнаружение: 0%'; break;
        case 'clear': setHistory([]); setInput(''); return;
        default: response = `Команда "${cmd}" не найдена.`;
      }

      setHistory(prev => [...prev, `> ${input}`, response]);
      setInput('');
    }
  };

  return (
    <Box p="xs" style={{ fontFamily: 'monospace', fontSize: '12px' }}>
      {history.map((line, i) => (
        <Text key={i} c={line.startsWith('>') ? 'blue' : 'green'}>{line}</Text>
      ))}
      <TextInput
        variant="unstyled"
        placeholder="_"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleCommand}
        styles={{ input: { color: '#00ff41', padding: 0, minHeight: 'auto' } }}
      />
    </Box>
  );
};