export interface TerminalTheme {
  id: string;
  name: string;
  color: string; // Основной неоновый цвет
  bg: string;    // Цвет фона
  price: number;
}

export const terminalThemes: TerminalTheme[] = [
  { id: 'classic', name: 'Classic Green', color: '#00FF41', bg: '#050505', price: 0 },
  { id: 'cyberia', name: 'Cyberia Blue', color: '#00FFF9', bg: '#020b12', price: 500 },
  { id: 'blood', name: 'Blood Code', color: '#FF4136', bg: '#0f0202', price: 1000 },
  { id: 'gold', name: 'Elite Gold', color: '#FFD700', bg: '#0a0900', price: 2500 },
];