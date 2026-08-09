import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Save, X, MessageSquare } from "lucide-react";
import {
  buscarObservacion,
  createObservacion,
  deleteObservacion,
  updateObservacion,
} from "@/features/bitacora/services/movimientos.service";
import { format } from "date-fns";
import { es } from "date-fns/locale";

function GestionObservaciones({ tramiteId, usuario }) {
  const [observaciones, setObservaciones] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [observacionEditada, setObservacionEditada] = useState("");
  const [nuevaObservacion, setNuevaObservacion] = useState("");

  useEffect(() => {
    if (tramiteId) fetchObservaciones();
  }, [tramiteId]);

  const fetchObservaciones = async () => {
    try {
      const data = await buscarObservacion(tramiteId);
      setObservaciones(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener observaciones:", error);
    }
  };

  const handleEdit = (id, contenidoActual) => {
    setEditingId(id);
    setObservacionEditada(contenidoActual);
  };

  const handleCancel = () => {
    setEditingId(null);
    setObservacionEditada("");
  };

  const handleAgregarObservacion = async (e) => {
    e.preventDefault();
    if (!nuevaObservacion.trim())
      return toast.error("La observación no puede estar vacía");

    const fecha = new Date().toISOString();
    const data = {
      observacion: nuevaObservacion,
      fecha,
      nombre: usuario.usuario_usu,
      tramite: tramiteId,
    };
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 2000)
      );

      const result = await Promise.race([
        createObservacion(data),
        timeoutPromise,
      ]);

      if (result.success) {
        toast.success("Observación guardada");
        setNuevaObservacion("");
        fetchObservaciones();
      }
    } catch (error) {
      toast.error("Error al guardar");
    }
  };

  const handleSaveEdit = async (id_observacion) => {
    try {
      const data = {
        observacion: observacionEditada,
        fecha: new Date().toISOString().split("T")[0],
        nombre: usuario.usuario_usu,
        id: id_observacion,
        tramite: tramiteId,
      };
      const result = await updateObservacion(data);
      if (result.success) {
        toast.success("Observación actualizada");
        setEditingId(null);
        fetchObservaciones();
      }
    } catch (error) {
      toast.error("Error al actualizar");
    }
  };

  const handleBorrarObservacion = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta observación?")) return;
    try {
      const result = await deleteObservacion(id);
      if (result.success) {
        toast.success("Observación borrada");
        fetchObservaciones();
      }
    } catch (error) {
      toast.error("Error al borrar");
    }
  };

  if (!tramiteId) {
    return (
      <div className="p-4 text-red-500 font-medium bg-red-50 rounded-lg">
        Error: No se encontró el ID del trámite.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
      {/* Encabezado */}
      <div className="flex items-center gap-2 mb-8 text-[#003f4f]">
        <MessageSquare size={20} />
        <h2 className="text-lg font-bold">Observaciones y Comentarios</h2>
      </div>

      {/* Línea de tiempo de observaciones */}
      <div className="relative border-l border-gray-300 ml-3 space-y-6 pb-4">
        {observaciones.length === 0 ? (
          <p className="pl-6 text-sm text-gray-500 italic">No hay observaciones registradas.</p>
        ) : (
          observaciones.map((dato, index) => {
            const isEditing = editingId === dato.id;

            return (
              <div key={dato.id || `obs-${index}`} className="relative pl-6 group">
                {/* Círculo de la línea de tiempo */}
                <div className="absolute -left-[9px] top-4 w-4 h-4 rounded-full border-2 border-[#003f4f] bg-white"></div>
                
                <div className="bg-[#f8f9fa] rounded-lg p-4 border border-transparent transition-colors hover:border-gray-200">
                  {isEditing ? (
                    /* MODO EDICIÓN */
                    <div className="space-y-3">
                      <textarea
                        value={observacionEditada}
                        onChange={(e) => setObservacionEditada(e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-3 text-sm focus:border-[#003f4f] focus:ring-1 focus:ring-[#003f4f] outline-none resize-none"
                        rows="3"
                        autoFocus
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={handleCancel}
                          className="flex items-center gap-1 px-4 py-1.5 rounded-md border border-gray-300 text-gray-600 hover:bg-white transition-colors text-sm font-medium"
                        >
                          <X size={16} />
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleSaveEdit(dato.id)}
                          className="flex items-center gap-1 px-4 py-1.5 rounded-md bg-[#003f4f] text-white hover:bg-[#002b36] transition-colors text-sm font-medium"
                        >
                          <Save size={16} />
                          Guardar
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* MODO VISTA */
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#003f4f]">
                            {dato.nombre}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-gray-500">
                          {format(new Date(dato.fecha), "dd/MM/yyyy HH:mm", {
                            locale: es,
                          })}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-700 whitespace-pre-wrap mt-1">
                        {dato.observacion}
                      </p>

                      {/* Botones de acción (visibles al pasar el mouse o en móvil) */}
                      <div className="flex justify-end gap-3 mt-3 pt-3 border-t border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(dato.id, dato.observacion)}
                          className="text-gray-500 hover:text-[#003f4f] transition-colors flex items-center gap-1 text-xs font-medium"
                          title="Editar"
                        >
                          <Pencil size={14} /> Editar
                        </button>
                        <button
                          onClick={() => handleBorrarObservacion(dato.id)}
                          className="text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1 text-xs font-medium"
                          title="Eliminar"
                        >
                          <Trash2 size={14} /> Eliminar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Formulario para nueva observación */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          Agregar nueva observación
        </label>
        <textarea
          className="w-full border border-gray-300 rounded-md p-3 text-sm focus:border-[#003f4f] focus:ring-1 focus:ring-[#003f4f] outline-none resize-none"
          value={nuevaObservacion}
          onChange={(e) => setNuevaObservacion(e.target.value)}
          placeholder="Escribe la observación aquí..."
          rows="3"
        />
        <div className="flex justify-end mt-3">
          <button
            className="px-6 py-2 bg-[#003f4f] hover:bg-[#002b36] text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
            onClick={handleAgregarObservacion}
            disabled={!nuevaObservacion.trim()}
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}

export default GestionObservaciones;