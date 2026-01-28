import Editor from '@monaco-editor/react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  Button, Title, Text, Paper, Group, Badge, Notification, 
  Stack, Center, Box, Collapse, Tooltip, ActionIcon, Tabs 
} from '@mantine/core';
import { 
  IconBulb, IconClock, IconRocket, IconTerminal, IconFileCode, IconReload, IconAlertTriangle 
} from '@tabler/icons-react';

// Импорты данных и компонентов
import { lessons } from '../data/lessons';
import { achievements } from '../data/achievements';
import { createGlitchState, glitchAvatars } from '../data/glitchCharacter';
import { TimeDebugger } from '../components/TimeDebugger';
import { InteractiveTheory } from '../components/InteractiveTheory';
import { HackerConsole } from '../components/HackerConsole';
import { MoralChoice } from '../components/MoralChoice';
import { awardMissionReputation, getXPMultiplier } from '../data/reputationSystem';
import { music } from '../utils/adaptiveMusic';
import { Typewriter } from 'react-simple-typewriter';
import { motion, AnimatePresence } from 'framer-motion';
import { sounds } from '../utils/audio';

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
  const [isError, setIsError] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [glitchState, setGlitchState] = useState(createGlitchState({ type: 'welcome' }));
  const [notification, setNotification] = useState<{ type: 'success' | 'fail' | null, message: string }>({ type: null, message: '' });
  const [showDebugger, setShowDebugger] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [moralModalOpened, setMoralModalOpened] = useState(false); 
  
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [unlockedHints, setUnlockedHints] = useState<number>(0);

  const isBossMode = currentLesson?.isBoss || false;
  const themeColor = isBossMode ? 'red' : 'green';
  const terminalTextColor = isBossMode ? '#FF4136' : '#00FF41';
  const borderColor = isBossMode ? '#FF4136' : '#1A1B1E';

  // --- ЛОГИКА ТАЙМЕРА ---
  useEffect(() => {
    if (isBossMode) {
      setTimeLeft(60); 
    } else {
      setTimeLeft(null);
    }
  }, [lessonId, isBossMode]); 

  useEffect(() => {
    if (timeLeft === 0 && !notification.type) {
      sounds.error();
      setIsError(true);
      setNotification({ type: 'fail', message: 'СИСТЕМА ОБНАРУЖЕНА! Время истекло. OmniCorp заблокировал ваш доступ.' });
    }
    
    if (timeLeft !== null && timeLeft > 0 && notification.type !== 'success') {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, notification.type]);

  // --- ЛОГИКА ПОКУПКИ ПОДСКАЗОК ---
  const buyHint = () => {
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
  };

  // --- ЛОГИКА ПЛАТНОГО РЕСТАРТА ---
  const handleRestart = () => {
    const RESTART_PRICE = 50; // Цена жизни
    const currentXP = Number(localStorage.getItem('userXP')) || 0;

    if (currentXP >= RESTART_PRICE) {
      // Списываем XP
      localStorage.setItem('userXP', String(currentXP - RESTART_PRICE));
      
      // Сбрасываем состояние
      setTimeLeft(60);
      setNotification({ type: null, message: '' });
      setIsError(false);
      setOutput(`> СИСТЕМА ПЕРЕЗАГРУЖЕНА (-${RESTART_PRICE} XP)\n> ПРОТОКОЛ ВЗЛОМА ПЕРЕЗАПУЩЕН...`);
      sounds.click();
    } else {
      // Если денег нет
      sounds.error();
      alert(`КРИТИЧЕСКАЯ ОШИБКА: Недостаточно энергии (XP) для перезагрузки! Требуется: ${RESTART_PRICE} XP.`);
    }
  };

  useEffect(() => {
    if (currentLesson) {
      setCode(currentLesson.initialCode);
      setNotification({ type: null, message: '' });
      setIsError(false);
      setErrorCount(0);
      setUnlockedHints(0);
      setShowDebugger(false);

      if (isBossMode) {
        window.dispatchEvent(new Event('boss-mode-on'));
        document.body.setAttribute('data-boss-mode', 'true');
        music.start('boss');
        setOutput("⚠️ WARNING: HIGH-LEVEL ENCRYPTION DETECTED\n⚠️ SYSTEM OVERRIDE IN PROGRESS...\n⚠️ INTRUSION ALERT!\n");
        sounds.siren();
        setGlitchState(createGlitchState({ type: 'boss', isBoss: true }));
      } else {
        window.dispatchEvent(new Event('boss-mode-off'));
        document.body.removeAttribute('data-boss-mode');
        music.start('ambient');
        setOutput("");
        setGlitchState(createGlitchState({ type: 'welcome' }));
      }

      const interval = setInterval(() => { sounds.type(); }, 80);
      const timer = setTimeout(() => { clearInterval(interval); }, 1500);
      
      return () => { 
        clearInterval(interval); 
        clearTimeout(timer); 
        music.stop(); 
        window.dispatchEvent(new Event('boss-mode-off'));
        document.body.removeAttribute('data-boss-mode');
      };
    }
  }, [lessonId, isBossMode]);

  const handleRunUpdated = async () => {
    if (timeLeft === 0) return;
    
    sounds.click();
    music.start('coding');
    setIsLoading(true);
    setIsError(false);
    
    setOutput(`> ИНИЦИАЛИЗАЦИЯ ВЗЛОМА...\n> АНАЛИЗ ЗАЩИТЫ...\n`);
    setNotification({ type: null, message: '' });

    await new Promise(res => setTimeout(res, 1000));

    try {
      if (!window.loadPyodide) throw new Error("Среда Python не готова...");
      const pyodide = await window.loadPyodide();
      
      let currentOutput = ""; 
      pyodide.setStdout({
        batched: (msg: string) => {
          currentOutput += msg + "\n";
          setOutput((prev) => prev + msg + "\n");
        },
      });

      await pyodide.runPythonAsync(code);

      if (currentOutput.trim() === currentLesson?.expectedOutput) {
        music.start('victory');
        sounds.success();
        setGlitchState(createGlitchState({ type: 'success', isSuccess: true }));
        
        confetti({ 
          particleCount: 150, spread: 70, origin: { y: 0.6 }, 
          colors: isBossMode ? ['#FF0000', '#FF4136'] : ['#00FF41', '#FFFFFF'] 
        });

        const finalXP = Math.floor(currentLesson.xp * getXPMultiplier());
        localStorage.setItem('userXP', String((Number(localStorage.getItem('userXP')) || 0) + finalXP));

        awardMissionReputation(lessonId, errorCount === 0);

        const completedRaw = localStorage.getItem('completedLessons');
        const completed: number[] = completedRaw ? JSON.parse(completedRaw) : [];
        if (!completed.includes(lessonId)) {
          completed.push(lessonId);
          localStorage.setItem('completedLessons', JSON.stringify(completed));
        }

        let achievementMessage = "";
        const stats = { completedCount: completed.length, completedIds: completed, totalXP: Number(localStorage.getItem('userXP')) };
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

        if (isBossMode) {
          setTimeout(() => setMoralModalOpened(true), 2000);
        }

        setErrorCount(0);
      } else {
        sounds.error();
        setIsError(true);
        setErrorCount(prev => prev + 1);
        setGlitchState(createGlitchState({ type: 'error', isError: true, errorCount: errorCount + 1 }));
        setOutput(`> ОШИБКА: Доступ запрещен. Неверный ключ.\n> СИСТЕМА ВЕРНУЛА: ${currentOutput.trim()}`);
        setNotification({ type: 'fail', message: 'ВЗЛОМ ПРЕРВАН: Неверный результат.' });
        music.start('ambient');
      }
    } catch (err: any) {
      sounds.error();
      setIsError(true);
      setErrorCount(prev => prev + 1);
      setGlitchState(createGlitchState({ type: 'error', isError: true, errorCount: errorCount + 1 }));
      setOutput(`> СИСТЕМНЫЙ СБОЙ:\n${err.message}`);
      setNotification({ type: 'fail', message: 'КРИТИЧЕСКАЯ ОШИБКА В КОДЕ!' });
      music.start('ambient');
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentLesson) return <Center h="100vh"><Button onClick={() => navigate('/courses')}>Назад</Button></Center>;

  return (
    <Box className={isError ? 'shake-screen' : ''} style={{ height: '100vh', background: '#050505', transition: 'all 0.3s' }}>
      <Stack gap={0} style={{ height: '100%' }}>
        
        <MoralChoice opened={moralModalOpened} onClose={() => setMoralModalOpened(false)} chapter={currentLesson.chapter} />

        {/* HEADER */}
        <Group justify="space-between" p="sm" style={{ borderBottom: `1px solid ${borderColor}`, background: '#0a0a0a', zIndex: 10 }}>
          <Group gap="xl">
            <Text c={themeColor} fw={700} className="glitch" data-text={isBossMode ? "[ ⚠️ BOSS_LEVEL ]" : "[ CODEFLOW_TERMINAL_V.2.0 ]"}>
              {isBossMode ? "[ ⚠️ BOSS_LEVEL ]" : "[ CODEFLOW_TERMINAL_V.2.0 ]"}
            </Text>
          </Group>

          <Group gap="xs">
            <Button size="xs" color="yellow" variant="light" leftSection={<IconBulb size={14}/>} onClick={buyHint} disabled={unlockedHints >= 2 || timeLeft === 0}>
              {unlockedHints === 0 ? "ПОДСКАЗКА (50 XP)" : unlockedHints === 1 ? "РЕШЕНИЕ (150 XP)" : "ОТКРЫТО"}
            </Button>
            {currentLesson.hasDebugger && (
              <ActionIcon variant="light" color="cyan" onClick={() => setShowDebugger(!showDebugger)}><IconClock size={18} /></ActionIcon>
            )}
            <Button size="xs" variant="subtle" color="gray" onClick={() => navigate('/courses')}>EXIT</Button>
          </Group>
        </Group>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          
          {/* LEFT PANEL */}
          <motion.div initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} style={{ width: '40%', display: 'flex', flexDirection: 'column', borderRight: `1px solid ${borderColor}`, background: '#0a0a0a' }}>
            <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
              
              {/* --- ТАЙМЕР ЗДЕСЬ (В ЛЕВОЙ ЧАСТИ) --- */}
              {timeLeft !== null && (
                <Paper p="xs" mb="md" bg={timeLeft < 10 ? "rgba(255,0,0,0.2)" : "rgba(0,0,0,0.3)"} style={{ border: '1px solid red', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <IconAlertTriangle color="red" size={20} style={{ marginRight: 10 }} />
                  <Text c="red" fw={900} size="lg" style={{ fontFamily: 'monospace', animation: timeLeft < 10 ? 'shake 0.1s infinite' : 'pulse 1s infinite' }}>
                    ДО ОБНАРУЖЕНИЯ: {timeLeft}s
                  </Text>
                </Paper>
              )}

              {/* ГЛИТЧ ПЕРСОНАЖ */}
              <Paper p="md" mb="md" bg="#001a00" style={{ border: '1px solid #00ff41', position: 'relative' }}>
                <Badge pos="absolute" top={-10} left={10} color="green" variant="filled" size="xs">GLITCH_AI [{glitchState.mood.toUpperCase()}]</Badge>
                <pre style={{ fontSize: '10px', color: '#00ff41', margin: 0, lineHeight: 1 }}>{glitchAvatars[glitchState.mood]}</pre>
                <Text size="xs" c="#00ff41" mt="sm" style={{ fontStyle: 'italic', fontFamily: 'monospace' }}>
                  <Typewriter key={glitchState.quote} words={[glitchState.quote]} typeSpeed={40} cursor cursorStyle="_" />
                </Text>
              </Paper>

              <AnimatePresence>
                {unlockedHints > 0 && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
                    <Paper p="md" mb="md" bg="#1a1a00" style={{ border: '1px solid #ffaa00' }}>
                      <Text size="xs" c="yellow" fw={700}>{unlockedHints === 1 ? "HINT:" : "SOLUTION:"}</Text>
                      <Text size="sm" c="yellow.3">{unlockedHints === 1 ? currentLesson.hint : currentLesson.hint2}</Text>
                    </Paper>
                  </motion.div>
                )}
              </AnimatePresence>

              <Collapse in={showDebugger}><TimeDebugger code={code} onClose={() => setShowDebugger(false)} /></Collapse>

              <Badge variant="outline" color={themeColor} mb="xs">{currentLesson.chapter}</Badge>
              <Title order={2} c={isBossMode ? 'red' : 'white'} mb="md">{currentLesson.title}</Title>
              
              <Paper p="md" bg="#111" radius="xs" mb="md" style={{ borderLeft: `3px solid ${isBossMode ? 'red' : '#2f9e44'}` }}>
                <Text size="xs" c={themeColor} mb={5} fw={700}>MISSION_DETAILS:</Text>
                <InteractiveTheory text={currentLesson.description} onCodeClick={(c) => setCode(prev => prev + "\n" + c)} />
              </Paper>

              <Paper p="md" bg="#161616" radius="xs" mb="xl">
                <Text c={themeColor} size="xs" fw={700} mb={5}>OBJECTIVE:</Text>
                <Text size="sm">{currentLesson.task}</Text>
              </Paper>

              {/* УМНАЯ КНОПКА С ЦЕНОЙ */}
              <Button 
                onClick={timeLeft === 0 ? handleRestart : handleRunUpdated} 
                loading={isLoading} 
                fullWidth 
                size="lg" 
                color={timeLeft === 0 ? "orange" : themeColor} 
                leftSection={timeLeft === 0 ? <IconReload size={20} /> : <IconRocket size={20} />}
                style={{ boxShadow: isBossMode ? '0 0 20px rgba(255, 0, 0, 0.3)' : '0 0 15px rgba(0, 255, 65, 0.2)' }}
              >
                {timeLeft === 0 ? "↺ РЕСТАРТ (-50 XP)" : (isBossMode ? "⚡ ВЗЛОМАТЬ ЯДРО" : "▶ ВЫПОЛНИТЬ ВЗЛОМ")}
              </Button>

              <AnimatePresence>
                {notification.type && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <Notification mt="xl" withCloseButton={false} color={notification.type === 'success' ? 'green' : 'red'} title={notification.type === 'success' ? '✓ ACCESS GRANTED' : '✗ ACCESS DENIED'}>
                      <Text size="sm" style={{ whiteSpace: 'pre-line' }}>{notification.message}</Text>
                      {notification.type === 'success' && lessons.find(l => l.id === lessonId + 1) && (
                        <Button fullWidth mt="sm" variant="white" color={themeColor} size="xs" onClick={() => navigate(`/lesson/${lessonId + 1}`)}>NEXT_MISSION →</Button>
                      )}
                    </Notification>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* RIGHT PANEL */}
          <div style={{ width: '60%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: '60%' }}>
              <Editor height="100%" defaultLanguage="python" theme="vs-dark" value={code} onChange={(v) => setCode(v || "")} options={{ minimap: { enabled: false }, fontSize: 16, fontFamily: 'JetBrains Mono' }} />
            </div>
            
            <div style={{ height: '40%', background: '#050505', borderTop: `1px solid ${borderColor}` }}>
              <Tabs defaultValue="output" color="green">
                <Tabs.List>
                  <Tabs.Tab value="output" leftSection={<IconFileCode size={14} />}>PYTHON_OUTPUT</Tabs.Tab>
                  <Tabs.Tab value="console" leftSection={<IconTerminal size={14} />}>SYSTEM_CONSOLE</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="output" p="sm" style={{ color: terminalTextColor, fontFamily: 'monospace', overflowY: 'auto', height: '120px' }}>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{output}</pre>
                </Tabs.Panel>

                <Tabs.Panel value="console" p="0"><HackerConsole /></Tabs.Panel>
              </Tabs>
            </div>
          </div>
        </div>
      </Stack>
    </Box>
  );
};

export default LessonPage;