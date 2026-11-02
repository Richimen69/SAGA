import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

const campo =
  "rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

/**
 * Rango de fechas del periodo. Solo consulta cuando las dos fechas están completas
 * y son válidas; con una sola, espera a la otra. Borrar vuelve al año completo.
 */
export default function FiltroPeriodo({ rango, onChange }) {
  const [desde, setDesde] = useState(rango?.desde ?? "");
  const [hasta, setHasta] = useState(rango?.hasta ?? "");

  // Si desde fuera se limpia el rango (por ejemplo al cambiar de año), se vacían los campos
  useEffect(() => {
    if (rango === null) {
      setDesde("");
      setHasta("");
    }
  }, [rango]);

  const invertido = Boolean(desde && hasta && hasta < desde);
  const incompleto = Boolean((desde || hasta) && !(desde && hasta));

  const aplicar = (nuevoDesde, nuevoHasta) => {
    if (nuevoDesde && nuevoHasta && nuevoHasta >= nuevoDesde) {
      onChange({ desde: nuevoDesde, hasta: nuevoHasta });
    }
  };

  const limpiar = () => {
    setDesde("");
    setHasta("");
    onChange(null);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1.5 text-sm text-slate-600">
          Desde
          <input
            type="date"
            value={desde}
            onChange={(e) => {
              setDesde(e.target.value);
              aplicar(e.target.value, hasta);
            }}
            className={campo}
          />
        </label>
        <label className="flex items-center gap-1.5 text-sm text-slate-600">
          Hasta
          <input
            type="date"
            value={hasta}
            onChange={(e) => {
              setHasta(e.target.value);
              aplicar(desde, e.target.value);
            }}
            className={campo}
          />
        </label>
        {(desde || hasta) && (
          <button
            type="button"
            onClick={limpiar}
            title="Borrar fechas"
            aria-label="Borrar fechas"
            className="text-red-500 transition-colors hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
      {invertido && <p className="mt-1 text-xs text-red-600">La fecha final no puede ser anterior a la inicial.</p>}
      {incompleto && !invertido && (
        <p className="mt-1 text-xs text-slate-400">Elige también la otra fecha para consultar el rango.</p>
      )}
    </div>
  );
}