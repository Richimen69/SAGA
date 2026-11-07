import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, Info, Loader2, X } from "lucide-react";
import useDetalleCobranza from "../../hooks/useDetalleCobranza";
import { fechaDMA, moneyCents, numero } from "../../utils/formatoDashboard";

const PILDORA_PAGO = {
  "NO PAGADA": "bg-red-100 text-red-700",
  "SE MANDÓ RECIBO": "bg-amber-100 text-amber-800",
};

/**
 * Ventana con los trámites de un tramo de antigüedad de la cobranza.
 * Se dibuja en el <body> para que ninguna tarjeta ni sección la tape.
 */
export default function DetalleCobranzaModal({ tramo, afianzadoraId, onCerrar }) {
  const { data, loading, error } = useDetalleCobranza(tramo.clave, afianzadoraId);
  const botonCerrar = useRef(null);
  const conAfianzadora = afianzadoraId == null;

  useEffect(() => {
    botonCerrar.current?.focus();
    const alTeclear = (e) => e.key === "Escape" && onCerrar();
    document.addEventListener("keydown", alTeclear);
    return () => document.removeEventListener("keydown", alTeclear);
  }, [onCerrar]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="presentation"
      onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="detalle-cobranza-titulo"
        className="flex max-h-[85vh] w-full max-w-7xl flex-col rounded-xl bg-white shadow-xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div>
            <h2 id="detalle-cobranza-titulo" className="text-base font-semibold text-slate-900">
              Cobranza pendiente · {tramo.etiqueta}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {data
                ? `${numero(data.total_tramites)} trámites · ${moneyCents(data.monto_total)} · antigüedad desde la fecha del trámite`
                : "Antigüedad desde la fecha del trámite"}
            </p>
          </div>
          <button
            ref={botonCerrar}
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="overflow-auto p-5">
          {loading && (
            <div className="flex items-center justify-center gap-2 p-10 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando trámites...
            </div>
          )}

          {error && (
            <div role="alert" className="flex items-start gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {data && data.tramites.length === 0 && (
            <p className="p-10 text-center text-sm text-slate-500">No hay trámites en este tramo.</p>
          )}

          {data && data.tramites.length > 0 && (
            <>
              {data.truncado && (
                <div className="mb-3 flex items-start gap-2 rounded-md bg-amber-50 p-3 text-xs text-amber-800">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    Hay {numero(data.total_tramites)} trámites en este tramo; aquí se muestran los {numero(data.limite)} de
                    mayor monto.
                  </span>
                </div>
              )}
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="sticky top-0 bg-slate-50 text-xs text-slate-500">
                  <tr>
                    <th className="px-3 py-2 font-medium">Folio</th>
                    <th className="px-3 py-2 font-medium">Cliente</th>
                    {conAfianzadora && <th className="px-3 py-2 font-medium">Afianzadora</th>}
                    <th className="px-3 py-2 font-medium">Movimiento</th>
                    <th className="px-3 py-2 font-medium">Fecha del trámite</th>
                    <th className="px-3 py-2 text-right font-medium">Antigüedad</th>
                    <th className="px-3 py-2 font-medium">Estatus de pago</th>
                    <th className="px-3 py-2 text-right font-medium">Prima total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.tramites.map((t) => (
                    <tr key={t.folio}>
                      <td className="whitespace-nowrap px-3 py-2 font-medium text-slate-900">{t.folio}</td>
                      <td className="px-3 py-2 text-slate-700">{t.cliente_nombre}</td>
                      {conAfianzadora && <td className="px-3 py-2 text-slate-600">{t.afianzadora_nombre}</td>}
                      <td className="px-3 py-2 text-slate-600">{t.movimiento_nombre}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-slate-600">{fechaDMA(t.fecha)}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-slate-600">
                        {t.dias == null ? "—" : `${numero(t.dias)} días`}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            PILDORA_PAGO[t.estatus_pago] ?? "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {t.estatus_pago}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right font-semibold tabular-nums text-slate-900">
                        {moneyCents(t.prima_total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}