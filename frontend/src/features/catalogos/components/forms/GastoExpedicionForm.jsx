import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Save } from "lucide-react";

const moneda = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });

const campo =
  "w-full rounded-md border border-slate-300 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

/**
 * Usar con `key={afianzadora.id}` para que el estado se reinicie al cambiar de afianzadora.
 * No debe reiniciarse al guardar: así se conserva el aviso de "guardado".
 */
export default function GastoExpedicionForm({ afianzadora, guardando, onGuardar }) {
  const [monto, setMonto] = useState(afianzadora.monto != null ? String(afianzadora.monto) : "");
  const [porcentaje, setPorcentaje] = useState(
    afianzadora.porcentaje_comision != null ? String(afianzadora.porcentaje_comision) : ""
  );
  const [error, setError] = useState(null);
  const [guardado, setGuardado] = useState(false);

  const comisionPorTramite = (Number(monto) || 0) * ((Number(porcentaje) || 0) / 100);

  const validar = () => {
    if (monto === "" || !(Number(monto) >= 0)) return "Captura el gasto de expedición (0 o más).";
    if (porcentaje === "" || !(Number(porcentaje) >= 0 && Number(porcentaje) <= 100)) {
      return "El porcentaje de comisión debe estar entre 0 y 100.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardado(false);
    const problema = validar();
    if (problema) return setError(problema);
    setError(null);

    const resultado = await onGuardar({ monto: String(monto), porcentaje_comision: String(porcentaje) });
    if (resultado.ok) setGuardado(true);
    else setError(resultado.mensaje);
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">
        {afianzadora.configurada ? "Editar gasto de expedición" : "Nuevo gasto de expedición"}
      </h3>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="gasto-monto" className="block text-sm font-medium text-slate-700">
            Gasto de expedición
          </label>
          <div className="relative mt-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
            <input
              id="gasto-monto"
              type="number"
              min="0"
              step="0.01"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="2500"
              className={`${campo} pl-7 pr-3`}
            />
          </div>
        </div>

        <div>
          <label htmlFor="gasto-porcentaje" className="block text-sm font-medium text-slate-700">
            Porcentaje de comisión
          </label>
          <div className="relative mt-1">
            <input
              id="gasto-porcentaje"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={porcentaje}
              onChange={(e) => setPorcentaje(e.target.value)}
              placeholder="50"
              className={`${campo} pl-3 pr-8`}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">%</span>
          </div>
        </div>
      </div>

      <p className="mt-4 rounded-md bg-slate-50 p-3 text-xs text-slate-600">
        El gasto se aplica a <strong>cada trámite</strong> del reporte de comisiones. Con estos datos, por cada trámite:{" "}
        <strong>
          {moneda.format(Number(monto) || 0)} × {Number(porcentaje) || 0}% = {moneda.format(comisionPorTramite)}
        </strong>{" "}
        de comisión por gasto de expedición.
      </p>

      {error && (
        <div role="alert" className="mt-4 flex items-start gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {guardado && (
        <div role="status" className="mt-4 flex items-start gap-2 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Gasto de expedición guardado.</span>
        </div>
      )}

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={guardando}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {afianzadora.configurada ? "Guardar cambios" : "Guardar"}
        </button>
      </div>
    </form>
  );
}
