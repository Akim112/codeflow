// Утилита для генерации "компьютерного" звука через код (Web Audio API)
const getAudioContext = () => {
  const Ctx = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  return Ctx ? new Ctx() : null;
};

const playSynthSound = (freq: number, type: OscillatorType, duration: number) => {
  try {
    const audioCtx = getAudioContext();
    if (!audioCtx) return;
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.error("Audio error:", e);
  }
};

export const sounds = {
  // Короткий хакерский клик
  click: () => playSynthSound(800, 'square', 0.05),
  
  // Звук успеха (двойной писк вверх)
  success: () => {
    playSynthSound(600, 'sine', 0.2);
    setTimeout(() => playSynthSound(900, 'sine', 0.4), 100);
  },
  
  // Звук ошибки (низкий гул)
  error: () => {
    playSynthSound(150, 'sawtooth', 0.5);
  },
  
  // Звук печати текста (очень короткий)
  type: () => playSynthSound(1200, 'sine', 0.01),

  // Исправленная сирена
  siren: () => {
    try {
      const audioCtx = getAudioContext();
      if (!audioCtx) return;
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      const now = audioCtx.currentTime;

      // Имитируем звук сирены, меняя частоту туда-сюда
      oscillator.frequency.setValueAtTime(300, now);
      oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.5);
      oscillator.frequency.exponentialRampToValueAtTime(300, now + 1.0);
      oscillator.frequency.exponentialRampToValueAtTime(600, now + 1.5);
      oscillator.frequency.exponentialRampToValueAtTime(300, now + 2.0);
      
      gainNode.gain.setValueAtTime(0.05, now); // Очень тихо
      gainNode.gain.linearRampToValueAtTime(0, now + 2.0); // Плавное затухание в конце

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(now + 2.0);
    } catch (e) {
      console.error("Siren error:", e);
    }
  }
};