import { Box, Text, Stack, Progress } from '@mantine/core';
import { useState, useEffect } from 'react';

interface CyberLoaderProps {
  text?: string;
  subtext?: string;
  progress?: number;
  color?: string;
}

export const CyberLoader = ({ 
  text = 'ИНИЦИАЛИЗАЦИЯ', 
  subtext = 'Подключение к серверу...',
  progress: externalProgress,
  color = '#00ff41'
}: CyberLoaderProps) => {
  const [progress, setProgress] = useState(externalProgress ?? 0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (externalProgress !== undefined) {
      setProgress(externalProgress);
      return;
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 0;
        return prev + Math.random() * 5;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [externalProgress]);

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(dotInterval);
  }, []);

  return (
    <Box
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
      }}
    >
      {/* Scanline effect */}
      <Box
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '5px',
          background: `linear-gradient(transparent, ${color}, transparent)`,
          opacity: 0.3,
          animation: 'scanline 2s linear infinite',
        }}
      />

      <Stack align="center" gap="xl">
        {/* Логотип */}
        <Box
          style={{
            fontSize: '4rem',
            fontFamily: 'Orbitron, sans-serif',
            color,
            textShadow: `0 0 20px ${color}, 0 0 40px ${color}`,
            animation: 'pulse 2s ease-in-out infinite',
          }}
        >
          ⬡
        </Box>

        {/* Текст */}
        <Text
          size="xl"
          fw={700}
          style={{
            fontFamily: 'Orbitron, sans-serif',
            color,
            letterSpacing: '0.3em',
          }}
        >
          {text}{dots}
        </Text>

        {/* Прогресс */}
        <Box style={{ width: 300 }}>
          <Progress 
            value={Math.min(progress, 100)} 
            color="green"
            size="sm"
            animated
            styles={{
              root: {
                background: '#111',
                border: `1px solid ${color}`,
              },
              section: {
                boxShadow: `0 0 10px ${color}`,
              },
            }}
          />
          <Text size="xs" c="dimmed" ta="center" mt="xs" ff="monospace">
            {Math.floor(Math.min(progress, 100))}%
          </Text>
        </Box>

        {/* Подтекст */}
        <Text size="sm" c="dimmed" ff="monospace">
          {subtext}
        </Text>

        {/* Декоративные элементы */}
        <Box
          style={{
            position: 'absolute',
            bottom: 40,
            left: 0,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            opacity: 0.3,
          }}
        >
          {['SYS', 'NET', 'SEC', 'DAT'].map((label) => (
            <Text
              key={label}
              size="xs"
              c={color}
              ff="monospace"
            >
              [{label}:OK]
            </Text>
          ))}
        </Box>
      </Stack>

      {/* CSS для анимаций */}
      <style>{`
        @keyframes scanline {
          0% { transform: translateY(-100vh); }
          100% { transform: translateY(100vh); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
      `}</style>
    </Box>
  );
};