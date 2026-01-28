import { Modal, Button, Title, Text, Stack, Group } from '@mantine/core';
import { addReputation } from '../data/reputationSystem';

interface Props {
  opened: boolean;
  onClose: () => void;
  chapter: string;
}

export const MoralChoice = ({ opened, onClose, chapter }: Props) => {
  const handleChoice = (factionId: string) => {
    addReputation(factionId, 50);
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} withCloseButton={false} centered size="lg" 
           overlayProps={{ backgroundOpacity: 0.8, blur: 10 }}>
      <Title order={3} c="red" mb="md">⚠️ КРИТИЧЕСКИЙ ВЫБОР: {chapter}</Title>
      <Text mb="xl">Вы получили доступ к архивам. Что вы сделаете с данными?</Text>
      
      <Stack>
        <Button variant="outline" color="blue" onClick={() => handleChoice('data_brokers')}>
          ПРОДАТЬ: Получить 500 XP и репутацию у Торговцев Данными.
        </Button>
        <Button variant="outline" color="cyan" onClick={() => handleChoice('ai_ethicists')}>
          ОПУБЛИКОВАТЬ: Раскрыть правду. Репутация у AI-Этиков.
        </Button>
      </Stack>
    </Modal>
  );
};