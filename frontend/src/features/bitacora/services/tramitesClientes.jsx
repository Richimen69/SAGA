import fetchApi from "@/shared/services/api";

// export const createTramite = async (tramiteData) => {
//   return await fetchApi('tramites.php', {
//     method: 'POST',
//     body: JSON.stringify(tramiteData),
//   });
// };
export const updateTramite = async (tramiteData) => {
  return await fetchApi(`tramites.php`, {
    method: "PUT",
    body: JSON.stringify(tramiteData),
  });
};

// export const deleteTramite = async (tramiteData) => {
//   return await fetchApi(`tramites.php`, {
//     method: "DELETE",
//     body: JSON.stringify(tramiteData),
//   });
// };
export const buscarTramitePorFolio = async (folio) => {
  return await fetchApi(`tramites.php?folio=${folio}`);
};

export const fetchTramites = async () => {
  return await fetchApi("tramites.php");
};
export const fetchFolios = async () => {
  return await fetchApi("obtener_folios.php");
};

export const fetchTramitesPorFianza = async (fianza) => {
  return await fetchApi(`tramites/subtramites.php?fianza=${fianza}`);
}

export const createSubtramite = async (tramiteData) => {
  return await fetchApi('tramites/subtramites.php', {
    method: 'POST',
    body: JSON.stringify(tramiteData),
  });
};