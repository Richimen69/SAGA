// src/support/components/TicketChat.jsx
import React, { useState } from 'react';
import ImageModal from './ImageModal'; 

// El " = [] " es el salvavidas. Si comments viene vacío, usa un arreglo vacío.
export default function TicketChat({ comments = [], currentUserRole }) {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <>
      <div className="flex flex-col space-y-4 p-4 bg-gray-50 h-96 overflow-y-auto rounded-lg border border-gray-200">
        
        {comments.length === 0 && (
          <div className="text-center text-gray-400 mt-10">
            No hay mensajes en este ticket aún.
          </div>
        )}

        {comments.map((comment) => {
          const isMe = comment.author?.role === currentUserRole;

          return (
            <div key={comment.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs md:max-w-md p-4 rounded-lg shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'}`}>
                
                <div className="flex justify-between items-center mb-2 text-xs opacity-75">
                  <span className="font-bold">{comment.author?.name || 'Usuario'}</span>
                  <span>{new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <p className="text-sm whitespace-pre-wrap">{comment.text}</p>

                {comment.attachments && comment.attachments.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {comment.attachments.map((file) => (
                      file.fileType.includes('image') ? (
                        <div key={file.id} onClick={() => setSelectedImage(file.fileUrl)} className="cursor-zoom-in relative group">
                          <img src={file.fileUrl} alt={file.fileName} className="w-full h-24 object-cover rounded border border-gray-300 group-hover:opacity-80 transition" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition pointer-events-none">
                            <span className="bg-black/60 text-white p-1 rounded-full text-xs">🔍</span>
                          </div>
                        </div>
                      ) : (
                        <a key={file.id} href={file.fileUrl} target="_blank" rel="noreferrer" className="flex items-center p-2 bg-gray-100 text-blue-600 rounded text-xs truncate hover:bg-gray-200 transition">
                          📎 {file.fileName}
                        </a>
                      )
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedImage && (
        <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
      )}
    </>
  );
}