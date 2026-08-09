import fetchApi from "@/shared/services/api";

export const fetchClientes = async () => {
  return await fetchApi(`datos_tramites.php?table=clientes`);
};

export const fetchAfianzadoras = async () => {
  return await fetchApi(`datos_tramites.php?table=afianzadoras`);
};

export const fetchBeficiarios = async () => {
  return await fetchApi(`datos_tramites.php?table=beneficiarios`);
};
export const actualizarMeta = async (data) => {
  return await fetchApi(`datos_tramites.php?table=afianzadoras`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};
