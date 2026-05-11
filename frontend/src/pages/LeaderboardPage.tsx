import { Container, Title, Table, Avatar, Group, Text, Button, Paper, Loader, Stack } from '@mantine/core';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { leaderboardApi, type LeaderboardEntry } from '../api/leaderboard';
import { authApi } from '../api/auth';

const LeaderboardPage = () => {
  const [users, setUsers] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const user = authApi.getUser();
    if (user?.id) {
      setCurrentUserId(user.id);
    }

    const fetchLeaderboard = async () => {
      try {
        const data = await leaderboardApi.getLeaderboard(50);
        setUsers(data);
      } catch (error) {
        console.error("Ошибка загрузки рейтинга:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (isLoading) {
    return (
      <Container size="sm" py="xl" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Stack align="center">
          <Loader color="green" />
          <Text c="green">Загрузка рейтинга...</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="sm" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2} c="green">// РЕЙТИНГ_ОПЕРАТИВНИКОВ</Title>
        <Button variant="subtle" component={Link} to="/">← На главную</Button>
      </Group>

      <Paper withBorder shadow="sm" radius="md">
        <Table verticalSpacing="sm" striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>#</Table.Th>
              <Table.Th>Оперативник</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>XP</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {users.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={3}>
                  <Text ta="center" c="dimmed" py="xl">Рейтинг пуст. Будь первым!</Text>
                </Table.Td>
              </Table.Tr>
            )}
            {users.map((user: LeaderboardEntry) => {
              const isMe = currentUserId !== null && user.userId === currentUserId;
              const initials = user.displayName
                ? user.displayName.slice(0, 2).toUpperCase()
                : '??';

              return (
                <Table.Tr key={user.userId} bg={isMe ? 'rgba(0, 255, 65, 0.1)' : undefined}>
                  <Table.Td>
                    {user.rank === 1 && "🥇"}
                    {user.rank === 2 && "🥈"}
                    {user.rank === 3 && "🥉"}
                    {user.rank > 3 && user.rank}
                  </Table.Td>
                  <Table.Td>
                    <Group gap="sm">
                      <Avatar color={isMe ? 'green' : 'blue'} radius="xl">{initials}</Avatar>
                      <Text fw={isMe ? 700 : 500}>
                        {user.displayName}{isMe ? ' (Вы)' : ''}
                      </Text>
                    </Group>
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'right' }}>
                    <Text fw={700} c="green">{user.totalXp}</Text>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Paper>
    </Container>
  );
};

export default LeaderboardPage;