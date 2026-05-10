import { Container, Title, Table, Avatar, Group, Text, Button, Paper } from '@mantine/core';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api, syncServerStateToLocalStorage, type LeaderboardEntryDto } from '../api';

interface UserRank {
  id: string;
  name: string;
  xp: number;
  avatar: string;
  isMe?: boolean;
}

const LeaderboardPage = () => {
  const [users, setUsers] = useState<UserRank[]>([]);

  useEffect(() => {
    const load = async () => {
      await syncServerStateToLocalStorage().catch(() => undefined);
      const [board, me] = await Promise.all([api.getLeaderboard(50), api.getMe().catch(() => null)]);

      const mapped = board.map((u: LeaderboardEntryDto) => ({
        id: u.userId,
        name: u.displayName,
        xp: u.totalXp,
        avatar: u.displayName.slice(0, 2).toUpperCase(),
        isMe: me ? u.userId === me.id : false,
      }));
      setUsers(mapped);
    };

    load().catch(console.error);
  }, []);

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
              <Table.Th>Студент</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>XP</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {users.map((user: UserRank, index: number) => (
              <Table.Tr key={user.id} bg={user.isMe ? 'rgba(0, 255, 65, 0.1)' : undefined}>
                <Table.Td>
                  {index === 0 && '🥇'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                  {index > 2 && index + 1}
                </Table.Td>
                <Table.Td>
                  <Group gap="sm">
                    <Avatar color="green" radius="xl">{user.avatar}</Avatar>
                    <Text fw={user.isMe ? 700 : 500}>{user.name}</Text>
                  </Group>
                </Table.Td>
                <Table.Td style={{ textAlign: 'right' }}>
                  <Text fw={700} c="green">{user.xp}</Text>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>
    </Container>
  );
};

export default LeaderboardPage;
