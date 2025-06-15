const words = [
  'a', 'as', 'sad', 'dash', 'add', 'fall', 'hall', 'had',
  'has', 'all', 'glad', 'ask', 'salad', 'skill', 'jail',
  'kid', 'fish', 'jig', 'lid', 'half'
];

export default function sampleHomeRowText() {
  const count = 5 + Math.floor(Math.random() * 5);
  const chosen = Array.from({ length: count }, () => {
    const i = Math.floor(Math.random() * words.length);
    return words[i];
  });
  return chosen.join(' ');
}
