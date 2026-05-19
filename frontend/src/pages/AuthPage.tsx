import { useState } from 'react';
import { Box, Button, TextInput, Stack, Title, Text, Tabs } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { MatrixRain } from '../components/MatrixRain';

const AuthPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setError('');
        setLoading(true);
        try {
            await authApi.login(email, password);
            navigate('/');
        } catch {
            setError('Неверный email или пароль');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        setError('');
        setLoading(true);
        try {
            await authApi.register(email, password, displayName);
            navigate('/');
        } catch {
            setError('Ошибка регистрации. Проверьте данные.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
            <MatrixRain opacity={0.03} />
            <Box style={{ width: 400, background: '#0a0a0a', border: '1px solid #00ff41', padding: 40, borderRadius: 4, position: 'relative', zIndex: 2 }}>
                <Title order={2} c="green" ff="monospace" ta="center" mb="xl">
          // CODEFLOW ACCESS
                </Title>

                <Tabs defaultValue="login" color="green">
                    <Tabs.List grow mb="xl">
                        <Tabs.Tab value="login" color="green">ВХОД</Tabs.Tab>
                        <Tabs.Tab value="register" color="green">РЕГИСТРАЦИЯ</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="login">
                        <Stack>
                            <TextInput label="EMAIL" placeholder="user@codeflow.io" value={email} onChange={e => setEmail(e.target.value)} styles={{ input: { background: '#000', borderColor: '#333', color: '#00ff41', fontFamily: 'monospace' }, label: { color: '#666', fontFamily: 'monospace' } }} />
                            <TextInput type="password" label="ПАРОЛЬ" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} styles={{ input: { background: '#000', borderColor: '#333', color: '#00ff41', fontFamily: 'monospace' }, label: { color: '#666', fontFamily: 'monospace' } }} />
                            {error && <Text c="red" size="sm" ff="monospace">{error}</Text>}
                            <Button onClick={handleLogin} loading={loading} color="green" fullWidth mt="md" styles={{ root: { fontFamily: 'monospace', letterSpacing: '0.1em' } }}>
                                ВОЙТИ В СИСТЕМУ
                            </Button>
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="register">
                        <Stack>
                            <TextInput label="ИМЯ ОПЕРАТИВНИКА" placeholder="Ghost_Hacker" value={displayName} onChange={e => setDisplayName(e.target.value)} styles={{ input: { background: '#000', borderColor: '#333', color: '#00ff41', fontFamily: 'monospace' }, label: { color: '#666', fontFamily: 'monospace' } }} />
                            <TextInput label="EMAIL" placeholder="user@codeflow.io" value={email} onChange={e => setEmail(e.target.value)} styles={{ input: { background: '#000', borderColor: '#333', color: '#00ff41', fontFamily: 'monospace' }, label: { color: '#666', fontFamily: 'monospace' } }} />
                            <TextInput type="password" label="ПАРОЛЬ" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} styles={{ input: { background: '#000', borderColor: '#333', color: '#00ff41', fontFamily: 'monospace' }, label: { color: '#666', fontFamily: 'monospace' } }} />
                            {error && <Text c="red" size="sm" ff="monospace">{error}</Text>}
                            <Button onClick={handleRegister} loading={loading} color="green" fullWidth mt="md" styles={{ root: { fontFamily: 'monospace', letterSpacing: '0.1em' } }}>
                                СОЗДАТЬ АГЕНТА
                            </Button>
                        </Stack>
                    </Tabs.Panel>
                </Tabs>
            </Box>
        </Box>
    );
};

export default AuthPage;