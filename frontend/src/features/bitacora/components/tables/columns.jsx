import { MessageSquare, Edit } from "lucide-react";
import { statusStyles } from "@/shared/utils/Constans";

export const getTramitesColumns = (abrirModalObservaciones, abrirModalEdicion, actualizarEstatusRapido) => [
  {
    accessorKey: 'folio',
    header: 'Folio',
  },
  {
    accessorKey: 'beneficiario_nombre',
    header: 'Beneficiario',
  },
  {
    // EDICIÓN INLINE: Cambiar estatus directamente en la tabla
    accessorKey: 'estatus_nombre',
    header: 'Estatus',
    cell: ({ row }) => {
      const tramite = row.original;
      return (
        <select 
          className={`border-0 rounded-md p-1 text-sm font-semibold cursor-pointer ${statusStyles[tramite.estatus_nombre] || "bg-gray-200 text-gray-600"}`}
          value={tramite.estatus_id}
          onChange={(e) => actualizarEstatusRapido(tramite.id, e.target.value)}
        >
          {/* Aquí mapearías tus opciones de estatus desde el catálogo */}
          <option value={tramite.estatus_id}>{tramite.estatus_nombre}</option>
        </select>
      );
    }
  },
  {
    // NUEVA COLUMNA: Botón para observaciones
    id: 'observaciones',
    header: 'Observaciones',
    cell: ({ row }) => (
      <button 
        onClick={() => abrirModalObservaciones(row.original.id)}
        className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
        title="Ver/Agregar Observaciones"
      >
        <MessageSquare size={16} />
      </button>
    )
  },
  {
    // NUEVA COLUMNA: Botón para editar todo el trámite
    id: 'acciones',
    header: 'Acciones',
    cell: ({ row }) => (
      <button 
        onClick={() => abrirModalEdicion(row.original.id)}
        className="flex items-center gap-2 px-3 py-1 bg-[#003f4f] text-white rounded-md hover:bg-[#002b36] transition-colors"
        title="Edición Completa"
      >
        <Edit size={16} /> Editar
      </button>
    )
  }
];