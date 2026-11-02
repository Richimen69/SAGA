import { AlertCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AlcanceConvencion from "../components/fianzas/AlcanceConvencion";
import CobranzaPendiente from "../components/fianzas/CobranzaPendiente";
import CompromisosPago from "../components/fianzas/CompromisosPago";
import FiltroAfianzadoras from "../components/fianzas/FiltroAfianzadoras";
import ResumenKpis from "../components/fianzas/ResumenKpis";
import VentaMensualChart from "../components/fianzas/VentaMensualChart";
import useDashboardFianzas from "../hooks/useDashboardFianzas";
import { fechaLarga, numero } from "../utils/formatoDashboard";

export default function DashboardFianzas() {
  const navigate = useNavigate();
  const {
    anioActual,
    anio,
    setAnio,
    afianzadoraId,
    setAfianzadoraId,
    afianzadoras,
    data,
    loading,
    error,
  } = useDashboardFianzas();

  const opcionesAnio = [anioActual - 2, anioActual - 1, anioActual];

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-4 md:p-6">
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
        </div>
      </header>

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

          <div className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <VentaMensualChart mensual={data.ventas.mensual} anio={data.anio} corte={data.corte} />
            </div>
            <AlcanceConvencion
              convencion={data.convencion}
              anio={data.anio}
              consolidado={afianzadoraId === null}
              totalAfianzadoras={afianzadoras.length}
              onConfigurar={() => navigate("/catalogos")}
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <CobranzaPendiente cobranza={data.cobranza} />
            </div>
            <CompromisosPago compromisos={data.compromisos} />
          </div>
        </div>
      )}
    </div>
  );
}