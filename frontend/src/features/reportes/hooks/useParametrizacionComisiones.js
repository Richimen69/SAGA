import { useCallback, useEffect, useState } from "react";
import { fetchAfianzadorasGasto } from "@/features/catalogos/services/gastosExpedicion.service";
import { extraerMensaje } from "@/shared/utils/errores";
import {
  actualizarParametro,
  crearParametro,
  fetchMovimientos,
  fetchParametrosAfianzadora,
  fetchRamos,
} from "../services/comisiones.service";

export default function useParametrizacionComisiones() {
  const [afianzadoras, setAfianzadoras] = useState([]); // incluye su gasto de expedición del catálogo
  const [ramos, setRamos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [afianzadoraId, setAfianzadoraIdBase] = useState(null);
  const [ramoId, setRamoId] = useState(null);
  const [parametros, setParametros] = useState([]); // parametrizaciones de la afianzadora elegida
  const [loading, setLoading] = useState(true);
  const [cargandoParametros, setCargandoParametros] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([fetchAfianzadorasGasto(), fetchRamos(), fetchMovimientos()])
      .then(([afis, listaRamos, listaMovs]) => {
        setAfianzadoras(afis);
        setRamos(listaRamos);
        setMovimientos([...listaMovs].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      })
      .catch((err) => setError(extraerMensaje(err)))
      .finally(() => setLoading(false));
  }, []);

  const cargarParametros = useCallback(async (id) => {
    const lista = await fetchParametrosAfianzadora(id);
    setParametros(lista);
    return lista;
  }, []);

  // Al cambiar de afianzadora se limpia el ramo y se traen sus parametrizaciones
  const setAfianzadoraId = (id) => {
    setAfianzadoraIdBase(id);
    setRamoId(null);
    setParametros([]);
    setError(null);
    if (id == null) return;
    setCargandoParametros(true);
    cargarParametros(id)
      .catch((err) => setError(extraerMensaje(err)))
      .finally(() => setCargandoParametros(false));
  };

  const afianzadora = afianzadoras.find((a) => a.id === afianzadoraId) ?? null;
  const ramo = ramos.find((r) => r.id === ramoId) ?? null;
  const parametro = parametros.find((p) => p.ramo === ramoId) ?? null;

  // movs: [{ movimiento, porcentaje_comision, pronto_pago, porcentaje_pronto_pago }]
  const guardar = async (movs) => {
    if (!afianzadora || !ramo) return { ok: false, mensaje: "Selecciona una afianzadora y un ramo." };

    const cuerpo = { afianzadora_id: afianzadora.id, ramo: ramo.id, movimientos: movs };
    setGuardando(true);
    try {
      if (parametro) await actualizarParametro(parametro.id, cuerpo);
      else await crearParametro(cuerpo);
      await cargarParametros(afianzadora.id);
      return { ok: true };
    } catch (err) {
      return { ok: false, mensaje: extraerMensaje(err) };
    } finally {
      setGuardando(false);
    }
  };

  return {
    afianzadoras, ramos, movimientos, afianzadora, ramo, parametro, parametros,
    afianzadoraId, setAfianzadoraId, ramoId, setRamoId,
    loading, cargandoParametros, guardando, error, guardar,
  };
}
