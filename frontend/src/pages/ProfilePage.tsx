import { Container, Title, Text, Paper, Group, RingProgress, Stack, Button, Badge, SimpleGrid, Progress, Divider, ThemeIcon } from '@mantine/core';
import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { api, syncServerStateToLocalStorage, type AchievementDefinitionDto, type FactionDto, type UserReputationDto, type UserProgressSummaryDto } from '../api';
import { IconTrophy, IconFlame, IconShoppingCart, IconChartBar } from '@tabler/icons-react';

const ProfilePage = () => {
  const [xp, setXp] = useState(0);
  const [progress, setProgress] = useState<UserProgressSummaryDto | null>(null);
  const [defs, setDefs] = useState<AchievementDefinitionDto[]>([]);
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [factions, setFactions] = useState<FactionDto[]>([]);
  const [repMap, setRepMap] = useState<Record<string, number>>({});

  useEffect(() => {
    const load = async () => {
      await syncServerStateToLocalStorage().catch(() => undefined);
      const [me, myProgress, achDefs, myAch, facDefs, myRep] = await Promise.all([
        api.getMe().catch(() => null),
        api.getMyProgress().catch(() => null),
        api.getAchievementDefinitions().catch(() => []),
        api.getMyAchievements().catch(() => []),
        api.getFactions().catch(() => []),
        api.getMyReputation().catch(() => []),
      ]);

      setXp(me?.totalXp ?? myProgress?.totalXp ?? 0);
      setProgress(myProgress);
      setDefs(achDefs);
      setUnlockedIds(myAch.map(a => a.achievementId));
      setFactions(facDefs);
      setRepMap(Object.fromEntries((myRep as UserReputationDto[]).map(r => [r.factionId, r.reputation])));
    };

    load().catch(console.error);
  }, []);

  const getRank = (value: number) => {
    if (value >= 5000) return { name: 'LEGEND', color: 'yellow', level: 6, icon: '👑' };
    if (value >= 2000) return { name: 'ROOT_ADMIN', color: 'red', level: 5, icon: '🔴' };
    if (value >= 1000) return { name: 'CYBER_GHOST', color: 'grape', level: 4, icon: '👻' };
    if (value >= 500) return { name: 'OPERATOR', color: 'blue', level: 3, icon: '🔷' };
    if (value >= 200) return { name: 'CODER', color: 'cyan', level: 2, icon: '💻' };
    return { name: 'SCRIPT_KIDDIE', color: 'gray', level: 1, icon: '🔰' };
  };

  const rank = getRank(xp);
  const level = Math.floor(xp / 500) + 1;
  const xpToNextLevel = 500 - (xp % 500);
  const completedCount = progress?.completedLessonsCount ?? 0;

  const rarityColors = {
    common: 'gray',
    rare: 'blue',
    epic: 'grape',
    legendary: 'yellow'
  } as const;

  const sortedAchievements = useMemo(() => defs, [defs]);

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="xl">
        <Button variant="subtle" component={Link} to="/courses" leftSection="←">К МИССИЯМ</Button>
        <Group>
          <Button variant="light" color="yellow" component={Link} to="/shop" leftSection={<IconShoppingCart size={16} />}>МАГАЗИН</Button>
          <Button variant="light" color="cyan" component={Link} to="/leaderboard" leftSection={<IconChartBar size={16} />}>РЕЙТИНГ</Button>
        </Group>
      </Group>

      <Stack gap="xl">
        <Paper shadow="md" p="xl" withBorder bg="#141517">
          <Group justify="space-between" wrap="wrap">
            <Group>
              <RingProgress
                size={140}
                thickness={14}
                sections={[{ value: ((xp % 500) / 500) * 100, color: rank.color }]}
                label={<Stack align="center" gap={0}><Text size="xl">{rank.icon}</Text><Text ta="center" fw={700} size="lg">LVL {level}</Text></Stack>}
              />
              <Stack gap={4}>
                <Badge color={rank.color} variant="filled" size="xl" style={{ fontSize: '14px' }}>{rank.name}</Badge>
                <Title order={2}>OPERATIVE</Title>
                <Text c="green" fw={700} size="xl">{xp.toLocaleString()} XP</Text>
                <Progress value={((xp % 500) / 500) * 100} color={rank.color} size="sm" style={{ width: 200 }} />
                <Text size="xs" c="dimmed">До LVL {level + 1}: {xpToNextLevel} XP</Text>
              </Stack>
            </Group>

            <SimpleGrid cols={2} spacing="lg">
              <Paper p="md" bg="#1a1a1a" radius="md">
                <Group gap="xs"><ThemeIcon color="green" variant="light"><IconTrophy size={18} /></ThemeIcon><div><Text size="xl" fw={700}>{completedCount}</Text><Text size="xs" c="dimmed">Миссий</Text></div></Group>
              </Paper>
              <Paper p="md" bg="#1a1a1a" radius="md">
                <Group gap="xs"><ThemeIcon color="yellow" variant="light"><IconFlame size={18} /></ThemeIcon><div><Text size="xl" fw={700}>{unlockedIds.length}</Text><Text size="xs" c="dimmed">Достижений</Text></div></Group>
              </Paper>
            </SimpleGrid>
          </Group>
        </Paper>

        <div>
          <Group mb="md"><Title order={3} c="cyan">// РЕПУТАЦИЯ В АНДЕГРАУНДЕ</Title></Group>
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            {factions.map(faction => {
              const rep = repMap[faction.id] || 0;
              const isUnlocked = xp >= faction.requiredRep;
              const repPercent = Math.min((rep / 200) * 100, 100);

              return (
                <Paper key={faction.id} p="md" withBorder style={{ opacity: isUnlocked ? 1 : 0.5, filter: isUnlocked ? 'none' : 'grayscale(0.7)', transition: 'all 0.3s' }}>
                  <Group mb="xs"><Text size="xl">{faction.icon}</Text><div style={{ flex: 1 }}><Text fw={700} size="sm">{faction.name}</Text><Text size="xs" c="dimmed">{faction.description}</Text></div></Group>
                  {isUnlocked ? (
                    <>
                      <Progress value={repPercent} color={faction.color} size="sm" mb="xs" animated />
                      <Group justify="space-between"><Text size="xs" c={faction.color} fw={700}>{rep} REP</Text><Badge size="xs" color={faction.color} variant="light">{faction.bonus}</Badge></Group>
                    </>
                  ) : (
                    <Badge color="gray" variant="outline" mt="xs">🔒 Требуется {faction.requiredRep} XP</Badge>
                  )}
                </Paper>
              );
            })}
          </SimpleGrid>
        </div>

        <Divider />

        <div>
          <Group justify="space-between" mb="md"><Title order={3} c="green">// ДОСТИЖЕНИЯ</Title><Badge variant="light" color="green">{unlockedIds.length} / {sortedAchievements.length}</Badge></Group>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
            {sortedAchievements.map(ach => {
              const isUnlocked = unlockedIds.includes(ach.id);
              const rarity = (ach.rarity as keyof typeof rarityColors) || 'common';
              return (
                <Paper key={ach.id} p="md" withBorder style={{ opacity: isUnlocked ? 1 : 0.4, filter: isUnlocked ? 'none' : 'grayscale(1)', transition: 'all 0.3s', borderColor: isUnlocked ? `var(--mantine-color-${rarityColors[rarity]}-6)` : undefined }}>
                  <Group wrap="nowrap"><Text size="2rem">{ach.icon}</Text><div style={{ flex: 1 }}><Group gap="xs" mb={4}><Text fw={700} size="sm">{ach.title}</Text><Badge size="xs" color={rarityColors[rarity]} variant="dot">{String(ach.rarity).toUpperCase()}</Badge></Group><Text size="xs" c="dimmed">{ach.description}</Text></div></Group>
                  {isUnlocked && <Badge color="green" variant="filled" size="xs" mt="sm" fullWidth>✓ РАЗБЛОКИРОВАНО</Badge>}
                </Paper>
              );
            })}
          </SimpleGrid>
        </div>

        <Divider />

        <Paper p="md" withBorder style={{ borderColor: '#ff4136' }}>
          <Title order={4} c="red" mb="sm">⚠️ ОПАСНАЯ ЗОНА</Title>
          <Text size="sm" c="dimmed" mb="md">Это действие удалит ВСЕ ваши данные: прогресс, достижения, репутацию. Восстановление невозможно.</Text>
          <Button color="red" variant="light" onClick={() => {
            if (confirm('⚠️ ВЫ УВЕРЕНЫ?\n\nВсе данные будут безвозвратно удалены!')) {
              api.resetProgress().then(() => syncServerStateToLocalStorage()).then(() => window.location.reload()).catch(() => alert('Не удалось сбросить профиль на сервере.'));
            }
          }}>🗑️ СБРОСИТЬ ВСЕ ДАННЫЕ</Button>
        </Paper>
      </Stack>
    </Container>
  );
};

export default ProfilePage;
