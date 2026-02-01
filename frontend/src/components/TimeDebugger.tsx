import { useState } from 'react';
import { Button, Paper, Text, Stack, Group, Badge, Table, ScrollArea, Box, Progress } from '@mantine/core';
import { IconPlayerSkipForward, IconReload, IconBug, IconPlayerPlay } from '@tabler/icons-react';

interface DebugStep {
  line: number;
  code: string;
  variables: Record<string, any>;
  lastChangedVar: string | null;
  output: string;
  action: string;
}

interface TimeDebuggerProps {
  code: string;
  onClose: () => void;
}

export const TimeDebugger = ({ code, onClose }: TimeDebuggerProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<DebugStep[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Улучшенный парсер Python
  const generateSteps = (sourceCode: string): DebugStep[] => {
    const lines = sourceCode.split('\n');
    const debugSteps: DebugStep[] = [];
    let currentVars: Record<string, any> = {};
    let currentOutput = '';
    let lineNumber = 0;

    const processLine = (line: string, _indent: number = 0): void => {
      lineNumber++;
      const trimmedLine = line.trim();
      
      if (!trimmedLine || trimmedLine.startsWith('#')) return;

      let lastChangedVar: string | null = null;
      let action = 'EXECUTE';

      // 1. Присваивание переменной
      if (trimmedLine.includes('=') && !trimmedLine.includes('==') && 
          !trimmedLine.startsWith('if') && !trimmedLine.startsWith('elif') &&
          !trimmedLine.startsWith('for') && !trimmedLine.startsWith('while') &&
          !trimmedLine.startsWith('def')) {
        
        const match = trimmedLine.match(/^(\w+)\s*=\s*(.+)$/);
        if (match) {
          const [, varName, expr] = match;
          try {
            const evaluatedValue = evaluateExpression(expr, currentVars);
            currentVars = { ...currentVars, [varName]: evaluatedValue };
            lastChangedVar = varName;
            action = `ASSIGN: ${varName} = ${JSON.stringify(evaluatedValue)}`;
          } catch (e) {
            currentVars = { ...currentVars, [varName]: '???' };
            action = `ASSIGN ERROR: ${varName}`;
          }
        }
      }

      // 2. Print
      if (trimmedLine.startsWith('print(')) {
        const match = trimmedLine.match(/print\((.+)\)$/);
        if (match) {
          try {
            const val = evaluateExpression(match[1], currentVars);
            currentOutput += String(val) + '\n';
            action = `PRINT: ${val}`;
          } catch (e) {
            currentOutput += 'ERROR\n';
            action = 'PRINT ERROR';
          }
        }
      }

      // 3. Обработка for-цикла (упрощённая)
      if (trimmedLine.startsWith('for ')) {
        const forMatch = trimmedLine.match(/for\s+(\w+)\s+in\s+range\((.+)\)/);
        if (forMatch) {
          const [, varName, rangeExpr] = forMatch;
          const rangeArgs = rangeExpr.split(',').map(s => evaluateExpression(s.trim(), currentVars));
          
          let start = 0, end = 0, step = 1;
          if (rangeArgs.length === 1) {
            end = rangeArgs[0];
          } else if (rangeArgs.length === 2) {
            [start, end] = rangeArgs;
          } else if (rangeArgs.length === 3) {
            [start, end, step] = rangeArgs;
          }

          action = `FOR LOOP: ${varName} from ${start} to ${end}`;
          
          // Находим тело цикла
          const bodyLines: string[] = [];
          const currentLineIndex = lines.indexOf(line);
          const baseIndent = line.search(/\S/);
          
          for (let i = currentLineIndex + 1; i < lines.length; i++) {
            const nextLine = lines[i];
            if (nextLine.trim() === '') continue;
            const nextIndent = nextLine.search(/\S/);
            if (nextIndent <= baseIndent && nextLine.trim() !== '') break;
            bodyLines.push(nextLine.trim());
          }

          // Эмулируем итерации
          for (let i = start; step > 0 ? i < end : i > end; i += step) {
            currentVars = { ...currentVars, [varName]: i };
            
            debugSteps.push({
              line: lineNumber,
              code: `${trimmedLine} // iteration ${varName}=${i}`,
              variables: { ...currentVars },
              lastChangedVar: varName,
              output: currentOutput.trim(),
              action: `LOOP ITERATION: ${varName} = ${i}`
            });

            // Выполняем тело цикла
            bodyLines.forEach(bodyLine => {
              if (bodyLine.startsWith('print(')) {
                const printMatch = bodyLine.match(/print\((.+)\)$/);
                if (printMatch) {
                  try {
                    const val = evaluateExpression(printMatch[1], currentVars);
                    currentOutput += String(val) + '\n';
                  } catch {}
                }
              }
            });
          }
          return;
        }
      }

      // 4. if/elif/else
      if (trimmedLine.startsWith('if ') || trimmedLine.startsWith('elif ')) {
        const condMatch = trimmedLine.match(/(if|elif)\s+(.+):/);
        if (condMatch) {
          try {
            const condition = evaluateExpression(condMatch[2], currentVars);
            action = `CONDITION: ${condMatch[2]} = ${condition}`;
          } catch {
            action = `CONDITION: ${condMatch[2]} (cannot evaluate)`;
          }
        }
      }

      // 5. def (просто показываем)
      if (trimmedLine.startsWith('def ')) {
        action = `DEFINE FUNCTION: ${trimmedLine}`;
      }

      debugSteps.push({
        line: lineNumber,
        code: trimmedLine,
        variables: { ...currentVars },
        lastChangedVar,
        output: currentOutput.trim(),
        action
      });
    };

    lines.forEach((line) => processLine(line));
    return debugSteps;
  };

  // Вычисление выражений
  const evaluateExpression = (expr: string, scope: Record<string, any>): any => {
    let processedExpr = expr.trim();
    
    // Обработка f-строк
    if (processedExpr.startsWith('f"') || processedExpr.startsWith("f'")) {
      const quote = processedExpr[1];
      let content = processedExpr.slice(2, -1);
      content = content.replace(/\{(\w+)\}/g, (_, varName) => {
        return scope[varName] !== undefined ? String(scope[varName]) : varName;
      });
      return content;
    }

    // Обработка обычных строк
    if ((processedExpr.startsWith('"') && processedExpr.endsWith('"')) ||
        (processedExpr.startsWith("'") && processedExpr.endsWith("'"))) {
      return processedExpr.slice(1, -1);
    }

    // Обработка списков
    if (processedExpr.startsWith('[') && processedExpr.endsWith(']')) {
      try {
        // Простой парсер списков
        const content = processedExpr.slice(1, -1);
        if (!content.trim()) return [];
        return content.split(',').map(item => evaluateExpression(item.trim(), scope));
      } catch {
        return processedExpr;
      }
    }

    // Доступ к элементам списка
    const indexMatch = processedExpr.match(/^(\w+)\[(\d+)\]$/);
    if (indexMatch) {
      const arr = scope[indexMatch[1]];
      const idx = parseInt(indexMatch[2]);
      if (Array.isArray(arr)) return arr[idx];
    }

    // len()
    const lenMatch = processedExpr.match(/^len\((\w+)\)$/);
    if (lenMatch && scope[lenMatch[1]]) {
      const val = scope[lenMatch[1]];
      if (Array.isArray(val) || typeof val === 'string') return val.length;
    }

    // Подстановка переменных и вычисление
    Object.keys(scope).forEach(key => {
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      const value = scope[key];
      if (typeof value === 'string') {
        processedExpr = processedExpr.replace(regex, `"${value}"`);
      } else if (Array.isArray(value)) {
        processedExpr = processedExpr.replace(regex, JSON.stringify(value));
      } else {
        processedExpr = processedExpr.replace(regex, String(value));
      }
    });

    try {
      // eslint-disable-next-line no-eval
      return eval(processedExpr);
    } catch {
      return processedExpr.replace(/['"]/g, '');
    }
  };

  const handleStart = () => {
    const generated = generateSteps(code);
    setSteps(generated);
    setCurrentStep(0);
    setIsRunning(true);
  };

  const handleStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleAutoPlay = async () => {
    for (let i = currentStep; i < steps.length; i++) {
      setCurrentStep(i);
      await new Promise(res => setTimeout(res, 500));
    }
  };

  const currentDebugStep = steps[currentStep];
  const progress = steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;

  return (
    <Paper p="md" bg="#0a0a0a" style={{ border: '1px solid #00ff41', boxShadow: '0 0 20px rgba(0,255,65,0.1)' }}>
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          <IconBug size={18} color="#00ff41" />
          <Text c="green" fw={700} size="sm" style={{ letterSpacing: '1px' }}>TIME_DEBUGGER v2.0</Text>
        </Group>
        <Button size="compact-xs" variant="subtle" color="gray" onClick={onClose}>✕</Button>
      </Group>

      {!isRunning ? (
        <Stack align="center" py="xl">
          <Text size="xs" c="dimmed" ta="center">
            Пошаговое выполнение кода с визуализацией памяти
          </Text>
          <Button 
            variant="outline" 
            color="green" 
            size="sm" 
            onClick={handleStart}
            leftSection={<IconBug size={16} />}
          >
            НАЧАТЬ ОТЛАДКУ
          </Button>
        </Stack>
      ) : (
        <Stack gap="xs">
          <Progress value={progress} color="green" size="xs" />
          
          <Group justify="space-between">
            <Badge variant="dot" color="green">ШАГ: {currentStep + 1} / {steps.length}</Badge>
            <Text size="xs" ff="monospace" c="dimmed">LINE: {currentDebugStep?.line}</Text>
          </Group>

          {/* Действие */}
          <Box p="xs" style={{ background: '#001a00', border: '1px solid #003300', borderRadius: '4px' }}>
            <Text size="xs" c="yellow" mb={4} fw={700}>ACTION:</Text>
            <Text ff="monospace" size="xs" c="yellow">{currentDebugStep?.action}</Text>
          </Box>

          {/* Код */}
          <Box p="xs" style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: '4px' }}>
            <Text size="xs" c="green" mb={4} fw={700} style={{ opacity: 0.5 }}>EXECUTING:</Text>
            <Text ff="monospace" size="sm" c="white">{currentDebugStep?.code}</Text>
          </Box>

          {/* Переменные */}
          <Box mt="xs">
            <Text size="xs" c="green" mb={4} fw={700} style={{ opacity: 0.5 }}>MEMORY STATE:</Text>
            <ScrollArea h={80}>
              <Table variant="unstyled" verticalSpacing={2}>
                <Table.Tbody>
                  {Object.entries(currentDebugStep?.variables || {}).map(([key, val]) => (
                    <Table.Tr key={key}>
                      <Table.Td style={{ width: '40%' }}>
                        <Text size="xs" c={currentDebugStep?.lastChangedVar === key ? "yellow" : "dimmed"} fw={currentDebugStep?.lastChangedVar === key ? 700 : 400}>
                          {key} {currentDebugStep?.lastChangedVar === key ? "← NEW" : ""}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="xs" fw={700} c="green">{JSON.stringify(val)}</Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                  {Object.keys(currentDebugStep?.variables || {}).length === 0 && (
                    <Table.Tr><Table.Td><Text size="xs" c="dimmed">Пусто</Text></Table.Td></Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Box>

          {/* Вывод */}
          <Box mt="xs" p="xs" style={{ background: '#000', borderRadius: '4px', border: '1px solid #222' }}>
            <Text size="xs" c="dimmed" mb={4}>STDOUT:</Text>
            <Text size="xs" ff="monospace" c="green" style={{ whiteSpace: 'pre-wrap' }}>
              {currentDebugStep?.output || '> waiting...'}
            </Text>
          </Box>

          {/* Кнопки */}
          <Group grow mt="sm">
            <Button 
              size="xs" 
              variant="filled"
              color="green"
              onClick={handleStep} 
              disabled={currentStep >= steps.length - 1}
              leftSection={<IconPlayerSkipForward size={14} />}
            >
              ШАГ
            </Button>
            <Button 
              size="xs" 
              variant="light"
              color="cyan"
              onClick={handleAutoPlay} 
              disabled={currentStep >= steps.length - 1}
              leftSection={<IconPlayerPlay size={14} />}
            >
              АВТО
            </Button>
            <Button size="xs" variant="outline" color="gray" onClick={handleStart} leftSection={<IconReload size={14} />}>
              СБРОС
            </Button>
          </Group>
        </Stack>
      )}
    </Paper>
  );
};