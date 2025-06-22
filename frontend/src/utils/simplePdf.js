import jsPDF from 'jspdf';

export function createPdf(title, chapters) {
  const doc = new jsPDF();
  let y = 10;

  if (title) {
    doc.setFontSize(18);
    doc.text(title, 10, y);
    y += 10;
  }

  chapters.forEach((ch, idx) => {
    if (ch.name) {
      doc.setFontSize(14);
      doc.text(ch.name, 10, y);
      y += 8;
    }

    if (ch.text) {
      doc.setFontSize(12);
      const lines = doc.splitTextToSize(ch.text, 180);
      doc.text(lines, 10, y);
      y += lines.length * 6 + 4;
    }

    if (ch.illustration) {
      const imgProps = doc.getImageProperties(ch.illustration);
      let imgWidth = 180;
      let imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      if (y + imgHeight > 280) {
        doc.addPage();
        y = 10;
      }
      doc.addImage(ch.illustration, 'PNG', 10, y, imgWidth, imgHeight);
      y += imgHeight + 6;
    }

    if (y > 280 && idx < chapters.length - 1) {
      doc.addPage();
      y = 10;
    }
  });

  return doc.output('datauristring');
}

export function downloadPdf(dataUrl, filename) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
