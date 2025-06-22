export function createPdf(title, chapters) {
  const parts = [];
  if (title) parts.push(`# ${title}\n`);
  chapters.forEach((ch) => {
    if (ch.name) parts.push(`## ${ch.name}\n`);
    if (ch.text) parts.push(`${ch.text}\n`);
  });
  const text = parts.join('\n');
  const base64 = typeof btoa === 'function'
    ? btoa(unescape(encodeURIComponent(text)))
    : Buffer.from(text, 'utf-8').toString('base64');
  return `data:application/pdf;base64,${base64}`;
}

export function downloadPdf(dataUrl, filename) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
