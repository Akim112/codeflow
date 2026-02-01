import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Button, Title, Text, Paper, Group, Badge, Notification,
  Stack, Center, Box, Collapse, ActionIcon, Tabs, Kbd, Progress, Loader, Skeleton
} from '@mantine/core';
import {
  IconBulb, IconClock, IconTerminal, IconFileCode, IconArrowRight, IconPlayerPlay
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Typewriter } from 'react-simple-typewriter';

import { lessons } from '../data/lessons';
import { achievements, calculateStats } from '../data/achievements';
import { createGlitchState, glitchAvatars } from '../data/glitchCharacter';
import { TimeDebugger } from '../components/TimeDebugger';
import { InteractiveTheory } from '../components/InteractiveTheory';
import { HackerConsole } from '../components/HackerConsole';
import { MoralChoice } from '../components/MoralChoice';
import { awardMissionReputation, getXPMultiplier } from '../data/reputationSystem';
import { music } from '../utils/adaptiveMusic';
import { sounds } from '../utils/audio';
import { MatrixRain } from '../components/MatrixRain';
import { pyodideWorkerScript } from '../utils/workerScript';

// Ленивая загрузка Monaco Editor для ускорения первоначальной загрузки страницы
const Editor = lazy(() => import('@monaco-editor/react'));

declare global {
  interface Window { loadPyodide: any; }
}

const LessonPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const lessonId = Number(id);
  const currentLesson = lessons.find(l => l.id === lessonId);

  // --- СОСТОЯНИЯ ---
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPyodideReady, setIsPyodideReady] = useState(false);
  const [pyodideError, setPyodideError] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [glitchState, setGlitchState] = useState(createGlitchState({ type: 'welcome' }));
  const [notification, setNotification] = useState<{ type: 'success' | 'fail' | null, message: string }>({ type: null, message: '' });
  const [showDebugger, setShowDebugger] = useState(false);
  const [moralModalOpened, setMoralModalOpened] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [unlockedHints, setUnlockedHints] = useState<number>(0);
  const [cleanStreak, setCleanStreak] = useState(0);
  const [typingProgress, setTypingProgress] = useState(0);

  // Ref для отслеживания активных запросов к воркеру
  const pendingRequests = useRef<Map<string, { resolve: (val: any) => void, reject: (err: any) => void, output: string }>>(new Map());
  const workerRef = useRef<Worker | null>(null);

  const isBossMode = currentLesson?.isBoss || false;
  const themeColor = isBossMode ? 'red' : 'green';
  const terminalTextColor = isBossMode ? '#FF4136' : '#00FF41';
  const borderColor = isBossMode ? '#FF4136' : '#1A1B1E';

  // --- ИНИЦИАЛИЗАЦИЯ WORKER ---
  useEffect(() => {
    // Инициализируем воркер из Blob, что гарантирует загрузку скрипта
    const blob = new Blob([pyodideWorkerScript], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    workerRef.current = new Worker(workerUrl);

    workerRef.current.onmessage = (event) => {
      const { type, error, id, output, message } = event.data;

      if (type === 'READY') {
        console.log('Pyodide Worker READY');
        setIsPyodideReady(true);
        setPyodideError(null);
      } else if (type === 'LOG') {
        console.log('[Worker]', message);
      } else if (type === 'ERROR') {
        if (id && pendingRequests.current.has(id)) {
          const req = pendingRequests.current.get(id);
          req?.reject(new Error(error));
          pendingRequests.current.delete(id);
        } else {
          console.error('Pyodide Worker Error:', error);
          setPyodideError(error || 'Ошибка инициализации Python ядра');
        }
      } else if (type === 'OUTPUT') {
        if (id && pendingRequests.current.has(id)) {
          const req = pendingRequests.current.get(id)!;
          req.output += output + "\n";
          // Обновляем UI в реальном времени
          setOutput(prev => prev + output + "\n");
        }
      } else if (type === 'WithResult') {
        if (id && pendingRequests.current.has(id)) {
          const req = pendingRequests.current.get(id)!;
          req.resolve(req.output); // Возвращаем накопленный вывод
          pendingRequests.current.delete(id);
        }
      }
    };

    // Запускаем инициализацию в воркере
    workerRef.current.postMessage({ type: 'INIT' });

    // Таймаут на случай если воркер зависнет
    const timeoutId = setTimeout(() => {
      if (!isPyodideReady) {
        setPyodideError('Превышено время ожидания загрузки ядра. Обновите страницу.');
      }
    }, 45000);

    return () => {
      clearTimeout(timeoutId);
      workerRef.current?.terminate();
      URL.revokeObjectURL(workerUrl);
    };
  }, []);

  // --- ИНИЦИАЛИЗАЦИЯ УРОКА ---
  useEffect(() => {
    if (currentLesson) {
      setCode(currentLesson.initialCode);
      setNotification({ type: null, message: '' });
      setIsError(false);
      setErrorCount(0);
      setUnlockedHints(0);
      setShowDebugger(false);
      setTypingProgress(0);

      setCleanStreak(Number(localStorage.getItem('cleanStreak') || '0'));

      if (isBossMode) {
        setTimeLeft(60);
        document.body.setAttribute('data-boss-mode', 'true');
        music.start('boss');
        setOutput("⚠️ WARNING: HIGH-LEVEL ENCRYPTION DETECTED\n⚠️ SYSTEM OVERRIDE IN PROGRESS...\n");
        sounds.siren();
        setGlitchState(createGlitchState({ type: 'boss', isBoss: true }));
      } else {
        setTimeLeft(null);
        document.body.removeAttribute('data-boss-mode');
        music.start('ambient');
        setOutput("");
        setGlitchState(createGlitchState({ type: 'welcome' }));
      }

      return () => {
        music.stop();
        document.body.removeAttribute('data-boss-mode');
      };
    }
  }, [lessonId, isBossMode, currentLesson]);

  // --- ТАЙМЕР ---
  useEffect(() => {
    if (timeLeft === 0 && !notification.type) {
      sounds.error();
      setIsError(true);
      setNotification({ type: 'fail', message: 'СИСТЕМА ОБНАРУЖЕНА! Время истекло.' });
    }
    if (timeLeft && timeLeft > 0 && !notification.type) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, notification.type]);

  // --- АНИМАЦИЯ ПРОГРЕССА НАБОРА ---
  useEffect(() => {
    if (currentLesson) {
      const progress = (code.length / Math.max(currentLesson.expectedOutput.length * 3, 50)) * 100;
      setTypingProgress(Math.min(progress, 100));
    }
  }, [code, currentLesson]);

  // --- ПОКУПКА ПОДСКАЗОК ---
  const buyHint = useCallback(() => {
    const currentXP = Number(localStorage.getItem('userXP')) || 0;
    const price = unlockedHints === 0 ? 50 : 150;

    if (currentXP >= price) {
      localStorage.setItem('userXP', String(currentXP - price));
      setUnlockedHints(prev => prev + 1);
      sounds.success();
      setGlitchState(createGlitchState({ type: 'hint' }));
    } else {
      sounds.error();
      alert("НЕДОСТАТОЧНО XP!");
    }
  }, [unlockedHints]);

  // --- ЗАПУСК КОДА ---
  const handleRunCode = useCallback(async () => {
    if (timeLeft === 0 || !currentLesson || !isPyodideReady || !workerRef.current) return;

    sounds.click();
    music.start('coding');
    setIsLoading(true);
    setIsError(false);
    setOutput(`> ИНИЦИАЛИЗАЦИЯ ВЗЛОМА...\n> АНАЛИЗ ЗАЩИТЫ...\n`);
    setNotification({ type: null, message: '' });

    await new Promise(res => setTimeout(res, 800));

    try {
      const resultOutput = await new Promise<string>((resolve, reject) => {
        const id = Date.now().toString() + Math.random().toString();
        pendingRequests.current.set(id, { resolve, reject, output: "" });

        workerRef.current?.postMessage({
          type: 'RUN_CODE',
          code,
          id
        });
      });

      if (resultOutput.trim() === currentLesson.expectedOutput) {
        // УСПЕХ
        music.start('victory');
        sounds.success();
        setGlitchState(createGlitchState({ type: 'success', isSuccess: true }));

        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.6 },
          colors: isBossMode ? ['#FF0000', '#FF4136', '#FF6B6B'] : ['#00FF41', '#00CC33', '#FFFFFF'],
          shapes: ['star', 'circle'],
        });

        // Ещё confetti волны
        setTimeout(() => confetti({ particleCount: 100, angle: 60, spread: 55, origin: { x: 0 } }), 200);
        setTimeout(() => confetti({ particleCount: 100, angle: 120, spread: 55, origin: { x: 1 } }), 400);

        // XP с множителем
        const finalXP = Math.floor(currentLesson.xp * getXPMultiplier());
        localStorage.setItem('userXP', String((Number(localStorage.getItem('userXP')) || 0) + finalXP));

        // Репутация
        awardMissionReputation(lessonId, errorCount === 0);

        // Прогресс
        const completedRaw = localStorage.getItem('completedLessons');
        const completed: number[] = completedRaw ? JSON.parse(completedRaw) : [];
        if (!completed.includes(lessonId)) {
          completed.push(lessonId);
          localStorage.setItem('completedLessons', JSON.stringify(completed));
        }

        // Clean streak
        const newCleanStreak = errorCount === 0 ? cleanStreak + 1 : 0;
        setCleanStreak(newCleanStreak);
        localStorage.setItem('cleanStreak', String(newCleanStreak));

        // Fast boss kill
        if (isBossMode && timeLeft && timeLeft > 30) {
          localStorage.setItem('fastBossKill', 'true');
        }

        // Проверка достижений
        let achievementMessage = "";
        const stats = calculateStats();
        const unlockedRaw = localStorage.getItem('unlockedAchievements');
        let unlocked: string[] = unlockedRaw ? JSON.parse(unlockedRaw) : [];

        achievements.forEach(ach => {
          if (!unlocked.includes(ach.id) && ach.condition(stats)) {
            unlocked.push(ach.id);
            localStorage.setItem('unlockedAchievements', JSON.stringify(unlocked));
            achievementMessage += `\n🏆 ДОСТИЖЕНИЕ: ${ach.title}!`;
            sounds.success();
          }
        });

        setNotification({
          type: 'success',
          message: `ДОСТУП ПОЛУЧЕН! +${finalXP} XP${achievementMessage}`
        });

        // Моральный выбор на боссах
        if (isBossMode) {
          setTimeout(() => setMoralModalOpened(true), 2000);
        }

        setErrorCount(0);
      } else {
        // НЕВЕРНЫЙ ОТВЕТ
        handleError(`> ОШИБКА: Неверный результат.\n> ОЖИДАЛОСЬ: ${currentLesson.expectedOutput}\n> ПОЛУЧЕНО: ${resultOutput.trim()}`);
      }
    } catch (err: any) {
      handleError(`> СИСТЕМНЫЙ СБОЙ:\n${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [code, currentLesson, timeLeft, isPyodideReady, errorCount, cleanStreak, lessonId, isBossMode]);

  const handleError = (message: string) => {
    sounds.error();
    setIsError(true);
    setErrorCount(prev => prev + 1);
    setCleanStreak(0);
    localStorage.setItem('cleanStreak', '0');
    setGlitchState(createGlitchState({ type: 'error', isError: true, errorCount: errorCount + 1 }));
    setOutput(message);
    setNotification({ type: 'fail', message: 'ВЗЛОМ ПРЕРВАН!' });
    music.start('ambient');
  };

  // Горячие клавиши
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunCode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRunCode]);

  if (!currentLesson) {
    return (
      <Center h="100vh" style={{ background: '#000' }}>
        <Stack align="center">
          <Text c="red" size="xl" className="glitch" data-text="МИССИЯ НЕ НАЙДЕНА">
            МИССИЯ НЕ НАЙДЕНА
          </Text>
          <Button onClick={() => navigate('/courses')} variant="outline" color="red">
            Вернуться к миссиям
          </Button>
        </Stack>
      </Center>
    );
  }

  const nextLesson = lessons.find(l => l.id === lessonId + 1);

  return (
    <Box
      className={isError ? 'shake-screen' : ''}
      style={{
        height: '100vh',
        background: '#050505',
        transition: 'all 0.3s',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Фоновые эффекты для босса */}
      {isBossMode && <MatrixRain opacity={0.02} color="#ff4136" speed={25} />}

      <Stack gap={0} style={{ height: '100%', position: 'relative', zIndex: 1 }}>
        <MoralChoice
          opened={moralModalOpened}
          onClose={() => setMoralModalOpened(false)}
          chapter={currentLesson.chapter}
        />

        {/* HEADER */}
        <Group
          justify="space-between"
          p="sm"
          style={{
            borderBottom: `1px solid ${borderColor}`,
            background: 'rgba(10,10,10,0.9)',
            backdropFilter: 'blur(10px)',
            zIndex: 10,
          }}
        >
          <Group gap="xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Text
                c={themeColor}
                fw={700}
                className="glitch"
                data-text={isBossMode ? "⚠️ BOSS_LEVEL" : "CODEFLOW_TERMINAL"}
                ff="Orbitron, sans-serif"
              >
                {isBossMode ? "⚠️ BOSS_LEVEL" : "CODEFLOW_TERMINAL"}
              </Text>
            </motion.div>

            {timeLeft !== null && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' }}
              >
                <Badge
                  color="red"
                  variant="filled"
                  size="lg"
                  leftSection={<IconClock size={14} />}
                  className={timeLeft < 10 ? 'warning-flash' : ''}
                  style={{
                    boxShadow: timeLeft < 10 ? '0 0 20px rgba(255,0,0,0.5)' : 'none',
                  }}
                >
                  {timeLeft}s
                </Badge>
              </motion.div>
            )}

            {/* Прогресс набора кода */}
            <Box style={{ width: 100 }}>
              <Progress
                value={typingProgress}
                color={themeColor}
                size="xs"
                animated
              />
            </Box>
          </Group>

          <Group gap="xs">
            {!isPyodideReady && !pyodideError && (
              <Badge color="yellow" variant="light" leftSection={<Loader size={10} />}>
                Загрузка Python...
              </Badge>
            )}

            {pyodideError && (
              <Badge color="red" variant="filled" title={pyodideError}>
                ⚠️ Python недоступен
              </Badge>
            )}

            <Group gap={4}>
              <Kbd size="xs">Ctrl</Kbd>
              <Text size="xs" c="dimmed">+</Text>
              <Kbd size="xs">Enter</Kbd>
            </Group>

            <Button
              size="xs"
              color="yellow"
              variant="light"
              leftSection={<IconBulb size={14} />}
              onClick={buyHint}
              disabled={unlockedHints >= 2 || timeLeft === 0}
            >
              {unlockedHints === 0 ? "ПОДСКАЗКА (50 XP)" : unlockedHints === 1 ? "РЕШЕНИЕ (150 XP)" : "ОТКРЫТО"}
            </Button>

            {currentLesson.hasDebugger && (
              <ActionIcon
                variant="light"
                color="cyan"
                onClick={() => setShowDebugger(!showDebugger)}
                title="Time Debugger"
              >
                <IconClock size={18} />
              </ActionIcon>
            )}

            <Button
              size="xs"
              variant="subtle"
              color="gray"
              onClick={() => navigate('/courses')}
            >
              EXIT
            </Button>
          </Group>
        </Group>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* LEFT PANEL */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
            style={{
              width: '40%',
              display: 'flex',
              flexDirection: 'column',
              borderRight: `1px solid ${borderColor}`,
              background: 'rgba(10,10,10,0.8)',
              backdropFilter: 'blur(5px)',
            }}
          >
            <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>

              {/* Глитч AI */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Paper
                  p="md"
                  mb="md"
                  bg="#001a00"
                  style={{
                    border: '1px solid #00ff41',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <Badge pos="absolute" top={-10} left={10} color="green" variant="filled" size="xs">
                    GLITCH_AI [{glitchState.mood.toUpperCase()}]
                  </Badge>
                  <pre style={{ fontSize: '10px', color: '#00ff41', margin: 0, lineHeight: 1 }}>
                    {glitchAvatars[glitchState.mood]}
                  </pre>
                  <Text size="xs" c="#00ff41" mt="sm" style={{ fontStyle: 'italic', fontFamily: 'monospace' }}>
                    <Typewriter
                      key={glitchState.quote}
                      words={[glitchState.quote]}
                      typeSpeed={30}
                      cursor
                      cursorStyle="_"
                    />
                  </Text>

                  {/* Сканлайн эффект */}
                  <Box
                    className="hologram"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      pointerEvents: 'none',
                    }}
                  />
                </Paper>
              </motion.div>

              {/* Подсказки */}
              <AnimatePresence>
                {unlockedHints > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <Paper p="md" mb="md" bg="#1a1a00" style={{ border: '1px solid #ffaa00' }}>
                      <Text size="xs" c="yellow" fw={700}>
                        {unlockedHints === 1 ? "💡 ПОДСКАЗКА:" : "📝 РЕШЕНИЕ:"}
                      </Text>
                      <Text size="sm" c="yellow.3" style={{ whiteSpace: 'pre-wrap' }}>
                        {unlockedHints === 1 ? currentLesson.hint : currentLesson.hint2}
                      </Text>
                    </Paper>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Дебаггер */}
              <Collapse in={showDebugger}>
                <Box mb="md">
                  <TimeDebugger code={code} onClose={() => setShowDebugger(false)} />
                </Box>
              </Collapse>

              {/* Информация о миссии */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Badge variant="outline" color={themeColor} mb="xs">
                  {currentLesson.chapter}
                </Badge>
                <Title order={2} c={isBossMode ? 'red' : 'white'} mb="md">
                  {currentLesson.title}
                </Title>

                <Paper
                  p="md"
                  bg="#111"
                  radius="xs"
                  mb="md"
                  style={{ borderLeft: `3px solid ${isBossMode ? '#ff4136' : '#2f9e44'}` }}
                >
                  <Text size="xs" c={themeColor} mb={5} fw={700}>MISSION_DETAILS:</Text>
                  <InteractiveTheory
                    text={currentLesson.description}
                    onCodeClick={(c) => setCode(prev => prev + "\n" + c)}
                  />
                </Paper>

                <Paper p="md" bg="#161616" radius="xs" mb="xl">
                  <Text c={themeColor} size="xs" fw={700} mb={5}>OBJECTIVE:</Text>
                  <Text size="sm">{currentLesson.task}</Text>
                </Paper>
              </motion.div>

              {/* Кнопка запуска */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleRunCode}
                  loading={isLoading}
                  fullWidth
                  size="lg"
                  color={pyodideError ? 'red' : themeColor}
                  disabled={timeLeft === 0 || !isPyodideReady || !!pyodideError}
                  leftSection={<IconPlayerPlay size={20} />}
                  styles={{
                    root: {
                      boxShadow: `0 0 20px ${isBossMode ? 'rgba(255,65,54,0.3)' : 'rgba(0,255,65,0.3)'}`,
                    }
                  }}
                >
                  {pyodideError ? "⚠️ Python недоступен" : isBossMode ? "⚡ ВЗЛОМАТЬ ЯДРО" : "▶ ВЫПОЛНИТЬ ВЗЛОМ"}
                </Button>
              </motion.div>

              {/* Уведомление о результате */}
              <AnimatePresence>
                {notification.type && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: 'spring' }}
                  >
                    <Notification
                      mt="xl"
                      withCloseButton={false}
                      color={notification.type === 'success' ? 'green' : 'red'}
                      title={notification.type === 'success' ? '✓ ACCESS GRANTED' : '✗ ACCESS DENIED'}
                      style={{
                        boxShadow: notification.type === 'success'
                          ? '0 0 30px rgba(0,255,65,0.3)'
                          : '0 0 30px rgba(255,65,54,0.3)',
                      }}
                    >
                      <Text size="sm" style={{ whiteSpace: 'pre-line' }}>{notification.message}</Text>
                      {notification.type === 'success' && nextLesson && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                        >
                          <Button
                            fullWidth
                            mt="sm"
                            variant="white"
                            color={themeColor}
                            size="sm"
                            onClick={() => navigate(`/lesson/${lessonId + 1}`)}
                            rightSection={<IconArrowRight size={16} />}
                          >
                            СЛЕДУЮЩАЯ МИССИЯ
                          </Button>
                        </motion.div>
                      )}
                      {notification.type === 'success' && !nextLesson && (
                        <Button
                          fullWidth
                          mt="sm"
                          variant="white"
                          color="yellow"
                          size="sm"
                          onClick={() => navigate('/profile')}
                        >
                          🏆 ВЫ ПРОШЛИ ИГРУ!
                        </Button>
                      )}
                    </Notification>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* RIGHT PANEL */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
            style={{ width: '60%', display: 'flex', flexDirection: 'column' }}
          >
            {/* Редактор кода */}
            <div style={{ height: '60%', position: 'relative' }}>
              <Suspense fallback={
                <Skeleton
                  height="100%"
                  animate
                  style={{
                    background: '#1e1e1e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Center h="100%">
                    <Stack align="center" gap="sm">
                      <Loader color="green" size="lg" />
                      <Text c="green" size="sm" ff="monospace">Загрузка редактора...</Text>
                    </Stack>
                  </Center>
                </Skeleton>
              }>
                <Editor
                  height="100%"
                  defaultLanguage="python"
                  theme="vs-dark"
                  value={code}
                  onChange={(v) => setCode(v || "")}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 16,
                    fontFamily: 'JetBrains Mono',
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    cursorBlinking: 'phase',
                    cursorSmoothCaretAnimation: 'on',
                  }}
                />
              </Suspense>

              {/* Декоративная линия */}
              <Box
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '3px',
                  height: '100%',
                  background: `linear-gradient(180deg, ${themeColor === 'red' ? '#ff4136' : '#00ff41'} 0%, transparent 100%)`,
                  opacity: 0.5,
                }}
              />
            </div>

            {/* Табы вывода */}
            <div style={{ height: '40%', background: '#050505', borderTop: `1px solid ${borderColor}` }}>
              <Tabs defaultValue="output" color="green">
                <Tabs.List>
                  <Tabs.Tab value="output" leftSection={<IconFileCode size={14} />}>
                    PYTHON_OUTPUT
                  </Tabs.Tab>
                  <Tabs.Tab value="console" leftSection={<IconTerminal size={14} />}>
                    SYSTEM_CONSOLE
                  </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="output" p="sm" style={{ height: 'calc(100% - 40px)', overflowY: 'auto' }}>
                  <pre style={{
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    color: pyodideError ? '#FF4136' : terminalTextColor,
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '14px',
                    textShadow: `0 0 10px ${pyodideError ? '#FF4136' : terminalTextColor}`,
                  }}>
                    {pyodideError
                      ? `> ОШИБКА СИСТЕМЫ\n> ${pyodideError}\n>\n> Попробуйте:\n> 1. Обновить страницу (F5)\n> 2. Проверить подключение к интернету\n> 3. Использовать VPN если CDN заблокирован`
                      : output || '> Ожидание выполнения кода..._'}
                  </pre>
                </Tabs.Panel>

                <Tabs.Panel value="console" p={0} style={{ height: 'calc(100% - 40px)' }}>
                  <HackerConsole />
                </Tabs.Panel>
              </Tabs>
            </div>
          </motion.div>
        </div>
      </Stack>
    </Box>
  );
};

export default LessonPage;