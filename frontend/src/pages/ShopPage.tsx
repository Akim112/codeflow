import { Container, Title, SimpleGrid, Card, Text, Button, Stack, Box, Loader } from '@mantine/core';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { terminalThemes } from '../data/shopItems';
import { sounds } from '../utils/audio';
import { motion } from 'framer-motion';
import { shopApi, type ShopItem } from '../api/shop';
import { usersApi } from '../api/users';

const ShopPage = () => {
  const [xp, setXp] = useState(0);
  const [ownedThemes, setOwnedThemes] = useState<string[]>(['classic']);
  const [activeTheme, setActiveTheme] = useState('classic');
  const [isLoading, setIsLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await usersApi.getMe();
        setXp(user.totalXp);
        localStorage.setItem('userXP', String(user.totalXp));
      } catch {
        setXp(Number(localStorage.getItem('userXP')) || 0);
      }

      try {
        const myItems = await shopApi.getMyItems();
        const ownedIds = myItems.map(item => item.id);
        if (!ownedIds.includes('classic')) ownedIds.unshift('classic');
        setOwnedThemes(ownedIds);
        localStorage.setItem('ownedThemes', JSON.stringify(ownedIds));
      } catch {
        setOwnedThemes(JSON.parse(localStorage.getItem('ownedThemes') || '["classic"]'));
      }

      setActiveTheme(localStorage.getItem('activeTheme') || 'classic');
      setIsLoading(false);
    };

    loadData();
  }, []);

  const handleBuy = async (themeId: string, _price: number) => {
    setPurchasing(themeId);
    try {
      await shopApi.purchase(themeId);

      const user = await usersApi.getMe();
      setXp(user.totalXp);
      localStorage.setItem('userXP', String(user.totalXp));

      const newOwned = [...ownedThemes, themeId];
      setOwnedThemes(newOwned);
      localStorage.setItem('ownedThemes', JSON.stringify(newOwned));
      sounds.success();
    } catch (error: any) {
      sounds.error();
      const msg = error?.message || 'Ошибка покупки';
      alert(`⚠️ ${msg}`);
    } finally {
      setPurchasing(null);
    }
  };

  const handleSelect = (themeId: string) => {
    localStorage.setItem('activeTheme', themeId);
    setActiveTheme(themeId);
    sounds.click();
    
    // Диспатчим кастомное событие для обновления App.tsx БЕЗ перезагрузки
    window.dispatchEvent(new Event('theme-changed'));
    window.dispatchEvent(new Event('storage'));
  };

  if (isLoading) {
    return (
      <Container size="lg" py="xl" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Loader color="green" />
        <Text ml="md" c="green">Загрузка магазина...</Text>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Stack gap={0}>
            <Title order={2} className="glitch" data-text="// ЧЕРНЫЙ_РЫНОК">
              // ЧЕРНЫЙ_РЫНОК
            </Title>
            <Text c="yellow" fw={700} size="xl" mt="xs">
              💰 БАЛАНС: {xp} XP
            </Text>
          </Stack>
          <Button variant="outline" color="green" component={Link} to="/" leftSection="←">
            ГЛАВНАЯ
          </Button>
        </div>

        {/* ТОВАРЫ */}
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
          {terminalThemes.map((theme, index) => {
            const isOwned = ownedThemes.includes(theme.id);
            const isActive = activeTheme === theme.id;
            const isPurchasing = purchasing === theme.id;

            return (
              <motion.div
                key={theme.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  withBorder
                  bg="#0a0a0a"
                  p="lg"
                  style={{
                    borderColor: isActive ? theme.color : '#1a1a1a',
                    borderWidth: isActive ? '2px' : '1px',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s'
                  }}
                  className={`cyber-card ${isActive ? 'boss-mode' : ''}`}
                >
                  {/* ПРЕВЬЮ */}
                  <Box
                    h={100}
                    mb="md"
                    style={{
                      background: theme.bg,
                      border: `2px solid ${theme.color}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <Text
                      c={theme.color}
                      fw={700}
                      size="lg"
                      style={{
                        textShadow: `0 0 10px ${theme.color}`
                      }}
                    >
                      PREVIEW
                    </Text>
                    
                    {/* Эффект сканлайнов на превью */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(rgba(255,255,255,0.03) 50%, transparent 50%)',
                        backgroundSize: '100% 4px',
                        pointerEvents: 'none'
                      }}
                    />
                  </Box>

                  {/* НАЗВАНИЕ */}
                  <Text fw={700} mb="xs" size="lg" ta="center">
                    {theme.name}
                  </Text>

                  {/* КНОПКА */}
                  {isOwned ? (
                    <Button
                      fullWidth
                      color={isActive ? 'green' : 'blue'}
                      variant={isActive ? 'filled' : 'light'}
                      onClick={() => handleSelect(theme.id)}
                    >
                      {isActive ? '✓ АКТИВНО' : 'ВЫБРАТЬ'}
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      variant="light"
                      color="yellow"
                      onClick={() => handleBuy(theme.id, theme.price)}
                      disabled={xp < theme.price || isPurchasing}
                      loading={isPurchasing}
                    >
                      {xp >= theme.price ? `КУПИТЬ ЗА ${theme.price} XP` : `🔒 ${theme.price} XP`}
                    </Button>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </SimpleGrid>

        {/* ИНФО */}
        <Card withBorder p="md" bg="#0a0a0a">
          <Text size="sm" c="dimmed">
            💡 <Text span fw={700}>СОВЕТ:</Text> Темы меняют весь интерфейс: неон, курсор, глитч-эффекты.
            Зарабатывай XP за прохождение миссий и покупай эксклюзивные темы!
          </Text>
        </Card>
      </Stack>
    </Container>
  );
};

export default ShopPage;