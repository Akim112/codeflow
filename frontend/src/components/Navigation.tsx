import { Group, Button, Badge } from '@mantine/core';
import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '../api';

export const Navigation = () => {
  const location = useLocation();
  const [xp, setXp] = useState(0);

  useEffect(() => {
    api.getMe().then((me) => setXp(me.totalXp)).catch(() => setXp(0));
  }, [location]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <Group gap="xs" style={{ padding: '10px 20px', borderBottom: '1px solid #1a1a1a', background: '#0a0a0a' }}>
      <Button component={Link} to="/" variant={isActive('/') ? 'filled' : 'subtle'} size="compact-sm" color="green">ГЛАВНАЯ</Button>
      <Button component={Link} to="/courses" variant={isActive('/courses') ? 'filled' : 'subtle'} size="compact-sm" color="green">МИССИИ</Button>
      <Button component={Link} to="/profile" variant={isActive('/profile') ? 'filled' : 'subtle'} size="compact-sm" color="green">ПРОФИЛЬ</Button>
      <Button component={Link} to="/leaderboard" variant={isActive('/leaderboard') ? 'filled' : 'subtle'} size="compact-sm" color="green">РЕЙТИНГ</Button>
      <Button component={Link} to="/shop" variant={isActive('/shop') ? 'filled' : 'subtle'} size="compact-sm" color="yellow" leftSection="🛒">МАГАЗИН</Button>
      <Badge color="cyan" variant="dot" size="lg" style={{ marginLeft: 'auto' }}>{xp} XP</Badge>
    </Group>
  );
};
