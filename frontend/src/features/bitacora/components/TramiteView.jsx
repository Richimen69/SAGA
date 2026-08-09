import React from "react";
import { FileText, Plus } from "lucide-react";
import AgregarSubtramite from "./modals/AgregarSubtramite";
import { fetchTramitesPorFianza } from "../services/tramites.service";
import { useState, useEffect } from "react";
import { statusStyles } from "@/shared/utils/Constans";
import { useNavigate } from "react-router-dom";
import { formatToDisplay } from "@/shared/utils/dateHelpers";
export default function TramiteView({ id, fianza }) {
  const navigate = useNavigate();
  const [showAdd, setShowAdd] = useState(false);
  const [tramites, setTramites] = useState([]);
  const fetchData = async () => {
    const data = await fetchTramitesPorFianza(fianza);
    setTramites(data.tramites);
  };
  useEffect(() => {
    fetchData();
  }, [id]);

  const handleRowClick = (id_movimiento) => {
    navigate(`/tramitecliente`, {
      state: { id: id_movimiento },
    });
  };
  return (
    <div className="w-full pt-5">
      <div className="flex flex-col bg-white items-center justify-center p-5 rounded-xl">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center justify-center gap-2">
            <FileText />
            <h1 className="text-xl font-bold text-gray-800">Movimientos</h1>
          </div>
          <div className="flex items-center justify-center gap-2">
            <button
              className="bg-primary hover:bg-[#1b4332] text-white font-semibold px-4 py-2 rounded-lg items-center flex justify-center"
              onClick={() => setShowAdd(true)}
            >
              <Plus className="inline mr-2" />
              Agregar Movimiento
            </button>
          </div>
        </div>
        {tramites?.length > 0 ? (
          <div className="w-full mt-5 ">
            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 ">
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Folio
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Fecha
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Movimiento
                    </th>
                    <th className="px-4 py-3 font-medium text-gray-600 text-center">
                      Estatus
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Responsable
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tramites.length > 0
                    ? tramites.map((tramiteItem, index) => (
                        <tr
                          key={tramiteItem.id || index}
                          className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleRowClick(tramiteItem.id)}
                        >
                          <td className="px-4 py-3 font-bold text-gray-700">
                            {tramiteItem.folio}
                          </td>

                          <td className="px-4 py-3 text-gray-600">
                            {tramiteItem.fecha}
                          </td>

                          <td className="px-4 py-3 text-gray-600">
                            {tramiteItem.movimiento_nombre}
                          </td>
                          <td className="px-4 py-3 text-gray-600 ">
                            <div className="flex flex-col items-center">
                              <span
                                className={
                                  statusStyles[tramiteItem.estatus_nombre] ||
                                  "bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-base font-semibold"
                                }
                              >
                                {tramiteItem.estatus_nombre}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3 text-gray-600">
                            {tramiteItem.tipo_proceso}
                          </td>
                        </tr>
                      ))
                    : null}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="w-full mt-5 items-center justify-center">
            <div className="flex flex-col items-center justify-center p-10 gap-5">
              <FileText size={64} color="#a9a2a2" />
              <h1 className=" text-[#a9a2a2]">
                No hay movimientos registrados
              </h1>
            </div>
          </div>
        )}
      </div>
      <AgregarSubtramite
        isOpen={showAdd}
        onClose={() => {
          setShowAdd(false);
          fetchData();
        }}
        id={id}
      />
    </div>
  );
}
