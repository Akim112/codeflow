// Система адаптивной музыки через Web Audio API

class AdaptiveMusic {
  private audioContext: AudioContext | null = null;
  private currentLayer: 'ambient' | 'coding' | 'boss' | 'victory' | null = null;
  private oscillators: OscillatorNode[] = [];
  private gainNodes: GainNode[] = [];

  constructor() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Audio not supported');
    }
  }

  // Запустить фоновый трек
  start(layer: 'ambient' | 'coding' | 'boss' | 'victory') {
    if (!this.audioContext) return;
    
    // Останавливаем предыдущий трек
    this.stop();
    this.currentLayer = layer;

    switch (layer) {
      case 'ambient':
        this.playAmbient();
        break;
      case 'coding':
        this.playCoding();
        break;
      case 'boss':
        this.playBoss();
        break;
      case 'victory':
        this.playVictory();
        break;
    }
  }

  // Остановить всё
  stop() {
    this.oscillators.forEach(osc => {
      try {
        osc.stop();
      } catch {}
    });
    this.oscillators = [];
    this.gainNodes = [];
  }

  // Ambient: тихий синт-пэд
  private playAmbient() {
    if (!this.audioContext) return;
    
    const freqs = [130.81, 164.81, 196.00]; // C3, E3, G3
    const now = this.audioContext.currentTime;

    freqs.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.02, now + 2 + i * 0.5);

      osc.connect(gain);
      gain.connect(this.audioContext!.destination);
      osc.start();

      this.oscillators.push(osc);
      this.gainNodes.push(gain);
    });
  }

  // Coding: добавляем ритмичные биты
  private playCoding() {
    this.playAmbient(); // Базовый слой
    
    if (!this.audioContext) return;
    
    // Добавляем "удары барабана" (низкий синт)
    const kickPattern = () => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();
      const now = this.audioContext!.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
      
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      osc.connect(gain);
      gain.connect(this.audioContext!.destination);
      osc.start();
      osc.stop(now + 0.3);
    };

    // Играем kick каждые 0.5 секунды
    const interval = setInterval(kickPattern, 500);
    
    // Останавливаем через 30 секунд (или при смене слоя)
    setTimeout(() => clearInterval(interval), 30000);
  }

  // Boss: быстрый, агрессивный
  private playBoss() {
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;
    const freqs = [110, 138.59, 164.81]; // Минорный аккорд

    freqs.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();

      osc.type = 'sawtooth'; // Более агрессивный звук
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.04, now);

      osc.connect(gain);
      gain.connect(this.audioContext!.destination);
      osc.start();

      this.oscillators.push(osc);
      this.gainNodes.push(gain);
    });

    // Быстрая пульсация
    const pulse = () => {
      this.gainNodes.forEach(g => {
        const now = this.audioContext!.currentTime;
        g.gain.setValueAtTime(0.04, now);
        g.gain.linearRampToValueAtTime(0.06, now + 0.2);
        g.gain.linearRampToValueAtTime(0.04, now + 0.4);
      });
    };

    const pulseInterval = setInterval(pulse, 400);
    setTimeout(() => clearInterval(pulseInterval), 30000);
  }

  // Victory: мажорная мелодия
  private playVictory() {
    if (!this.audioContext) return;

    const melody = [
      { freq: 523.25, time: 0 },    // C5
      { freq: 659.25, time: 0.3 },  // E5
      { freq: 783.99, time: 0.6 },  // G5
      { freq: 1046.50, time: 0.9 }, // C6
    ];

    melody.forEach(({ freq, time }) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();
      const now = this.audioContext!.currentTime + time;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      osc.connect(gain);
      gain.connect(this.audioContext!.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    });
  }
}

// Экспортируем единственный экземпляр
export const music = new AdaptiveMusic();