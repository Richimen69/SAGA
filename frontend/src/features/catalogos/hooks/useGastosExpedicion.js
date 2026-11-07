import { useCallback, useEffect, useState } from "react";
import { extraerMensaje } from "@/shared/utils/errores";
import {
  actualizarGastoExpedicion,
  crearGastoExpedicion,
  fetchAfianzadorasGasto,
} from "../services/gastosExpedicion.service";

export default function useGastosExpedicion() {
  const [afianzadoras, setAfianzadoras] = useState([]);
  const [seleccionadaId, setSeleccionadaId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    const lista = await fetchAfianzadorasGasto();
    setAfianzadoras(lista);
    return lista;
  }, []);

  useEffect(() => {
    cargar()
      .catch((err) => setError(extraerMensaje(err)))
      .finally(() => setLoading(false));
  }, [cargar]);

  const seleccionada = afianzadoras.find((a) => a.id === seleccionadaId) ?? null;

  // datos: { monto, porcentaje_comision }
  const guardar = async (datos) => {
    if (!seleccionada) return { ok: false, mensaje: "Selecciona una afianzadora." };

    const cuerpo = { afianzadora_id: seleccionada.id, ...datos };
    setGuardando(true);
    try {
      if (seleccionada.gasto_id) await actualizarGastoExpedicion(seleccionada.gasto_id, cuerpo);
      else await crearGastoExpedicion(cuerpo);
      await cargar();
      return { ok: true };
    } catch (err) {
      return { ok: false, mensaje: extraerMensaje(err) };
    } finally {
      setGuardando(false);
    }
  };

  return { afianzadoras, seleccionada, setSeleccionadaId, loading, guardando, error, guardar };
}
