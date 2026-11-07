// Convierte los errores de DRF ({campo: ["msg"]}, listas anidadas, detail) en un texto legible
const aplanar = (valor, campo = "") => {
  if (valor == null) return [];
  if (typeof valor === "string") return [campo ? `${campo}: ${valor}` : valor];
  if (Array.isArray(valor)) return valor.flatMap((v) => aplanar(v, campo));
  if (typeof valor === "object") {
    return Object.entries(valor).flatMap(([clave, v]) =>
      aplanar(v, ["non_field_errors", "detail"].includes(clave) ? campo : clave)
    );
  }
  return [String(valor)];
};

export const extraerMensaje = (err) => {
  const estado = err?.status ?? err?.response?.status;
  if (estado === 403) return "No tienes permiso para esta sección. Solo pueden usarla los usuarios staff.";

  const partes = aplanar(err?.data ?? err?.response?.data);
  if (partes.length) return partes.join(" · ");
  return err?.message || "Ocurrió un error inesperado.";
};
