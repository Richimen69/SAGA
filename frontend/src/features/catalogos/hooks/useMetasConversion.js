import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  actualizarMetaConversion,
  crearMetaConversion,
  extraerMensaje,
  fetchAfianzadorasMeta,
  fetchAvanceMeta,
  fetchMetaConversion,
  fetchRamos,
  fetchTiposDeRamo,
} from "../services/metasConversion";

export default function useMetasConversion(anio) {
  const [afianzadoras, setAfianzadoras] = useState([]);
  const [ramos, setRamos] = useState([]);
  // { [ramoId]: [tipos] } — null si no se pudieron cargar los tipos de ese ramo
  const [tiposPorRamo, setTiposPorRamo] = useState({});
  const [seleccionada, setSeleccionada] = useState(null);
  const [meta, setMeta] = useState(null); // meta de conversión guardada (con sus subramos)
  const [avance, setAvance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [errorDetalle, setErrorDetalle] = useState(null);

  // Evita que una respuesta lenta pise a una selección más reciente
  const ultimaSeleccion = useRef(0);

  const cargarAfianzadoras = useCallback(async () => {
    const lista = await fetchAfianzadorasMeta(anio);
    setAfianzadoras(lista);
    return lista;
  }, [anio]);

  const seleccionar = useCallback(
    async (afianzadora) => {
      const turno = ++ultimaSeleccion.current;
      setSeleccionada(afianzadora);
      setMeta(null);
      setAvance(null);
      setErrorDetalle(null);

      if (!afianzadora?.meta_conversion_id) return;

      setLoadingDetalle(true);
      try {
        const [detalle, datosAvance] = await Promise.all([
          fetchMetaConversion(afianzadora.meta_conversion_id),
          fetchAvanceMeta(anio, afianzadora.id),
        ]);
        if (turno !== ultimaSeleccion.current) return;
        setMeta(detalle);
        setAvance(datosAvance);
      } catch (err) {
        if (turno === ultimaSeleccion.current) setErrorDetalle(extraerMensaje(err));
      } finally {
        if (turno === ultimaSeleccion.current) setLoadingDetalle(false);
      }
    },
    [anio]
  );

  // Ramos: se cargan una sola vez
  useEffect(() => {
    fetchRamos()
      .then(setRamos)
      .catch((err) => setError(extraerMensaje(err)));
  }, []);

  // Hijas de cada ramo: una consulta por ramo, una sola vez cuando ya hay ramos
  useEffect(() => {
    if (ramos.length === 0) return;
    let activo = true;

    Promise.allSettled(ramos.map((r) => fetchTiposDeRamo(r.id))).then((resultados) => {
      if (!activo) return;
      setTiposPorRamo(
        Object.fromEntries(
          ramos.map((r, i) => [r.id, resultados[i].status === "fulfilled" ? resultados[i].value : null])
        )
      );
    });

    return () => {
      activo = false;
    };
  }, [ramos]);

  // Afianzadoras: al montar y cada vez que cambia el año
  useEffect(() => {
    let activo = true;
    ultimaSeleccion.current++;
    setSeleccionada(null);
    setMeta(null);
    setAvance(null);
    setLoading(true);
    setError(null);

    fetchAfianzadorasMeta(anio)
      .then((lista) => activo && setAfianzadoras(lista))
      .catch((err) => activo && setError(extraerMensaje(err)))
      .finally(() => activo && setLoading(false));

    return () => {
      activo = false;
    };
  }, [anio]);

  // payload: { meta_conversion, tipos: [{ tipo_fianza, porcentaje }] }
  const guardar = async (payload) => {
    if (!seleccionada) return { ok: false, mensaje: "Selecciona una afianzadora." };

    const cuerpo = { afianzadora_id: seleccionada.id, anio, ...payload };
    setGuardando(true);
    try {
      if (meta) await actualizarMetaConversion(meta.id, cuerpo);
      else await crearMetaConversion(cuerpo);

      toast.success("Meta de conversión guardada");
      const lista = await cargarAfianzadoras();
      const actualizada = lista.find((a) => a.id === seleccionada.id);
      await seleccionar(actualizada ?? seleccionada);
      return { ok: true };
    } catch (err) {
      return { ok: false, mensaje: extraerMensaje(err) };
    } finally {
      setGuardando(false);
    }
  };

  return {
    afianzadoras,
    ramos,
    tiposPorRamo,
    seleccionada,
    meta,
    avance,
    loading,
    loadingDetalle,
    guardando,
    error,
    errorDetalle,
    seleccionar,
    guardar,
  };
}