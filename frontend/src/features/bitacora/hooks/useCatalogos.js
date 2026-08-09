import { useState, useEffect } from "react";
import { fetchEstatus, fetchMovimientos } from "../services/catalogos.service";
import {
fetchAfianzadoras,
fetchBeficiarios,
} from "@/features/bitacora/services/datosTramites";

const useCatalogos = () => {
  const [catalogos, setCatalogos] = useState({
    afianzadoras: [],
    beneficiarios: [],
    movimientos: [],
    estatus: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Usamos un controlador para cancelar la petición si el usuario sale de la pantalla
    const controller = new AbortController();

    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        const [
          beneficiariosData, 
          movimientosData, 
          afianzadorasData, 
          estatusData
        ] = await Promise.all([
            fetchBeficiarios(),
            fetchMovimientos(),
            fetchAfianzadoras(),
            fetchEstatus()
          ]);

        // Función de seguridad para extraer arrays
        const extractArray = (data) => (Array.isArray(data) ? data : data?.results || []);

        setCatalogos({
          beneficiarios: extractArray(beneficiariosData).map((b) => ({
            value: b.id_ben,
            label: b.nombre_ben,
          })),
          movimientos: extractArray(movimientosData).map((m) => ({
            value: m.id,
            label: m.nombre,
          })),
          afianzadoras: extractArray(afianzadorasData).map((a) => ({
            value: a.id_afi,
            label: a.nombre_afi,
          })),
          estatus: extractArray(estatusData).map((e) => ({
            value: e.id,
            label: e.nombre,
          })),
        });
      } catch (err) {
        console.error("Error al cargar catálogos:", err);
        setError("No se pudieron cargar los catálogos. Intente de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();

    return () => controller.abort(); // Limpieza
  }, []);

  return { catalogos, loading, error };
};

export default useCatalogos;