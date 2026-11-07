import { AlertCircle, Loader2 } from "lucide-react";
import useParametrizacionComisiones from "../hooks/useParametrizacionComisiones";
import ComisionRamoForm from "./forms/ComisionRamoForm";

const selectClase =
  "mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400";

export default function ParametrizacionComisiones() {
  const {
    afianzadoras, ramos, movimientos, afianzadora, ramo, parametro, parametros,
    afianzadoraId, setAfianzadoraId, ramoId, setRamoId,
    loading, cargandoParametros, guardando, error, guardar,
  } = useParametrizacionComisiones();

  const ramosConfigurados = new Set(parametros.map((p) => p.ramo));

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-16 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Cargando...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2">
        <div>
          <label htmlFor="param-afianzadora" className="text-sm font-medium text-slate-700">
            1. Afianzadora
          </label>
          <select
            id="param-afianzadora"
            value={afianzadoraId ?? ""}
            onChange={(e) => setAfianzadoraId(e.target.value ? Number(e.target.value) : null)}
            className={selectClase}
          >
            <option value="">Selecciona una afianzadora</option>
            {afianzadoras.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="param-ramo" className="text-sm font-medium text-slate-700">
            2. Ramo
          </label>
          <select
            id="param-ramo"
            value={ramoId ?? ""}
            disabled={!afianzadora || cargandoParametros}
            onChange={(e) => setRamoId(e.target.value ? Number(e.target.value) : null)}
            className={selectClase}
          >
            <option value="">{cargandoParametros ? "Cargando..." : "Selecciona un ramo"}</option>
            {ramos.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre}
                {ramosConfigurados.has(r.id) ? " ✓" : ""}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-400">Los ramos con ✓ ya tienen comisiones configuradas.</p>
        </div>
      </div>

      {!afianzadora || !ramo ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
          Elige una afianzadora y un ramo para configurar sus comisiones.
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
              {afianzadora.nombre} · {ramo.nombre}
            </h2>
            <p className="text-xs text-slate-500">3. Movimientos y su comisión</p>
          </div>
          <ComisionRamoForm
            key={`${afianzadora.id}-${ramo.id}`}
            parametro={parametro}
            movimientos={movimientos}
            gasto={afianzadora.configurada ? { monto: afianzadora.monto, porcentaje_comision: afianzadora.porcentaje_comision } : null}
            guardando={guardando}
            onGuardar={guardar}
          />
        </>
      )}
    </div>
  );
}
