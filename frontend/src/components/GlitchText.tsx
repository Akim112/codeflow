import { useState, useEffect } from 'react';
import { Text } from '@mantine/core';
import type { TextProps } from '@mantine/core';

interface GlitchTextProps extends Omit<TextProps, 'style'> {
  children: string;
  intensity?: 'low' | 'medium' | 'high';
  glitchChars?: string;
  style?: React.CSSProperties;
}

export const GlitchText = ({ 
  children, 
  intensity = 'medium',
  glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`',
  style,
  ...props 
}: GlitchTextProps) => {
  const [displayText, setDisplayText] = useState(children);
  const [isGlitching, setIsGlitching] = useState(false);

  const intensityConfig = {
    low: { chance: 0.001, duration: 50, interval: 100 },
    medium: { chance: 0.003, duration: 100, interval: 50 },
    high: { chance: 0.01, duration: 150, interval: 30 },
  };

  const config = intensityConfig[intensity];

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() < config.chance) {
        setIsGlitching(true);
        
        const glitched = children
          .split('')
          .map(char => 
            Math.random() < 0.3 
              ? glitchChars[Math.floor(Math.random() * glitchChars.length)]
              : char
          )
          .join('');
        
        setDisplayText(glitched);

        setTimeout(() => {
          setDisplayText(children);
          setIsGlitching(false);
        }, config.duration);
      }
    }, config.interval);

    return () => clearInterval(glitchInterval);
  }, [children, config, glitchChars]);

  const combinedStyle: React.CSSProperties = {
    ...style,
    filter: isGlitching ? 'blur(0.5px)' : 'none',
  };

  return (
    <Text 
      {...props} 
      className={`glitch ${props.className || ''}`}
      data-text={children}
      style={combinedStyle}
    >
      {displayText}
    </Text>
  );
};