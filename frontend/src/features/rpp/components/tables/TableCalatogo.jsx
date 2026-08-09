import React, { useEffect, useState } from "react";
import { catalagos } from "@/features/rpp/services/rpp";
import { Toaster } from "sonner";
import CatalogoTramites from "../modals/CatalogoTramites";
export default function TableCalatogo() {
  const [catalago, setCatalago] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [id, setId] = useState("");

  useEffect(() => {
    // Solicitar opciones al backend
    const fetchTramites = async () => {
      try {
        const response = await api.catalogos.list();
        setCatalago(response);
      } catch (error) {
        console.error("Error al obtener las opciones:", error);
      }
    };

    fetchTramites();
  }, []);
  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                Tramite
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                Costo
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                Tiempo de entrega
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                Costo Express
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                Tiempo de entrega
              </th>
            </tr>
          </thead>
          <tbody>
            {catalago.length > 0 ? (
              catalago.map((catalago) => (
                <tr
                  key={catalago.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => {
                    setId(catalago.id);
                    setShowDialog(true);
                  }}
                >
                  <td className="px-4 py-3 font-medium text-gray-900 text-nowrap">
                    {catalago.tramite}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {catalago.costo_normal}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {catalago.tiempo_entrega}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {catalago.tramite_express}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {catalago.tiempo_entrega_express}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="12" className="p-4 text-center text-gray-600">
                  No se encontraron.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {showDialog && (
          <CatalogoTramites onClose={() => setShowDialog(false)} id={id} />
        )}
      </div>
      <Toaster position="top-center" richColors />
    </div>
  );
}
