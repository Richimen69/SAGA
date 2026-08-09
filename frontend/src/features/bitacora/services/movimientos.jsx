import fetchApi from "@/shared/services/api";

export const createMovimiento = async (movimientoData) => {
  return await fetchApi(`movimientos.php`, {
    method: "POST",
    body: JSON.stringify(movimientoData),
  });
};

export const deleteMovimiento = async (id_movimiento) => {
  return await fetchApi(`movimientos.php`, {
    method: "DELETE",
    body: JSON.stringify({ id_movimiento: id_movimiento }),
  });
};
export const updateMovimiento = async ( data ) => {
  return await fetchApi(`movimientos.php`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const buscarMovimiento = async (id) => {
  return await fetchApi(`movimientos.php?id=${id}`);
};
