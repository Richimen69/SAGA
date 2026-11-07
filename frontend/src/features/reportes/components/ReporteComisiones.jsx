import { AlertCircle, FileSpreadsheet, Info, Loader2, Play } from "lucide-react";
import useReporteComisiones from "../hooks/useReporteComisiones";
import { fechaDMA } from "../utils/formatoReportes";
import TablaComisiones from "./TablaComisiones";

const campo =
  "mt-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function ReporteComisiones() {
  const {
    afianzadoras, afianzadoraId, setAfianzadoraId, desde, setDesde, hasta, setHasta,
    reporte, loading, exportando, error, aviso, generar, exportar,
  } = useReporteComisiones();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="min-w-[14rem] flex-1">
          <label htmlFor="rep-afianzadora" className="text-sm font-medium text-slate-700">
            Afianzadora
          </label>
          <select
            id="rep-afianzadora"
            value={afianzadoraId ?? ""}
            onChange={(e) => setAfianzadoraId(e.target.value ? Number(e.target.value) : null)}
            className={`${campo} w-full`}
          >
            <option value="">Todas las afianzadoras</option>
            {afianzadoras.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="rep-desde" className="block text-sm font-medium text-slate-700">
            Desde
          </label>
          <input id="rep-desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className={campo} />
        </div>
        <div>
          <label htmlFor="rep-hasta" className="block text-sm font-medium text-slate-700">
            Hasta
          </label>
          <input id="rep-hasta" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className={campo} />
        </div>
        <button
          type="button"
          onClick={generar}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          Generar reporte
        </button>
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {aviso && (
        <div
          role="status"
          className={`flex items-start gap-2 rounded-md p-3 text-sm ${aviso.tipo === "error" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"}`}
        >
          {aviso.tipo === "error" ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> : <Info className="mt-0.5 h-4 w-4 shrink-0" />}
          <span>{aviso.texto}</span>
        </div>
      )}

      {!reporte ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
          Elige la afianzadora y el periodo, y presiona "Generar reporte". Antes, configura las comisiones en la pestaña
          Parametrización.
        </div>
      ) : (
        <div className={`space-y-3 transition-opacity ${loading ? "opacity-60" : ""}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                {reporte.nombreAfianzadora || "Todas las afianzadoras"}
              </h2>
              <p className="text-xs text-slate-500">
                Trámites con fecha de término del {fechaDMA(reporte.desde)} al {fechaDMA(reporte.hasta)}
              </p>
            </div>
            <button
              type="button"
              onClick={exportar}
              disabled={reporte.filas.length === 0 || exportando}
              title="Descarga el detalle trámite por trámite y el resumen"
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {exportando ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
              {exportando ? "Generando..." : "Excel"}
            </button>
          </div>
          <TablaComisiones reporte={reporte} />
        </div>
      )}
    </div>
  );
}