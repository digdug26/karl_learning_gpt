export function loadStoryImages() {
  try {
    const stored = localStorage.getItem('storyImages');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveStoryImages(images) {
  localStorage.setItem('storyImages', JSON.stringify(images));
}

export function addStoryImage(url) {
  const images = loadStoryImages();
  images.push(url);
  saveStoryImages(images);
}
