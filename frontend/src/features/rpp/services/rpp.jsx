const baseURL = "https://bitacorabc.site/Backend_RPP/";

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

export const obtenerTramites = async () => {
  return await fetchApi(`tramites.php`, {
    method: "GET",
    body: JSON.stringify(),
  });
};

export const obtenerTramitesId = async (data) => {
  return await fetchApi(`tramites_id.php?id_tramite=${data}`, {
    method: "GET",
    body: JSON.stringify(),
  });
};
export const datosTramites = async () => {
  return await fetchApi(`estado_tramites.php`);
};

export const borrarTramite = async (data) => {
  return await fetchApi(`tramites_id.php?id_tramite=${data}`, {
    method: "DELETE",
    body: JSON.stringify(),
  });
};

export const obtenerAgentes = async () => {
  return await fetchApi(`agentes.php`, {
    method: "GET",
    body: JSON.stringify(),
  });
};

export const catalagos = async () => {
  return await fetchApi(`tramites-catalogo.php`, {
    method: "GET",
    body: JSON.stringify(),
  });
};
export const catalagosID = async (id) => {
  return await fetchApi(`tramites-catalogo.php?id=${id}`, {
    method: "GET",
    body: JSON.stringify(),
  });
};

export const getFacturas = async () => {
  return await fetchApi(`dasboard_montos.php`, {
    method: "GET",
    body: JSON.stringify(),
  });
};
export const getPagados= async () => {
  return await fetchApi(`dashboard_pagados.php`, {
    method: "GET",
    body: JSON.stringify(),
  });
};

export const getAfianzadoras= async () => {
  return await fetchApi(`obtener_afianzadoras.php`, {
    method: "GET",
    body: JSON.stringify(),
  });
};

export const updateCatalago = async (data) => {
  return await fetchApi(`tramites-catalogo.php`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};


export const updateTramites = async (data) => {
  return await fetchApi(`agentes.php`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const nuevoUsuario = async (usuario) => {
  console.log(usuario);
  return await fetchApi(`nuevo_usuario.php`, {
    method: "POST",
    body: JSON.stringify(usuario),
  });
};

export const uploadArchivo = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetchApi(`upload.php`, {
      method: "POST",
      body: formData,
    });

    if (!response) {
      throw new Error("La respuesta de la API es inválida.");
    }

    return response; // Suponiendo que fetchApi ya devuelve un JSON
  } catch (error) {
    console.error("Error al subir el archivo:", error);
    return { success: false, error: error.message };
  }
};

export const updateTramite = async (id_tramite) => {
  return await fetchApi(`agentes.php`, {
    method: "PUT",
    body: JSON.stringify(id_tramite),
  });
};
