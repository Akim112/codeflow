// Система адаптивной музыки через Web Audio API

type MusicLayer = 'ambient' | 'coding' | 'boss' | 'victory';

class AdaptiveMusic {
  private audioContext: AudioContext | null = null;
  private currentLayer: MusicLayer | null = null;
  private oscillators: OscillatorNode[] = [];
  private gainNodes: GainNode[] = [];
  private intervals: number[] = [];
  private timeouts: number[] = [];

  constructor() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Audio not supported');
    }
  }

  private cleanup() {
    // Очищаем все интервалы
    this.intervals.forEach(id => clearInterval(id));
    this.intervals = [];

    // Очищаем все таймауты
    this.timeouts.forEach(id => clearTimeout(id));
    this.timeouts = [];

    // Останавливаем осцилляторы
    this.oscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    this.oscillators = [];

    // Отключаем gain nodes
    this.gainNodes.forEach(gain => {
      try {
        gain.disconnect();
      } catch {}
    });
    this.gainNodes = [];
  }

  start(layer: MusicLayer) {
    if (!this.audioContext) return;
    if (this.currentLayer === layer) return; // Не перезапускать тот же слой

    this.stop();
    this.currentLayer = layer;

    // Возобновляем контекст если он приостановлен
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    switch (layer) {
      case 'ambient': this.playAmbient(); break;
      case 'coding': this.playCoding(); break;
      case 'boss': this.playBoss(); break;
      case 'victory': this.playVictory(); break;
    }
  }

  stop() {
    this.cleanup();
    this.currentLayer = null;
  }

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
      gain.gain.linearRampToValueAtTime(0.015, now + 2 + i * 0.5);

      osc.connect(gain);
      gain.connect(this.audioContext!.destination);
      osc.start();

      this.oscillators.push(osc);
      this.gainNodes.push(gain);
    });
  }

  private playCoding() {
    this.playAmbient();
    if (!this.audioContext) return;

    const ctx = this.audioContext;
    
    const kickPattern = () => {
      if (!this.audioContext || this.currentLayer !== 'coding') return;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
      
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(now + 0.3);
    };

    const intervalId = window.setInterval(kickPattern, 600);
    this.intervals.push(intervalId);
  }

  private playBoss() {
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;
    const freqs = [110, 138.59, 164.81]; // A2, C#3, E3 (минор)

    freqs.forEach((freq) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.03, now);

      osc.connect(gain);
      gain.connect(this.audioContext!.destination);
      osc.start();

      this.oscillators.push(osc);
      this.gainNodes.push(gain);
    });

    // Пульсация
    const pulse = () => {
      if (!this.audioContext || this.currentLayer !== 'boss') return;
      
      this.gainNodes.forEach(g => {
        const now = this.audioContext!.currentTime;
        g.gain.setValueAtTime(0.03, now);
        g.gain.linearRampToValueAtTime(0.05, now + 0.15);
        g.gain.linearRampToValueAtTime(0.03, now + 0.3);
      });
    };

    const pulseInterval = window.setInterval(pulse, 300);
    this.intervals.push(pulseInterval);
  }

  private playVictory() {
    if (!this.audioContext) return;

    const melody = [
      { freq: 523.25, time: 0 },    // C5
      { freq: 659.25, time: 0.2 },  // E5
      { freq: 783.99, time: 0.4 },  // G5
      { freq: 1046.50, time: 0.6 }, // C6
    ];

    melody.forEach(({ freq, time }) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();
      const now = this.audioContext!.currentTime + time;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      osc.connect(gain);
      gain.connect(this.audioContext!.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    });

    // Автоматически переключаемся на ambient через 2 секунды
    const timeoutId = window.setTimeout(() => {
      if (this.currentLayer === 'victory') {
        this.start('ambient');
      }
    }, 2000);
    this.timeouts.push(timeoutId);
  }
}

export const music = new AdaptiveMusic();