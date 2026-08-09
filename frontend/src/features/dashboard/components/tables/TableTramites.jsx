import React from "react";
import { fetchTramites } from "@/features/bitacora/services/tramitesClientes";
import { useEffect, useState } from "react";
import { statusStyles } from "@/shared/utils/Constans";
import { useNavigate } from "react-router-dom";
export default function TableTramites({ tipo }) {
  const [clientes, setClientes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const data = await fetchTramites();
        setClientes(data);
      } catch (error) {
        console.error("Error al obtener los clientes:", error);
      }
    };
    fetchClientes();
  }, []);
  // Definir los filtros como un objeto para mejor mantenimiento
  const filtros = {
    PENDIENTE: (cliente) => cliente.estatus === "PENDIENTE",

    PROCESO: (cliente) => {
      const estatusExcluidos = [
        "TERMINADO/PENDIENTE",
        "TERMINADO",
        "TERMINADO/COMPROMISO",
        "NO PROCEDE",
      ];
      return !estatusExcluidos.includes(cliente.estatus);
    },

    BC: (cliente) => cliente.tipo_proceso === "BC",

    COMPROMISO: (cliente) => cliente.estatus === "TERMINADO/COMPROMISO",

    MOVGEN: (cliente) => {
      const movimientosValidos = [
        "AUMENTO",
        "CANCELACIÓN",
        "PRÓRROGA",
        "EXPEDICIÓN",
      ];
      return movimientosValidos.includes(cliente.movimiento);
    },

    COBRANZA: (cliente) =>
      cliente.estatus_pago === "PENDIENTE" && cliente.estatus === "TERMINADO",
  };

  // Aplicar el filtro
  const filteredClientes = filtros[tipo] ? clientes.filter(filtros[tipo]) : [];
  return (
    <div>
      <div className="rounded-lg border border-gray-200 overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Folio
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Nombre
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Fecha
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Movimiento
                </th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">
                  Estatus
                </th>
                {tipo != "COBRANZA" && (
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Responsable
                  </th>
                )}
                {tipo === "COBRANZA" && (
                  <>
                    <th className="px-4 py-3 font-medium text-gray-600 text-left">
                      Prima Total
                    </th>
                    <th className="px-4 py-3 font-medium text-gray-600 text-left">
                      Importe Total
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredClientes.map((cliente) => (
                <tr
                  key={cliente.id_tramite}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() =>
                    navigate(`/vistaprevia`, {
                      state: { id: cliente.id_tramite },
                    })
                  }
                >
                  <td className="px-4 py-3 font-medium text-gray-900 text-nowrap">
                    {cliente.folio}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{cliente.nombre}</td>

                  <td className="px-4 py-3 text-gray-600">{cliente.fecha}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {cliente.movimiento}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-nowrap text-center">
                    <span
                      className={
                        statusStyles[cliente.estatus] ||
                        "bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-base font-semibold"
                      }
                    >
                      {cliente.estatus}
                    </span>
                  </td>
                  {tipo != "COBRANZA" && (
                    <td className="px-4 py-3 text-gray-600 text-center text-nowrap">
                      {cliente.estatus === "TERMINADO/COMPROMISO" &&
                      cliente.tiene_compromiso === "SI"
                        ? cliente.categoria_compromiso
                        : cliente.estatus === "TERMINADO" ||
                          (cliente.estatus === "TERMINADO/PENDIENTE" &&
                            cliente.tiene_compromiso === "NO")
                        ? null
                        : cliente.tipo_proceso}
                    </td>
                  )}
                  {tipo === "COBRANZA" && (
                    <>
                      <td className="px-4 py-3 text-gray-600 font-bold text-left">
                        ${cliente.prima_total}
                      </td>
                      <td className="px-4 py-3 text-gray-600 font-bold text-left">
                        ${cliente.prima_total}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
