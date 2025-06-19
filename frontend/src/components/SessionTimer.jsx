import { useEffect, useState } from 'react';

export default function SessionTimer({ maxMinutes, children, onHardCap }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setElapsed((e) => e + 1), 60000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (elapsed === 20) window.dispatchEvent(new Event('comic-break'));
    if (elapsed >= maxMinutes) onHardCap?.();
  }, [elapsed, maxMinutes, onHardCap]);
  return (
    <div>
      <div className="text-xs text-gray-500">⏱ {elapsed}/{maxMinutes} min</div>
      {typeof children === "function"
        ? children({ elapsed, maxMinutes })
        : children}
    </div>
  );
}
