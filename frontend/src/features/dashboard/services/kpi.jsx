const baseURL = "https://bitacorabc.site/backend/kpi/";

const fetchApi = async (endpoint, options = {}) => {
  // Clonar las opciones para evitar modificar el objeto original
  const config = { ...options };

  // Verifica si se está enviando FormData
  if (config.body instanceof FormData) {
    if (config.headers) {
      delete config.headers["Content-Type"]; // Solo eliminar Content-Type
    }
  } else {
    config.headers = {
      "Content-Type": "application/json",
      ...config.headers,
    };
  }

  const response = await fetch(baseURL + endpoint, config);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error en la solicitud");
  }

  return response.json();
};

export const obtenerEstados = async () => {
  return await fetchApi(`estado_tramites.php`, {
    method: "GET",
    body: JSON.stringify(),
  });
};
export const obtenerTotalAfianzadoras = async (fecha) => {
  return await fetchApi(`afianzadoras.php?mes=${fecha}`, {
    method: "GET", // No es necesario enviar un cuerpo en GET
  });
};



export const pendientes = async () => {
  return await fetchApi(`pendientes/pendientes_categoria.php`, {
    method: "GET",
    body: JSON.stringify(),
  });
};
export const totalPendientes = async () => {
  return await fetchApi(`pendientes/total.php`, {
    method: "GET",
    body: JSON.stringify(),
  });
};
export const cobranzaData = async () => {
  return await fetchApi(`cobranza.php`, {
    method: "GET",
    body: JSON.stringify(),
  });
};
export const totalCompromisos = async () => {
  return await fetchApi(`compromisos/total.php`, {
    method: "GET",
    body: JSON.stringify(),
  });
};
export const compromisos = async () => {
  return await fetchApi(`compromisos/compromisos.php`, {
    method: "GET",
    body: JSON.stringify(),
  });
};
export const movimietos = async () => {
  return await fetchApi(`movimientos.php`, {
    method: "GET",
    body: JSON.stringify(),
  });
};