import { Container, Title, Table, Avatar, Group, Text, Button, Paper } from '@mantine/core';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

// 1. Описываем структуру объекта пользователя для TypeScript
interface UserRank {
  id: number;
  name: string;
  xp: number;
  avatar: string;
  isMe?: boolean;
}

const fakeUsers: UserRank[] = [
  { id: 1, name: "AlexCode", xp: 2500, avatar: "AC" },
  { id: 2, name: "PythonMaster", xp: 2100, avatar: "PM" },
  { id: 3, name: "Ivan2025", xp: 1800, avatar: "IV" },
  { id: 4, name: "Kate_Dev", xp: 1500, avatar: "KD" },
];

const LeaderboardPage = () => {
  const [users, setUsers] = useState<UserRank[]>(fakeUsers);

  useEffect(() => {
    const myXP = Number(localStorage.getItem('userXP')) || 0;
    const me: UserRank = { id: 99, name: "Вы (Студент)", xp: myXP, avatar: "ME", isMe: true };
    
    const allUsers = [...fakeUsers, me].sort((a, b) => b.xp - a.xp);
    setUsers(allUsers);
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
            {/* 2. Указываем типы в map для исправления ошибки 7006 */}
            {users.map((user: UserRank, index: number) => (
              <Table.Tr key={user.id} bg={user.isMe ? 'rgba(0, 255, 65, 0.1)' : undefined}>
                <Table.Td>
                    {index === 0 && "🥇"}
                    {index === 1 && "🥈"}
                    {index === 2 && "🥉"}
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