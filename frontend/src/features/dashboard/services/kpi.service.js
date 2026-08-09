import fetchApi from "@/shared/services/apiNew";
// 1. Desglose Mensual (Gráfica de líneas)
export const primaTotal = async () => {
    const response = await fetchApi(`tramites/dashboard_ventas/`, {
      method: "GET",
      body: JSON.stringify(),
    });
    // Retornamos solo el arreglo para la gráfica
    return response.desglose_mensual;
  };
  
  // 2. Acumulado Anual (Barras de progreso a la derecha - Sin filtro)
  export const metaAnual = async () => {
    const response = await fetchApi(`tramites/dashboard_ventas/`, {
      method: "GET",
      body: JSON.stringify(),
    });
    // Retornamos solo el arreglo para las barras de progreso
    return response.resumen_anual;
  };
  
  // 3. Acumulado con Filtro de Fechas
  export const metaPorFiltro = async (inicio, fin) => {
    const response = await fetchApi(`tramites/dashboard_ventas/?fecha_inicio=${inicio}&fecha_fin=${fin}`, {
      method: "GET",
      body: JSON.stringify(),
    });
    return response.resumen_anual;
  };