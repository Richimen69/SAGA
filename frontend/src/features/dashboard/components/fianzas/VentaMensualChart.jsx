import { formatoVariacion, mesCorto, moneyCompact, moneyFull, topeEje } from "../../utils/formatoDashboard";

// Verde si vendió más que el año anterior, rojo si vendió menos, gris si quedó igual
const estiloVariacion = (valor) => {
  if (valor > 0) return "bg-emerald-50 text-emerald-700";
  if (valor < 0) return "bg-red-50 text-red-700";
  return "bg-slate-100 text-slate-500";
};

function Variacion({ valor, className = "", ...props }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-1.5 py-0.5 font-semibold ${estiloVariacion(valor)} ${className}`}
      {...props}
    >
      {formatoVariacion(valor)}
    </span>
  );
}

// Pastilla de un mes: su % contra el mismo mes del año anterior. "Nuevo" si el año anterior no vendió nada ese mes.
function VariacionMes({ m, anio, enCurso }) {
  const nombre = mesCorto(m.mes);
  if (m.variacion_pct != null) {
    const detalle = enCurso
      ? `${anio} vs los mismos días de ${anio - 1}`
      : `${anio} vs ${anio - 1}`;
    return (
      <Variacion
        valor={m.variacion_pct}
        className="text-[10px]"
        title={`${nombre}: ${moneyCompact(m.actual)} contra ${moneyCompact(m.anterior_comparable)} (${detalle})`}
        aria-label={`Variación de ${nombre}: ${formatoVariacion(m.variacion_pct)}`}
      />
    );
  }
  if (m.anterior_comparable === 0 && m.actual > 0) {
    return (
      <span
        className="inline-block whitespace-nowrap rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700"
        title={`${nombre}: ${anio - 1} no tuvo ventas en ese periodo`}
      >
        Nuevo
      </span>
    );
  }
  return null; // el mes aún no llega, o ninguno de los dos años vendió
}

export default function VentaMensualChart({ mensual, anio, corte, totalActual = 0, anterior = null }) {
  const [anioCorte, mesCorte, diaCorte] = corte.split("-").map(Number);
  const mesEnCurso = anio === anioCorte ? mesCorte : null;
  const periodo = mesEnCurso ? `1 ene – ${diaCorte} ${mesCorto(mesCorte).toLowerCase()}` : "año completo";
  // El año anterior completo solo se muestra aparte si es distinto de su mismo periodo
  const anioCompleto =
    anterior?.total_anio_completo != null && Math.abs(anterior.total_anio_completo - anterior.total_prima) > 0.005
      ? anterior.total_anio_completo
      : null;

  const maximo = Math.max(0, ...mensual.flatMap((m) => [m.actual, m.anterior]));
  const tope = topeEje(maximo);
  const altura = (valor) => `${Math.min((valor / tope) * 100, 100)}%`;
  const marcas = [0, 1, 2, 3, 4].map((i) => (tope * i) / 4);

  return (
    <section className="flex h-full w-full min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Venta por prima mensual</h2>
          <p className="text-xs text-slate-500">
            Prima total por mes de término, {anio} vs {anio - 1}
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-blue-900" /> {anio}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-slate-300" /> {anio - 1}
          </span>
        </div>
      </div>

      {anterior && (
        <div className="mt-4 rounded-lg bg-slate-50 p-3" data-testid="comparativa-total">
          <div className="grid grid-cols-2 items-center gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <div>
              <p className="text-[11px] text-slate-500">
                {anio - 1} · {periodo}
              </p>
              <p className="text-lg font-semibold text-slate-600">{moneyFull(anterior.total_prima)}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500">
                {anio} · {periodo}
              </p>
              <p className="text-lg font-semibold text-blue-900">{moneyFull(totalActual)}</p>
            </div>
            <div className="col-span-2 flex items-center gap-2 sm:col-span-1 sm:flex-col sm:items-start sm:gap-0.5">
              {anterior.variacion_pct != null ? (
                <Variacion valor={anterior.variacion_pct} className="text-sm" aria-label={`Variación total: ${formatoVariacion(anterior.variacion_pct)}`} />
              ) : (
                <span className="text-xs text-slate-400">Sin base de comparación</span>
              )}
              {anterior.variacion_pct != null && <span className="text-[11px] text-slate-400">vs {anio - 1}</span>}
            </div>
          </div>
          {anioCompleto != null && (
            <p className="mt-2 border-t border-slate-200 pt-2 text-[11px] text-slate-400">
              Año completo {anio - 1}: {moneyFull(anioCompleto)}
            </p>
          )}
        </div>
      )}

      {/* La zona de barras crece para llenar la tarjeta; los ejes se alinean con una cuadrícula */}
      <div className="mt-8 grid min-h-[300px] flex-1 grid-cols-[2.5rem_1fr] grid-rows-[1fr_auto] gap-x-3">
        <div className="relative text-right text-[10px] text-slate-400">
          {marcas.map((valor, i) => (
            <span
              key={i}
              className="absolute right-0 translate-y-1/2"
              style={{ bottom: `${(i / 4) * 100}%` }}
            >
              {moneyCompact(valor).replace(".00", "").replace(".0", "")}
            </span>
          ))}
        </div>

        <div className="relative" role="img" aria-label={`Venta mensual ${anio} contra ${anio - 1}`}>
          {marcas.map((_, i) => (
            <div
              key={i}
              className="absolute inset-x-0 border-t border-slate-100"
              style={{ bottom: `${(i / 4) * 100}%` }}
            />
          ))}
          <div className="absolute inset-0 flex items-end">
            {mensual.map((m) => (
              <div key={m.mes} className="flex h-full flex-1 items-end justify-center gap-1">
                <div
                  className="w-2.5 rounded-t bg-slate-300 sm:w-4"
                  style={{ height: altura(m.anterior) }}
                  title={`${mesCorto(m.mes)} ${anio - 1}: ${moneyCompact(m.anterior)}`}
                />
                <div className="relative flex h-full flex-col items-center justify-end">
                  <div
                    className="w-2.5 rounded-t bg-blue-900 sm:w-4"
                    style={{ height: altura(m.actual) }}
                    title={`${mesCorto(m.mes)} ${anio}: ${moneyCompact(m.actual)}`}
                  />
                  {/* El monto va sobre la barra sin ocupar espacio: así no ensancha la columna en pantallas medianas */}
                  {m.actual > 0 && (
                    <span
                      className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold text-blue-900 lg:block"
                      style={{ bottom: `calc(${altura(m.actual)} + 4px)` }}
                    >
                      {moneyCompact(m.actual)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div />
        <div>
          <div className="mt-2 flex">
            {mensual.map((m) => (
              <div key={m.mes} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[11px] text-slate-500">
                  {mesCorto(m.mes)}
                  {m.mes === mesEnCurso ? "*" : ""}
                </span>
                {/* Variación contra el mismo mes del año anterior */}
                <span className="hidden min-h-[20px] sm:block">
                  <VariacionMes m={m} anio={anio} enCurso={m.mes === mesEnCurso} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}