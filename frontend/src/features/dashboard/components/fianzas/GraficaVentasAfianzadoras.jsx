import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { moneyCompact, moneyFull } from "../../utils/formatoDashboard";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#076163", "#9B3A4D"];

// Una fila por mes, con una columna por afianzadora (a_<clave>)
export const filasGrafica = (serie) =>
  serie.meses.map((mes) => ({
    name: mes.etiqueta,
    ...Object.fromEntries(serie.afianzadoras.map((a) => [`a_${a.clave}`, mes.valores[a.clave] ?? 0])),
  }));

export default function GraficaVentasAfianzadoras({ serie, titulo }) {
  const filas = filasGrafica(serie);

  return (
    <div>
      <h3 className="text-base font-semibold text-slate-900">{titulo}</h3>

      {serie.afianzadoras.length === 0 ? (
        <p className="mt-8 rounded-lg border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
          No hay ventas en este periodo.
        </p>
      ) : (
        <>
          <div className="mt-3" role="img" aria-label={titulo}>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={filas} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={moneyCompact} />
                <Tooltip formatter={(valor, nombre) => [moneyFull(valor), nombre]} />
                {serie.afianzadoras.map((afi, i) => (
                  <Line
                    key={afi.clave}
                    type="monotone"
                    dataKey={`a_${afi.clave}`}
                    name={afi.nombre}
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth={4}
                    dot={{ fill: COLORS[i % COLORS.length], strokeWidth: 3, r: 3 }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {serie.afianzadoras.map((afi, i) => {
              const maximo = Math.max(0, ...filas.map((f) => f[`a_${afi.clave}`]));
              return (
                <div key={afi.clave} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3">
                  <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-slate-800">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span className="truncate">{afi.nombre}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-[10px] text-slate-400">Máximo mensual</span>
                    <span className="text-sm font-semibold text-slate-900">{moneyCompact(maximo)}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}