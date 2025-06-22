import { useState, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { addStoryPDF } from '../utils/storyPDFs';
import { createPdf, downloadPdf } from '../utils/simplePdf';

export default function StoryCreation({ onBack }) {
  const [title, setTitle] = useState('');
  const [chapterName, setChapterName] = useState('');
  const [body, setBody] = useState('');
  const [chapters, setChapters] = useState([]);
  const [showCanvas, setShowCanvas] = useState(false);
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const history = useRef([]);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);

  const startDraw = (e) => {
    if (!showCanvas) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const ctx = canvasRef.current.getContext('2d');
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setDrawing(true);
  };

  const draw = (e) => {
    if (!drawing || !showCanvas) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const endDraw = () => {
    if (!showCanvas) return;
    setDrawing(false);
    history.current.push(canvasRef.current.toDataURL());
  };

  const clearCanvas = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    history.current = [];
  };

  const undo = () => {
    if (history.current.length <= 1) {
      clearCanvas();
      return;
    }
    history.current.pop();
    const img = new Image();
    img.src = history.current[history.current.length - 1];
    img.onload = () => {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  const captureDrawing = () => {
    if (showCanvas && canvasRef.current) {
      return canvasRef.current.toDataURL('image/png');
    }
    return null;
  };

  const addChapter = () => {
    const illustration = captureDrawing();
    const chapter = { name: chapterName, text: body, illustration };
    setChapters([...chapters, chapter]);
    setChapterName('');
    setBody('');
    clearCanvas();
  };

  const handleDoneChapter = () => {
    if (!window.confirm('Are you sure you are done with this chapter?')) return;
    addChapter();
  };

  const generatePDF = (allChapters) => {
    const dataUrl = createPdf(title || 'My Story', allChapters);
    addStoryPDF(dataUrl);
    downloadPdf(dataUrl, 'story.pdf');
  };

  const handleDoneStory = () => {
    if (!window.confirm('Are you sure you are finished with this story?')) return;
    const illustration = captureDrawing();
    const finalChapters = [...chapters, { name: chapterName, text: body, illustration }];
    generatePDF(finalChapters);
    setTitle('');
    setChapterName('');
    setBody('');
    setChapters([]);
    clearCanvas();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-5 w-5 mr-2" />Back
        </Button>
        <h1 className="text-2xl font-bold">Story Creation</h1>
      </div>

      <div className="space-y-4 bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Story Title</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Chapter Name</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={chapterName}
            onChange={(e) => setChapterName(e.target.value)}
            placeholder="Chapter name"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Story Text</label>
          <textarea
            className="w-full h-48 p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your story..."
          />
        </div>
      </div>

      <div className="space-y-4">
        <Button onClick={() => setShowCanvas(!showCanvas)} className="w-full" variant="secondary">
          {showCanvas ? 'Hide Illustration' : 'Optional Illustration'}
        </Button>
        {showCanvas && (
          <div className="border border-slate-300 p-2 rounded">
            <canvas
              ref={canvasRef}
              width={300}
              height={300}
              className="border border-slate-200"
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
            />
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <Button size="sm" variant="ghost" onClick={clearCanvas}>Clear</Button>
              <Button size="sm" variant="ghost" onClick={undo}>Undo</Button>
              <label className="text-sm flex items-center gap-1">
                Color
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
              </label>
              <label className="text-sm flex items-center gap-1">
                Width
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={lineWidth}
                  onChange={(e) => setLineWidth(Number(e.target.value))}
                />
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="flex space-x-3">
        <Button onClick={handleDoneChapter} className="w-full">
          Done with Chapter
        </Button>
        <Button onClick={handleDoneStory} variant="hero" className="w-full">
          Done with Story
        </Button>
      </div>
    </div>
  );
}
