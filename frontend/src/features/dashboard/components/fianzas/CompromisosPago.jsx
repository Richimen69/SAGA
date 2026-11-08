import { fechaCorta, moneyCompact, moneyFull, numero } from "../../utils/formatoDashboard";

const Dato = ({ valor, etiqueta, clases }) => (
  <div className={`rounded-lg p-3 ${clases}`}>
    <p className="text-2xl font-bold text-slate-900">{valor}</p>
    <p className="text-xs text-slate-600">{etiqueta}</p>
  </div>
);

// El vencimiento solo se muestra si el trámite tiene un compromiso abierto con fecha registrada
function Vencimiento({ compromiso }) {
  if (!compromiso.fecha_vencimiento) return null;

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
  const lista = compromisos.listado_abiertos;

  return (
    <section className="flex h-full min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">Compromisos de pago</h2>
      <p className="text-xs text-slate-500">Trámites en compromiso de pago con estatus de pago NO PAGADA</p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Dato valor={numero(compromisos.abiertos)} etiqueta="Trámites" clases="bg-amber-100" />
        <Dato valor={moneyCompact(compromisos.monto_abierto)} etiqueta="Prima por cobrar" clases="bg-slate-100" />
      </div>

      {lista.length === 0 ? (
        <p className="mt-5 text-sm text-slate-500">No hay trámites en compromiso de pago.</p>
      ) : (
        <>
          <ul className="mt-4 max-h-[24rem] space-y-2 overflow-y-auto pr-1">
            {lista.map((c) => (
              <li key={c.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{c.folio}</p>
                    <p className="truncate text-xs text-slate-500" title={c.cliente_nombre}>
                      {c.cliente_nombre}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-sm font-semibold text-slate-900">{moneyFull(c.monto)}</span>
                    <Vencimiento compromiso={c} />
                  </div>
                </div>
                <p className="mt-2 break-words border-t border-slate-100 pt-2 text-xs text-slate-600">
                  <span className="font-medium text-slate-500">Observaciones: </span>
                  {c.observaciones_pago || <span className="text-slate-400">Sin observaciones</span>}
                </p>
              </li>
            ))}
          </ul>
          {compromisos.truncado && (
            <p className="mt-2 text-xs text-slate-400">
              Se muestran {numero(lista.length)} de {numero(compromisos.abiertos)} trámites.
            </p>
          )}
        </>
      )}
    </section>
  );
}