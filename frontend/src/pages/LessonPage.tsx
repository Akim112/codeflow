import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { useMediaQuery } from '@mantine/hooks';
import { gsap } from 'gsap';
import { useParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Button, Title, Text, Paper, Group, Badge, Notification,
  Stack, Center, Box, Tabs, Kbd, Progress, Loader, Skeleton
} from '@mantine/core';
import {
  IconBulb, IconClock, IconTerminal, IconFileCode, IconArrowRight, IconPlayerPlay, IconBug, IconHeart, IconShieldLock
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Typewriter } from 'react-simple-typewriter';

import { coursesApi } from '../api/courses';
import { progressApi } from '../api/progress';

import { achievements, calculateStats } from '../data/achievements';
import { createGlitchState, glitchAvatars } from '../data/glitchCharacter';

import { InteractiveTheory } from '../components/InteractiveTheory';
import { HackerConsole } from '../components/HackerConsole';
import { MoralChoice } from '../components/MoralChoice';
import { StoryOutcome } from '../components/StoryOutcome';
import { awardMissionReputation, getXPMultiplier } from '../data/reputationSystem';
import { getBossTimeLimit, getBossAttemptData, recordBossFailure, canAttemptBoss, getCooldownRemaining, getCooldownTotal, resetBossOnSuccess, getMaxAttempts, formatCooldown } from '../data/bossSystem';
import { music } from '../utils/adaptiveMusic';
import { sounds } from '../utils/audio';
import { MatrixRain } from '../components/MatrixRain';
import { pyodideWorkerScript } from '../utils/workerScript';
import { Debugger } from '../components/Debugger';

// Ленивая загрузка Monaco Editor для ускорения первоначальной загрузки страницы
const Editor = lazy(() => import('@monaco-editor/react'));

declare global {
  interface Window { loadPyodide: any; }
}

const LessonPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const lessonId = Number(id);

  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [pageLoading, setPageLoading] = useState(true);

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
  const [activeTab, setActiveTab] = useState<string | null>('output');
  const [moralModalOpened, setMoralModalOpened] = useState(false);
  const [storyOutcomeOpened, setStoryOutcomeOpened] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [unlockedHints, setUnlockedHints] = useState<number>(0);
  const [cleanStreak, setCleanStreak] = useState(0);
  const [typingProgress, setTypingProgress] = useState(0);
  const [traceData, setTraceData] = useState<any[] | null>(null);
  const [bossAttempt, setBossAttempt] = useState(1);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const [showBossBriefing, setShowBossBriefing] = useState(false);

  const [nextLesson, setNextLesson] = useState<any>(null);

  // Ref для отслеживания активных запросов к воркеру
  const pendingRequests = useRef<Map<string, { resolve: (val: any) => void, reject: (err: any) => void, output: string }>>(new Map());
  const workerRef = useRef<Worker | null>(null);
  const redFlashRef = useRef<HTMLDivElement>(null);
  const isRunningRef = useRef(false); // Мьютекс для предотвращения двойного запуска

  const isMobile = useMediaQuery('(max-width: 1024px)');

  const isBossMode = currentLesson?.isBoss || false;
  const themeColor = isBossMode ? 'red' : 'green';
  const terminalTextColor = isBossMode ? '#FF4136' : '#00FF41';
  const borderColor = isBossMode ? '#FF4136' : '#1A1B1E';

  useEffect(() => {
    const fetchLesson = async () => {
      setPageLoading(true);
      try {
        const data = await coursesApi.getLessonById(lessonId);
        setCurrentLesson(data);
        if (data && data.initialCode) {
          setCode(data.initialCode);
        }
        // Проверяем есть ли следующий урок в БД
        try {
          const next = await coursesApi.getLessonById(lessonId + 1);
          setNextLesson(next);
        } catch {
          setNextLesson(null);
        }
      } catch (error) {
        console.error("Ошибка загрузки урока:", error);
      } finally {
        setPageLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId]);

  // --- ИНИЦИАЛИЗАЦИЯ WORKER ---
  // --- ИНИЦИАЛИЗАЦИЯ WORKER ---
  const initWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
    }

    setIsPyodideReady(false);
    setPyodideError(null);

    // Инициализируем воркер из Blob, что гарантирует загрузку скрипта
    const blob = new Blob([pyodideWorkerScript], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    workerRef.current = new Worker(workerUrl);

    workerRef.current.onmessage = (event) => {
      const { type, error, id, output, message, result, trace } = event.data;

      if (type === 'READY') {
        console.log('Pyodide Worker READY');
        setIsPyodideReady(true);
        setPyodideError(null);
      } else if (type === 'LOG') {
        console.log('[Worker]', message);
      } else if (type === 'ERROR') {
        if (id && pendingRequests.current.has(id)) {
          console.error('Worker request failed:', error);
          const req = pendingRequests.current.get(id);
          req?.reject(new Error(error));
          pendingRequests.current.delete(id);
        } else {
          console.error('Pyodide Worker Fatal Error:', error);
          // Only set error if not already ready, or if it's a critical failure
          setPyodideError(error || 'Ошибка инициализации Python ядра');
        }
      } else if (type === 'OUTPUT') {
        if (id && pendingRequests.current.has(id)) {
          const req = pendingRequests.current.get(id)!;
          // Store raw output
          req.output += output + "\n";
          // Start realtime update
          setOutput(prev => prev + output + "\n");
        }
      } else if (type === 'WithResult') {
        if (id && pendingRequests.current.has(id)) {
          const req = pendingRequests.current.get(id)!;
          req.resolve(req.output); // Возвращаем накопленный вывод
          pendingRequests.current.delete(id);
        }
      } else if (type === 'DEBUG_TRACE') {
        // Handle debug trace (future implementation)
        if (id && pendingRequests.current.has(id)) {
          const req = pendingRequests.current.get(id)!;
          // We resolve with the trace object for the debugger
          req.resolve({ output: req.output, trace });
          pendingRequests.current.delete(id);
        }
      }
    };

    // Запускаем инициализацию в воркере
    workerRef.current.postMessage({ type: 'INIT' });

    // Таймаут на случай если воркер зависнет
    const timeoutId = setTimeout(() => {
      if (!isPyodideReady && !workerRef.current) { // Check if we haven't already retried or succeeded
        setPyodideError('Превышено время ожидания загрузки ядра. Нажмите "Переподключить".');
      }
    }, 45000);

    return () => {
      clearTimeout(timeoutId);
      workerRef.current?.terminate();
      URL.revokeObjectURL(workerUrl);
    };
  }, []);

  useEffect(() => {
    const cleanup = initWorker();
    return cleanup;
  }, [initWorker]);

  const handleRetryConnection = () => {
    console.log('Retrying connection...');
    initWorker();
  };

  // --- ИНИЦИАЛИЗАЦИЯ УРОКА ---
  useEffect(() => {
    if (currentLesson) {
      setCode(currentLesson.initialCode);
      setNotification({ type: null, message: '' });
      setIsError(false);
      setErrorCount(0);
      setUnlockedHints(0);
      setActiveTab('output');
      setTypingProgress(0);

      setCleanStreak(Number(localStorage.getItem('cleanStreak') || '0'));

      if (isBossMode) {
        // Проверяем доступность босса (cooldown)
        const canPlay = canAttemptBoss(lessonId);
        const remaining = getCooldownRemaining(lessonId);
        const attemptData = getBossAttemptData(lessonId);

        setBossAttempt(attemptData.attempt);
        setCooldownLeft(remaining);

        if (!canPlay && remaining > 0) {
          // Босс на кулдауне
          setTimeLeft(null);
          setGlitchState(createGlitchState({ type: 'cooldown' }));
          setOutput(`⏳ СИСТЕМА ЗАБЛОКИРОВАНА\n⏳ Следующая попытка через: ${formatCooldown(remaining)}\n\n> Перезагрузите страницу когда время выйдет.`);
          document.body.setAttribute('data-boss-mode', 'true');
          music.start('ambient');
        } else {
          // Доступен — показать брифинг и запустить
          const timeLimit = getBossTimeLimit(lessonId);
          setTimeLeft(timeLimit);
          setShowBossBriefing(true);
          document.body.setAttribute('data-boss-mode', 'true');
          music.start('boss');
          setOutput(`⚠️ WARNING: HIGH-LEVEL ENCRYPTION DETECTED\n⚠️ SYSTEM OVERRIDE IN PROGRESS...\n⏱️ ВРЕМЯ: ${timeLimit} секунд\n❤️ ПОПЫТКА: ${attemptData.attempt} из ${getMaxAttempts()}\n`);
          sounds.siren();
          setGlitchState(createGlitchState({ type: 'boss', isBoss: true }));
        }
      } else {
        setTimeLeft(null);
        setCooldownLeft(0);
        setShowBossBriefing(false);
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
    if (timeLeft === 0 && !notification.type && isBossMode) {
      sounds.error();
      setIsError(true);

      // Записываем провал и получаем информацию о следующей попытке
      const result = recordBossFailure(lessonId);

      if (result.isLocked && result.cooldownSeconds >= 28800) {
        // Все 5 попыток использованы
        setNotification({
          type: 'fail',
          message: `СИСТЕМА ОБНАРУЖЕНА! Все попытки исчерпаны.\n⏳ Следующая серия попыток через ${formatCooldown(result.cooldownSeconds)}.`
        });
        setCooldownLeft(result.cooldownSeconds);
      } else if (result.isLocked) {
        // Есть кулдаун перед следующей попыткой
        setNotification({
          type: 'fail',
          message: `ВРЕМЯ ИСТЕКЛО! Попытка ${result.nextAttempt - 1} из ${getMaxAttempts()} провалена.\n⏳ Следующая попытка через ${formatCooldown(result.cooldownSeconds)}.`
        });
        setCooldownLeft(result.cooldownSeconds);
        setBossAttempt(result.nextAttempt);
      } else {
        // Мгновенная повторная попытка (вторая жизнь) — автоматический перезапуск таймера
        setBossAttempt(result.nextAttempt);
        setNotification({
          type: 'fail',
          message: `ВРЕМЯ ИСТЕКЛО! Попытка ${result.nextAttempt - 1} из ${getMaxAttempts()}.\n❤️ Перезапуск через 3 сек...`
        });
        setTimeout(() => {
          const newTimeLimit = getBossTimeLimit(lessonId);
          setTimeLeft(newTimeLimit);
          setIsError(false);
          setNotification({ type: null, message: '' });
          setOutput(`⚠️ ПОВТОРНАЯ ПОПЫТКА\n⏱️ ВРЕМЯ: ${newTimeLimit} секунд\n❤️ ПОПЫТКА: ${result.nextAttempt} из ${getMaxAttempts()}\n`);
        }, 3000);
      }
    }
    if (timeLeft && timeLeft > 0 && (notification.type !== 'success')) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, notification.type, isBossMode, lessonId]);

  // --- КУЛДАУН ТАЙМЕР ---
  useEffect(() => {
    if (cooldownLeft > 0) {
      const timer = setTimeout(() => {
        const remaining = getCooldownRemaining(lessonId);
        setCooldownLeft(remaining);
        if (remaining <= 0) {
          // Кулдаун закончился — автоматический перезапуск миссии
          const newTimeLimit = getBossTimeLimit(lessonId);
          setTimeLeft(newTimeLimit);
          setIsError(false);
          setNotification({ type: null, message: '' });
          setOutput(`✅ СИСТЕМА РАЗБЛОКИРОВАНА!\n⏱️ ВРЕМЯ: ${newTimeLimit} секунд\n❤️ ПОПЫТКА: ${bossAttempt} из ${getMaxAttempts()}\n\n> Удачи, оператор.`);
          sounds.success();
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownLeft, lessonId, bossAttempt]);

  // --- АНИМАЦИЯ ПРОГРЕССА НАБОРА ---
  useEffect(() => {
    if (currentLesson) {
      const progress = (code.length / Math.max(currentLesson.expectedOutput.length * 3, 50)) * 100;
      setTypingProgress(Math.min(progress, 100));
    }
  }, [code, currentLesson]);

  // --- ПОКУПКА ПОДСКАЗОК ---
  const buyHint = useCallback(async () => {
    const price = unlockedHints === 0 ? 50 : 150;

    try {
      const result = await progressApi.purchaseHint(price);
      // Update cached XP from server response
      localStorage.setItem('userXP', String(result.totalXp));
      setUnlockedHints(prev => prev + 1);
      sounds.success();
      setGlitchState(createGlitchState({ type: 'hint' }));
    } catch (err: any) {
      sounds.error();
      alert(err.message || "НЕДОСТАТОЧНО XP!");
    }
  }, [unlockedHints]);

  // --- ОБРАБОТКА ОШИБОК ---
  const handleError = useCallback((message: string) => {
    sounds.error();
    setIsError(true);
    setErrorCount(prev => prev + 1);
    setCleanStreak(0);
    localStorage.setItem('cleanStreak', '0');
    setGlitchState(createGlitchState({ type: 'error', isError: true, errorCount: errorCount + 1 }));
    setOutput(message);

    // В боссовом режиме: уменьшить жизни и НЕ останавливать таймер
    if (isBossMode && currentLesson?.isBoss) {
      const result = recordBossFailure(lessonId);
      setBossAttempt(result.nextAttempt);

      if (result.isLocked && result.cooldownSeconds >= 28800) {
        // Все жизни потрачены — полная блокировка
        setTimeLeft(0);
        setNotification({
          type: 'fail',
          message: `ВСЕ ЖИЗНИ ПОТЕРЯНЫ! \n⏳ Следующая серия попыток через ${formatCooldown(result.cooldownSeconds)}.`
        });
        setCooldownLeft(result.cooldownSeconds);
        music.start('ambient');
        return;
      } else if (result.isLocked) {
        // Есть кулдаун — остановить
        setTimeLeft(0);
        setNotification({
          type: 'fail',
          message: `ЖИЗНЬ ПОТЕРЯНА! [${getMaxAttempts() - result.nextAttempt + 1}/${getMaxAttempts()}]\n⏳ Следующая попытка через ${formatCooldown(result.cooldownSeconds)}.`
        });
        setCooldownLeft(result.cooldownSeconds);
        music.start('ambient');
        return;
      }

      // Мгновенная жизнь — показать предупреждение на 3 секунды, таймер НЕ останавливается
      setNotification({ type: 'fail', message: `ОШИБКА! ЖИЗНЬ ПОТЕРЯНА [${getMaxAttempts() - result.nextAttempt + 1}/${getMaxAttempts()}]` });
      // Автоочистка через 3 сек чтобы таймер не стоял
      setTimeout(() => {
        setNotification(prev => prev.type === 'fail' ? { type: null, message: '' } : prev);
        setIsError(false);
      }, 3000);
      return;
    }

    setNotification({ type: 'fail', message: 'ВЗЛОМ ПРЕРВАН!' });
    music.start('ambient');

    // GSAP Shake & Red Flash Effect
    const isBoss = currentLesson?.isBoss;
    const shakeIntensity = isBoss ? 30 : 10;
    const shakeDuration = 0.05;
    const repeat = 40; // ~2 seconds total duration (40 * 0.05s)
    const redOpacity = isBoss ? 0.8 : 0.4;
    const flashDuration = 2.0;

    // Intense chaotic shake
    gsap.fromTo(document.body,
      { x: 0, y: 0, rotation: 0 },
      {
        x: () => (Math.random() - 0.5) * shakeIntensity,
        y: () => (Math.random() - 0.5) * shakeIntensity,
        rotation: () => (Math.random() - 0.5) * (isBoss ? 4 : 1),
        duration: shakeDuration,
        repeat: repeat,
        yoyo: true,
        ease: "sine.inOut",
        onComplete: () => {
          gsap.set(document.body, { x: 0, y: 0, rotation: 0 });
        }
      }
    );

    // Red Screen Flash
    if (redFlashRef.current) {
      gsap.fromTo(redFlashRef.current,
        { opacity: redOpacity },
        { opacity: 0, duration: flashDuration, ease: "power2.out" }
      );
    }
  }, [currentLesson, errorCount, createGlitchState]);

  // --- ЗАПУСК КОДА ---
  const handleRunCode = useCallback(async () => {
    if (isRunningRef.current || timeLeft === 0 || !currentLesson || !isPyodideReady || !workerRef.current) return;
    isRunningRef.current = true;

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
        // --- Отправляем результат на бэкенд ---
        let earnedXp = currentLesson.xp;
        try {
          const progressResult = await progressApi.completeLesson(lessonId, errorCount === 0);
          earnedXp = progressResult.xpEarned;
          console.log("Прогресс сохранен в БД, XP:", earnedXp);
          // Update cached XP
          const cachedCompleted: number[] = JSON.parse(localStorage.getItem('completedLessons') || '[]');
          if (!cachedCompleted.includes(lessonId)) {
            cachedCompleted.push(lessonId);
            localStorage.setItem('completedLessons', JSON.stringify(cachedCompleted));
          }
        } catch (dbErr) {
          console.error("Не удалось сохранить прогресс в БД:", dbErr);
          earnedXp = Math.floor(currentLesson.xp * getXPMultiplier());
        }

        // Визуальные эффекты
        music.start('victory');
        sounds.success();
        setGlitchState(createGlitchState({ type: 'success', isSuccess: true }));

        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.6 },
          colors: isBossMode ? ['#FF0000', '#FF4136', '#FF6B6B'] : ['#00FF41', '#00CC33', '#FFFFFF'],
        });

        setNotification({
          type: 'success',
          message: `ДОСТУП ПОЛУЧЕН! +${earnedXp} XP`
        });

        setErrorCount(0);
      } else {
        // НЕВЕРНЫЙ ОТВЕТ
        handleError(`> ОШИБКА: Неверный результат.\n> ОЖИДАЛОСЬ: ${currentLesson.expectedOutput}\n> ПОЛУЧЕНО: ${resultOutput.trim()}`);
      }
    } catch (err: any) {
      handleError(`> СИСТЕМНЫЙ СБОЙ:\n${err.message}`);
    } finally {
      setIsLoading(false);
      isRunningRef.current = false;
    }
  }, [code, currentLesson, timeLeft, isPyodideReady, errorCount, cleanStreak, lessonId, isBossMode]);

  // --- DEBUGGER ---
  const handleDebug = useCallback(async () => {
    if (timeLeft === 0 || !currentLesson || !isPyodideReady || !workerRef.current) return;

    sounds.click();
    setIsLoading(true);
    setIsError(false);
    // Don't clear output, we will show debug overlay

    try {
      const { trace } = await new Promise<{ trace: any[], output: string }>((resolve, reject) => {
        const id = Date.now().toString() + Math.random().toString();
        pendingRequests.current.set(id, { resolve, reject, output: "" });

        workerRef.current?.postMessage({
          type: 'RUN_DEBUG',
          code,
          id
        });
      });

      setTraceData(trace);
      setTraceData(trace);
      setActiveTab('debug');
    } catch (err: any) {
      handleError(`> DEBUG FAILURE:\n${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [code, currentLesson, timeLeft, isPyodideReady, handleError]);




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

  // Пока данные скачиваются с бэкенда
  if (pageLoading) {
    return (
      <Center h="100vh" style={{ background: '#050505' }}>
        <Stack align="center" gap="md">
          <Loader color="green" size="xl" variant="bars" />
          <Text c="green" ff="monospace" className="glitch" data-text="ПОДКЛЮЧЕНИЕ К УЗЛУ...">
            ПОДКЛЮЧЕНИЕ К УЗЛУ...
          </Text>
        </Stack>
      </Center>
    );
  }

  // Если загрузка прошла, но такого урока нет в базе
  if (!currentLesson) {
    return (
      <Center h="100vh" style={{ background: '#000' }}>
        <Stack align="center">
          <Text c="red" size="xl" ff="monospace">МИССИЯ НЕ НАЙДЕНА В БАЗЕ ДАННЫХ</Text>
          <Button onClick={() => navigate('/courses')} variant="outline" color="red">
            Вернуться в список
          </Button>
        </Stack>
      </Center>
    );
  }



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
          lessonId={lessonId}
        />

        <StoryOutcome
          opened={storyOutcomeOpened}
          onClose={() => setStoryOutcomeOpened(false)}
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

            {/* Таймер обратного отсчёта — только когда активно тикает */}
            {timeLeft !== null && timeLeft > 0 && (
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

            {/* Сердечки (жизни) — всегда видны в босс-режиме */}
            {isBossMode && (
              <Badge
                color="dark"
                variant="filled"
                size="lg"
                styles={{ root: { fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px' } }}
              >
                {Array.from({ length: getMaxAttempts() }, (_, i) => (
                  <span key={i} style={{
                    color: i < (getMaxAttempts() - bossAttempt + 1) ? '#ff4136' : '#333',
                    textShadow: i < (getMaxAttempts() - bossAttempt + 1) ? '0 0 8px #ff4136' : 'none',
                    transition: 'all 0.5s',
                  }}>
                    {i < (getMaxAttempts() - bossAttempt + 1) ? '♥' : '×'}
                  </span>
                ))}
              </Badge>
            )}

            {/* Кулдаун — показывается вместо таймера когда время вышло */}
            {cooldownLeft > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Badge color="orange" variant="filled" size="lg" leftSection={<IconShieldLock size={14} />}>
                  ⏳ {formatCooldown(cooldownLeft)}
                </Badge>
                <Progress
                  value={(cooldownLeft / Math.max(1, getCooldownTotal(lessonId))) * 100}
                  color="orange"
                  size="xs"
                  striped
                  animated
                />
              </div>
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

        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', flex: 1, overflow: isMobile ? 'auto' : 'hidden' }}>

          {/* LEFT PANEL */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
            style={{
              width: isMobile ? '100%' : '40%',
              minHeight: isMobile ? '50vh' : 'auto',
              display: 'flex',
              flexDirection: 'column',
              borderRight: isMobile ? 'none' : `1px solid ${borderColor}`,
              borderBottom: isMobile ? `1px solid ${borderColor}` : 'none',
              background: 'rgba(10,10,10,0.8)',
              backdropFilter: 'blur(5px)',
            }}
          >
            <div style={{ padding: '20px', flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>

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

              {/* Boss briefing info */}
              <AnimatePresence>
                {isBossMode && showBossBriefing && cooldownLeft <= 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: 'spring' }}
                  >
                    <Paper
                      p="md"
                      mb="md"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,0,0,0.08) 0%, rgba(255,65,54,0.05) 100%)',
                        border: '1px solid rgba(255,65,54,0.4)',
                        boxShadow: '0 0 20px rgba(255,0,0,0.1)',
                      }}
                    >
                      <Group justify="space-between" mb="xs">
                        <Badge color="red" variant="filled" size="sm">⚔️ НАЧАТЬ ОПЕРАЦИЮ</Badge>
                        <Badge color="dark" variant="filled" size="xs">BOSS_FIGHT</Badge>
                      </Group>
                      <Group gap="lg" mt="xs">
                        <Box>
                          <Text size="xs" c="dimmed">ВРЕМЯ:</Text>
                          <Text size="lg" c="red" fw={700} ff="Orbitron, sans-serif">{getBossTimeLimit(lessonId)}с</Text>
                        </Box>
                        <Box>
                          <Text size="xs" c="dimmed">ПОПЫТКА:</Text>
                          <Text size="lg" c="pink" fw={700} ff="Orbitron, sans-serif">{bossAttempt}/{getMaxAttempts()}</Text>
                        </Box>
                        <Box>
                          <Text size="xs" c="dimmed">ЖИЗНИ:</Text>
                          <Text size="lg" fw={700} ff="JetBrains Mono, monospace" style={{ letterSpacing: '4px' }}>
                            {Array.from({ length: getMaxAttempts() }, (_, i) => (
                              <span key={i} style={{
                                color: i < (getMaxAttempts() - bossAttempt + 1) ? '#ff4136' : '#333',
                                textShadow: i < (getMaxAttempts() - bossAttempt + 1) ? '0 0 10px #ff4136, 0 0 20px #ff413680' : 'none',
                                transition: 'all 0.5s ease',
                              }}>
                                {i < (getMaxAttempts() - bossAttempt + 1) ? '♥' : '×'}
                              </span>
                            ))}
                          </Text>
                        </Box>
                      </Group>
                      <Text size="xs" c="dimmed" mt="sm" style={{ fontStyle: 'italic' }}>
                        {bossAttempt <= 2
                          ? 'Первые 2 попытки — мгновенный повтор. Дальше придётся подождать.'
                          : `После провала: ожидание перед следующей попыткой.`
                        }
                      </Text>
                    </Paper>
                  </motion.div>
                )}
              </AnimatePresence>

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
                <Group grow>
                  <Button
                    fullWidth
                    size="lg"
                    color={pyodideError ? 'red' : themeColor}
                    disabled={timeLeft === 0 || !isPyodideReady || !!pyodideError || notification.type === 'success' || cooldownLeft > 0}
                    leftSection={<IconPlayerPlay size={20} />}
                    onClick={handleRunCode}
                    styles={{
                      root: {
                        transition: 'all 0.3s',
                        '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 0 20px ${isBossMode ? 'rgba(255, 65, 54, 0.4)' : 'rgba(0, 255, 65, 0.4)'}` }
                      }
                    }}
                  >
                    {pyodideError ? "⚠️ Python unavailable" : isBossMode ? "⚡ HACK CORE" : "▶ EXECUTE HACK"}
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    color="yellow"
                    disabled={isLoading || !isPyodideReady || !!pyodideError}
                    leftSection={<IconBug size={20} />}
                    onClick={handleDebug}
                  >
                    DEBUG
                  </Button>
                </Group>
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
            style={{
              width: isMobile ? '100%' : '60%',
              minHeight: isMobile ? '60vh' : 'auto',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Редактор кода */}
            <div style={{ height: '60%', minHeight: isMobile ? '400px' : 'auto', position: 'relative' }}>
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
              <Tabs value={activeTab} onChange={setActiveTab} color="green" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Tabs.List>
                  <Tabs.Tab value="output" leftSection={<IconFileCode size={14} />}>
                    PYTHON_OUTPUT
                  </Tabs.Tab>
                  <Tabs.Tab value="console" leftSection={<IconTerminal size={14} />}>
                    SYSTEM_CONSOLE
                  </Tabs.Tab>
                  <Tabs.Tab value="debug" leftSection={<IconBug size={14} />} disabled={!traceData}>
                    DEBUGGER
                  </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="output" p="sm" style={{ flex: 1, overflowY: 'auto' }}>
                  <pre style={{
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    color: pyodideError ? '#FF4136' : terminalTextColor,
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '14px',
                    textShadow: `0 0 10px ${pyodideError ? '#FF4136' : terminalTextColor}`,
                  }}>
                    {pyodideError
                      ? (
                        <Stack>
                          <Text color="red">
                            {`> ОШИБКА СИСТЕМЫ\n> ${pyodideError}\n>\n> Попробуйте:\n> 1. Обновить страницу (F5)\n> 2. Проверить подключение к интернету\n> 3. Использовать VPN если CDN заблокирован`}
                          </Text>
                          <Button
                            color="red"
                            variant="outline"
                            size="xs"
                            onClick={handleRetryConnection}
                          >
                            ↻ ПЕРЕПОДКЛЮЧИТЬ ЯДРО
                          </Button>
                        </Stack>
                      )
                      : output || '> Ожидание выполнения кода..._'}
                  </pre>
                </Tabs.Panel>

                <Tabs.Panel value="console" p={0} style={{ flex: 1, minHeight: 0 }}>
                  <HackerConsole />
                </Tabs.Panel>

                <Tabs.Panel value="debug" p={0} style={{ flex: 1, minHeight: 0 }}>
                  {traceData && (
                    <Debugger
                      trace={traceData}
                      code={code}
                    />
                  )}
                </Tabs.Panel>
              </Tabs>
            </div>
          </motion.div>
        </div>
      </Stack>
      {/* Red Flash Overlay */}
      <div
        ref={redFlashRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: '#ff4136',
          pointerEvents: 'none',
          zIndex: 9999,
          opacity: 0,
          mixBlendMode: 'overlay',
        }}
      />


    </Box>
  );
};

export default LessonPage;