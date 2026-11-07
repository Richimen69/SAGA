import { useState } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Loader2, Save } from "lucide-react";
import { dinero, porcentaje as formatoPorcentaje } from "../../utils/formatoReportes";

const DIAS_PRONTO_PAGO = 10; // regla fija del backend

const numeroEntrada =
  "w-24 rounded-md border border-slate-300 px-2 py-1 text-right text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-300";

// Estado inicial por movimiento a partir de la parametrización guardada
const seleccionInicial = (parametro) =>
  Object.fromEntries(
    (parametro?.movimientos || []).map((m) => [
      m.movimiento,
      {
        comision: String(Number(m.porcentaje_comision)),
        pronto: Boolean(m.pronto_pago),
        pp: m.porcentaje_pronto_pago != null ? String(Number(m.porcentaje_pronto_pago)) : "",
        gasto: m.aplica_gasto_expedicion !== false, // sin dato = aplica
      },
    ])
  );

/**
 * Usar con `key` = afianzadora + ramo para reiniciar el estado al cambiar de ramo.
 * No debe reiniciarse al guardar: así se conserva el aviso de "guardado".
 */
export default function ComisionRamoForm({ parametro, movimientos, gasto, guardando, onGuardar }) {
  const [seleccion, setSeleccion] = useState(() => seleccionInicial(parametro));
  const [error, setError] = useState(null);
  const [guardado, setGuardado] = useState(false);

  const cambiar = (id, cambios) =>
    setSeleccion((actual) => ({ ...actual, [id]: { ...actual[id], ...cambios } }));

  const alternarMovimiento = (id) =>
    setSeleccion((actual) => {
      const copia = { ...actual };
      if (id in copia) delete copia[id];
      else copia[id] = { comision: "", pronto: false, pp: "", gasto: true };
      return copia;
    });

  const validar = () => {
    const ids = Object.keys(seleccion);
    if (ids.length === 0) return "Selecciona al menos un movimiento.";
    for (const id of ids) {
      const { comision, pronto, pp } = seleccion[id];
      const nombre = movimientos.find((m) => String(m.id) === id)?.nombre ?? `movimiento ${id}`;
      if (comision === "" || !(Number(comision) >= 0 && Number(comision) <= 100)) {
        return `La comisión de "${nombre}" debe estar entre 0 y 100.`;
      }
      if (pronto && (pp === "" || !(Number(pp) >= 0 && Number(pp) <= 100))) {
        return `Indica el % de pronto pago de "${nombre}" (entre 0 y 100).`;
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardado(false);
    const problema = validar();
    if (problema) return setError(problema);
    setError(null);

    const resultado = await onGuardar(
      Object.entries(seleccion).map(([id, v]) => ({
        movimiento: Number(id),
        porcentaje_comision: String(v.comision),
        aplica_gasto_expedicion: v.gasto,
        pronto_pago: v.pronto,
        porcentaje_pronto_pago: v.pronto ? String(v.pp) : null,
      }))
    );
    if (resultado.ok) setGuardado(true);
    else setError(resultado.mensaje);
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">Comisiones por movimiento</h3>
      <p className="text-xs text-slate-500">
        Marca los movimientos que generan comisión. El porcentaje se calcula sobre la <strong>prima total</strong>.
        El pronto pago es opcional y aplica solo si la fecha de pago está a {DIAS_PRONTO_PAGO} días o menos de la fecha de
        término. Desmarca <strong>Gasto de expedición</strong> en los movimientos que no lo cobran (por ejemplo, una
        cancelación).
      </p>

      {gasto ? (
        <p className="mt-3 rounded-md bg-slate-50 p-3 text-xs text-slate-600">
          Gasto de expedición (del catálogo, no editable):{" "}
          <strong>{formatoPorcentaje(gasto.porcentaje_comision)}</strong> de comisión sobre {dinero(gasto.monto)} por trámite.
        </p>
      ) : (
        <div className="mt-3 flex items-start gap-2 rounded-md bg-amber-50 p-3 text-xs text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Esta afianzadora no tiene gasto de expedición en el catálogo. Mientras no lo configures, el reporte mostrará $0.00 en
            esa columna.
          </span>
        </div>
      )}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs text-slate-500">
              <th className="py-2 pr-3 font-medium">Movimiento</th>
              <th className="px-3 py-2 font-medium">% Comisión</th>
              <th className="px-3 py-2 font-medium">Pronto pago</th>
              <th className="px-3 py-2 font-medium">Gasto de expedición</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {movimientos.map((mov) => {
              const id = String(mov.id);
              const fila = seleccion[id];
              const marcado = fila !== undefined;
              return (
                <tr key={mov.id}>
                  <td className="py-2 pr-3">
                    <label className="flex cursor-pointer items-center gap-2 text-slate-800">
                      <input
                        type="checkbox"
                        checked={marcado}
                        onChange={() => alternarMovimiento(id)}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      {mov.nombre}
                    </label>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        disabled={!marcado}
                        value={marcado ? fila.comision : ""}
                        onChange={(e) => cambiar(id, { comision: e.target.value })}
                        aria-label={`Comisión de ${mov.nombre}`}
                        className={numeroEntrada}
                      />
                      <span className="text-slate-500">%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        disabled={!marcado}
                        checked={marcado && fila.pronto}
                        onChange={(e) => cambiar(id, { pronto: e.target.checked, pp: e.target.checked ? fila.pp : "" })}
                        aria-label={`Pronto pago de ${mov.nombre}`}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        disabled={!marcado || !fila.pronto}
                        value={marcado && fila.pronto ? fila.pp : ""}
                        onChange={(e) => cambiar(id, { pp: e.target.value })}
                        aria-label={`Porcentaje de pronto pago de ${mov.nombre}`}
                        className={numeroEntrada}
                      />
                      <span className="text-slate-500">%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-slate-600">
                    {marcado && (
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={fila.gasto}
                          onChange={(e) => cambiar(id, { gasto: e.target.checked })}
                          aria-label={`Aplica gasto de expedición en ${mov.nombre}`}
                          className="h-4 w-4 rounded border-slate-300"
                        />
                        {fila.gasto ? (
                          gasto ? formatoPorcentaje(gasto.porcentaje_comision) : "—"
                        ) : (
                          <span className="text-slate-400">No aplica</span>
                        )}
                      </label>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {error && (
        <div role="alert" className="mt-4 flex items-start gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {guardado && (
        <div role="status" className="mt-4 flex items-start gap-2 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Parametrización guardada.</span>
        </div>
      )}

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={guardando}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {parametro ? "Guardar cambios" : "Guardar parametrización"}
        </button>
      </div>
    </form>
  );
}