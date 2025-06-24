export function loadCounts() {
  try {
    const stored = localStorage.getItem('funFactsCounts');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export function saveCounts(counts) {
  localStorage.setItem('funFactsCounts', JSON.stringify(counts));
}

export function incrementCount(topic) {
  const counts = loadCounts();
  counts[topic] = (counts[topic] || 0) + 1;
  saveCounts(counts);
  return counts[topic];
}

export function getCount(topic) {
  const counts = loadCounts();
  return counts[topic] || 0;
}
