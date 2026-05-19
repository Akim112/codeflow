import React, { useState, useEffect } from 'react';
import { Paper, Title, Group, Button, Text, Slider, Table, Stack, Code, ScrollArea } from '@mantine/core';
import { IconBug, IconPlayerPlay, IconPlayerTrackNext, IconPlayerTrackPrev, IconRefresh } from '@tabler/icons-react';

interface TraceStep {
    line: number;
    locals: Record<string, string>;
    stdout: string;
}

interface DebuggerProps {
    trace: TraceStep[];
    code: string;
}

export const Debugger: React.FC<DebuggerProps> = ({ trace, code }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const codeLines = code.split('\n');

    useEffect(() => {
        let interval: any;
        if (isPlaying) {
            interval = setInterval(() => {
                setCurrentStep(prev => {
                    if (prev >= trace.length - 1) {
                        setIsPlaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 800);
        }
        return () => clearInterval(interval);
    }, [isPlaying, trace.length]);

    const stepData = trace[currentStep] || { line: 0, locals: {}, stdout: '' };

    return (
        <Paper
            p="md"
            withBorder
            style={{
                height: '100%',
                backgroundColor: '#0a0a0a',
                border: 'none', // Border handled by parent or tabs
            }}
        >
            <Stack h="100%" gap="xs">
                <Group justify="space-between">
                    <Group>
                        <IconBug size={20} color="#00FF41" />
                        <Title order={4} c="green" style={{ fontFamily: 'Orbitron' }}>DEBUG_MODE</Title>
                    </Group>
                    {/* Controls */}
                    <Group gap={4}>
                        <Button
                            size="compact-xs"
                            variant="subtle"
                            leftSection={<IconPlayerTrackPrev size={14} />}
                            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                            disabled={currentStep === 0}
                        >
                            PREV
                        </Button>

                        <Button
                            size="compact-xs"
                            color={isPlaying ? 'yellow' : 'green'}
                            leftSection={isPlaying ? <IconRefresh size={14} /> : <IconPlayerPlay size={14} />}
                            onClick={() => setIsPlaying(!isPlaying)}
                        >
                            {isPlaying ? 'PAUSE' : 'PLAY'}
                        </Button>

                        <Button
                            size="compact-xs"
                            variant="subtle"
                            rightSection={<IconPlayerTrackNext size={14} />}
                            onClick={() => setCurrentStep(Math.min(trace.length - 1, currentStep + 1))}
                            disabled={currentStep >= trace.length - 1}
                        >
                            NEXT
                        </Button>
                    </Group>
                </Group>

                <Slider
                    value={currentStep}
                    onChange={setCurrentStep}
                    min={0}
                    max={Math.max(0, trace.length - 1)}
                    label={(val) => `Step ${val + 1}/${trace.length}`}
                    color="green"
                    size="sm"
                    mb="xs"
                />

                <div style={{ flex: 1, display: 'flex', gap: '10px', overflow: 'hidden' }}>
                    {/* Code View */}
                    <Paper withBorder p={0} style={{ flex: 1, height: '100%', overflowY: 'auto', background: '#050505', borderColor: '#333', minWidth: 0 }}>
                        <div style={{ padding: '8px' }}>
                            {codeLines.map((line, idx) => {
                                const lineNum = idx + 1;
                                const isCurrent = stepData.line === lineNum;
                                return (
                                    <div
                                        key={idx}
                                        style={{
                                            background: isCurrent ? 'rgba(0, 255, 65, 0.2)' : 'transparent',
                                            borderLeft: isCurrent ? '3px solid #00FF41' : '3px solid transparent',
                                            paddingLeft: '8px',
                                            fontFamily: 'JetBrains Mono, monospace',
                                            fontSize: '12px',
                                            color: isCurrent ? '#fff' : '#888',
                                            display: 'flex',
                                            minHeight: '1.2em' // Ensure empty lines have height
                                        }}
                                    >
                                        <span style={{ width: '24px', color: '#444', userSelect: 'none', textAlign: 'right', paddingRight: '8px', flexShrink: 0 }}>{lineNum}</span>
                                        <span style={{ whiteSpace: 'pre' }}>{line}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </Paper>

                    {/* Variables & Output */}
                    <Stack style={{ width: '35%', height: '100%', minWidth: '200px' }} gap="xs">
                        {/* Variables */}
                        <Paper withBorder p="xs" style={{ flex: 1, overflowY: 'auto', background: '#050505', borderColor: '#333' }}>
                            <Text size="xs" c="dimmed" mb="xs" fw={700}>LOCALS</Text>
                            {Object.keys(stepData.locals).length === 0 ? (
                                <Text c="dimmed" size="xs" fs="italic">Empty</Text>
                            ) : (
                                <Table highlightOnHover horizontalSpacing="xs" verticalSpacing={2}>
                                    <Table.Tbody>
                                        {Object.entries(stepData.locals).map(([key, val]) => (
                                            <Table.Tr key={key}>
                                                <Table.Td style={{ color: '#00FF41', fontSize: '12px', padding: '4px' }}>{key}</Table.Td>
                                                <Table.Td style={{ fontFamily: 'monospace', fontSize: '12px', padding: '4px' }}>{val}</Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </Table.Tbody>
                                </Table>
                            )}
                        </Paper>

                        {/* Output Snapshot */}
                        <Paper withBorder p="xs" style={{ height: '30%', background: '#050505', borderColor: '#333' }}>
                            <Text size="xs" c="dimmed" mb={4} fw={700}>OUTPUT</Text>
                            <ScrollArea h="calc(100% - 20px)">
                                <Code block color="dark" style={{ border: 'none', background: 'transparent', fontSize: '12px', padding: 0 }}>
                                    {stepData.stdout || ''}
                                </Code>
                            </ScrollArea>
                        </Paper>
                    </Stack>
                </div>
            </Stack>
        </Paper>
    );
};
