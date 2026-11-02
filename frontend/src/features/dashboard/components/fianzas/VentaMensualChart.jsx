import { mesCorto, moneyCompact, topeEje } from "../../utils/formatoDashboard";

export default function VentaMensualChart({ mensual, anio, corte }) {
  const [anioCorte, mesCorte] = corte.split("-").map(Number);
  const mesEnCurso = anio === anioCorte ? mesCorte : null;

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
                <div className="flex h-full flex-col items-center justify-end">
                  {m.actual > 0 && (
                    <span className="mb-1 hidden whitespace-nowrap text-[10px] font-semibold text-blue-900 lg:block">
                      {moneyCompact(m.actual)}
                    </span>
                  )}
                  <div
                    className="w-2.5 rounded-t bg-blue-900 sm:w-4"
                    style={{ height: altura(m.actual) }}
                    title={`${mesCorto(m.mes)} ${anio}: ${moneyCompact(m.actual)}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div />
        <div>
          <div className="mt-2 flex">
            {mensual.map((m) => (
              <span key={m.mes} className="flex-1 text-center text-[11px] text-slate-500">
                {mesCorto(m.mes)}
                {m.mes === mesEnCurso ? "*" : ""}
              </span>
            ))}
          </div>
          {mesEnCurso && <p className="mt-2 text-[11px] text-slate-400">* Mes en curso (incompleto).</p>}
        </div>
      </div>
    </section>
  );
}