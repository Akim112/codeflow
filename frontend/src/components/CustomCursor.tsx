import { useEffect, useRef } from 'react';

/**
 * Кастомный курсор-прицел, заменяющий системный.
 * Отслеживает движение мыши и добавляет hover-эффект на кликабельных элементах.
 */
export const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    // Перемещаем курсор за мышью
    const onMouseMove = (e: MouseEvent) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
      cursor.style.opacity = '1';
    };

    // Hover-эффект на кликабельных элементах
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable =
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[role="button"]') ||
        target.closest('[data-clickable]') ||
        window.getComputedStyle(target).cursor === 'pointer';

      if (isClickable) {
        cursor.classList.add('cursor-hover');
      } else {
        cursor.classList.remove('cursor-hover');
      }
    };

    // Click-эффект
    const onMouseDown = () => cursor.classList.add('cursor-click');
    const onMouseUp = () => cursor.classList.remove('cursor-click');

    // Скрываем когда курсор уходит за пределы окна
    const onMouseLeave = () => { cursor.style.opacity = '0'; };
    const onMouseEnter = () => { cursor.style.opacity = '1'; };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseover', onMouseOver);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    document.documentElement.addEventListener('mouseleave', onMouseLeave);
    document.documentElement.addEventListener('mouseenter', onMouseEnter);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
      document.documentElement.removeEventListener('mouseleave', onMouseLeave);
      document.documentElement.removeEventListener('mouseenter', onMouseEnter);
    };
  }, []);

  return <div ref={cursorRef} className="custom-cursor" style={{ opacity: 0 }} />;
};
