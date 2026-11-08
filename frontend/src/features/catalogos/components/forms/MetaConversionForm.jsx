import { useState } from "react";
import { AlertCircle, ChevronDown, ChevronRight, Loader2, Save } from "lucide-react";

// Convierte los subramos guardados en { [tipoId]: "porcentaje" }
const seleccionInicial = (meta) =>
  Object.fromEntries((meta?.tipos || []).map((t) => [t.tipo_fianza, String(Number(t.porcentaje))]));

const nombresDeTipo = (ramos, tiposPorRamo, meta) => {
  const nombres = Object.fromEntries((meta?.tipos || []).map((t) => [String(t.tipo_fianza), `${t.ramo_nombre} – ${t.tipo_nombre}`]));
  for (const ramo of ramos) {
    for (const tipo of tiposPorRamo[ramo.id] || []) nombres[String(tipo.id)] = `${ramo.nombre} – ${tipo.nombre}`;
  }
  return nombres;
};

// Casilla del ramo: marcada si están todos sus subramos, "a medias" si solo algunos
function CasillaRamo({ estado, ...props }) {
  return (
    <input
      type="checkbox"
      ref={(el) => {
        if (el) el.indeterminate = estado === "parcial";
      }}
      checked={estado === "todos"}
      className="h-4 w-4 rounded border-slate-300"
      {...props}
    />
  );
}

/**
 * La meta se arma por SUBRAMO (tipo de fianza): cada subramo se marca por separado y tiene su propio %.
 * Usar con `key` (afianzadora + año + id de la meta) para que el estado
 * se reinicie al cambiar de afianzadora o después de guardar.
 */
export default function MetaConversionForm({ meta, ramos, tiposPorRamo = {}, guardando, onGuardar }) {
  const [metaConversion, setMetaConversion] = useState(
    meta ? String(Number(meta.meta_conversion)) : ""
  );
  const [seleccion, setSeleccion] = useState(() => seleccionInicial(meta));
  // Los ramos que ya tienen subramos en la meta arrancan desplegados
  const [abiertos, setAbiertos] = useState(() => new Set((meta?.tipos || []).map((t) => String(t.ramo_id))));
  const [error, setError] = useState(null);

  const toggleTipo = (id) => {
    setSeleccion((actual) => {
      const copia = { ...actual };
      if (id in copia) delete copia[id];
      else copia[id] = "100";
      return copia;
    });
  };

  // Marca (o desmarca) todos los subramos del ramo. Los que ya estaban marcados conservan su %.
  const toggleRamo = (ramo) => {
    const tipos = tiposPorRamo[ramo.id];
    if (!Array.isArray(tipos) || tipos.length === 0) return;
    const ids = tipos.map((t) => String(t.id));

    setSeleccion((actual) => {
      const copia = { ...actual };
      if (ids.every((id) => id in copia)) ids.forEach((id) => delete copia[id]);
      else ids.forEach((id) => { if (!(id in copia)) copia[id] = "100"; });
      return copia;
    });
    setAbiertos((actual) => new Set(actual).add(String(ramo.id)));
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
    if (ids.length === 0) return "Selecciona al menos un subramo.";

    const nombres = nombresDeTipo(ramos, tiposPorRamo, meta);
    for (const id of ids) {
      const pct = Number(seleccion[id]);
      if (!(pct > 0 && pct <= 100)) {
        return `El porcentaje de "${nombres[id] ?? `subramo ${id}`}" debe ser mayor a 0 y menor o igual a 100.`;
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
      tipos: Object.entries(seleccion).map(([id, pct]) => ({
        tipo_fianza: Number(id),
        porcentaje: String(pct),
      })),
    });
    if (!resultado.ok) setError(resultado.mensaje);
  };

  const totalSeleccionados = Object.keys(seleccion).length;

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

      <p className="mt-5 text-sm font-medium text-slate-700">Subramos que cuentan para la meta</p>
      <p className="text-xs text-slate-500">
        Marca los subramos (tipos de fianza) y define qué porcentaje de su prima se toma en cuenta. La casilla del
        ramo marca todos sus subramos; usa la flecha para ver cada uno.
      </p>

      {ramos.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">No hay ramos disponibles.</p>
      ) : (
        <ul className="mt-3 divide-y divide-slate-100 rounded-md border border-slate-200">
          {ramos.map((ramo) => {
            const id = String(ramo.id);
            const abierto = abiertos.has(id);
            const tipos = tiposPorRamo[ramo.id];
            const cargados = Array.isArray(tipos) ? tipos : [];
            const marcados = cargados.filter((t) => String(t.id) in seleccion).length;
            const estado = marcados === 0 ? "ninguno" : marcados === cargados.length ? "todos" : "parcial";

            return (
              <li key={ramo.id} className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleAbierto(id)}
                    aria-expanded={abierto}
                    aria-label={`${abierto ? "Ocultar" : "Ver"} subramos de ${ramo.nombre}`}
                    className="rounded p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  >
                    {abierto ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-800">
                    <CasillaRamo
                      estado={estado}
                      disabled={cargados.length === 0}
                      onChange={() => toggleRamo(ramo)}
                      aria-label={`Todos los subramos de ${ramo.nombre}`}
                    />
                    {ramo.nombre}
                  </label>
                  {Array.isArray(tipos) && (
                    <span className="whitespace-nowrap text-xs text-slate-400">
                      {marcados} de {tipos.length} {tipos.length === 1 ? "subramo" : "subramos"}
                    </span>
                  )}
                </div>

                {abierto && (
                  <div className="ml-9 mt-1">
                    {tipos === undefined && <p className="py-1 text-xs text-slate-400">Cargando subramos...</p>}
                    {tipos === null && (
                      <p className="py-1 text-xs text-red-600">No se pudieron cargar los subramos de este ramo.</p>
                    )}
                    {Array.isArray(tipos) && tipos.length === 0 && (
                      <p className="py-1 text-xs text-slate-400">Este ramo no tiene subramos registrados.</p>
                    )}
                    {cargados.length > 0 && (
                      <ul className="divide-y divide-slate-50">
                        {cargados.map((tipo) => {
                          const tipoId = String(tipo.id);
                          const marcado = tipoId in seleccion;
                          return (
                            <li key={tipo.id} className="flex items-center justify-between gap-3 py-1.5">
                              <label className="flex min-w-0 cursor-pointer items-center gap-2 text-sm text-slate-700">
                                <input
                                  type="checkbox"
                                  checked={marcado}
                                  onChange={() => toggleTipo(tipoId)}
                                  aria-label={`Subramo ${tipo.nombre} de ${ramo.nombre}`}
                                  className="h-4 w-4 rounded border-slate-300"
                                />
                                <span className="truncate">{tipo.nombre}</span>
                              </label>
                              <div className="flex shrink-0 items-center gap-1">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.01"
                                  disabled={!marcado}
                                  value={marcado ? seleccion[tipoId] : ""}
                                  onChange={(e) => cambiarPorcentaje(tipoId, e.target.value)}
                                  aria-label={`Porcentaje de ${tipo.nombre}`}
                                  className="w-20 rounded-md border border-slate-300 px-2 py-1 text-right text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-300"
                                />
                                <span className="text-sm text-slate-500">%</span>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-2 text-xs text-slate-500">
        {totalSeleccionados} {totalSeleccionados === 1 ? "subramo seleccionado" : "subramos seleccionados"}
      </p>

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