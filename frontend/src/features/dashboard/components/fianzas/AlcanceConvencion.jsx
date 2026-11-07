import { AlertTriangle } from "lucide-react";
import { moneyCompact, moneyFull, nombreCorto } from "../../utils/formatoDashboard";

const Fila = ({ etiqueta, valor, color = "text-slate-900" }) => (
  <div className="flex items-center justify-between gap-3 py-2 text-sm">
    <dt className="text-slate-500">{etiqueta}</dt>
    <dd className={`text-right font-semibold ${color}`}>{valor}</dd>
  </div>
);

const opcional = (valor, formato) => (valor == null ? "—" : formato(valor));

// Barra de avance (teal) con la proyección al ritmo actual detrás (teal claro)
function Barra({ porcentaje, proyeccion }) {
  const avance = Math.min(porcentaje, 100);
  return (
    <div
      className="relative h-3 w-full overflow-hidden rounded-full bg-slate-200"
      role="progressbar"
      aria-valuenow={avance}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="absolute inset-y-0 left-0 bg-teal-200" style={{ width: `${Math.min(proyeccion ?? 0, 100)}%` }} />
      <div className="absolute inset-y-0 left-0 bg-teal-600" style={{ width: `${avance}%` }} />
    </div>
  );
}

const Leyenda = () => (
  <div className="flex gap-4 text-[11px] text-slate-500">
    <span className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-sm bg-teal-600" /> Avance
    </span>
    <span className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-sm bg-teal-200" /> Proyección al ritmo actual
    </span>
  </div>
);

const Tarjeta = ({ children }) => (
  <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">{children}</section>
);

/** Todas las afianzadoras: una barra por afianzadora, cada una contra su PROPIA meta (no se suman). */
function BarrasPorAfianzadora({ convencion, anio, afianzadorasSinMeta, onSelectAfianzadora, onConfigurar }) {
  return (
    <Tarjeta>
      <h2 className="text-base font-semibold text-slate-900">Alcance de conversión {anio}</h2>
      <p className="text-xs text-slate-500">Meta anual de cada afianzadora. Haz clic en una para ver su detalle.</p>
      <div className="mt-3">
        <Leyenda />
      </div>

      <ul className="mt-5 space-y-6">
        {convencion.por_afianzadora.map((a) => (
          <li key={a.afianzadora_id}>
            <div className="flex items-baseline justify-between gap-3">
              <button
                type="button"
                onClick={() => onSelectAfianzadora(a.afianzadora_id)}
                title={`Ver el detalle de ${a.afianzadora_nombre}`}
                className="truncate text-left text-sm font-medium text-slate-900 hover:text-blue-700 hover:underline"
              >
                {a.afianzadora_nombre}
              </button>
              <span className="shrink-0 text-2xl font-bold tracking-tight text-teal-600">{a.porcentaje.toFixed(1)}%</span>
            </div>

            <div className="mt-2">
              <Barra porcentaje={a.porcentaje} proyeccion={a.proyeccion_pct} />
            </div>

            <p className="mt-1.5 text-xs text-slate-600">
              <span className="font-semibold text-teal-700">{moneyCompact(a.avance)}</span> de {moneyCompact(a.meta)} ·{" "}
              <span className="text-red-600">faltan {moneyCompact(a.faltante)}</span>
            </p>
            {a.proyeccion_cierre != null && (
              <p className="text-xs text-amber-600">
                Proyección al cierre ≈ {moneyCompact(a.proyeccion_cierre)} ({Math.round(a.proyeccion_pct)}%)
              </p>
            )}
            {a.prima_sin_ramo > 0 && (
              <p className="mt-1 flex items-start gap-1.5 text-[11px] text-amber-700">
                <AlertTriangle className="mt-px h-3 w-3 shrink-0" />
                {moneyCompact(a.prima_sin_ramo)} en trámites sin tipo de fianza no cuentan para su meta.
              </p>
            )}
          </li>
        ))}
      </ul>

      {afianzadorasSinMeta.length > 0 && (
        <div className="mt-6 border-t border-slate-100 pt-3 text-[11px] text-slate-400">
          <p>
            Sin meta de conversión en {anio}: {afianzadorasSinMeta.map((a) => nombreCorto(a.nombre)).join(" · ")}.
          </p>
          <button type="button" onClick={onConfigurar} className="mt-1 text-blue-600 hover:underline">
            Configurar metas
          </button>
        </div>
      )}
    </Tarjeta>
  );
}

