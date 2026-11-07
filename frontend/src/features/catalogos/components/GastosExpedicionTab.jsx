import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, CircleDashed, Loader2, Search } from "lucide-react";
import useGastosExpedicion from "../hooks/useGastosExpedicion";
import GastoExpedicionForm from "./forms/GastoExpedicionForm";

const moneda = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });

export default function GastosExpedicionTab() {
  const { afianzadoras, seleccionada, setSeleccionadaId, loading, guardando, error, guardar } =
    useGastosExpedicion();
  const [busqueda, setBusqueda] = useState("");

  const filtradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return texto ? afianzadoras.filter((a) => a.nombre?.toLowerCase().includes(texto)) : afianzadoras;
  }, [afianzadoras, busqueda]);

  return (
    <div>
      {error && (
        <div role="alert" className="mb-4 flex items-start gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm lg:col-span-1">
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
              {filtradas.map((afi) => (
                <li key={afi.id}>
                  <button
                    type="button"
                    onClick={() => setSeleccionadaId(afi.id)}
                    className={`flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
                      seleccionada?.id === afi.id ? "bg-blue-50" : ""
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-slate-800">{afi.nombre}</span>
                      {afi.configurada ? (
                        <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" /> Configurado
                        </span>
                      ) : (
                        <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                          <CircleDashed className="h-3 w-3" /> Sin configurar
                        </span>
                      )}
                    </span>
                    {afi.configurada && (
                      <span className="text-xs text-slate-500">
                        {moneda.format(afi.monto)} · {afi.porcentaje_comision}% de comisión
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-4 lg:col-span-2">
          {!seleccionada ? (
            <div className="rounded-lg border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
              Selecciona una afianzadora para configurar su gasto de expedición.
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="text-base font-semibold text-slate-900">{seleccionada.nombre}</h2>
                <p className="text-xs text-slate-500">Catálogo de gastos de expedición</p>
              </div>
              <GastoExpedicionForm
                key={seleccionada.id}
                afianzadora={seleccionada}
                guardando={guardando}
                onGuardar={guardar}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
