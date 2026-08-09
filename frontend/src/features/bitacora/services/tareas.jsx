import fetchApi from "@/shared/services/api";

export const obtenerMovimientos = async () => {
  return await fetchApi(`tareas.php`, {
    method: "GET",
    body: JSON.stringify(),
  });
};
export const obtenerTareas = async (id) => {
  return await fetchApi(`tareas.php?id_tramite=${id}`, {
    method: "GET",
    body: JSON.stringify(),
  });
};
export const obtenerTareasCompletas = async (id) => {
  return await fetchApi(`tareas.php?id_tramite=${id}&completadas=1`, {
    method: "GET",
    body: JSON.stringify(),
  });
};

export const obtenerTareasTramite = async (id) => {
  return await fetchApi(`tareas.php?id_tramite=${id}&detalles=1`, {
    method: "GET",
    body: JSON.stringify(),
  });
};

export const guardarTareaCompletada = async (data) => {
  return await fetchApi(`tareas.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};
