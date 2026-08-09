import React from "react";
import { Clock, Mail, MessageCirclePlus, User } from "lucide-react";

// Función de formato de fecha (puedes moverla a un archivo de utilidades)
const formatDisplayDate = (dateString) => {
  if (!dateString) return "Fecha no disponible";
  const date = new Date(dateString.replace(" ", "T"));
  return date.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const SeguimientoList = ({ seguimientos }) => {
  if (seguimientos.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageCirclePlus className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">
          Este cliente aún no tiene seguimientos registrados.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
        {seguimientos.map((seguimiento) => (
          <div key={seguimiento.id_seguimiento}>
            <div className="flex flex-col border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow gap-3">
              <div className="flex items-center gap-2 mb-2 pt-5 text-gray-500">
                <Clock size={20} />
                <p>{formatDisplayDate(seguimiento.fecha_registro)}</p>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <User size={20} />
                <p>{seguimiento.nombre}</p>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Mail size={20} />
                <p>{seguimiento.correo}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50">
                <p>{seguimiento.observaciones}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};