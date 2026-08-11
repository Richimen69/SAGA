import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { statusStyles } from "@/shared/utils/Constans";
import { format, parseISO } from "date-fns";
// --- Funciones Auxiliares ---
const parseDateDDMMYYYY = (str) => {
  if (!str) return null;
  const parts = str.split("/");
  if (parts.length !== 3) return null;
  const [d, m, y] = parts.map(Number);
  if (Number.isNaN(d) || Number.isNaN(m) || Number.isNaN(y)) return null;
  return new Date(y, m - 1, d);
};

const isPastDate = (date) => {
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalizar a la medianoche para comparar solo fechas
  return date < today;
};

export default function TramiteRow({ tramite, listaIds }) {
  const navigate = useNavigate();
  // --- Lógica de Renderizado Memorizada ---

  // Calcula la clase de color para la fecha del trámite solo si el 'tramite' cambia
  const fechaColorClass = useMemo(() => {
    if (tramite.estatus !== "EN REVISIÓN DE PREVIAS") return "text-gray-600";

    const fechaTramite = parseDateDDMMYYYY(tramite.fecha);
    if (!fechaTramite) return "text-gray-600";

    const hoy = new Date();
    const diferenciaDias = Math.floor(
      (hoy - fechaTramite) / (1000 * 60 * 60 * 24),
    );

    return diferenciaDias > 30
      ? "text-red-600 bg-red-100 rounded-lg"
      : "text-gray-600";
  }, [tramite.fecha, tramite.estatus]);

  // Determina el color de la fecha de compromiso
  const fechaCompromisoColorClass = useMemo(() => {
    const fechaObj = parseDateDDMMYYYY(tramite.fecha_compromiso);
    return isPastDate(fechaObj) ? "text-red-600" : "text-gray-500";
  }, [tramite.fecha_compromiso]);

  // Define el contenido del tooltip para no tener lógica compleja en el JSX
  const tooltipContent = useMemo(() => {
    let textoObservacion = null;

    // 1. Obtenemos el texto plano dependiendo de dónde venga
    if (tramite.compromisos?.length > 0) {
      // El modelo Compromiso en Django tiene el campo 'observaciones' (con 's')
      textoObservacion = tramite.compromisos[0].observaciones;
    } else if (tramite.ultima_observacion) {
      // ultima_observacion es un objeto, extraemos su propiedad 'observacion'
      textoObservacion = tramite.ultima_observacion.observacion;
    }

    // 2. Si no hay texto o el estatus es 18, no renderizamos nada
    if (!textoObservacion || tramite.estatus === 18) {
      return null;
    }

    // 3. Limpiamos el texto
    const textoLimpio = textoObservacion.trim();

    // Si después de limpiar el texto quedó vacío, tampoco retornamos nada
    if (textoLimpio === "") return null;

    // 4. Retornar contenido formateado
    return (
      <div>
        <p className="font-semibold">{textoLimpio}</p>
      </div>
    );
  }, [tramite]); // <- Depender de 'tramite' asegura que reaccione a cambios en compromisos o estatus

  const handleRowClick = () => {
    navigate(`/vistaprevia`, {
      state: {
        id: tramite.id,
        listaIds: listaIds,
      },
    });
  };

  return (
    <tr
      className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={handleRowClick}
    >
      <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
        {tramite.folio}
      </td>
      <td className="px-4 py-3 font-medium text-gray-900">
        {tramite.beneficiario_nombre}
      </td>
      <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
        {tramite.numero_fianza}
      </td>
      <td className="px-4 py-3 text-gray-600">{tramite.cliente_nombre}</td>
      <td className="px-4 py-3">
        <p className={`p-1 ${fechaColorClass} text-left`}>
          {format(parseISO(tramite.fecha), "dd/MM/yyyy")}
        </p>
      </td>
      <td className="px-4 py-3 text-gray-600">{tramite.movimiento_nombre}</td>
      <td className="px-4 py-3 text-gray-600">{tramite.afianzadora_nombre}</td>
      <td className="relative px-4 py-3 text-gray-600 whitespace-nowrap text-center group">
        <div className="flex flex-col items-center">
          <span
            className={
              statusStyles[tramite.estatus_nombre] ||
              "bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-base font-semibold tex"
            }
          >
            {tramite.estatus_nombre}
          </span>
          {tramite.tiene_compromiso === "SI" && tramite.fecha_compromiso && (
            <span className={`text-base mt-1 ${fechaCompromisoColorClass}`}>
              {tramite.fecha_compromiso}
            </span>
          )}
        </div>
        {tooltipContent && (
          <div
            role="tooltip"
            className="absolute z-10 hidden group-hover:block bg-primary text-white text-xs rounded py-1 px-2 bottom-full mb-1 left-1/2 -translate-x-1/2 whitespace-normal w-[800px] text-center"
          >
            {tooltipContent}
          </div>
        )}
      </td>
      <td className="px-4 py-3 text-gray-600 text-left whitespace-nowrap">
        {tramite.tipo_proceso}
      </td>
      <td className="px-4 py-3 text-gray-600">{tramite.estatus_pago}</td>
    </tr>
  );
}
