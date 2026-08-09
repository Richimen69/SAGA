import fetchApi from "@/shared/services/apiNew";

export const fetchClientesAll = async () => {
  return await fetchApi("clientes-legacy/");
};

export const fetchMovimientos = async () => {
  return await fetchApi("movimientos/");
};

export const fetchEstatus = async () => {
  return await fetchApi("estatus/");
};