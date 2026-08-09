import fetchApi from "@/shared/services/apiNew";


export const createObservacion = async (movimientoData) => {
    return await fetchApi(`observaciones/`, {
      method: "POST",
      body: JSON.stringify(movimientoData),
    });
  };
  
  export const deleteObservacion = async (id) => {
    return await fetchApi(`observaciones/${id}/`, {
      method: "DELETE",
      body: JSON.stringify({ id: id }),
    });
  };
  export const updateObservacion = async ( data ) => {
    return await fetchApi(`observaciones/${data.id}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  };
  
  export const buscarObservacion = async (id) => {
    return await fetchApi(`observaciones/por_tramite/?tramite_id=${id}`);
  };