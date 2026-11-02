import { AlertTriangle } from "lucide-react";
import { formatoMoneda, formatoPorcentaje } from "../utils/formato";

const colorBarra = (pct) => {
  if (pct >= 100) return "bg-emerald-500";
  if (pct >= 50) return "bg-amber-500";
  return "bg-red-500";
};

export default function AvanceMeta({ avance }) {
  if (!avance) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
        Todavía no hay datos de avance para esta meta.
      </div>
    );
  }

  const cumplimiento = Number(avance.porcentaje_cumplimiento) || 0;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">Avance de conversión</h3>

      <div className="mt-3 flex items-end justify-between">
        <span className="text-2xl font-semibold text-slate-900">{formatoPorcentaje(cumplimiento)}</span>
        <span className="text-xs text-slate-500">de {formatoMoneda(avance.meta_conversion)}</span>
      </div>

      <div
        className="mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuenow={Math.min(cumplimiento, 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-all ${colorBarra(cumplimiento)}`}
          style={{ width: `${Math.min(cumplimiento, 100)}%` }}
        />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-md bg-slate-50 p-3">
          <dt className="text-xs text-slate-500">Total aceptado</dt>
          <dd className="font-medium text-slate-900">{formatoMoneda(avance.total_aceptado)}</dd>
        </div>
        <div className="rounded-md bg-slate-50 p-3">
          <dt className="text-xs text-slate-500">Faltante</dt>
          <dd className="font-medium text-slate-900">{formatoMoneda(avance.faltante)}</dd>
        </div>
      </dl>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs text-slate-500">
              <th className="py-2 pr-3 font-medium">Ramo</th>
              <th className="px-3 py-2 text-right font-medium">Prima</th>
              <th className="px-3 py-2 text-right font-medium">%</th>
              <th className="py-2 pl-3 text-right font-medium">Aceptado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {avance.ramos.map((r) => (
              <tr key={r.ramo}>
                <td className="py-2 pr-3 text-slate-800">{r.ramo_nombre}</td>
                <td className="px-3 py-2 text-right text-slate-600">{formatoMoneda(r.prima)}</td>
                <td className="px-3 py-2 text-right text-slate-600">{formatoPorcentaje(r.porcentaje)}</td>
                <td className="py-2 pl-3 text-right font-medium text-slate-900">
                  {formatoMoneda(r.prima_aceptada)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {Number(avance.prima_sin_ramo) > 0 && (
        <div className="mt-4 flex items-start gap-2 rounded-md bg-amber-50 p-3 text-xs text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Hay {formatoMoneda(avance.prima_sin_ramo)} en trámites sin tipo de fianza. No se pueden asignar a
            ningún ramo y no cuentan para esta meta.
          </span>
        </div>
      )}
    </div>
  );
}