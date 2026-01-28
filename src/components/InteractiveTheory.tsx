import { Text, Code, Tooltip } from '@mantine/core';

interface Props {
  text: string;
  onCodeClick: (code: string) => void;
}

export const InteractiveTheory = ({ text, onCodeClick }: Props) => {
  // Разбиваем текст на части: обычный текст и код в обратных кавычках
  const parts = text.split(/(`[^`]+`)/g);

  return (
    <Text size="sm" c="gray.3" style={{ lineHeight: 1.6 }}>
      {parts.map((part, index) => {
        // Проверяем, является ли часть кодом (обрамлена в `)
        if (part.startsWith('`') && part.endsWith('`')) {
          const code = part.slice(1, -1); // Убираем кавычки
          return (
            <Tooltip key={index} label="💡 Нажми, чтобы вставить в редактор" withArrow>
              <Code
                color="green"
                style={{ 
                  cursor: 'pointer', 
                  margin: '0 4px',
                  padding: '2px 6px',
                  background: '#001a00',
                  border: '1px solid #00ff41',
                  transition: 'all 0.2s'
                }}
                onClick={() => {
                  onCodeClick(code);
                  // Звуковой фидбек
                  const audio = new AudioContext();
                  const osc = audio.createOscillator();
                  const gain = audio.createGain();
                  osc.frequency.value = 1200;
                  gain.gain.setValueAtTime(0.1, audio.currentTime);
                  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.1);
                  osc.connect(gain).connect(audio.destination);
                  osc.start();
                  osc.stop(audio.currentTime + 0.1);
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#003300';
                  e.currentTarget.style.boxShadow = '0 0 10px rgba(0,255,65,0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#001a00';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {code}
              </Code>
            </Tooltip>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </Text>
  );
};