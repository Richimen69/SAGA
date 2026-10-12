// src/support/components/ImageModal.jsx
import React, { useState, useEffect } from 'react';

export default function ImageModal({ imageUrl, onClose }) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    setScale((prev) => Math.min(Math.max(0.5, prev + delta), 5));
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleReset = (e) => {
    e.stopPropagation();
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  if (!imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="absolute top-4 right-4 flex gap-4 z-50">
        <button onClick={handleReset} className="px-4 py-2 bg-white/20 hover:bg-white/40 text-white rounded-lg font-bold">🔍 1:1</button>
        <button onClick={onClose} className="px-4 py-2 bg-red-500/80 hover:bg-red-600 text-white rounded-lg font-bold">✕ Cerrar</button>
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm bg-black/50 px-4 py-2 rounded-full pointer-events-none">
        Usa la rueda del ratón para hacer zoom • Clic y arrastra para mover
      </div>
      <div 
        className="relative w-full h-full overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing"
        onWheel={handleWheel} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onClick={(e) => e.stopPropagation()}
      >
        <img src={imageUrl} alt="Zoom" className="max-w-full max-h-full object-contain" style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})` }} draggable={false} />
      </div>
    </div>
  );
}