// src/support/components/CommentInput.jsx
import React, { useState } from 'react';
import { addSupportComment } from '../services/supportService';

export default function CommentInput({ ticketId, currentUser, onCommentAdded }) {
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files) setFiles((prev) => [...prev, ...Array.from(e.target.files)]);
    e.target.value = null; 
  };

  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    const pastedFiles = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        pastedFiles.push(new File([file], `captura-${Date.now()}.png`, { type: file.type }));
      }
    }
    if (pastedFiles.length > 0) {
      e.preventDefault(); 
      setFiles((prev) => [...prev, ...pastedFiles]);
    }
  };

  const removeFile = (indexToRemove) => setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && files.length === 0) return;
    setIsSubmitting(true);
    try {
      await addSupportComment(ticketId, text, currentUser.id, currentUser.role, files);
      setText('');
      setFiles([]);
      onCommentAdded(); 
    } catch (error) {
      alert("Error al enviar el mensaje");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
      <textarea
        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none resize-none transition-colors"
        rows="3"
        placeholder="Escribe tu respuesta o pega una imagen (Ctrl + V)..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onPaste={handlePaste}
      ></textarea>

      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {files.map((file, index) => (
            <div key={index} className="flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full border border-indigo-200">
              <span className="truncate max-w-[150px] font-medium">{file.name}</span>
              <button type="button" onClick={() => removeFile(index)} className="ml-1 text-indigo-400 hover:text-red-500 font-bold focus:outline-none">✕</button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
        <label className="cursor-pointer text-gray-500 hover:text-indigo-600 flex items-center gap-2 text-sm font-bold transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          Adjuntar Archivos
          <input type="file" multiple className="hidden" onChange={handleFileChange} accept="image/*,.pdf,.doc,.docx" />
        </label>

        <button
          type="submit"
          disabled={isSubmitting || (!text.trim() && files.length === 0)}
          className={`px-6 py-2 rounded-md font-bold text-white text-sm transition shadow-sm ${
            isSubmitting || (!text.trim() && files.length === 0) 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isSubmitting ? 'Enviando...' : 'Enviar Respuesta'}
        </button>
      </div>
    </form>
  );
}