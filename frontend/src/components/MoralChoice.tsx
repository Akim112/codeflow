import { Modal, Button, Title, Text, Stack, Box } from '@mantine/core';
import { recordMoralChoice, chapterChoices, getChoiceIntro, getPreviousConsequence, ChapterChoice } from '../data/storyOutcomes';
import { progressApi } from '../api/progress';
import { sounds } from '../utils/audio';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  opened: boolean;
  onClose: () => void;
  chapter: string;
  lessonId: number;
}

export const MoralChoice = ({ opened, onClose, chapter, lessonId }: Props) => {
  const handleChoice = async (choice: ChapterChoice) => {
    try {
      const result = await progressApi.moralChoice(choice.faction, lessonId);
      localStorage.setItem('userXP', String(result.totalXp));
      recordMoralChoice(lessonId, chapter, choice.faction);
      sounds.success();
      onClose();
    } catch {
      sounds.error();
      alert('Не удалось сохранить выбор. Попробуйте снова.');
    }
  };

  const choices = chapterChoices[chapter] || chapterChoices["Глава 1: Проникновение"];
  const intro = getChoiceIntro(chapter);
  const previousConsequence = getPreviousConsequence(lessonId);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      centered
      size="lg"
      overlayProps={{ backgroundOpacity: 0.95, blur: 20 }}
      styles={{
        content: {
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 100%)',
          border: '2px solid #ff4136',
          animation: 'pulse-border 2s ease-in-out infinite',
        }
      }}
    >
      <Box
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,65,54,0.03) 2px, rgba(255,65,54,0.03) 4px)',
          pointerEvents: 'none',
          borderRadius: 'inherit',
        }}
      />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
      >
        <Title order={3} c="red" mb="md" ta="center" className="glitch" data-text={intro.title}>
          {intro.title}
        </Title>

        <Text c="dimmed" ta="center" mb="xs" ff="monospace" size="xs">
          {chapter}
        </Text>

        <AnimatePresence>
          {previousConsequence && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ delay: 0.3 }}
            >
              <Box
                mb="md"
                p="sm"
                style={{
                  background: 'rgba(255,200,0,0.05)',
                  border: '1px solid rgba(255,200,0,0.2)',
                  borderRadius: '4px',
                }}
              >
                <Text size="xs" c="yellow" fw={700} mb={4}>
                  📜 ПОСЛЕДСТВИЕ ПРЕДЫДУЩЕГО ВЫБОРА:
                </Text>
                <Text size="xs" c="yellow.3" style={{ fontStyle: 'italic' }}>
                  {previousConsequence}
                </Text>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>

        <Text mb="xl" ta="center" size="lg" c="gray.3">
          {intro.description.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              {i < intro.description.split('\n').length - 1 && <br />}
            </span>
          ))}
        </Text>

        <Stack gap="md">
          {choices.map((choice, index) => (
            <motion.div
              key={choice.faction}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.2 }}
            >
              <Button
                variant="outline"
                color={choice.color}
                size="lg"
                fullWidth
                onClick={() => handleChoice(choice).catch(() => undefined)}
                styles={{
                  root: {
                    height: 'auto',
                    padding: '16px',
                    background: choice.gradient,
                    transition: 'all 0.3s',
                  }
                }}
              >
                <Stack gap={4} align="center" style={{ width: '100%' }}>
                  <Text size="xl">{choice.icon}</Text>
                  <Text fw={700}>{choice.title}</Text>
                  <Text size="xs" c="dimmed">{choice.desc}</Text>
                </Stack>
              </Button>
            </motion.div>
          ))}
        </Stack>
      </motion.div>

      <style>{`
        @keyframes pulse-border {
          0%, 100% { box-shadow: 0 0 20px rgba(255,65,54,0.3); }
          50% { box-shadow: 0 0 50px rgba(255,65,54,0.6); }
        }
      `}</style>
    </Modal>
  );
};
