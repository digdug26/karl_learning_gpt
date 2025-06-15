import React, { useState } from 'react';
import sample from '../utils/sampleHomeRowText';

export default function TypingHomeRow({ onFinish }) {
  const [text] = useState(sample());
  const [input, setInput] = useState('');
  const correct = text.slice(0, input.length) === input;
  const complete = input === text;

  return (
    <div>
      <p className="font-mono bg-gray-100 p-2 rounded">{text}</p>
      <input
        className="w-full p-2 border"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        autoFocus
      />
      {complete && onFinish(correct)}
    </div>
  );
}
