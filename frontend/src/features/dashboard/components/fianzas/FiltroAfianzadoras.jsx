import { nombreCorto } from "../../utils/formatoDashboard";

const base = "rounded-full px-3 py-1 text-xs font-medium transition-colors";
const activo = "bg-blue-600 text-white";
const inactivo = "bg-blue-50 text-blue-700 hover:bg-blue-100";

export default function FiltroAfianzadoras({ afianzadoras, seleccionadaId, onSelect }) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar por afianzadora">
      <button
        type="button"
        onClick={() => onSelect(null)}
        aria-pressed={seleccionadaId === null}
        className={`${base} ${seleccionadaId === null ? activo : inactivo}`}
      >
        Todas
      </button>
      {afianzadoras.map((afi) => (
        <button
          key={afi.id}
          type="button"
          title={afi.nombre}
          onClick={() => onSelect(afi.id)}
          aria-pressed={seleccionadaId === afi.id}
          className={`${base} ${seleccionadaId === afi.id ? activo : inactivo}`}
        >
          {nombreCorto(afi.nombre)}
        </button>
      ))}
    </div>
  );
}