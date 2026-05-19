import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Text, Button, TextInput, Group, Code } from '@mantine/core';
import { useTypewriter, Cursor } from 'react-simple-typewriter';
import { IconVolume, IconVolumeOff, IconTerminal2 } from '@tabler/icons-react';

interface OpeningSequenceProps {
    onComplete: () => void;
}

const BOOT_SEQUENCE = [
    "INITIALIZING KERNEL...",
    "LOADING MODULES: [NET] [SEC] [CRYPTO]...",
    "BYPASSING FIREWALL...",
    "ESTABLISHING SECURE CONNECTION...",
    "ACCESSING MAINFRAME...",
    "DECRYPTING USER DATA...",
    "SYSTEM INTEGRITY: 98%",
    "WARNING: UNAUTHORIZED ACCESS DETECTED",
    "INITIATING DEFENSE PROTOCOLS...",
    "DEFENSE PROTOCOLS OVERRIDDEN.",
    "WELCOME, USER.",
];

export const OpeningSequence = ({ onComplete }: OpeningSequenceProps) => {
    const [phase, setPhase] = useState<'boot' | 'story' | 'interactive'>('boot');
    const [bootLines, setBootLines] = useState<string[]>([]);
    const [soundEnabled, setSoundEnabled] = useState(false);
    const [inputCommand, setInputCommand] = useState('');
    const [glitchIntensity, setGlitchIntensity] = useState(0);
    const [isError, setIsError] = useState(false);

    // Audio refs (placeholders for now, or synthesized)
    const audioContextRef = useRef<AudioContext | null>(null);

    // Parallax mouse effect
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth) * 20 - 10,
                y: (e.clientY / window.innerHeight) * 20 - 10,
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Boot Sequence Logic
    useEffect(() => {
        let delay = 100;
        BOOT_SEQUENCE.forEach((line, index) => {
            setTimeout(() => {
                setBootLines((prev) => [...prev, line]);
                // Scroll to bottom
                const terminal = document.getElementById('terminal-boot');
                if (terminal) terminal.scrollTop = terminal.scrollHeight;

                if (index === BOOT_SEQUENCE.length - 1) {
                    setTimeout(() => setPhase('story'), 1000);
                }
            }, delay);
            delay += Math.random() * 300 + 100;
        });
    }, []);

    // Story Typewriter
    const [storyText] = useTypewriter({
        words: [
            'В начале была лишь тишина...',
            'Хаос правил цифровым миром.',
            'Код был запутан. Логика отсутствовала.',
            'Но затем пришел Архитектор.',
            'Чтобы войти, инициализируй протокол.',
        ],
        loop: 1,
        typeSpeed: 50,
        deleteSpeed: 30,
        delaySpeed: 1500,
        onLoopDone: () => setPhase('interactive'),
    });

    // Sound Synth (Simple Beeps)
    const playBeep = (freq = 440, type: OscillatorType = 'square', duration = 0.1) => {
        if (!soundEnabled) return;
        try {
            if (!audioContextRef.current) audioContextRef.current = new window.AudioContext();
            const ctx = audioContextRef.current;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) {
            console.error("Audio error", e);
        }
    };

    const handleCommandSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const cmd = inputCommand.trim().toLowerCase();

        if (cmd === 'init protocol' || cmd === 'import hacks' || cmd === 'start' || cmd === 'sudo su') {
            playBeep(880, 'sawtooth', 0.5);
            setGlitchIntensity(1); // Max glitch

            // Success animation sequence
            setBootLines(prev => [...prev, `> ${inputCommand}`, "ACCESS GRANTED.", "WELCOME TO CODEFLOW."]);

            setTimeout(() => {
                onComplete();
            }, 1500);
        } else {
            playBeep(150, 'sawtooth', 0.3);
            setIsError(true);
            setBootLines(prev => [...prev, `> ${inputCommand}`, "ACCESS DENIED. TRY 'init protocol'"]);
            setInputCommand('');
            setTimeout(() => setIsError(false), 500);
        }
    };

    return (
        <Box
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: '#050505',
                zIndex: 2147483647,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                color: '#00ff41',
                fontFamily: 'JetBrains Mono, monospace',
            }}
        >
            {/* GLOBAL OVERLAYS (CRT, SCANLINE, VIGNETTE) */}
            <div className="scanlines" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10, background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 2px, 3px 100%' }} />
            <div className="vignette" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 11, background: 'radial-gradient(circle, rgba(0,0,0,0) 60%, rgba(0,0,0,0.8) 100%)' }} />

            {/* PARALLAX BACKGROUND LAYER */}
            <motion.div
                animate={{ x: mousePosition.x * -2, y: mousePosition.y * -2 }}
                style={{
                    position: 'absolute',
                    top: '-10%',
                    left: '-10%',
                    width: '120%',
                    height: '120%',
                    backgroundImage: 'radial-gradient(#111 15%, transparent 16%), radial-gradient(#111 15%, transparent 16%)',
                    backgroundSize: '60px 60px',
                    backgroundPosition: '0 0, 30px 30px',
                    opacity: 0.1,
                    zIndex: 1,
                }}
            />

            {/* TERMINAL WINDOW */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                    width: 'min(800px, 90vw)',
                    height: 'min(600px, 80vh)',
                    background: 'rgba(10, 10, 10, 0.95)',
                    border: `1px solid ${isError ? 'red' : '#00ff41'}`,
                    borderRadius: '4px',
                    boxShadow: `0 0 ${glitchIntensity * 50 + 20}px ${isError ? 'red' : '#00ff41'}`,
                    padding: '2rem',
                    position: 'relative',
                    zIndex: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}
            >
                {/* HEADER */}
                <Group justify="space-between" mb="lg" style={{ borderBottom: '1px solid #333', paddingBottom: '10px' }}>
                    <Group gap="xs">
                        <IconTerminal2 size={20} />
                        <Text ff="monospace" size="sm">ROOT@CODEFLOW:~</Text>
                    </Group>
                    <Button
                        variant="subtle"
                        color="gray"
                        size="xs"
                        onClick={onComplete}
                        styles={{ root: { color: '#666', '&:hover': { color: '#fff' } } }}
                    >
                        SKIP INTRUSION »
                    </Button>
                </Group>

                {/* CONTENT AREA */}
                <Box style={{ flex: 1, overflowY: 'auto', fontFamily: 'JetBrains Mono' }} id="terminal-boot">
                    {/* BOOT LOGS */}
                    <Box mb="md" style={{ opacity: 0.7, fontSize: '0.9rem' }}>
                        {bootLines.map((line, i) => (
                            <Text key={i} component="div" c={line.includes('WARNING') || line.includes('DENIED') ? 'red' : 'green'}>
                                {line}
                            </Text>
                        ))}
                    </Box>

                    {/* PHASE: STORY */}
                    {(phase === 'story' || phase === 'interactive') && (
                        <Box my="xl" style={{ minHeight: '60px' }}>
                            <Text size="xl" fw={700} c="white" style={{ textShadow: '0 0 10px rgba(255,255,255,0.5)' }}>
                                {storyText}<Cursor cursorStyle='_' />
                            </Text>
                        </Box>
                    )}

                    {/* PHASE: INTERACTIVE INPUT */}
                    {phase === 'interactive' && (
                        <form onSubmit={handleCommandSubmit}>
                            <Group gap="xs" align="center">
                                <Text c="#00ff41" fw="bold">{`user@codeflow:~$`}</Text>
                                <input
                                    autoFocus
                                    value={inputCommand}
                                    onChange={(e) => {
                                        setInputCommand(e.target.value);
                                        playBeep(800 + Math.random() * 200, 'square', 0.05); // Typing sound
                                    }}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#fff',
                                        fontFamily: 'JetBrains Mono, monospace',
                                        fontSize: '1rem',
                                        outline: 'none',
                                        flex: 1,
                                        caretColor: '#00ff41'
                                    }}
                                    placeholder="Type 'init protocol'..."
                                />
                            </Group>
                            {isError && (
                                <Text c="red" size="sm" mt="xs" className="glitch">
                                    ERROR: COMMAND NOT RECOGNIZED. HINT: TRY 'init protocol'
                                </Text>
                            )}
                        </form>
                    )}
                </Box>
            </motion.div>

            {/* SOUND TOGGLE (Bottom Right) */}
            <Button
                onClick={() => setSoundEnabled(!soundEnabled)}
                variant="outline"
                color={soundEnabled ? 'green' : 'gray'}
                style={{
                    position: 'absolute',
                    bottom: 30,
                    right: 30,
                    zIndex: 30,
                    borderColor: soundEnabled ? '#00ff41' : '#333',
                    color: soundEnabled ? '#00ff41' : '#555'
                }}
            >
                {soundEnabled ? <IconVolume size={18} /> : <IconVolumeOff size={18} />}
                <Text ml="xs" size="xs">{soundEnabled ? 'SOUND ON' : 'SOUND OFF'}</Text>
            </Button>

            {/* GLITCH STYLES */}
            <style>{`
        @keyframes glitch {
          2%, 64% { transform: translate(2px,0) skew(0deg); }
          4%, 60% { transform: translate(-2px,0) skew(0deg); }
          62% { transform: translate(0,0) skew(5deg); }
        }
        .glitch {
          animation: glitch 1s linear infinite;
        }
        ::selection {
            background: #00ff41;
            color: #000;
        }
      `}</style>
        </Box>
    );
};
