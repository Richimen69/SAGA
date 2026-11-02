import { DollarSign, Download, Loader2 } from "lucide-react";
import { fechaDMA, moneyFull, numero } from "../../utils/formatoDashboard";
import FiltroPeriodo from "./FiltroPeriodo";
import GraficaVentasAfianzadoras from "./GraficaVentasAfianzadoras";
import ResumenAfianzadoras from "./ResumenAfianzadoras";

export default function VentasPeriodo({
  periodo,
  anio,
  consolidado,
  rango,
  onRangoChange,
  onSelectAfianzadora,
  exportando,
  onExportarSeleccion,
  onExportarAfianzadora,
}) {
  const titulo = periodo.personalizado
    ? `Prima total del ${fechaDMA(periodo.desde)} al ${fechaDMA(periodo.hasta)}`
    : `Prima total ${anio}`;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm text-slate-500">
            <DollarSign className="h-4 w-4" /> {titulo}
          </p>
          <p className="mt-2 text-5xl font-bold tracking-tight text-slate-900">{moneyFull(periodo.total_prima)}</p>
          <p className="mt-1 text-xs text-slate-500">{numero(periodo.total_tramites)} trámites en el periodo</p>
        </div>

        <div className="flex flex-wrap items-start gap-3">
          <FiltroPeriodo rango={rango} onChange={onRangoChange} />
          <button
            type="button"
            onClick={onExportarSeleccion}
            disabled={exportando !== null}
            title="Descarga los trámites del periodo seleccionado"
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {exportando !== null ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {exportando !== null ? "Generando..." : consolidado ? "Excel (todo)" : "Excel"}
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className={consolidado ? "lg:col-span-2" : "lg:col-span-3"}>
          <GraficaVentasAfianzadoras
            serie={periodo.serie_mensual}
            titulo={consolidado ? "Distribución por afianzadora" : "Ventas por mes"}
          />
        </div>
        {consolidado && (
          <ResumenAfianzadoras
            filas={periodo.resumen_afianzadoras}
            onSelect={onSelectAfianzadora}
            onExportar={onExportarAfianzadora}
            exportando={exportando}
          />
        )}
      </div>
    </section>
  );
}