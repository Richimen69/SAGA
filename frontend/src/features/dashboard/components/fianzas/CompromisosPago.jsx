import { fechaCorta, moneyFull, numero } from "../../utils/formatoDashboard";

// Cuántos compromisos abiertos se listan; el resto se resume en "y N más"
const MAX_VISIBLES = 3;

const Dato = ({ valor, etiqueta, clases }) => (
  <div className={`rounded-lg p-3 ${clases}`}>
    <p className="text-2xl font-bold text-slate-900">{numero(valor)}</p>
    <p className="text-xs text-slate-600">{etiqueta}</p>
  </div>
);

function Vencimiento({ compromiso }) {
  if (compromiso.vencido) {
    const dias = Math.abs(compromiso.dias_para_vencer);
    return (
      <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-medium text-red-700">
        Vencido hace {dias} {dias === 1 ? "día" : "días"}
      </span>
    );
  }
  const pronto = compromiso.dias_para_vencer <= 7;
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
        pronto ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-700"
      }`}
    >
      {compromiso.dias_para_vencer === 0 ? "Vence hoy" : `Vence ${fechaCorta(compromiso.fecha_vencimiento)}`}
    </span>
  );
}

export default function CompromisosPago({ compromisos }) {
  const visibles = compromisos.listado_abiertos.slice(0, MAX_VISIBLES);
  const ocultos = compromisos.abiertos - visibles.length;

  return (
    <section className="flex h-full min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">Compromisos de pago</h2>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Dato valor={compromisos.registrados} etiqueta="Registrados" clases="bg-slate-100" />
        <Dato valor={compromisos.cumplidos} etiqueta="Cumplidos" clases="bg-emerald-100" />
        <Dato valor={compromisos.abiertos} etiqueta="Abiertos" clases="bg-amber-100" />
      </div>

      <p className="mt-5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        Abiertos · trámites terminados con pago pendiente
      </p>
      {visibles.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">No hay compromisos abiertos.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {visibles.map((c) => (
            <li key={c.id} className="rounded-lg border border-slate-200 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{c.folio}</p>
                  <p className="truncate text-xs text-slate-500">{c.cliente_nombre || "Sin cliente"}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-sm font-semibold text-slate-900">{moneyFull(c.monto)}</span>
                  <Vencimiento compromiso={c} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {ocultos > 0 && (
        <p className="mt-2 text-xs text-slate-400">y {ocultos} más sin mostrar.</p>
      )}
    </section>
  );
}