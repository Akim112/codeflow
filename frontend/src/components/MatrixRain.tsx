import { useEffect, useRef } from 'react';

interface MatrixRainProps {
  opacity?: number;
  speed?: number;
  color?: string;
}

export const MatrixRain = ({
  opacity = 0.05,
  speed = 33,
  color = '#00ff41'
}: MatrixRainProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Размеры canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Матричные символы
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ{}[]<>/*-+=#$%&@!?';
    const charArray = chars.split('');

    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);

    // Массив для отслеживания позиции Y каждого столбца
    const drops: number[] = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }

    const draw = () => {
      // Полупрозрачный чёрный фон для эффекта затухания
      ctx.fillStyle = `rgba(0, 0, 0, 0.05)`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = color;
      ctx.font = `${fontSize}px JetBrains Mono`;

      for (let i = 0; i < drops.length; i++) {
        // Случайный символ
        const char = charArray[Math.floor(Math.random() * charArray.length)];

        // Рисуем символ
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Более яркий "головной" символ
        if (Math.random() > 0.975) {
          ctx.fillStyle = '#ffffff';
        } else {
          ctx.fillStyle = color;
        }

        ctx.fillText(char, x, y);

        // Сбрасываем при достижении дна + случайность
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    };

    let animationFrameId: number;
    let lastTime = 0;

    const animate = (time: number) => {
      // Ограничиваем FPS
      const deltaTime = time - lastTime;
      if (deltaTime > speed) {
        lastTime = time - (deltaTime % speed); // Корректировка времени
        draw();
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [color, speed]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity,
      }}
    />
  );
};