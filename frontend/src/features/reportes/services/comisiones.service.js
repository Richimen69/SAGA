import fetchApi from "@/shared/services/apiNew";

// Trae todas las páginas si el backend pagina (results/next); si no, devuelve la lista tal cual
const traerTodo = async (ruta) => {
  const items = [];
  let siguiente = ruta;
  for (let i = 0; siguiente && i < 50; i++) {
    const data = await fetchApi(siguiente);
    if (Array.isArray(data)) return data;
    items.push(...(data?.results || []));
    // `next` viene como URL absoluta: solo se conserva su query (?page=2)
    siguiente = data?.next ? `${ruta.split("?")[0]}${new URL(data.next).search}` : null;
  }
  return items;
};

export const fetchRamos = () => traerTodo("ramos-fianza/");
export const fetchMovimientos = () => traerTodo("movimientos/");

// Parametrizaciones (ramo + sus movimientos) de una afianzadora
export const fetchParametrosAfianzadora = (afianzadoraId) =>
  traerTodo(`comisiones-parametros/?afianzadora_id=${afianzadoraId}`);

export const crearParametro = (payload) =>
  fetchApi("comisiones-parametros/", { method: "POST", body: JSON.stringify(payload) });

export const actualizarParametro = (id, payload) =>
  fetchApi(`comisiones-parametros/${id}/`, { method: "PUT", body: JSON.stringify(payload) });

// afianzadoraId vacío = todas las que tienen parametrización.
// detalle: agrega el listado trámite por trámite (lo usa el Excel)
export const fetchReporteComisiones = ({ desde, hasta, afianzadoraId, detalle = false }) => {
  const params = new URLSearchParams({ fecha_inicio: desde, fecha_fin: hasta });
  if (afianzadoraId) params.append("afianzadora_id", String(afianzadoraId));
  if (detalle) params.append("detalle", "1");
  return fetchApi(`reportes/comisiones/?${params.toString()}`);
};