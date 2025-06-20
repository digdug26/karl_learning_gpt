export const alphabet = 'abcdefghijklmnopqrstuvwxyz';

export function loadProgress() {
  try {
    const stored = localStorage.getItem('typingProgress');
    return stored ? JSON.parse(stored) : { lettersCount: 1, streak: 0, achievements: [], badge: null };
  } catch {
    return { lettersCount: 1, streak: 0, achievements: [], badge: null };
  }
}

export function saveProgress(progress) {
  localStorage.setItem('typingProgress', JSON.stringify(progress));
}

const characterStickers = ['🤖','🧚','🧙','🦸','👩\u200d🚀'];
const animalStickers = ['🐶','🐱','🦁','🐵','🐧','🐢'];

export function randomSticker() {
  const all = [...characterStickers, ...animalStickers];
  return all[Math.floor(Math.random() * all.length)];
}
