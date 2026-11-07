import fetchApi from "@/shared/services/apiNew";

// El backend puede paginar (results) o devolver el arreglo directo
const extraerLista = (data) => (Array.isArray(data) ? data : data?.results || []);

// Afianzadoras de la BD legacy + estado de su meta de conversión para el año
export const fetchAfianzadorasMeta = async (anio) => {
  const data = await fetchApi(`metas-conversion/afianzadoras/?anio=${anio}`);
  return data?.afianzadoras || [];
};

export const fetchMetaConversion = (id) => fetchApi(`metas-conversion/${id}/`);

export const crearMetaConversion = (payload) =>
  fetchApi("metas-conversion/", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const actualizarMetaConversion = (id, payload) =>
  fetchApi(`metas-conversion/${id}/`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const fetchAvanceMeta = async (anio, afianzadoraId) => {
  const data = await fetchApi(
    `metas-conversion/avance/?anio=${anio}&afianzadora_id=${afianzadoraId}`
  );
  return data?.afianzadoras?.[0] ?? null;
};

export const fetchRamos = async () => extraerLista(await fetchApi("ramos-fianza/"));

// Hijas del ramo (tipos de fianza). El backend responde { ramo_id, ramo, count, data: [...] }
export const fetchTiposDeRamo = async (ramoId) => {
  const data = await fetchApi(`ramos-fianza/${ramoId}/tipos/`);
  return extraerLista(data?.data ?? data);
};

// Convierte los errores de DRF ({campo: ["msg"]}, listas anidadas, detail) en un texto legible
const aplanar = (valor, campo = "") => {
  if (valor == null) return [];
  if (typeof valor === "string") return [campo ? `${campo}: ${valor}` : valor];
  if (Array.isArray(valor)) return valor.flatMap((v) => aplanar(v, campo));
  if (typeof valor === "object") {
    return Object.entries(valor).flatMap(([clave, v]) =>
      aplanar(v, ["non_field_errors", "detail"].includes(clave) ? campo : clave)
    );
  }
  return [String(valor)];
};

export const extraerMensaje = (err) => {
  const data = err?.data ?? err?.response?.data;
  const partes = aplanar(data);
  if (partes.length) return partes.join(" · ");
  return err?.message || "Ocurrió un error inesperado.";
};