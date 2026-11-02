import { useEffect, useRef, useState } from "react";
import { fetchAfianzadorasFiltro, fetchDashboardFianzas } from "../services/dashboardFianzas.service";
import { exportarTramitesExcel } from "../utils/exportarExcel";

export default function useDashboardFianzas() {
  const anioActual = new Date().getFullYear();
  const [anio, setAnioBase] = useState(anioActual);
  const [afianzadoraId, setAfianzadoraId] = useState(null); // null = todas
  const [rango, setRango] = useState(null); // { desde, hasta } | null = año completo
  const [afianzadoras, setAfianzadoras] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportando, setExportando] = useState(null); // nombre que se está exportando; "" = todas
  const [avisoExcel, setAvisoExcel] = useState(null); // { tipo: "error" | "info", texto }

  // Evita que una respuesta lenta pise a una consulta más reciente
  const ultimaConsulta = useRef(0);

  // Al cambiar de año el rango deja de tener sentido, así que se limpia
  const setAnio = (nuevo) => {
    setRango(null);
    setAnioBase(nuevo);
  };

  useEffect(() => {
    fetchAfianzadorasFiltro(anioActual)
      .then(setAfianzadoras)
      .catch(() => setAfianzadoras([])); // sin chips sigue funcionando el consolidado
  }, [anioActual]);

  const desde = rango?.desde ?? null;
  const hasta = rango?.hasta ?? null;

  useEffect(() => {
    const turno = ++ultimaConsulta.current;
    setLoading(true);
    setError(null);

    fetchDashboardFianzas(anio, afianzadoraId, desde && hasta ? { desde, hasta } : null)
      .then((respuesta) => turno === ultimaConsulta.current && setData(respuesta))
      .catch((err) => {
        if (turno === ultimaConsulta.current) {
          setError(err?.message || "No se pudo cargar el dashboard. Intenta de nuevo.");
        }
      })
      .finally(() => turno === ultimaConsulta.current && setLoading(false));
  }, [anio, afianzadoraId, desde, hasta]);

  // nombreAfianzadora: como lo guardan los trámites; null = todas.
  // Exporta el mismo periodo que se está viendo en la gráfica.
  const exportar = async (nombreAfianzadora = null) => {
    const periodo = data?.periodo;
    if (!periodo) return;

    setAvisoExcel(null);
    setExportando(nombreAfianzadora ?? "");
    try {
      const resultado = await exportarTramitesExcel({
        desde: periodo.desde,
        hasta: periodo.hasta,
        personalizado: periodo.personalizado,
        nombreAfianzadora,
      });
      if (resultado.vacio) {
        setAvisoExcel({ tipo: "info", texto: "No hay trámites para exportar en este periodo." });
      }
    } catch (err) {
      setAvisoExcel({ tipo: "error", texto: err?.message || "No se pudo generar el archivo de Excel." });
    } finally {
      setExportando(null);
    }
  };

  // Exporta lo que se está viendo: todas, o la afianzadora elegida en los chips.
  // El backend filtra por el nombre que guardan los trámites, que sale del resumen
  // (no de la lista de la BD legacy, donde el nombre puede escribirse distinto).
  const exportarSeleccion = () => {
    if (afianzadoraId === null) return exportar(null);

    const nombre = data?.periodo.resumen_afianzadoras.find((f) => f.afianzadora_id === afianzadoraId)?.nombre;
    if (!nombre) {
      setAvisoExcel({ tipo: "info", texto: "No hay trámites para exportar en este periodo." });
      return Promise.resolve();
    }
    return exportar(nombre);
  };

  return {
    anioActual,
    anio,
    setAnio,
    afianzadoraId,
    setAfianzadoraId,
    rango,
    setRango,
    afianzadoras,
    data,
    loading,
    error,
    exportando,
    avisoExcel,
    exportar,
    exportarSeleccion,
  };
}