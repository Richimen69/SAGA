import { Download, Loader2 } from "lucide-react";
import { moneyCompact, moneyFull } from "../../utils/formatoDashboard";

const colorMetaGeneral = (pct) => {
  if (pct >= 80) return "bg-emerald-500";
  if (pct >= 50) return "bg-yellow-400";
  return "bg-red-500";
};

function Barra({ pct, color }) {
  return (
    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-200">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  );
}

export default function ResumenAfianzadoras({ filas, onSelect, onExportar, exportando }) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <h3 className="text-base font-semibold text-slate-900">Resumen por afianzadora</h3>
      <p className="text-xs text-slate-500">Venta del periodo. Haz clic en una afianzadora para ver su detalle.</p>

      {filas.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">No hay ventas en este periodo.</p>
      ) : (
        <ul className="mt-4 max-h-[640px] space-y-5 overflow-y-auto pr-1">
          {filas.map((fila, i) => {
            const seleccionable = fila.afianzadora_id != null;
            const descargando = exportando === fila.nombre;
            const faltante = Math.max((fila.meta_general_periodo ?? 0) - fila.venta, 0);

            return (
              <li key={fila.afianzadora_id ?? "sin-afianzadora"} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-2 text-sm font-medium">
                    {seleccionable ? (
                      <button
                        type="button"
                        onClick={() => onSelect(fila.afianzadora_id)}
                        className="truncate text-left text-slate-900 hover:text-blue-700 hover:underline"
                      >
                        {fila.nombre}
                      </button>
                    ) : (
                      <span className="truncate text-slate-500">{fila.nombre}</span>
                    )}
                    <button
                      type="button"
                      onClick={() => onExportar(fila.nombre)}
                      disabled={exportando !== null || !seleccionable}
                      title={`Descargar Excel de ${fila.nombre}`}
                      aria-label={`Descargar Excel de ${fila.nombre}`}
                      className="shrink-0 text-slate-400 transition-colors hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {descargando ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </span>
                  <span className="shrink-0 text-xs text-slate-400">#{i + 1}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-slate-900">{moneyFull(fila.venta)}</span>
                  {fila.meta_general_periodo ? (
                    <span className="text-sm font-medium text-blue-600">
                      {fila.avance_meta_general_pct.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">Sin meta general</span>
                  )}
                </div>

                {fila.meta_general_periodo ? (
                  <>
                    <Barra pct={fila.avance_meta_general_pct} color={colorMetaGeneral(fila.avance_meta_general_pct)} />
                    <p className="text-xs text-red-500">
                      Faltan: {moneyFull(faltante)}{" "}
                      <span className="text-slate-400">de {moneyCompact(fila.meta_general_periodo)}</span>
                    </p>
                  </>
                ) : null}

                {fila.meta_conversion ? (
                  <div className="pt-1">
                    <p className="text-xs text-slate-600">
                      Conversión <span className="font-semibold text-slate-900">{fila.conversion_pct.toFixed(1)}%</span>{" "}
                      · {moneyCompact(fila.conversion_aceptado)} de {moneyCompact(fila.meta_conversion)}
                    </p>
                    <Barra pct={fila.conversion_pct} color="bg-teal-600" />
                  </div>
                ) : (
                  <p className="pt-1 text-xs text-slate-400">Sin meta de conversión</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}