import { alphabet } from './typingProgress';

export default function generatePracticeText(count) {
  const letters = alphabet.slice(0, count);
  const arr = [];
  for (let i = 0; i < 20; i++) {
    const ch = letters[Math.floor(Math.random() * letters.length)];
    arr.push(ch);
    if ((i + 1) % 4 === 0 && i !== 19) arr.push(' ');
  }
  return arr.join('');
}
