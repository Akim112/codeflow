import { Container, Title, Text, Button, Group, Stack, SimpleGrid, Card, Badge, Box } from '@mantine/core';
import { Link } from 'react-router-dom';
import { Typewriter } from 'react-simple-typewriter';
import { IconRocket, IconTrophy, IconShoppingCart, IconUser, IconCode, IconShield } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { MatrixRain } from '../components/MatrixRain';
import { ParticleBackground } from '../components/ParticleBackground';
import { GlitchText } from '../components/GlitchText';
import { usersApi } from '../api/users';
import { progressApi, type UserProgressSummary } from '../api/progress';
import { achievementsApi } from '../api/achievements';

const HomePage = () => {
  const [userXP, setUserXP] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [achievementsCount, setAchievementsCount] = useState(0);
  const [themesCount, setThemesCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 500);

    const loadData = async () => {
      try {
        const user = await usersApi.getMe();
        setUserXP(user.totalXp);
        localStorage.setItem('userXP', String(user.totalXp));
        localStorage.setItem('user', JSON.stringify(user));
      } catch {
        setUserXP(Number(localStorage.getItem('userXP')) || 0);
      }

      try {
        const progress: UserProgressSummary = await progressApi.getMyProgress();
        setCompletedCount(progress.completedLessonsCount);
        localStorage.setItem('completedLessons', JSON.stringify(progress.completedLessonIds));
      } catch {
        setCompletedCount(JSON.parse(localStorage.getItem('completedLessons') || '[]').length);
      }

      try {
        const myAchievements = await achievementsApi.getMyAchievements();
        setAchievementsCount(myAchievements.length);
        localStorage.setItem('unlockedAchievements', JSON.stringify(myAchievements.map(a => a.achievementId)));
      } catch {
        setAchievementsCount(JSON.parse(localStorage.getItem('unlockedAchievements') || '[]').length);
      }

      setThemesCount(JSON.parse(localStorage.getItem('ownedThemes') || '["classic"]').length);
    };

    loadData();
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { label: 'Миссий пройдено', value: completedCount, icon: IconCode },
    { label: 'Достижений', value: achievementsCount, icon: IconTrophy },
    { label: 'Тем куплено', value: themesCount, icon: IconShield },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    <Box style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Фоновые эффекты */}
      <MatrixRain opacity={0.03} />
      <ParticleBackground particleCount={30} />

      {/* Градиентный оверлей */}
      <Box
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(ellipse at center, transparent 0%, #000 70%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      <Container size="lg" style={{ position: 'relative', zIndex: 2 }}>
        <motion.div
          initial="hidden"
          animate={showContent ? 'visible' : 'hidden'}
          variants={containerVariants}
        >
          <Stack
            align="center"
            justify="center"
            gap="xl"
            style={{ minHeight: '100vh', padding: '40px 0' }}
          >
            {/* ЛОГОТИП */}
            <motion.div variants={itemVariants}>
              <Box style={{ position: 'relative' }}>
                <Box
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '300px',
                    height: '300px',
                    background: 'radial-gradient(circle, rgba(0,255,65,0.2) 0%, transparent 70%)',
                    filter: 'blur(40px)',
                  }}
                />

                <Title
                  className="glitch neon-glow"
                  data-text="[ CODEFLOW ]"
                  order={1}
                  style={{
                    fontSize: 'clamp(2.5rem, 8vw, 5rem)',
                    textAlign: 'center',
                    fontFamily: 'Orbitron, sans-serif',
                    letterSpacing: '0.1em',
                    position: 'relative',
                  }}
                >
                  <Typewriter
                    words={["[ CODEFLOW ]"]}
                    cursor
                    cursorStyle="_"
                    typeSpeed={100}
                  />
                </Title>
              </Box>
            </motion.div>

            {/* ПОДЗАГОЛОВОК */}
            <motion.div variants={itemVariants}>
              <GlitchText
                c="green"
                size="lg"
                ff="monospace"
                ta="center"
                intensity="low"
              >
                // СИСТЕМА ОБУЧЕНИЯ ХАКЕРОВ v2.0
              </GlitchText>
            </motion.div>

            {/* СТАТУС */}
            <motion.div variants={itemVariants}>
              <Group gap="md" justify="center">
                <Badge color="green" variant="dot" size="lg" className="badge-glow">
                  СИСТЕМА: ONLINE
                </Badge>
                <Badge color="cyan" variant="dot" size="lg">
                  XP: {userXP}
                </Badge>
                <Badge color="yellow" variant="dot" size="lg">
                  БЕЗОПАСНОСТЬ: МАКСИМУМ
                </Badge>
              </Group>
            </motion.div>

            {/* ОПИСАНИЕ */}
            <motion.div variants={itemVariants}>
              <Text
                size="xl"
                c="dimmed"
                maw={700}
                ta="center"
                style={{ lineHeight: 1.8 }}
              >
                Ты — последняя надежда <Text span fw={700} c="cyan">сопротивления</Text>.
                Проникни в сеть <Text span fw={700} c="red" className="warning-flash">OmniCorp</Text> и
                разрушь систему изнутри. Овладей <Text span fw={700} c="green">Python</Text>,
                взломай защиту и стань <Text span fw={700} c="yellow">легендой</Text>.
              </Text>
            </motion.div>

            {/* ГЛАВНАЯ КНОПКА */}
            <motion.div variants={itemVariants}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  component={Link}
                  to="/courses"
                  size="xl"
                  leftSection={<IconRocket size={24} />}
                  className="electric-border"
                  styles={{
                    root: {
                      fontSize: '1.3rem',
                      padding: '24px 48px',
                      background: 'linear-gradient(135deg, #00ff41 0%, #00cc33 100%)',
                      border: 'none',
                      boxShadow: '0 0 30px rgba(0,255,65,0.4)',
                      transition: 'all 0.3s',
                      overflow: 'visible',
                    },
                    label: {                      // ← добавить весь этот блок
                      whiteSpace: 'nowrap',
                      overflow: 'visible',
                    },
                    inner: {                      // ← и это
                      overflow: 'visible',
                    }
                  }}
                >
                  НАЧАТЬ ОПЕРАЦИЮ
                </Button>
              </motion.div>
            </motion.div>

            {/* СТАТИСТИКА */}
            <motion.div variants={itemVariants} style={{ width: '100%' }}>
              <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg" mt="xl">
                {stats.map((stat) => (
                  <Card
                    key={stat.label}
                    withBorder
                    p="lg"
                    style={{
                      textAlign: 'center',
                      background: 'rgba(0, 255, 65, 0.03)',
                      border: '1px solid rgba(0, 255, 65, 0.15)',
                    }}
                  >
                    <stat.icon size={32} color="var(--neon-green)" style={{ marginBottom: 10 }} />
                    <Text size="2rem" fw={700} c="green" style={{ textShadow: '0 0 15px rgba(0,255,65,0.5)' }}>
                      {stat.value}
                    </Text>
                    <Text size="xs" c="dimmed" tt="uppercase" mt="xs">
                      {stat.label}
                    </Text>
                  </Card>
                ))}
              </SimpleGrid>
            </motion.div>

            {/* БЫСТРЫЙ ДОСТУП */}
            <motion.div variants={itemVariants} style={{ width: '100%' }}>
              <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md" mt="xl">
                {[
                  { to: '/profile', icon: IconUser, label: 'ПРОФИЛЬ', color: 'green' },
                  { to: '/shop', icon: IconShoppingCart, label: 'МАГАЗИН', color: 'yellow' },
                  { to: '/leaderboard', icon: IconTrophy, label: 'РЕЙТИНГ', color: 'cyan' },
                  { to: '/courses', icon: IconCode, label: 'МИССИИ', color: 'red' },
                ].map((item) => (
                  <motion.div
                    key={item.to}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Card
                      component={Link}
                      to={item.to}
                      withBorder
                      p="lg"
                      className="cyber-card"
                      style={{
                        cursor: 'pointer',
                        textAlign: 'center',
                        textDecoration: 'none',
                      }}
                    >
                      <item.icon
                        size={28}
                        color={`var(--mantine-color-${item.color}-6)`}
                        style={{ marginBottom: 8 }}
                      />
                      <Text fw={700} size="sm">{item.label}</Text>
                    </Card>
                  </motion.div>
                ))}
              </SimpleGrid>
            </motion.div>

            {/* ФУТЕР */}
            <motion.div variants={itemVariants}>
              <Text size="xs" c="dimmed" mt="xl" style={{ opacity: 0.5 }} ff="monospace">
                v3.0.0 | © 2026 CodeFlow Terminal | Powered by Pyodide & React
              </Text>
            </motion.div>
          </Stack>
        </motion.div>
      </Container>

      {/* Декоративные элементы */}
      <Box
        style={{
          position: 'fixed',
          bottom: 20,
          left: 20,
          opacity: 0.3,
        }}
      >
        <Text size="xs" c="green" ff="monospace">
          [SYS] Memory: OK<br />
          [NET] Connection: STABLE<br />
          [SEC] Firewall: ACTIVE
        </Text>
      </Box>

      <Box
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          opacity: 0.3,
        }}
      >
        <Text size="xs" c="green" ff="monospace" ta="right">
          IP: 192.168.1.337<br />
          PING: 13ms<br />
          UPTIME: 99.99%
        </Text>
      </Box>
    </Box>
  );
};

export default HomePage;