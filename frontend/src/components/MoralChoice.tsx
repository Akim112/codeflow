import { Modal, Button, Title, Text, Stack, Box } from '@mantine/core';
import { sounds } from '../utils/audio';
import { motion } from 'framer-motion';
import { api, syncServerStateToLocalStorage } from '../api';

interface Props {
  opened: boolean;
  onClose: () => void;
  chapter: string;
}

export const MoralChoice = ({ opened, onClose, chapter }: Props) => {
  const handleChoice = async (factionId: string, xpBonus: number) => {
    await api.moralChoice(factionId, xpBonus, 50);
    await syncServerStateToLocalStorage().catch(() => undefined);
    sounds.success();
    onClose();
  };

  const choices = [
    {
      faction: 'data_brokers',
      xp: 500,
      color: 'blue',
      icon: '💾',
      title: 'ПРОДАТЬ НА ЧЁРНОМ РЫНКЕ',
      desc: '+500 XP | +50 репутации у Торговцев Данными',
      gradient: 'linear-gradient(135deg, rgba(0,100,255,0.1) 0%, rgba(0,50,150,0.1) 100%)',
    },
    {
      faction: 'ai_ethicists',
      xp: 300,
      color: 'cyan',
      icon: '📢',
      title: 'ОПУБЛИКОВАТЬ АНОНИМНО',
      desc: '+300 XP | +50 репутации у AI-Этиков',
      gradient: 'linear-gradient(135deg, rgba(0,255,255,0.1) 0%, rgba(0,150,150,0.1) 100%)',
    },
    {
      faction: 'ghost_protocol',
      xp: 100,
      color: 'gray',
      icon: '🗑️',
      title: 'УНИЧТОЖИТЬ ДАННЫЕ',
      desc: '+100 XP | +50 репутации у Протокола Призрак',
      gradient: 'linear-gradient(135deg, rgba(100,100,100,0.1) 0%, rgba(50,50,50,0.1) 100%)',
    },
  ];

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
      {/* Сканлайн эффект */}
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
        <Title order={3} c="red" mb="md" ta="center" className="glitch" data-text="⚠️ КРИТИЧЕСКИЙ ВЫБОР">
          ⚠️ КРИТИЧЕСКИЙ ВЫБОР
        </Title>
        
        <Text c="dimmed" ta="center" mb="xs" ff="monospace" size="xs">
          {chapter}
        </Text>
        
        <Text mb="xl" ta="center" size="lg" c="gray.3">
          Вы получили доступ к секретным архивам OmniCorp. 
          <br/>
          <Text span c="red" fw={700}>Что вы сделаете с этими данными?</Text>
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
                onClick={() => handleChoice(choice.faction, choice.xp).catch(() => undefined)}
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

      {/* CSS анимации */}
      <style>{`
        @keyframes pulse-border {
          0%, 100% { box-shadow: 0 0 20px rgba(255,65,54,0.3); }
          50% { box-shadow: 0 0 50px rgba(255,65,54,0.6); }
        }
      `}</style>
    </Modal>
  );
};
