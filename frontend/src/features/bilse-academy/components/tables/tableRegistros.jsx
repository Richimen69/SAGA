import React, { useEffect, useState } from "react";
import { lista } from "../../services/registros.service";

function TableRegistros() {
  // 1. Definimos el estado para los registros
  const [registros, setRegistros] = useState([]);

  useEffect(() => {
    const fetchLista = async () => {
      try {
        const data = await lista();
        // 2. Guardamos los datos en el estado
        // Si data es el arreglo directo [{...}], lo pasamos; si no, aseguramos un array
        setRegistros(data || []);
      } catch (error) {
        console.error("Error al cargar registros:", error);
      }
    };
    fetchLista();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="rounded-xl bg-white p-5 flex items-center justify-center">
        <p className="text-2xl font-bold text-primary">Panel de registros Bilse Academy</p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <th className="px-6 py-4 text-slate-700 dark:text-slate-200 text-sm font-bold uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-4 text-slate-700 dark:text-slate-200 text-sm font-bold uppercase tracking-wider">
                Teléfono
              </th>
              <th className="px-6 py-4 text-slate-700 dark:text-slate-200 text-sm font-bold uppercase tracking-wider">
                Correo Electrónico
              </th>
              <th className="px-6 py-4 text-slate-700 dark:text-slate-200 text-sm font-bold uppercase tracking-wider">
                Empresa
              </th>
              
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {/* 3. Mapeamos los registros dinámicamente */}
            {registros.length > 0 ? (
              registros.map((reg, index) => (
                <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-5 text-slate-900 dark:text-slate-100 text-sm font-medium">
                    {reg.nombre}
                  </td>
                  <td className="px-6 py-5 text-slate-500 dark:text-slate-400 text-sm">
                    {reg.telefono}
                  </td>
                  <td className="px-6 py-5 text-slate-500 dark:text-slate-400 text-sm underline decoration-slate-200 underline-offset-4">
                    {reg.email}
                  </td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-brand-teal/10 text-brand-teal border border-brand-teal/20">
                      {reg.empresa}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-10 text-center text-slate-500 dark:text-slate-400 italic">
                  Cargando registros o no hay datos disponibles...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TableRegistros;