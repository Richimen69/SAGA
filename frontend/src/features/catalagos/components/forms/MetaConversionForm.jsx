import { useState } from "react";
import { AlertCircle, ChevronDown, ChevronRight, Loader2, Save } from "lucide-react";

// Convierte los ramos guardados en { [ramoId]: "porcentaje" }
const seleccionInicial = (meta) =>
  Object.fromEntries((meta?.ramos || []).map((r) => [r.ramo, String(Number(r.porcentaje))]));

function TiposDelRamo({ tipos }) {
  if (tipos === undefined) return <p className="text-xs text-slate-400">Cargando tipos...</p>;
  if (tipos === null) return <p className="text-xs text-red-600">No se pudieron cargar los tipos de este ramo.</p>;
  if (tipos.length === 0) return <p className="text-xs text-slate-400">Este ramo no tiene tipos registrados.</p>;

  return (
    <ul className="flex flex-wrap gap-1.5">
      {tipos.map((tipo) => (
        <li key={tipo.id} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
          {tipo.nombre}
        </li>
      ))}
    </ul>
  );
}

/**
 * Usar con `key` (afianzadora + año + id de la meta) para que el estado
 * se reinicie al cambiar de afianzadora o después de guardar.
 */
export default function MetaConversionForm({ meta, ramos, tiposPorRamo = {}, guardando, onGuardar }) {
  const [metaConversion, setMetaConversion] = useState(
    meta ? String(Number(meta.meta_conversion)) : ""
  );
  const [seleccion, setSeleccion] = useState(() => seleccionInicial(meta));
  // Los ramos que ya están en la meta arrancan con sus hijas visibles
  const [abiertos, setAbiertos] = useState(() => new Set(Object.keys(seleccionInicial(meta))));
  const [error, setError] = useState(null);

  const toggleRamo = (id) => {
    setSeleccion((actual) => {
      const copia = { ...actual };
      if (id in copia) delete copia[id];
      else copia[id] = "100";
      return copia;
    });
  };

  const toggleAbierto = (id) => {
    setAbiertos((actual) => {
      const copia = new Set(actual);
      if (copia.has(id)) copia.delete(id);
      else copia.add(id);
      return copia;
    });
  };

  const cambiarPorcentaje = (id, valor) => {
    setSeleccion((actual) => ({ ...actual, [id]: valor }));
  };

  const validar = () => {
    if (!(Number(metaConversion) > 0)) return "La meta de conversión debe ser mayor a 0.";

    const ids = Object.keys(seleccion);
    if (ids.length === 0) return "Selecciona al menos un ramo.";

    for (const id of ids) {
      const pct = Number(seleccion[id]);
      const nombre = ramos.find((r) => String(r.id) === id)?.nombre ?? `ramo ${id}`;
      if (!(pct > 0 && pct <= 100)) {
        return `El porcentaje de "${nombre}" debe ser mayor a 0 y menor o igual a 100.`;
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const problema = validar();
    if (problema) {
      setError(problema);
      return;
    }
    setError(null);

    const resultado = await onGuardar({
      meta_conversion: String(metaConversion),
      ramos: Object.entries(seleccion).map(([id, pct]) => ({
        ramo: Number(id),
        porcentaje: String(pct),
      })),
    });
    if (!resultado.ok) setError(resultado.mensaje);
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">
        {meta ? "Editar meta de conversión" : "Nueva meta de conversión"}
      </h3>

      <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="meta-conversion">
        Meta de conversión
      </label>
      <div className="relative mt-1 max-w-xs">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
        <input
          id="meta-conversion"
          type="number"
          min="0"
          step="0.01"
          value={metaConversion}
          onChange={(e) => setMetaConversion(e.target.value)}
          placeholder="6000000"
          className="w-full rounded-md border border-slate-300 py-2 pl-7 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <p className="mt-5 text-sm font-medium text-slate-700">Ramos que cuentan para la meta</p>
      <p className="text-xs text-slate-500">
        Marca los ramos y define qué porcentaje de su prima se toma en cuenta. Usa la flecha para ver los tipos
        de fianza de cada ramo.
      </p>

      {ramos.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">No hay ramos disponibles.</p>
      ) : (
        <ul className="mt-3 divide-y divide-slate-100 rounded-md border border-slate-200">
          {ramos.map((ramo) => {
            const id = String(ramo.id);
            const marcado = id in seleccion;
            const abierto = abiertos.has(id);
            const tipos = tiposPorRamo[ramo.id];

            return (
              <li key={ramo.id} className="px-3 py-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleAbierto(id)}
                      aria-expanded={abierto}
                      aria-label={`${abierto ? "Ocultar" : "Ver"} tipos de ${ramo.nombre}`}
                      className="rounded p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    >
                      {abierto ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-800">
                      <input
                        type="checkbox"
                        checked={marcado}
                        onChange={() => toggleRamo(id)}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      {ramo.nombre}
                    </label>
                    {Array.isArray(tipos) && (
                      <span className="whitespace-nowrap text-xs text-slate-400">
                        {tipos.length} {tipos.length === 1 ? "tipo" : "tipos"}
                      </span>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      disabled={!marcado}
                      value={marcado ? seleccion[id] : ""}
                      onChange={(e) => cambiarPorcentaje(id, e.target.value)}
                      aria-label={`Porcentaje de ${ramo.nombre}`}
                      className="w-20 rounded-md border border-slate-300 px-2 py-1 text-right text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-300"
                    />
                    <span className="text-sm text-slate-500">%</span>
                  </div>
                </div>

                {abierto && (
                  <div className="ml-7 mt-2">
                    <TiposDelRamo tipos={tipos} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {error && (
        <div role="alert" className="mt-4 flex items-start gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={guardando}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {meta ? "Guardar cambios" : "Crear meta"}
        </button>
      </div>
    </form>
  );
}