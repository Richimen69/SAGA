import fetchApi from "@/shared/services/apiNew";

// Sin afianzadoraId devuelve el consolidado de todas.
// `rango` ({ desde, hasta } en AAAA-MM-DD) solo afecta al bloque `periodo`
// (gráfica general, total, resumen y Excel); sin rango es el año completo.
export const fetchDashboardFianzas = (anio, afianzadoraId, rango = null) => {
  const params = new URLSearchParams({ anio: String(anio) });
  if (afianzadoraId) params.append("afianzadora_id", String(afianzadoraId));
  if (rango?.desde && rango?.hasta) {
    params.append("fecha_inicio", rango.desde);
    params.append("fecha_fin", rango.hasta);
  }
  return fetchApi(`dashboard-fianzas/?${params.toString()}`);
};

// Afianzadoras para los chips del filtro
export const fetchAfianzadorasFiltro = async (anio) => {
  const data = await fetchApi(`metas-conversion/afianzadoras/?anio=${anio}`);
  return (data?.afianzadoras || []).map(({ id, nombre }) => ({ id, nombre }));
};