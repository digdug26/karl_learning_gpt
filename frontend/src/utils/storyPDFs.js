export function loadStoryPDFs() {
  try {
    const stored = localStorage.getItem('storyPDFs');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveStoryPDFs(pdfs) {
  localStorage.setItem('storyPDFs', JSON.stringify(pdfs));
}

export function addStoryPDF(dataUrl) {
  const pdfs = loadStoryPDFs();
  pdfs.push(dataUrl);
  saveStoryPDFs(pdfs);
}
