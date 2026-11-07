import { useEffect, useRef, useState } from "react";
import { fetchAfianzadorasGasto } from "@/features/catalogos/services/gastosExpedicion.service";
import { extraerMensaje } from "@/shared/utils/errores";
import { fetchReporteComisiones } from "../services/comisiones.service";
import { exportarReporteComisiones } from "../utils/exportarReporteComisiones";
import { hoyISO } from "../utils/formatoReportes";

export default function useReporteComisiones() {
  const [afianzadoras, setAfianzadoras] = useState([]);
  const [afianzadoraId, setAfianzadoraId] = useState(null); // null = todas
  const [desde, setDesde] = useState(`${new Date().getFullYear()}-01-01`);
  const [hasta, setHasta] = useState(hoyISO());
  const [reporte, setReporte] = useState(null); // el último generado (con los filtros con que se pidió)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [aviso, setAviso] = useState(null); // resultado de la exportación a Excel
  const [exportando, setExportando] = useState(false);
  const ultimaConsulta = useRef(0);

  useEffect(() => {
    fetchAfianzadorasGasto()
      .then(setAfianzadoras)
      .catch(() => setAfianzadoras([]));
  }, []);

  const nombreDe = (id) => afianzadoras.find((a) => a.id === id)?.nombre ?? null;

  const generar = async () => {
    setAviso(null);
    if (!desde || !hasta) return setError("Elige la fecha inicial y la final.");
    if (hasta < desde) return setError("La fecha final no puede ser anterior a la inicial.");

    const turno = ++ultimaConsulta.current;
    setLoading(true);
    setError(null);
    try {
      const datos = await fetchReporteComisiones({ desde, hasta, afianzadoraId });
      if (turno === ultimaConsulta.current) {
        setReporte({ ...datos, nombreAfianzadora: afianzadoraId ? nombreDe(afianzadoraId) : null });
      }
    } catch (err) {
      if (turno === ultimaConsulta.current) setError(extraerMensaje(err));
    } finally {
      if (turno === ultimaConsulta.current) setLoading(false);
    }
  };

  // Usa los filtros con los que se generó el reporte (no lo que haya en los campos ahora)
  // y pide el listado trámite por trámite para armar la hoja de detalle.
  const exportar = async () => {
    if (!reporte) return;
    setAviso(null);
    setExportando(true);
    try {
      const completo = await fetchReporteComisiones({
        desde: reporte.desde,
        hasta: reporte.hasta,
        afianzadoraId: reporte.afianzadora_id,
        detalle: true,
      });
      const resultado = exportarReporteComisiones({ reporte: completo, nombreAfianzadora: reporte.nombreAfianzadora });
      if (resultado.vacio) setAviso({ tipo: "info", texto: "No hay filas para exportar." });
    } catch (err) {
      setAviso({ tipo: "error", texto: extraerMensaje(err) });
    } finally {
      setExportando(false);
    }
  };

  return {
    afianzadoras, afianzadoraId, setAfianzadoraId, desde, setDesde, hasta, setHasta,
    reporte, loading, exportando, error, aviso, generar, exportar,
  };
}