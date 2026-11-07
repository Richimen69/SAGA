import fetchApi from "@/shared/services/apiNew";

// Afianzadoras de la BD legacy + el gasto de expedición que ya tengan configurado
export const fetchAfianzadorasGasto = async () => {
  const data = await fetchApi("gastos-expedicion/afianzadoras/");
  return data?.afianzadoras || [];
};

export const crearGastoExpedicion = (payload) =>
  fetchApi("gastos-expedicion/", { method: "POST", body: JSON.stringify(payload) });

export const actualizarGastoExpedicion = (id, payload) =>
  fetchApi(`gastos-expedicion/${id}/`, { method: "PUT", body: JSON.stringify(payload) });
