import React from "react";
import { useState, useEffect, useCallback } from "react";
import { obtenerClientes } from "../../services/clientes";
import { Referidos } from "../modals/Referidos";
import { Seguimiento } from "../modals/Seguimiento";
import { fetchClientesAll } from "@/features/bitacora/services/catalogos.service";
import {
  Phone,
  Mail,
  UserRoundSearch,
  Eye,
  UserCheck,
  CircleCheck,
  CircleAlert,
} from "lucide-react";
export default function TableClientes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [modalActivo, setModalActivo] = useState(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState({
    id_cli: "",
    nombre_cli: "",
  });
  const [clientes, setClientes] = useState([]);
  const handleAbrirModal = (tipo, clienteData) => {
    setClienteSeleccionado(clienteData);
    setModalActivo(tipo);
  };

  const handleCerrarModal = () => {
    setModalActivo(null);
  };

  const fetchClientes = useCallback(async () => {
    try {
      const response = await obtenerClientes();
      setClientes(response);
    } catch (error) {
      console.error("Error al obtener los clientes:", error);
    }
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  const handleFormSuccess = () => {
    fetchClientes();
  };

  const filteredClientes = clientes.filter((dato) => {
    if (!dato.nombre_cli) return true;
    return dato.nombre_cli.toLowerCase().includes(searchQuery.toLowerCase());
  });
  return (
    <div className="w-full">
      <div className="py-5">
        <input
          type="text"
          placeholder="Nombre del fiado"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-hidden focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fiado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telefono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referidos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seguimiento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClientes.length > 0 ? (
                filteredClientes.map((cliente) => (
                  <tr
                    key={cliente.id_cli}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-medium text-gray-900">
                            {cliente.nombre_cli}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {cliente.correo_cli}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Phone className="h-3 w-3" />
                        {cliente.telefono_cli}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium text-sm">
                        {cliente.tipo_cliente}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          cliente.total_referidos > 0
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <UserCheck className="mr-1" size={14} />
                        {cliente.total_referidos} referido
                        {cliente.total_referidos !== 1 ? "s" : ""}
                      </span>
                    </td>
                    {cliente.tipo_cliente === "CI" ? (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            cliente.total_seguimiento > 0
                              ? "bg-green-100 text-green-800" // Con seguimiento
                              : "bg-red-100 text-red-800" // Sin seguimiento
                          }`}
                        >
                          {cliente.total_seguimiento > 0 ? (
                            <>
                              <CircleCheck className="mr-1" size={14} />
                              {`${cliente.total_seguimiento} ${
                                cliente.total_seguimiento === 1
                                  ? "seguimiento"
                                  : "seguimientos"
                              }`}
                            </>
                          ) : (
                            <>
                              <CircleAlert className="mr-1" size={14} />
                              Sin seguimiento
                            </>
                          )}
                        </span>
                      </td>
                    ) : (
                      <td></td>
                    )}

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleAbrirModal("referidos", {
                              id_cli: cliente.id_cli,
                              nombre_cli: cliente.nombre_cli,
                            })
                          }
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Eye size={16} />
                          Ver Referidos
                        </button>
                        {cliente.tipo_cliente === "CI" && (
                          <button
                            onClick={() =>
                              handleAbrirModal("seguimiento", {
                                id_cli: cliente.id_cli,
                                nombre_cli: cliente.nombre_cli,
                              })
                            }
                            className=" text-black px-4 py-2 rounded-lg border-2 hover:bg-gray-100 transition-colors flex items-center gap-2"
                          >
                            <UserRoundSearch size={16} />
                            Seguimiento
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="12" className="p-4 text-center text-gray-600">
                    No se encontraron trámites.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Referidos
        isOpen={modalActivo === "referidos"}
        onClose={handleCerrarModal}
        cliente={clienteSeleccionado.nombre_cli}
        id_cli={clienteSeleccionado.id_cli}
        onSuccess={handleFormSuccess}
      />
        <Seguimiento
          isOpen={modalActivo === "seguimiento"}
          onClose={handleCerrarModal}
          cliente={clienteSeleccionado.nombre_cli}
          id_cli={clienteSeleccionado.id_cli}
          onSuccess={handleFormSuccess}
          onActivate={handleFormSuccess}
        />
    </div>
  );
}
