import { useState } from "react";
import { AlertCircle, Info, Loader2, Settings2, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useProtectedData from "@/shared/hooks/useProtectedData";
import Pastel from "@/features/dashboard/components/cards/PastelEstadoTramites";
import PastelPendientes from "@/features/dashboard/components/cards/PastelPendientes";
import PastelCompromisos from "@/features/dashboard/components/cards/PastelCompromisos";
import PastelMovimientos from "@/features/dashboard/components/cards/PastelMovimientos";
import TableTramites from "@/features/dashboard/components/tables/TableTramites";
import AlcanceConvencion from "../components/fianzas/AlcanceConvencion";
import CobranzaPendiente from "../components/fianzas/CobranzaPendiente";
import CompromisosPago from "../components/fianzas/CompromisosPago";
import FiltroAfianzadoras from "../components/fianzas/FiltroAfianzadoras";
import ResumenKpis from "../components/fianzas/ResumenKpis";
import VentaMensualChart from "../components/fianzas/VentaMensualChart";
import VentasPeriodo from "../components/fianzas/VentasPeriodo";
import useDashboardFianzas from "../hooks/useDashboardFianzas";
import { fechaLarga, numero } from "../utils/formatoDashboard";

export default function Dashboard() {
  const navigate = useNavigate();
  useProtectedData();

  const {
    anioActual,
    anio,
    setAnio,
    afianzadoraId,
    setAfianzadoraId,
    rango,
    setRango,
    afianzadoras,
    data,
    loading,
    error,
    exportando,
    avisoExcel,
    exportar,
    exportarSeleccion,
  } = useDashboardFianzas();

  // Tabla de detalle que se abre al hacer clic en un pastel
  const [tipoTabla, setTipoTabla] = useState(null);
  const abrirTabla = (tipo) => setTipoTabla((actual) => (actual === tipo ? null : tipo));

  const opcionesAnio = [anioActual - 2, anioActual - 1, anioActual];

  return (
    <div className="mx-auto max-w-8xl space-y-5 p-4 md:p-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard de fianzas</h1>
          {data && (
            <p className="mt-1 text-sm text-slate-500">
              Corte al {fechaLarga(data.corte)} · {numero(data.tramites_analizados)} trámites analizados
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <FiltroAfianzadoras
            afianzadoras={afianzadoras}
            seleccionadaId={afianzadoraId}
            onSelect={setAfianzadoraId}
          />
          <label className="flex items-center gap-2 text-sm text-slate-600">
            Año
            <select
              value={anio}
              onChange={(e) => setAnio(Number(e.target.value))}
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {opcionesAnio.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => navigate("/catalogos")}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Target className="h-4 w-4" /> Metas de conversión
          </button>
          <button
            type="button"
            className="rounded-full p-2 hover:bg-slate-100"
            onClick={() => navigate("/config")}
            title="Configuraciones (meta general)"
            aria-label="Configuraciones"
          >
            <Settings2 color="#076163" />
          </button>
        </div>
      </header>

      {avisoExcel && (
        <div
          role="status"
          className={`flex items-start gap-2 rounded-md p-3 text-sm ${
            avisoExcel.tipo === "error" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"
          }`}
        >
          {avisoExcel.tipo === "error" ? (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <span>{avisoExcel.texto}</span>
        </div>
      )}

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!data && loading && (
        <div className="flex items-center justify-center gap-2 p-16 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Cargando dashboard...
        </div>
      )}

      {data && (
        <div aria-busy={loading} className={`space-y-5 transition-opacity ${loading ? "opacity-60" : ""}`}>
          <ResumenKpis data={data} />

          <VentasPeriodo
            periodo={data.periodo}
            anio={data.anio}
            consolidado={afianzadoraId === null}
            rango={rango}
            onRangoChange={setRango}
            onSelectAfianzadora={setAfianzadoraId}
            exportando={exportando}
            onExportarSeleccion={exportarSeleccion}
            onExportarAfianzadora={exportar}
          />

          <div className="grid gap-5 lg:grid-cols-3">
            <div className="flex lg:col-span-2">
              <VentaMensualChart
                mensual={data.ventas.mensual}
                anio={data.anio}
                corte={data.corte}
                totalActual={data.ventas.total_prima}
                anterior={data.ventas.anio_anterior}
              />
            </div>
            <AlcanceConvencion
              convencion={data.convencion}
              anio={data.anio}
              consolidado={data.afianzadora_id === null}
              afianzadorasSinMeta={afianzadoras.filter(
                (a) => !(data.convencion.por_afianzadora ?? []).some((p) => p.afianzadora_id === a.id)
              )}
              onSelectAfianzadora={setAfianzadoraId}
              onConfigurar={() => navigate("/catalogos")}
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <div className="flex lg:col-span-2">
              <CobranzaPendiente cobranza={data.cobranza} afianzadoraId={data.afianzadora_id} />
            </div>
            <CompromisosPago compromisos={data.compromisos} />
          </div>
        </div>
      )}

    </div>
  );
}