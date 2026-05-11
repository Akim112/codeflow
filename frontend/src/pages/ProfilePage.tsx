import { Container, Title, Text, Paper, Group, RingProgress, Stack, Button, Badge, SimpleGrid, Progress, Divider, ThemeIcon, Loader } from '@mantine/core';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { IconTrophy, IconFlame, IconShoppingCart, IconChartBar } from '@tabler/icons-react';
import { usersApi, type UserProfile } from '../api/users';
import { progressApi, type UserProgressSummary } from '../api/progress';
import { achievementsApi, type AchievementDefinition, type UserAchievement } from '../api/achievements';
import { factionsApi, type Faction, type UserReputation } from '../api/factions';
import { authApi } from '../api/auth';

const ProfilePage = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState<UserProgressSummary | null>(null);
  const [allAchievements, setAllAchievements] = useState<AchievementDefinition[]>([]);
  const [unlockedAchievementIds, setUnlockedAchievementIds] = useState<string[]>([]);
  const [allFactions, setAllFactions] = useState<Faction[]>([]);
  const [myReputation, setMyReputation] = useState<UserReputation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadAll = async () => {
      try {
        // Load all data in parallelx
        const [userData, progressData, achievementsData, myAchievementsData, factionsData, reputationData] =
          await Promise.allSettled([
            usersApi.getMe(),
            progressApi.getMyProgress(),
            achievementsApi.getAll(),
            achievementsApi.getMyAchievements(),
            factionsApi.getAll(),
            factionsApi.getMyReputation(),
          ]);

        if (userData.status === 'fulfilled') {
          setUser(userData.value);
          localStorage.setItem('userXP', String(userData.value.totalXp));
        }

        if (progressData.status === 'fulfilled') {
          setProgress(progressData.value);
          localStorage.setItem('completedLessons', JSON.stringify(progressData.value.completedLessonIds));
          localStorage.setItem('cleanStreak', String(progressData.value.cleanStreak));
          if (progressData.value.fastBossKill) localStorage.setItem('fastBossKill', 'true');
        }

        if (achievementsData.status === 'fulfilled') {
          setAllAchievements(achievementsData.value);
        }

        if (myAchievementsData.status === 'fulfilled') {
          const ids = myAchievementsData.value.map((a: UserAchievement) => a.achievementId);
          setUnlockedAchievementIds(ids);
          localStorage.setItem('unlockedAchievements', JSON.stringify(ids));
        }

        if (factionsData.status === 'fulfilled') {
          setAllFactions(factionsData.value);
        }

        if (reputationData.status === 'fulfilled') {
          setMyReputation(reputationData.value);
          // Cache reputation
          const repObj: Record<string, number> = {};
          reputationData.value.forEach((r: UserReputation) => { repObj[r.factionId] = r.reputation; });
          localStorage.setItem('reputation', JSON.stringify(repObj));
        }
      } catch (error) {
        console.error("Ошибка загрузки профиля:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAll();
  }, []);

  const handleReset = async () => {
    if (!confirm('⚠️ ВЫ УВЕРЕНЫ?\n\nВсе данные будут безвозвратно удалены!')) return;

    setIsResetting(true);
    try {
      await progressApi.resetProgress();
      // Clear local cache
      localStorage.removeItem('completedLessons');
      localStorage.removeItem('unlockedAchievements');
      localStorage.removeItem('reputation');
      localStorage.removeItem('cleanStreak');
      localStorage.removeItem('fastBossKill');
      localStorage.setItem('userXP', '0');
      window.location.reload();
    } catch (error) {
      console.error("Ошибка сброса:", error);
      alert('Ошибка при сбросе прогресса');
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoading) {
    return (
      <Container size="lg" py="xl" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Loader color="green" />
        <Text ml="md" c="green">Загрузка профиля...</Text>
      </Container>
    );
  }

  const xp = user?.totalXp ?? 0;
  const displayName = user?.displayName || 'OPERATIVE';
  const completedCount = progress?.completedLessonsCount ?? 0;

  // Логика рангов
  const getRank = (xp: number) => {
    if (xp >= 5000) return { name: "LEGEND", color: "yellow", level: 6, icon: "👑" };
    if (xp >= 2000) return { name: "ROOT_ADMIN", color: "red", level: 5, icon: "🔴" };
    if (xp >= 1000) return { name: "CYBER_GHOST", color: "grape", level: 4, icon: "👻" };
    if (xp >= 500) return { name: "OPERATOR", color: "blue", level: 3, icon: "🔷" };
    if (xp >= 200) return { name: "CODER", color: "cyan", level: 2, icon: "💻" };
    return { name: "SCRIPT_KIDDIE", color: "gray", level: 1, icon: "🔰" };
  };

  const rank = getRank(xp);
  const level = Math.floor(xp / 500) + 1;
  const xpToNextLevel = 500 - (xp % 500);

  // Рейтинг редкости
  const rarityColors: Record<string, string> = {
    common: 'gray',
    rare: 'blue',
    epic: 'grape',
    legendary: 'yellow'
  };

  // Build reputation lookup
  const repLookup: Record<string, number> = {};
  myReputation.forEach(r => { repLookup[r.factionId] = r.reputation; });

  return (
    <Container size="lg" py="xl">
      {/* Навигация */}
      <Group justify="space-between" mb="xl">
        <Button variant="subtle" component={Link} to="/courses" leftSection={<span>←</span>}>
          К МИССИЯМ
        </Button>
        <Group>
          <Button variant="light" color="yellow" component={Link} to="/shop" leftSection={<IconShoppingCart size={16} />}>
            МАГАЗИН
          </Button>
          <Button variant="light" color="cyan" component={Link} to="/leaderboard" leftSection={<IconChartBar size={16} />}>
            РЕЙТИНГ
          </Button>
          <Button variant="light" color="red" onClick={() => {
            authApi.logout();
            navigate('/auth');
          }}>
            ВЫХОД
          </Button>
        </Group>

        <Stack gap="xl">
          {/* ОСНОВНОЙ ПРОФИЛЬ */}
          <Paper shadow="md" p="xl" withBorder bg="#141517">
            <Group justify="space-between" wrap="wrap">
              <Group>
                <RingProgress
                  size={140}
                  thickness={14}
                  sections={[{ value: ((xp % 500) / 500) * 100, color: rank.color }]}
                  label={
                    <Stack align="center" gap={0}>
                      <Text size="xl">{rank.icon}</Text>
                      <Text ta="center" fw={700} size="lg">LVL {level}</Text>
                    </Stack>
                  }
                />
                <Stack gap={4}>
                  <Badge color={rank.color} variant="filled" size="xl" style={{ fontSize: '14px' }}>
                    {rank.name}
                  </Badge>
                  <Title order={2}>{displayName}</Title>
                  <Text c="green" fw={700} size="xl">{xp.toLocaleString()} XP</Text>
                  <Progress
                    value={((xp % 500) / 500) * 100}
                    color={rank.color}
                    size="sm"
                    style={{ width: 200 }}
                  />
                  <Text size="xs" c="dimmed">
                    До LVL {level + 1}: {xpToNextLevel} XP
                  </Text>
                </Stack>
              </Group>

              {/* Статистика */}
              <SimpleGrid cols={2} spacing="lg">
                <Paper p="md" bg="#1a1a1a" radius="md">
                  <Group gap="xs">
                    <ThemeIcon color="green" variant="light"><IconTrophy size={18} /></ThemeIcon>
                    <div>
                      <Text size="xl" fw={700}>{completedCount}</Text>
                      <Text size="xs" c="dimmed">Миссий</Text>
                    </div>
                  </Group>
                </Paper>
                <Paper p="md" bg="#1a1a1a" radius="md">
                  <Group gap="xs">
                    <ThemeIcon color="yellow" variant="light"><IconFlame size={18} /></ThemeIcon>
                    <div>
                      <Text size="xl" fw={700}>{unlockedAchievementIds.length}</Text>
                      <Text size="xs" c="dimmed">Достижений</Text>
                    </div>
                  </Group>
                </Paper>
              </SimpleGrid>
            </Group>
          </Paper>

          {/* РЕПУТАЦИЯ */}
          {allFactions.length > 0 && (
            <div>
              <Group mb="md">
                <Title order={3} c="cyan">// РЕПУТАЦИЯ В АНДЕГРАУНДЕ</Title>
              </Group>
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                {allFactions.map(faction => {
                  const rep = repLookup[faction.id] || 0;
                  // Если свойство requiredRep нет в объекте Faction, используем 0 или проксируем логику
                  const isUnlocked = !faction.requiredRep || xp >= faction.requiredRep;
                  const repPercent = Math.min((rep / 200) * 100, 100);

                  return (
                    <Paper
                      key={faction.id}
                      p="md"
                      withBorder
                      style={{
                        opacity: isUnlocked ? 1 : 0.5,
                        filter: isUnlocked ? 'none' : 'grayscale(0.7)',
                        transition: 'all 0.3s'
                      }}
                    >
                      <Group mb="xs">
                        <Text size="xl">{faction.icon || '🏴'}</Text>
                        <div style={{ flex: 1 }}>
                          <Text fw={700} size="sm">{faction.name}</Text>
                          <Text size="xs" c="dimmed">{faction.description}</Text>
                        </div>
                      </Group>

                      {isUnlocked ? (
                        <>
                          <Progress value={repPercent} color={faction.color} size="sm" mb="xs" animated />
                          <Group justify="space-between">
                            <Text size="xs" c={faction.color} fw={700}>
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
          )}

          <Divider />

          {/* ДОСТИЖЕНИЯ */}
          <div>
            <Group justify="space-between" mb="md">
              <Title order={3} c="green">// ДОСТИЖЕНИЯ</Title>
              <Badge variant="light" color="green">
                {unlockedAchievementIds.length} / {allAchievements.length}
              </Badge>
            </Group>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
              {allAchievements.map(ach => {
                const isUnlocked = unlockedAchievementIds.includes(ach.id);
                return (
                  <Paper
                    key={ach.id}
                    p="md"
                    withBorder
                    style={{
                      opacity: isUnlocked ? 1 : 0.4,
                      filter: isUnlocked ? 'none' : 'grayscale(1)',
                      transition: 'all 0.3s',
                      borderColor: isUnlocked ? `var(--mantine-color-${rarityColors[ach.rarity] || 'gray'}-6)` : undefined
                    }}
                  >
                    <Group wrap="nowrap">
                      <Text size="2rem">{ach.icon}</Text>
                      <div style={{ flex: 1 }}>
                        <Group gap="xs" mb={4}>
                          <Text fw={700} size="sm">{ach.title}</Text>
                          <Badge size="xs" color={rarityColors[ach.rarity] || 'gray'} variant="dot">
                            {ach.rarity.toUpperCase()}
                          </Badge>
                        </Group>
                        <Text size="xs" c="dimmed">{ach.description}</Text>
                      </div>
                    </Group>
                    {isUnlocked && (
                      <Badge color="green" variant="filled" size="xs" mt="sm" fullWidth>
                        ✓ РАЗБЛОКИРОВАНО
                      </Badge>
                    )}
                  </Paper>
                );
              })}
            </SimpleGrid>
          </div>

          <Divider />

          {/* ОПАСНАЯ ЗОНА */}
          <Paper p="md" withBorder style={{ borderColor: '#ff4136' }}>
            <Title order={4} c="red" mb="sm">⚠️ ОПАСНАЯ ЗОНА</Title>
            <Text size="sm" c="dimmed" mb="md">
              Это действие удалит ВСЕ ваши данные: прогресс, достижения, репутацию. Восстановление невозможно.
            </Text>
            <Button
              color="red"
              variant="light"
              onClick={handleReset}
              loading={isResetting}
            >
              🗑️ СБРОСИТЬ ВСЕ ДАННЫЕ
            </Button>
          </Paper>
        </Stack>
      </Group> {/* <- ВОТ ЭТОТ Тег был пропущен */}
    </Container>
  );
};

export default ProfilePage;