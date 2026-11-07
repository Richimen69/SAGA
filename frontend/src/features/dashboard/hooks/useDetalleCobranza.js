import { useEffect, useState } from "react";
import { extraerMensaje } from "@/shared/utils/errores";
import { fetchDetalleCobranza } from "../services/dashboardFianzas.service";

// Carga los trámites de un tramo de antigüedad. Con `tramo` vacío no consulta nada.
export default function useDetalleCobranza(tramo, afianzadoraId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(tramo));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!tramo) return undefined;
    let vigente = true; // evita que una respuesta lenta pise a una más reciente
    setLoading(true);
    setError(null);
    setData(null);

    fetchDetalleCobranza({ tramo, afianzadoraId })
      .then((respuesta) => vigente && setData(respuesta))
      .catch((err) => vigente && setError(extraerMensaje(err)))
      .finally(() => vigente && setLoading(false));

    return () => {
      vigente = false;
    };
  }, [tramo, afianzadoraId]);

  return { data, loading, error };
}