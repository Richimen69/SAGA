import fetchApi from "@/shared/services/apiNew";

export const lista = async () => {
    const response = await fetchApi(`registros/`, {
      method: "GET",
      body: JSON.stringify(),
    });
    // Retornamos solo el arreglo para las barras de progreso
    return response;
  };