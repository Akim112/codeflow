import { Container, Title, Text, Paper, Group, RingProgress, Stack, Button, Badge, SimpleGrid, Progress } from '@mantine/core';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { achievements } from '../data/achievements';
import { factions, getReputation, isFactionUnlocked, type ReputationState } from '../data/reputationSystem';

const ProfilePage = () => {
  const [xp, setXp] = useState(0);
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [reputation, setReputation] = useState<ReputationState>({});

  useEffect(() => {
    setXp(Number(localStorage.getItem('userXP')) || 0);
    setUnlockedIds(JSON.parse(localStorage.getItem('unlockedAchievements') || '[]'));
    
    // Загружаем репутацию
    const savedRep = localStorage.getItem('reputation');
    if (savedRep) {
      setReputation(JSON.parse(savedRep));
    }
  }, []);

  // Логика рангов
  const getRank = (xp: number) => {
    if (xp >= 2000) return { name: "ROOT_ADMIN", color: "red", level: 5 };
    if (xp >= 1000) return { name: "CYBER_GHOST", color: "grape", level: 4 };
    if (xp >= 500) return { name: "OPERATOR", color: "blue", level: 3 };
    if (xp >= 200) return { name: "CODER", color: "cyan", level: 2 };
    return { name: "SCRIPT_KIDDIE", color: "gray", level: 1 };
  };

  const rank = getRank(xp);
  const level = Math.floor(xp / 500) + 1;
  const xpToNextLevel = 500 - (xp % 500);

  return (
    <Container size="lg" py="xl">
      <Button variant="subtle" component={Link} to="/courses" mb="md">← К МИССИЯМ</Button>
      
      <Stack gap="xl">
        {/* ОСНОВНОЙ ПРОФИЛЬ */}
        <Paper shadow="md" p="xl" withBorder bg="#141517">
          <Group justify="space-between">
            <Group>
              <RingProgress
                size={120}
                thickness={12}
                sections={[{ value: ((xp % 500) / 500) * 100, color: rank.color }]}
                label={
                  <Text ta="center" fw={700} size="xl">
                    LVL {level}
                  </Text>
                }
              />
              <Stack gap={0}>
                <Badge color={rank.color} variant="filled" size="lg" mb="xs">
                  {rank.name}
                </Badge>
                <Title order={2}>USER_ID: OPERATIVE</Title>
                <Text c="dimmed">{xp} XP TOTAL</Text>
                <Text size="xs" c="dimmed" mt={5}>
                  До следующего уровня: {xpToNextLevel} XP
                </Text>
              </Stack>
            </Group>

            {/* Статистика */}
            <Stack gap="xs" align="flex-end">
              <Text size="sm" c="dimmed">
                Миссий завершено: {JSON.parse(localStorage.getItem('completedLessons') || '[]').length}
              </Text>
              <Text size="sm" c="dimmed">
                Достижений: {unlockedIds.length} / {achievements.length}
              </Text>
            </Stack>
          </Group>
        </Paper>

        {/* РЕПУТАЦИЯ С ФРАКЦИЯМИ */}
        <div>
          <Title order={3} c="cyan" mb="md">// РЕПУТАЦИЯ В АНДЕГРАУНДЕ</Title>
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            {factions.map(faction => {
              const rep = getReputation(faction.id);
              const isUnlocked = isFactionUnlocked(faction);
              const repPercent = Math.min((rep / 200) * 100, 100);

              return (
                <Paper 
                  key={faction.id} 
                  p="md" 
                  withBorder 
                  style={{ 
                    opacity: isUnlocked ? 1 : 0.5,
                    filter: isUnlocked ? 'none' : 'grayscale(0.7)'
                  }}
                >
                  <Group mb="xs">
                    <Text size="xl">{faction.icon}</Text>
                    <div style={{ flex: 1 }}>
                      <Text fw={700} size="sm">{faction.name}</Text>
                      <Text size="xs" c="dimmed">{faction.description}</Text>
                    </div>
                  </Group>

                  {isUnlocked ? (
                    <>
                      <Progress value={repPercent} color={faction.color} size="sm" mb="xs" />
                      <Group justify="space-between">
                        <Text size="xs" c={faction.color}>
                          {rep} REP
                        </Text>
                        <Badge size="xs" color={faction.color} variant="light">
                          {faction.bonus}
                        </Badge>
                      </Group>
                    </>
                  ) : (
                    <Badge color="gray" variant="outline" mt="xs">
                      🔒 Требуется {faction.requiredRep} XP
                    </Badge>
                  )}
                </Paper>
              );
            })}
          </SimpleGrid>
        </div>

        {/* ДОСТИЖЕНИЯ */}
        <div>
          <Title order={3} c="green" mb="md">// ДОСТИЖЕНИЯ</Title>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
            {achievements.map(ach => {
              const isUnlocked = unlockedIds.includes(ach.id);
              return (
                <Paper 
                  key={ach.id} 
                  p="md" 
                  withBorder 
                  style={{ 
                    opacity: isUnlocked ? 1 : 0.3, 
                    filter: isUnlocked ? 'none' : 'grayscale(1)',
                    transition: 'all 0.3s'
                  }}
                >
                  <Group>
                    <Text size="xl">{ach.icon}</Text>
                    <div>
                      <Text fw={700} size="sm">{ach.title}</Text>
                      <Text size="xs" c="dimmed">{ach.description}</Text>
                    </div>
                  </Group>
                  {isUnlocked && (
                    <Badge color="green" variant="light" size="xs" mt="xs">
                      ✓ Разблокировано
                    </Badge>
                  )}
                </Paper>
              );
            })}
          </SimpleGrid>
        </div>

        {/* ОПАСНАЯ ЗОНА */}
        <Paper p="md" withBorder style={{ borderColor: 'red' }}>
          <Title order={4} c="red" mb="sm">⚠️ ОПАСНАЯ ЗОНА</Title>
          <Text size="sm" c="dimmed" mb="md">
            Это действие удалит ВСЕ ваши данные: прогресс, достижения, репутацию. Восстановление невозможно.
          </Text>
          <Button 
            color="red" 
            variant="light" 
            onClick={() => { 
              if (confirm('Вы уверены? Все данные будут удалены!')) {
                localStorage.clear(); 
                window.location.reload(); 
              }
            }}
          >
            СБРОСИТЬ ВСЕ ДАННЫЕ
          </Button>
        </Paper>
      </Stack>
    </Container>
  );
};

export default ProfilePage;