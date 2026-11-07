import { AlertTriangle } from "lucide-react";
import { dinero, numero, porcentaje } from "../utils/formatoReportes";

const celdaNumero = "px-3 py-3 text-right tabular-nums";

export default function TablaComisiones({ reporte }) {
  const conAfianzadora = reporte.afianzadora_id == null;
  const { totales, no_considerados: fuera, afianzadoras_sin_gasto: sinGasto } = reporte;

  return (
    <div className="space-y-4">
      {fuera.tramites > 0 && (
        <div className="flex items-start gap-2 rounded-md bg-amber-50 p-3 text-xs text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Hay {numero(fuera.tramites)} trámites del periodo ({dinero(fuera.prima_total)} de prima) que no entran en este
            reporte porque su ramo y movimiento no están parametrizados.
          </span>
        </div>
      )}
      {sinGasto.length > 0 && (
        <div className="flex items-start gap-2 rounded-md bg-amber-50 p-3 text-xs text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Sin gasto de expedición en el catálogo, por eso su columna de gastos aparece en $0.00:{" "}
            {sinGasto.map((a) => a.nombre).join(" · ")}
          </span>
        </div>
      )}

      {reporte.filas.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
          No hay trámites en este periodo para las comisiones parametrizadas.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                {conAfianzadora && <th className="px-3 py-3 font-medium">Afianzadora</th>}
                <th className="px-3 py-3 font-medium">Ramo</th>
                <th className="px-3 py-3 font-medium">Movimiento</th>
                <th className="px-3 py-3 text-right font-medium">Trámites</th>
                <th className="px-3 py-3 text-right font-medium">Prima total</th>
                <th className="px-3 py-3 text-right font-medium">Comisión</th>
                <th className="px-3 py-3 text-right font-medium">Gastos de expedición</th>
                <th className="px-3 py-3 text-right font-medium">Comisión PP</th>
                <th className="px-3 py-3 text-right font-medium">Comisión total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reporte.filas.map((f) => (
                <tr key={`${f.afianzadora_id}-${f.ramo_id}-${f.movimiento_id}`}>
                  {conAfianzadora && <td className="px-3 py-3 text-slate-700">{f.afianzadora_nombre}</td>}
                  <td className="px-3 py-3 font-medium text-slate-900">{f.ramo_nombre}</td>
                  <td className="px-3 py-3 text-slate-700">{f.movimiento_nombre}</td>
                  <td className={`${celdaNumero} text-slate-600`}>{numero(f.tramites)}</td>
                  <td className={celdaNumero}>{dinero(f.prima_total)}</td>
                  <td className={celdaNumero}>
                    {dinero(f.comision)}
                    <span className="block text-[11px] text-slate-400">{porcentaje(f.porcentaje_comision)}</span>
                  </td>
                  <td className={celdaNumero}>
                    {f.aplica_gasto_expedicion === false ? (
                      <>
                        <span className="text-slate-300">—</span>
                        <span className="block text-[11px] text-slate-400">No aplica</span>
                      </>
                    ) : (
                      <>
                        {dinero(f.gasto_expedicion)}
                        {f.gasto_sin_configurar && (
                          <span className="block text-[11px] text-amber-600">Sin gasto en catálogo</span>
                        )}
                      </>
                    )}
                  </td>
                  <td className={celdaNumero}>
                    {f.pronto_pago_activo ? (
                      <>
                        {dinero(f.comision_pronto_pago)}
                        <span className="block text-[11px] text-slate-400">
                          {numero(f.tramites_pronto_pago)} de {numero(f.tramites)} · {porcentaje(f.porcentaje_pronto_pago)}
                        </span>
                      </>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className={`${celdaNumero} font-semibold text-slate-900`}>{dinero(f.comision_total)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-teal-700 text-white">
              <tr className="font-semibold">
                <td className="px-3 py-3" colSpan={conAfianzadora ? 3 : 2}>
                  Total
                </td>
                <td className={celdaNumero}>{numero(totales.tramites)}</td>
                <td className={celdaNumero}>{dinero(totales.prima_total)}</td>
                <td className={celdaNumero}>{dinero(totales.comision)}</td>
                <td className={celdaNumero}>{dinero(totales.gasto_expedicion)}</td>
                <td className={celdaNumero}>{dinero(totales.comision_pronto_pago)}</td>
                <td className={celdaNumero}>{dinero(totales.comision_total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}