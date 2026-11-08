import { useMemo, useState } from "react";
import { CheckCircle2, CircleDashed, Loader2, Search } from "lucide-react";
import { formatoMoneda } from "../utils/formato";

export default function AfianzadorasList({ afianzadoras, seleccionadaId, onSelect, loading }) {
  const [busqueda, setBusqueda] = useState("");

  const filtradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return afianzadoras;
    return afianzadoras.filter((a) => a.nombre?.toLowerCase().includes(texto));
  }, [afianzadoras, busqueda]);

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar afianzadora..."
            className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 p-8 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Cargando afianzadoras...
        </div>
      ) : filtradas.length === 0 ? (
        <p className="p-8 text-center text-sm text-slate-500">No se encontraron afianzadoras.</p>
      ) : (
        <ul className="max-h-[32rem] divide-y divide-slate-100 overflow-y-auto">
          {filtradas.map((afi) => {
            const activa = afi.id === seleccionadaId;
            return (
              <li key={afi.id}>
                <button
                  type="button"
                  onClick={() => onSelect(afi)}
                  className={`flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
                    activa ? "bg-blue-50" : ""
                  }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-slate-800">{afi.nombre}</span>
                    {afi.configurada ? (
                      <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" /> Configurada
                      </span>
                    ) : (
                      <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                        <CircleDashed className="h-3 w-3" /> Sin configurar
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-slate-500">
                    Meta general: {formatoMoneda(afi.meta_general)}
                  </span>
                  {afi.configurada && (
                    <span className="text-xs text-slate-500">
                      Meta de conversión: {formatoMoneda(afi.meta_conversion)} · {afi.total_tipos}{" "}
                      {afi.total_tipos === 1 ? "subramo" : "subramos"}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}