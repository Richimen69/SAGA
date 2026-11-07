import { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import AfianzadorasList from "../components/AfianzadorasList";
import AvanceMeta from "../components/AvanceMeta";
import GastosExpedicionTab from "../components/GastosExpedicionTab";
import MetaConversionForm from "../components/forms/MetaConversionForm";
import useMetasConversion from "../hooks/useMetasConversion";
import { formatoMoneda } from "../utils/formato";

// Para agregar más catálogos, añade una pestaña aquí y su contenido abajo
const TABS = [
  { id: "metas", label: "Metas de conversión" },
  { id: "gastos", label: "Gastos de expedición" },
];

function MetasConversionTab() {
  const anioActual = new Date().getFullYear();
  const [anio, setAnio] = useState(anioActual);
  const opcionesAnio = [anioActual - 1, anioActual, anioActual + 1];

  const {
    afianzadoras,
    ramos,
    tiposPorRamo,
    seleccionada,
    meta,
    avance,
    loading,
    loadingDetalle,
    guardando,
    error,
    errorDetalle,
    seleccionar,
    guardar,
  } = useMetasConversion(anio);

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <label htmlFor="anio-meta" className="text-sm font-medium text-slate-700">
          Año
        </label>
        <select
          id="anio-meta"
          value={anio}
          onChange={(e) => setAnio(Number(e.target.value))}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          {opcionesAnio.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div role="alert" className="mb-4 flex items-start gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <AfianzadorasList
            afianzadoras={afianzadoras}
            seleccionadaId={seleccionada?.id}
            onSelect={seleccionar}
            loading={loading}
          />
        </div>

        <div className="space-y-4 lg:col-span-2">
          {!seleccionada ? (
            <div className="rounded-lg border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
              Selecciona una afianzadora para parametrizar su meta de conversión.
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="text-base font-semibold text-slate-900">{seleccionada.nombre}</h2>
                <p className="text-xs text-slate-500">
                  Meta general: {formatoMoneda(seleccionada.meta_general)} · Año {anio}
                </p>
              </div>

              {loadingDetalle ? (
                <div className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white p-10 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" /> Cargando meta...
                </div>
              ) : errorDetalle ? (
                <div role="alert" className="flex items-start gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{errorDetalle}</span>
                </div>
              ) : (
                <>
                  <MetaConversionForm
                    key={`${seleccionada.id}-${anio}-${meta?.id ?? "nueva"}-${meta?.fecha_actualizacion ?? ""}`}
                    meta={meta}
                    ramos={ramos}
                    tiposPorRamo={tiposPorRamo}
                    guardando={guardando}
                    onGuardar={guardar}
                  />
                  {meta && <AvanceMeta avance={avance} />}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CatalogosPage() {
  const [tab, setTab] = useState(TABS[0].id);

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6">
      <h1 className="text-xl font-semibold text-slate-900">Catálogos</h1>

      <div className="mt-4 flex gap-1 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {tab === "metas" && <MetasConversionTab />}
        {tab === "gastos" && <GastosExpedicionTab />}
      </div>
    </div>
  );
}
