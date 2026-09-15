import fetchApi from "@/shared/services/apiNew";

export const crearTramite = async (tramiteData) => {
  return await fetchApi("tramites/", {
    method: "POST",
    body: JSON.stringify(tramiteData),
  });
};
// services/tramites.service.js

export const fetchTramites = async (page = 1, filters = {}) => {
  const params = new URLSearchParams();
  
  params.append('page', page);
  if (filters.search) params.append('search', filters.search);
  if (filters.numero_fianza) params.append('numero_fianza__icontains', filters.numero_fianza);
  if (filters.movimiento) params.append('movimiento__nombre', filters.movimiento);
  if (filters.estatus) params.append('estatus__nombre', filters.estatus);
  if (filters.estatus_pago) params.append('estatus_pago', filters.estatus_pago);
  if (filters.agente_nombre) params.append('agente_nombre', filters.agente_nombre);
  if (filters.beneficiario_nombre) params.append('beneficiario_nombre', filters.beneficiario_nombre);
  if (filters.afianzadora_id) params.append('afianzadora_id', filters.afianzadora_id);
  
  return await fetchApi(`tramites-completo/?${params.toString()}`);
};
export const fetchTramitesId= async (id) => {
  return await fetchApi(`tramites-completo/${id}/`, {
    method: "GET",
    body: JSON.stringify(),
  });
};
export const deleteTramite = async (id) => {
  return await fetchApi(`tramites-completo/${id}/`, {
    method: "DELETE",
  });
};

export const updateTramite = async (tramiteData, id) => {
  return await fetchApi(`tramites-completo/${id}/`, {
    method: "PUT",
    body: JSON.stringify(tramiteData),
  });
};

export const fetchTramitesPorFianza = async (fianza) => {
  return await fetchApi(`tramites-completo/por_fianza/?numero_fianza=${fianza}`);
}

export const compararExcel = async (formData) => {
  const data = await fetchApi("tramites-completo/comparar_excel", {
    method: "POST",
    body: formData,
    
  });
  
  return data;
};

export const addCompromiso = async (data) => {
  return await fetchApi("compromisos/", {
    method: "POST",
    body: JSON.stringify(data),
  });
};
export const putCompromiso= async (data, id) => {
  return await fetchApi(`compromisos/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};
export const completarCompromiso= async (data, id) => {
  return await fetchApi(`compromisos/${id}/marcar_completado/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const getTiposFianza = async () => {
  return await fetchApi('tipos-fianza');
};

export const getRamosFianza = async () => {
  return await fetchApi('ramos-fianza');
};

export const getCompromiso = async (id) => {
  return await fetchApi(`compromisos/por_tramite/?tramite_id=${id}`);
};