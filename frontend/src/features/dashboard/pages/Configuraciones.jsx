import React, { useState, useEffect } from "react";
import { fetchAfianzadoras } from "@/features/bitacora/services/datosTramites";
import { Toaster, toast } from "sonner";
import { FileLock2, Target, SquarePen, Ban, Save } from "lucide-react";
import { actualizarMeta } from "@/features/bitacora/services/datosTramites";
export default function Configuraciones() {
  const [afianzadoras, setAfianzadoras] = useState([]);
  useEffect(() => {
    const obtenerAfianzadoras = async () => {
      const response = await fetchAfianzadoras();
      setAfianzadoras(response);
    };
    obtenerAfianzadoras();
  }, []);
  const [editingId, setEditingId] = useState(null);
  const [tempMeta, setTempMeta] = useState(0);

  const handleEdit = (id, currentMeta) => {
    setEditingId(id);
    setTempMeta(currentMeta);
  };
  

  const handleSave = async (id) => {
    const data = {
      id_afi: id,
      meta: tempMeta.replace(/,/g, ""), // Asegúrate de quitar comas
    };

    const response = await actualizarMeta(data);
    if (response.success) {
      toast.success("Meta guardada exitosamente.");

      const updated = await fetchAfianzadoras();
      setAfianzadoras(updated);
    } else {
      toast.error("Hubo un error al guardar la meta.");
    }

    setEditingId(null);
    setTempMeta(0);
  };

  const handleCancel = () => {
    setEditingId(null);
    setTempMeta(0);
  };
  return (
    <div className="p-6">
      <div className="w-full p-6 bg-white rounded-xl shadow-xs border border-gray-200">
        <h1 className="text-2xl font-semibold mb-6 text-gray-800">
          Configuraciones
        </h1>

        <div className="mb-4">
          <div className="grid gap-6">
            <div className="bg-linear-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <FileLock2 strokeWidth={1} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Información de Afianzadora
                </h3>
              </div>
            </div>
            {afianzadoras
              .filter((item) => item.afianzadora === 1)
              .map((item, index) => {
                const isEditing = editingId === item.id_afi;
                return (
                  <div
                    key={`${item.nombre_afi}-${index}`}
                    className="bg-white rounded-xl border border-gray-200 shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden group"
                  >
                    {/* Contenido de la tabla */}
                    <div className="p-6">
                      <div className="overflow-hidden rounded-lg ">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-6 py-4 text-left">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm flex gap-2 font-semibold text-gray-700 uppercase tracking-wider">
                                    <FileLock2 strokeWidth={1} /> Afianzadora
                                  </span>
                                </div>
                              </th>
                              <th className="px-6 py-4 text-left">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm flex gap-2 font-semibold text-gray-700 uppercase tracking-wider">
                                    <Target strokeWidth={1} /> Meta
                                  </span>
                                </div>
                              </th>
                              <th className="px-6 py-4 text-left"></th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            <tr className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <div className="shrink-0 h-10 w-10">
                                    <div className="h-10 w-10 rounded-full bg-linear-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                                      <span className="text-white font-medium text-sm">
                                        {item.nombre_afi.charAt(0)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="ml-4 w-2/3">
                                    <div className="text-sm font-medium text-gray-900">
                                      {item.nombre_afi}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 w-1/3">
                                {isEditing ? (
                                  <div className="flex items-center gap-2">
                                    <div class="flex h-[34px] text-[14px] text-black/60 w-[160px] items-center bg-[#ffff] border border-black/10 rounded-lg focus-within:ring-2 focus-within:ring-gray-700  transition-all duration-150 ease-in-out">
                                      <span class="ml-2">$</span>
                                      <input
                                        required
                                        className="bg-transparent text-black/60 px-3 py-1 rounded-l-lg focus:outline-hidden w-full"
                                        id="currency-input"
                                        name="text"
                                        type="text"
                                        value={tempMeta}
                                        onChange={(e) => {
                                          const input = e.target.value;
                                          const rawValue = input.replace(
                                            /,/g,
                                            ""
                                          ); // elimina comas

                                          // Solo permitir números (incluyendo vacío para permitir borrado)
                                          if (
                                            rawValue === "" ||
                                            /^\d+$/.test(rawValue)
                                          ) {
                                            const formatted =
                                              rawValue === ""
                                                ? ""
                                                : Number(
                                                    rawValue
                                                  ).toLocaleString("en-US");
                                            setTempMeta(formatted);
                                          }
                                        }}
                                        placeholder="0.00"
                                      />

                                      <span class="mr-2">MXN</span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                      ${item.meta?.toLocaleString("en-US")}
                                    </span>
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 w-10">
                                {isEditing ? (
                                  <div className="flex items-center gap-2">
                                    <button
                                      size="sm"
                                      onClick={() => handleSave(item.id_afi)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Save color="#07b693" strokeWidth={1} />
                                    </button>
                                    <button
                                      size="sm"
                                      variant="outline"
                                      onClick={handleCancel}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Ban color="#e80202" strokeWidth={1} />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      handleEdit(item.id_afi, item.meta)
                                    }
                                    className="h-8 w-8 p-0"
                                  >
                                    <SquarePen strokeWidth={1} />
                                  </button>
                                )}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
      <Toaster position="top-center" richColors />
    </div>
  );
}
