import { Container, Title, Text, Button, Stack, SimpleGrid, Card, Badge } from '@mantine/core';
import { Link } from 'react-router-dom';
import { Typewriter } from 'react-simple-typewriter';
import { IconRocket, IconTrophy, IconShoppingCart, IconUser } from '@tabler/icons-react';
import { motion } from 'framer-motion';

const HomePage = () => {
  const userXP = Number(localStorage.getItem('userXP')) || 0;

  return (
    <Container size="lg" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh', padding: '40px 20px' }}>
      <Stack align="center" gap="xl">
        {/* ЛОГОТИП */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Title 
            className="glitch neon-glow" 
            data-text="[ CodeFlow ]" 
            order={1} 
            style={{ fontSize: '4rem', textAlign: 'center' }}
          >
            <Typewriter words={["[ CodeFlow ]"]} cursor cursorStyle="_" />
          </Title>
        </motion.div>

        {/* ПОДЗАГОЛОВОК */}
        <Text c="green" style={{ fontFamily: 'monospace', fontSize: '1.2rem', textAlign: 'center' }}>
          // СИСТЕМА ГОТОВА К ПОДКЛЮЧЕНИЮ
        </Text>

        {/* ОПИСАНИЕ */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Text size="xl" c="dimmed" maw={700} ta="center" style={{ lineHeight: 1.6 }}>
            Ты — последняя надежда сопротивления. Проникни в сеть <Text span fw={700} c="red">OmniCorp</Text> и разрушь систему изнутри.
            Овладей <Text span fw={700} c="green">Python</Text>, взломай защиту и стань легендой.
          </Text>
        </motion.div>

        {/* ГЛАВНАЯ КНОПКА */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button 
            component={Link} 
            to="/courses" 
            size="xl"
            leftSection={<IconRocket size={24} />}
            style={{ fontSize: '1.2rem', padding: '20px 40px' }}
          >
            НАЧАТЬ ОПЕРАЦИЮ
          </Button>
        </motion.div>

        {/* БЫСТРЫЙ ДОСТУП */}
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md" mt="xl" w="100%">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Card 
              component={Link} 
              to="/profile" 
              withBorder 
              p="lg" 
              className="cyber-card"
              style={{ cursor: 'pointer', textAlign: 'center' }}
            >
              <IconUser size={32} color="var(--neon-green)" style={{ marginBottom: '10px' }} />
              <Text fw={700} size="lg">ПРОФИЛЬ</Text>
              <Badge color="green" variant="light" mt="xs">{userXP} XP</Badge>
            </Card>
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Card 
              component={Link} 
              to="/shop" 
              withBorder 
              p="lg" 
              className="cyber-card"
              style={{ cursor: 'pointer', textAlign: 'center' }}
            >
              <IconShoppingCart size={32} color="var(--neon-green)" style={{ marginBottom: '10px' }} />
              <Text fw={700} size="lg">МАГАЗИН</Text>
              <Text size="xs" c="dimmed">Темы терминала</Text>
            </Card>
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <Card 
              component={Link} 
              to="/leaderboard" 
              withBorder 
              p="lg" 
              className="cyber-card"
              style={{ cursor: 'pointer', textAlign: 'center' }}
            >
              <IconTrophy size={32} color="var(--neon-green)" style={{ marginBottom: '10px' }} />
              <Text fw={700} size="lg">РЕЙТИНГ</Text>
              <Text size="xs" c="dimmed">Топ хакеров</Text>
            </Card>
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.0 }}
          >
            <Card 
              withBorder 
              p="lg" 
              className="cyber-card"
              style={{ textAlign: 'center', background: '#0a0a0a' }}
            >
              <Text size="xl" mb="xs">⬡</Text>
              <Text fw={700} size="sm">СТАТУС</Text>
              <Badge color="green" variant="dot" mt="xs">ONLINE</Badge>
            </Card>
          </motion.div>
        </SimpleGrid>

        {/* ФУТЕР */}
        <Text size="xs" c="dimmed" mt="xl" style={{ opacity: 0.5 }}>
          v2.0.0 | © 2026 CodeFlow Terminal | Powered by Pyodide & React
        </Text>
      </Stack>
    </Container>
  );
};

export default HomePage;