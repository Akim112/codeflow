import { useState, useEffect } from 'react';
import { Modal, Text, Stack, Box, Button, Title, Badge } from '@mantine/core';
import { motion, AnimatePresence } from 'framer-motion';
import { getStoryEnding, StoryEnding } from '../data/storyOutcomes';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';

interface Props {
  opened: boolean;
  onClose: () => void;
}

export const StoryOutcome = ({ opened, onClose }: Props) => {
  const [ending, setEnding] = useState<StoryEnding | null>(null);
  const [currentLine, setCurrentLine] = useState(0);
  const [showEpilogue, setShowEpilogue] = useState(false);

  useEffect(() => {
    if (opened) {
      const e = getStoryEnding();
      setEnding(e);
      setCurrentLine(0);
      setShowEpilogue(false);
      sounds.success();

      // Финальное конфетти
      setTimeout(() => {
        confetti({
          particleCount: 300,
          spread: 160,
          origin: { y: 0.5 },
          colors: ['#FFD700', '#FF4136', '#00FF41', '#00FFF9', '#BF40BF'],
          shapes: ['star', 'circle'],
        });
      }, 500);
    }
  }, [opened]);

  // Автоматическое раскрытие текста
  useEffect(() => {
    if (!ending || !opened) return;

    if (currentLine < ending.narrative.length) {
      const timer = setTimeout(() => {
        setCurrentLine(prev => prev + 1);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setShowEpilogue(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [currentLine, ending, opened]);

  if (!ending) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      centered
      size="xl"
      overlayProps={{ backgroundOpacity: 0.98, blur: 30 }}
      styles={{
        content: {
          background: 'linear-gradient(135deg, #050505 0%, #0a0a0a 50%, #050505 100%)',
          border: `2px solid ${ending.color}`,
          boxShadow: `0 0 60px ${ending.color}40`,
          maxHeight: '90vh',
          overflow: 'auto',
        }
      }}
    >
      {/* Сканлайн эффект */}
      <Box
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.01) 2px, rgba(255,255,255,0.01) 4px)',
          pointerEvents: 'none',
          borderRadius: 'inherit',
        }}
      />

      <Stack gap="xl" p="md">
        {/* Заголовок */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 1 }}
        >
          <Stack align="center" gap="sm">
            <Text size="60px">{ending.icon}</Text>
            <Title
              order={1}
              c={ending.color}
              ta="center"
              className="glitch"
              data-text={ending.title}
              ff="Orbitron, sans-serif"
              style={{ textShadow: `0 0 30px ${ending.color}60` }}
            >
              {ending.title}
            </Title>
            <Badge color="dark" variant="filled" size="lg">
              ОПЕРАЦИЯ ЗАВЕРШЕНА
            </Badge>
          </Stack>
        </motion.div>

        {/* Нарратив */}
        <Stack gap="md">
          <AnimatePresence>
            {ending.narrative.slice(0, currentLine).map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Box
                  p="md"
                  style={{
                    borderLeft: `3px solid ${ending.color}`,
                    background: `linear-gradient(90deg, ${ending.color}08 0%, transparent 100%)`,
                  }}
                >
                  <Text
                    size="md"
                    c="gray.3"
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      lineHeight: 1.8,
                    }}
                  >
                    {line}
                  </Text>
                </Box>
              </motion.div>
            ))}
          </AnimatePresence>
        </Stack>

        {/* Эпилог */}
        <AnimatePresence>
          {showEpilogue && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', duration: 1 }}
            >
              <Box
                p="xl"
                style={{
                  background: `linear-gradient(135deg, ${ending.color}15 0%, transparent 100%)`,
                  border: `1px solid ${ending.color}40`,
                  borderRadius: '8px',
                  textAlign: 'center',
                }}
              >
                <Text
                  size="lg"
                  fw={700}
                  c={ending.color}
                  mb="sm"
                  style={{ fontFamily: 'monospace' }}
                >
                  {ending.epilogue}
                </Text>
                <Badge color="yellow" variant="filled" size="lg" mt="md">
                  🏆 ДОСТИЖЕНИЕ: {ending.achievement}
                </Badge>
              </Box>

              <Button
                fullWidth
                mt="xl"
                size="lg"
                variant="outline"
                color={ending.color}
                onClick={onClose}
                styles={{
                  root: {
                    transition: 'all 0.3s',
                    '&:hover': {
                      boxShadow: `0 0 30px ${ending.color}40`,
                    },
                  },
                }}
              >
                ВЫЙТИ ИЗ СИСТЕМЫ
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </Stack>

      <style>{`
        @keyframes final-glow {
          0%, 100% { box-shadow: 0 0 20px ${ending.color}30; }
          50% { box-shadow: 0 0 60px ${ending.color}60; }
        }
      `}</style>
    </Modal>
  );
};
