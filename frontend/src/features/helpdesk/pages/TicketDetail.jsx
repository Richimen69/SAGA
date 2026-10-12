import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getSupportTicketById,
  updateSupportTicketStatus,
} from "../services/supportService";
import TicketChat from "../components/TicketChat";
import CommentInput from "../components/CommentInput";
import ImageModal from "../components/ImageModal";

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("authUser")) || {
    id: "1",
    role: "TECH",
    name: "Técnico",
  };

  const fetchTicketDetail = async () => {
    try {
      const data = await getSupportTicketById(id);
      // Extraemos directamente de data, por la forma en que lo envuelve tu fetchApi
      setTicket(data.data || data);
    } catch (error) {
      console.error("Error cargando detalle:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketDetail();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      // FIX: Ya no mandamos currentUser.id
      await updateSupportTicketStatus(id, newStatus);
      fetchTicketDetail();
    } catch (error) {
      alert("Error al actualizar el estado");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex justify-center items-center text-gray-500">
        Cargando detalles...
      </div>
    );
  if (!ticket)
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex justify-center items-center text-red-500 font-bold">
        Ticket no encontrado
      </div>
    );

  const isTechOrAdmin =
    currentUser.role === "TECH" || currentUser.role === "ADMIN";

  return (
    <div className="min-h-screen p-6 font-sans text-gray-700">
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Detalle de Incidencia
            </h1>
            <p className="text-xs font-semibold text-brand uppercase tracking-wider mt-1">
              Soporte IT <span className="text-gray-400 mx-1">•</span> Ticket #
              {ticket.folio}
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition flex items-center gap-2 cursor-pointer"
          >
            ← Volver a la lista
          </button>
        </div>
        
        {/* TARJETA DE INFORMACIÓN DEL TICKET */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {ticket.title}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Creado por{" "}
                {/* FIX: Usamos username o name dependiendo de Django */}
                <span className="font-bold">{ticket.creator?.username || ticket.creator?.name}</span> el{" "}
                {/* FIX: Cambiado de createdAt a created_at */}
                {new Date(ticket.created_at).toLocaleString("es-MX")}
              </p>
            </div>

            {/* Control de Estado */}
            <div className="flex flex-col items-end">
              <label className="text-xs font-bold text-gray-400 uppercase mb-1">
                Estado Actual
              </label>
              {isTechOrAdmin ? (
                <select
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="bg-gray-50 border border-red-300 text-brand text-sm rounded-md focus:ring-brand focus:border-brand-hover block p-2 font-bold outline-none cursor-pointer"
                >
                  <option value="ABIERTO">Abierto</option>
                  <option value="EN_PROGRESO">En Progreso</option>
                  <option value="ESPERANDO_USUARIO">Esperando al Usuario</option>
                  <option value="RESUELTO">Marcar como Resuelto</option>
                  <option value="CERRADO">Cerrado</option>
                </select>
              ) : (
                <span className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-md font-bold text-sm border border-indigo-100">
                  {ticket.status}
                </span>
              )}
            </div>
          </div>

          {/* Grid de Metadatos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">
                Tipo de Caso
              </p>
              <p className="text-sm font-medium text-gray-800 mt-1">
                {ticket.caseType || "Incidente"}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">
                Categoría
              </p>
              <p className="text-sm font-medium text-gray-800 mt-1">
                {ticket.category?.name || "No especificada"}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">
                Prioridad
              </p>
              <p className="text-sm font-medium text-gray-800 mt-1">{ticket.priority || "Media"}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">
                Técnico Asignado
              </p>
              <p className="text-sm font-medium text-gray-800 mt-1">
                {/* FIX: Usamos username o name dependiendo de Django */}
                {ticket.assignedTech?.username || ticket.assignedTech?.name || "Sin asignar"}
              </p>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase mb-2">
              Descripción Detallada
            </p>
            <div className="p-4 bg-gray-50 rounded-md border border-gray-200 text-sm text-gray-700 whitespace-pre-wrap">
              {ticket.description}
            </div>
          </div>

          {/* Archivos Adjuntos */}
          {ticket.attachments && ticket.attachments.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase mb-3">
                Archivos Adjuntos Iniciales
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {ticket.attachments.map((file) =>
                  file.fileType.includes("image") ? (
                    <div
                      key={file.id}
                      onClick={() => setSelectedImage(file.fileUrl)}
                      className="cursor-zoom-in relative group"
                    >
                      <img
                        src={file.fileUrl}
                        alt={file.fileName}
                        className="w-full h-24 object-cover rounded border border-gray-300 group-hover:opacity-80 transition"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition pointer-events-none">
                        <span className="bg-black/60 text-white p-1 rounded-full text-xs">
                          🔍
                        </span>
                      </div>
                    </div>
                  ) : (
                    <a
                      key={file.id}
                      href={file.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center p-2 bg-gray-50 border border-gray-200 text-indigo-600 rounded text-xs truncate hover:bg-gray-100 transition"
                    >
                      📎 {file.fileName}
                    </a>
                  ),
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* ZONA DE CHAT Y COMENTARIOS */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
            Historial y Comentarios
          </h3>
          <TicketChat
            comments={ticket.comments || []}
            currentUserRole={currentUser.role}
          />
        </div>
        
        {/* INPUT DE RESPUESTA */}
        {ticket.status !== "CERRADO" && (
          <CommentInput
            ticketId={ticket.id}
            currentUser={currentUser}
            onCommentAdded={fetchTicketDetail}
          />
        )}
      </div>

      {/* MODAL DE IMAGEN */}
      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}