import fetchApi from "@/shared/services/apiNew";

// 1. Desglose Mensual (Gráfica de líneas)
// CORRECCIÓN: Se agregaron los parámetros 'inicio' y 'fin'
export const primaTotal = async (inicio, fin) => {
  const url = (inicio && fin) 
    ? `tramites/dashboard_ventas/?fecha_inicio=${inicio}&fecha_fin=${fin}`
    : `tramites/dashboard_ventas/`;

  const response = await fetchApi(url, {
    method: "GET",
    // CORRECCIÓN: Se eliminó el 'body' porque GET no lo soporta
  });
  
  // Retornamos solo el arreglo para la gráfica
  return response.desglose_mensual;
};

// 2. Acumulado Anual (Barras de progreso a la derecha - Sin filtro)
export const metaAnual = async () => {
  const response = await fetchApi(`tramites/dashboard_ventas/`, {
    method: "GET",
    // CORRECCIÓN: Se eliminó el 'body'
  });
  
  // Retornamos solo el arreglo para las barras de progreso
  return response.resumen_anual;
};

// 3. Acumulado con Filtro de Fechas
export const metaPorFiltro = async (inicio, fin) => {
  const response = await fetchApi(`tramites/dashboard_ventas/?fecha_inicio=${inicio}&fecha_fin=${fin}`, {
    method: "GET",
    // CORRECCIÓN: Se eliminó el 'body'
  });
  return response.resumen_anual;
};

export const obtenerTramitesParaExcel = async (inicio, fin, afianzadora = null) => {
  let url = `tramites/tramites_excel/?`;
  
  if (inicio && fin) {
    url += `fecha_inicio=${inicio}&fecha_fin=${fin}&`;
  }
  
  // Si le damos clic al icono de descargar de una afianzadora específica
  if (afianzadora) {
    url += `afianzadora=${encodeURIComponent(afianzadora)}&`;
  }

  const response = await fetchApi(url, {
    method: "GET",
  });
  
  return response; 
};