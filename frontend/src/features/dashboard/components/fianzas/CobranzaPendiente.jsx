import { useState } from "react";
import { moneyCompact, numero } from "../../utils/formatoDashboard";
import DetalleCobranzaModal from "./DetalleCobranzaModal";

const COLORES_ANTIGUEDAD = ["bg-teal-600", "bg-amber-600", "bg-red-600", "bg-red-900"];

const Dato = ({ etiqueta, valor, detalle, color = "text-slate-900" }) => (
  <div>
    <p className="text-xs text-slate-500">{etiqueta}</p>
    <p className={`mt-1 text-3xl font-bold tracking-tight ${color}`}>{valor}</p>
    <p className="mt-0.5 text-xs text-slate-500">{detalle}</p>
  </div>
);

export default function CobranzaPendiente({ cobranza, afianzadoraId = null }) {
  const [tramoAbierto, setTramoAbierto] = useState(null); // { clave, etiqueta } del tramo cuyo detalle se está viendo
  const maximo = Math.max(0, ...cobranza.antiguedad.map((t) => t.monto));

  // Los tramos llegan en orden: 0–30, 31–90, 91–180, > 180. Pasados de 90 días = los dos últimos.
  const vencida = cobranza.antiguedad.slice(2).reduce(
    (acc, t) => ({ monto: acc.monto + t.monto, tramites: acc.tramites + t.tramites }),
    { monto: 0, tramites: 0 }
  );
  const pctVencida = cobranza.monto_total > 0 ? (vencida.monto / cobranza.monto_total) * 100 : 0;

  return (
    <section className="flex h-full w-full min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-slate-900">Cobranza pendiente</h2>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
          {numero(cobranza.total_tramites)} trámites · {moneyCompact(cobranza.monto_total)}
        </span>
      </div>

      {cobranza.total_tramites === 0 ? (
        <p className="mt-6 text-sm text-slate-500">No hay cobranza pendiente.</p>
      ) : (
        <div className="mt-5 grid flex-1 gap-6 md:grid-cols-3">
          <div className="flex flex-col justify-between gap-5">
            <Dato
              etiqueta="Total por cobrar"
              valor={moneyCompact(cobranza.monto_total)}
              detalle={`${numero(cobranza.total_tramites)} trámites · ${numero(cobranza.tramites_con_prima)} con prima`}
            />
            <Dato
              etiqueta="En NO PAGADA"
              valor={moneyCompact(cobranza.no_pagada.monto)}
              detalle={`${numero(cobranza.no_pagada.tramites)} trámites`}
              color="text-amber-600"
            />
            <Dato
              etiqueta="Con más de 90 días"
              valor={moneyCompact(vencida.monto)}
              detalle={`${numero(vencida.tramites)} trámites · ${pctVencida.toFixed(1)}% del total`}
              color="text-red-600"
            />
          </div>

          <div className="flex flex-col">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Antigüedad (días desde el trámite)
            </p>
            <p className="text-[11px] text-slate-400">Haz clic en un tramo para ver sus trámites.</p>
            <ul className="mt-3 flex flex-1 flex-col justify-between gap-4">
              {cobranza.antiguedad.map((tramo, i) => (
                <li key={tramo.clave}>
                  <button
                    type="button"
                    disabled={tramo.tramites === 0}
                    onClick={() => setTramoAbierto({ clave: tramo.clave, etiqueta: tramo.etiqueta })}
                    title={tramo.tramites === 0 ? "No hay trámites en este tramo" : `Ver los trámites de ${tramo.etiqueta}`}
                    className="-mx-2 block w-[calc(100%+1rem)] rounded-md px-2 py-1 text-left transition-colors enabled:hover:bg-slate-50 disabled:cursor-default"
                  >
                    <span className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-800">{tramo.etiqueta}</span>
                      <span className="text-xs text-slate-500">
                        {moneyCompact(tramo.monto)} · {numero(tramo.tramites)}
                      </span>
                    </span>
                    <span className="mt-1.5 block h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <span
                        className={`block h-full rounded-full ${COLORES_ANTIGUEDAD[i]}`}
                        style={{ width: `${maximo > 0 ? (tramo.monto / maximo) * 100 : 0}%` }}
                      />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Top 5 clientes con saldo
            </p>
            <ul className="mt-3 flex flex-1 flex-col justify-between gap-3">
              {cobranza.top_clientes.map((cliente) => (
                <li
                  key={`${cliente.cliente_id}-${cliente.cliente_nombre}`}
                  className="flex items-start justify-between gap-3 text-sm"
                >
                  <span className="text-slate-700">{cliente.cliente_nombre}</span>
                  <span className="shrink-0 font-semibold text-slate-900">{moneyCompact(cliente.saldo)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {tramoAbierto && (
        <DetalleCobranzaModal
          tramo={tramoAbierto}
          afianzadoraId={afianzadoraId}
          onCerrar={() => setTramoAbierto(null)}
        />
      )}
    </section>
  );
}