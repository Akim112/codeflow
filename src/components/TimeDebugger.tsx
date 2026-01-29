import { useState } from 'react';
import { Button, Paper, Text, Stack, Group, Badge, Table, ScrollArea, Box } from '@mantine/core';
import { IconPlayerSkipForward, IconReload, IconBug } from '@tabler/icons-react';

interface DebugStep {
  line: number;
  code: string;
  variables: Record<string, unknown>;
  lastChangedVar: string | null;
  output: string;
}

interface TimeDebuggerProps {
  code: string;
  onClose: () => void;
}

export const TimeDebugger = ({ code, onClose }: TimeDebuggerProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<DebugStep[]>([]);

  // Улучшенный движок с поддержкой f-строк
  const generateSteps = (sourceCode: string): DebugStep[] => {
    const lines = sourceCode.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
    const debugSteps: DebugStep[] = [];
    let currentVars: Record<string, unknown> = {};
    let currentOutput = '';

    lines.forEach((line, idx) => {
      let lastChangedVar = null;

      // 1. Обработка присваивания
      if (line.includes('=') && !line.includes('==') && !line.startsWith('print')) {
        const [varName, expr] = line.split('=').map(s => s.trim());
        try {
          const evaluatedValue = evaluatePythonExpression(expr, currentVars);
          currentVars = { ...currentVars, [varName]: evaluatedValue };
          lastChangedVar = varName;
        } catch {
          currentVars = { ...currentVars, [varName]: "Error" };
        }
      }
      
      // 2. Обработка print (включая f-строки)
      if (line.startsWith('print(')) {
        const match = line.match(/print\((.*)\)/);
        if (match) {
          const expr = match[1].trim();
          try {
            let val;
            
            // Проверка на f-строку: f'...' или f"..."
            if (expr.startsWith('f"') || expr.startsWith("f'")) {
              val = evaluateFString(expr, currentVars);
            } else {
              val = evaluatePythonExpression(expr, currentVars);
            }
            
            currentOutput += val + '\n';
          } catch {
            currentOutput += "Error\n";
          }
        }
      }

      // 3. Обработка циклов (упрощённо)
      if (line.startsWith('for ')) {
        const match = line.match(/for (\w+) in range\((\d+)(?:,\s*(\d+))?(?:,\s*(-?\d+))?\)/);
        if (match) {
          const varName = match[1];
          const start = match[2] ? parseInt(match[2], 10) : 0;

          currentVars = { ...currentVars, [varName]: start };
          lastChangedVar = varName;
        }
      }

      debugSteps.push({
        line: idx + 1,
        code: line,
        variables: { ...currentVars },
        lastChangedVar,
        output: currentOutput.trim()
      });
    });

    return debugSteps;
  };

  // Вычисление f-строк: f'Try: {i}'
  const evaluateFString = (fstr: string, scope: Record<string, unknown>): string => {
    // Убираем f' и '
    const template = fstr.slice(2, -1);

    // Заменяем {переменная} на значения
    const regex = /{([^}]+)}/g;
    return template.replace(regex, (_match, varName: string) => {
      return scope[varName.trim()] !== undefined ? String(scope[varName.trim()]) : `{${varName}}`;
    });
  };

  // Вычисление Python-выражений
  const evaluatePythonExpression = (expr: string, scope: Record<string, unknown>) => {
    const keys = Object.keys(scope);
    const values = Object.values(scope);
    
    try {
      return new Function(...keys, `return ${expr}`)(...values);
    } catch {
      return expr.replace(/['"]/g, '');
    }
  };

  const handleStart = () => {
    setSteps(generateSteps(code));
    setCurrentStep(0);
  };

  const currentDebugStep = steps[currentStep];

  return (
    <Paper p="md" bg="#0a0a0a" mb="md" style={{ border: '1px solid #00ff41', boxShadow: '0 0 20px rgba(0,255,65,0.1)' }}>
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          <IconBug size={18} color="#00ff41" />
          <Text c="green" fw={700} size="sm" style={{ letterSpacing: '1px' }}>⏱ TIME_DEBUGGER_v1.3</Text>
        </Group>
        <Button size="compact-xs" variant="subtle" color="gray" onClick={onClose}>✕</Button>
      </Group>

      {steps.length === 0 ? (
        <Stack align="center" py="xl">
          <Text size="xs" c="dimmed" ta="center">Готов к пошаговому анализу...</Text>
          <Button 
            variant="outline" 
            color="green" 
            size="sm" 
            onClick={handleStart}
            leftSection={<IconBug size={16} />}
          >
            ЗАПУСТИТЬ ОТЛАДКУ
          </Button>
        </Stack>
      ) : (
        <Stack gap="xs">
          {/* Индикатор */}
          <Group justify="space-between">
            <Badge variant="dot" color="green">ШАГ: {currentStep + 1} / {steps.length}</Badge>
            <Text size="xs" ff="monospace" c="dimmed">СТРОКА: {currentDebugStep?.line}</Text>
          </Group>

          {/* Код */}
          <Box p="xs" style={{ background: '#001a00', border: '1px solid #003300', borderRadius: '4px' }}>
            <Text size="xs" c="green" mb={4} fw={700} style={{ opacity: 0.5 }}>EXECUTING:</Text>
            <Text ff="monospace" size="sm" c="white">{currentDebugStep?.code}</Text>
          </Box>

          {/* Переменные */}
          <Box mt="xs">
            <Text size="xs" c="green" mb={4} fw={700} style={{ opacity: 0.5 }}>MEMORY_STATE:</Text>
            <ScrollArea h={80}>
              <Table variant="unstyled" verticalSpacing={2}>
                <Table.Tbody>
                  {Object.entries(currentDebugStep?.variables || {}).map(([key, val]) => (
                    <Table.Tr key={key}>
                      <Table.Td style={{ width: '40%' }}>
                        <Text size="xs" c={currentDebugStep.lastChangedVar === key ? "yellow" : "dimmed"}>
                          {key} {currentDebugStep.lastChangedVar === key && "← updated"}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="xs" fw={700} c="green">{JSON.stringify(val)}</Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                  {Object.keys(currentDebugStep?.variables || {}).length === 0 && (
                    <Table.Tr><Table.Td><Text size="xs" c="dimmed">Нет переменных</Text></Table.Td></Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Box>

          {/* Вывод */}
          <Box mt="xs" p="xs" style={{ background: '#000', borderRadius: '4px', border: '1px solid #222' }}>
            <Text size="xs" c="dimmed" mb={4}>STDOUT:</Text>
            <Text size="xs" ff="monospace" c="green">
              {currentDebugStep?.output || '> ожидание...'}
            </Text>
          </Box>

          {/* Управление */}
          <Group grow mt="sm">
            <Button 
              size="xs" 
              variant="filled"
              color="green"
              onClick={() => currentStep < steps.length - 1 && setCurrentStep(s => s + 1)} 
              disabled={currentStep >= steps.length - 1}
              leftSection={<IconPlayerSkipForward size={14} />}
            >
              NEXT
            </Button>
            <Button size="xs" variant="outline" color="gray" onClick={handleStart} leftSection={<IconReload size={14} />}>
              RESET
            </Button>
          </Group>
        </Stack>
      )}
    </Paper>
  );
};