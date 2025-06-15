import React from 'react';

export default function ComicPad({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded shadow max-w-lg w-full">
        <h2 className="text-xl font-bold mb-2">Comic Break!</h2>
        <p className="mb-4">Enjoy a quick comic scene.</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