/** Una afianzadora elegida: el detalle completo de su meta. */
function DetalleMeta({ convencion, anio }) {
  return (
    <Tarjeta>
      <h2 className="text-base font-semibold text-slate-900">Alcance de conversión {anio}</h2>
      <p className="text-xs text-slate-500">Meta anual sobre venta por prima</p>

      <p className="mt-4 flex items-baseline gap-2">
        <span className="text-5xl font-bold tracking-tight text-teal-600">{convencion.porcentaje.toFixed(1)}%</span>
        <span className="text-sm text-slate-500">de la meta</span>
      </p>

      <div className="mt-3">
        <Barra porcentaje={convencion.porcentaje} proyeccion={convencion.proyeccion_pct} />
      </div>
      <div className="mt-2">
        <Leyenda />
      </div>

      <dl className="mt-4 divide-y divide-slate-100 border-t border-slate-100">
        <Fila etiqueta="Meta anual" valor={moneyFull(convencion.meta)} />
        <Fila etiqueta="Avance acumulado" valor={moneyFull(convencion.avance)} color="text-teal-600" />
        <Fila etiqueta="Faltante" valor={moneyFull(convencion.faltante)} color="text-red-600" />
        <Fila etiqueta="Días restantes del año" valor={convencion.dias_restantes} />
        <Fila
          etiqueta="Ritmo actual / requerido"
          valor={`${opcional(convencion.ritmo_actual_mensual, moneyCompact)} / ${opcional(
            convencion.ritmo_requerido_mensual,
            moneyCompact
          )} por mes`}
        />
        <Fila
          etiqueta="Proyección al cierre"
          valor={
            convencion.proyeccion_cierre == null
              ? "—"
              : `≈ ${moneyCompact(convencion.proyeccion_cierre)} (${Math.round(convencion.proyeccion_pct)}%)`
          }
          color="text-amber-600"
        />
      </dl>

      {convencion.prima_sin_ramo > 0 && (
        <div className="mt-3 flex items-start gap-2 rounded-md bg-amber-50 p-3 text-xs text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{moneyFull(convencion.prima_sin_ramo)} en trámites sin tipo de fianza no cuentan para la meta.</span>
        </div>
      )}
    </Tarjeta>
  );
}

export default function AlcanceConvencion({
  convencion,
  anio,
  consolidado,
  afianzadorasSinMeta = [],
  onSelectAfianzadora,
  onConfigurar,
}) {
  if (!convencion.configurada) {
    return (
      <Tarjeta>
        <h2 className="text-base font-semibold text-slate-900">Alcance de conversión {anio}</h2>
        <p className="mt-4 text-sm text-slate-500">
          {consolidado
            ? `Ninguna afianzadora tiene meta de conversión configurada para ${anio}.`
            : `Esta afianzadora no tiene meta de conversión configurada para ${anio}.`}
        </p>
        <button
          type="button"
          onClick={onConfigurar}
          className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Configurar meta
        </button>
      </Tarjeta>
    );
  }

  // El modo lo decide la forma de los datos que llegan (no la selección del filtro): al cambiar de
  // afianzadora, por un instante la pantalla aún tiene los datos anteriores.
  if (convencion.por_afianzadora) {
    return (
      <BarrasPorAfianzadora
        convencion={convencion}
        anio={anio}
        afianzadorasSinMeta={afianzadorasSinMeta}
        onSelectAfianzadora={onSelectAfianzadora}
        onConfigurar={onConfigurar}
      />
    );
  }
  return <DetalleMeta convencion={convencion} anio={anio} />;
}