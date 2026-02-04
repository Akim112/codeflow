import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { ReactNode, memo } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

// Оптимизированные варианты анимации - используем transform и opacity (GPU ускорение)
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 0.98,
  },
};

// Быстрый и плавный переход
const pageTransition = {
  type: 'tween' as const,
  ease: 'easeOut' as const, // Быстрый старт, плавное завершение
  duration: 0.3, // Уменьшено с 0.5 до 0.3
};

// Мемоизируем компонент для предотвращения лишних ререндеров
export const PageTransition = memo(({ children }: PageTransitionProps) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        style={{
          minHeight: '100vh',
          willChange: 'transform, opacity', // Подсказка браузеру для GPU ускорения
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
});

PageTransition.displayName = 'PageTransition';