import React, { useState, useEffect } from "react";
import {
  getSupportCategories,
  createSupportCategory,
  updateSupportCategory,
  getTechUsers,
} from "../services/supportService";

export default function SupportCategories() {
  const [categories, setCategories] = useState([]);
  const [techs, setTechs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados del Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    defaultTechId: "",
    parentId: "",
    isActive: true,
  });

  const getFullCategoryName = (category, allCategories) => {
    if (!category.parentId) return category.name;
    const parent = allCategories.find((c) => c.id === category.parentId);
    if (!parent) return category.name;
    return `${getFullCategoryName(parent, allCategories)} > ${category.name}`;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catsRes, techsRes] = await Promise.all([
        getSupportCategories(),
        getTechUsers(),
      ]);
      const catsData = catsRes.results || catsRes.data || catsRes;
      setCategories(Array.isArray(catsData) ? catsData : []);

      const techsData = techsRes.results || techsRes.data || techsRes;
      setTechs(Array.isArray(techsData) ? techsData : []);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || "",
        defaultTechId: category.defaultTechId || "",
        isActive: category.isActive,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        description: "",
        defaultTechId: "",
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Adaptamos el payload para Django DRF (quitamos los sufijos "Id")
      const payload = {
        name: formData.name,
        description: formData.description,
        defaultTech: formData.defaultTechId || null,
        parent: formData.parentId || null,
        isActive: formData.isActive,
      };

      if (editingCategory) {
        await updateSupportCategory(editingCategory.id, payload);
      } else {
        await createSupportCategory(payload);
      }
      setIsModalOpen(false);
      fetchData(); // Recargar tabla
    } catch (error) {
      alert("Error al guardar la categoría");
    }
  };

  const toggleStatus = async (category) => {
    try {
      await updateSupportCategory(category.id, {
        isActive: !category.isActive,
      });
      fetchData();
    } catch (error) {
      alert("Error al cambiar el estado");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-gray-700">
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Categorías de Soporte
            </h1>
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mt-1">
              Soporte IT <span className="text-gray-400 mx-1">•</span>{" "}
              Configuración
            </p>
          </div>
          <button
            onClick={() => openModal()}
            className="px-6 py-2 bg-brand hover:bg-brand-hover text-white text-sm font-bold rounded-md shadow-sm transition flex items-center gap-2 cursor-pointer"
          >
            <span>+</span> Nueva Categoría
          </button>
        </div>

        {/* TABLA */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Técnico por Defecto
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Cargando...
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr
                    key={cat.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {getFullCategoryName(cat, categories)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                      {cat.description || "-"}
                    </td>
                    {/* Reemplaza este bloque (donde pintas el técnico en la tabla) */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {cat.defaultTech ? (
                        <span className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                            {cat.default_tech_name
                              ? cat.default_tech_name.charAt(0).toUpperCase()
                              : "?"}
                          </span>
                          {cat.default_tech_name}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">
                          Sin asignar
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleStatus(cat)}
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border transition-colors cursor-pointer
                        ${cat.isActive ? "bg-green-50 text-green-700 cursor-pointer border-green-200 hover:bg-green-100" : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"}`}
                      >
                        {cat.isActive ? "Activa" : "Inactiva"}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openModal(cat)}
                        className="text-brand hover:text-brand-hover font-bold cursor-pointer"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MODAL DE CREACIÓN / EDICIÓN */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-bold text-gray-800">
                  {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Nombre de la Categoría *
                  </label>
                  <input
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ej. Hardware, Redes..."
                    className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Categoría Padre (Opcional)
                  </label>
                  <select
                    value={formData.parentId}
                    onChange={(e) =>
                      setFormData({ ...formData, parentId: e.target.value })
                    }
                    className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="">
                      Ninguna (Es una categoría principal)
                    </option>
                    {categories
                      // Evitamos que una categoría sea padre de sí misma
                      .filter((c) => c.id !== editingCategory?.id)
                      // Ordenamos alfabéticamente por la ruta completa
                      .sort((a, b) =>
                        getFullCategoryName(a, categories).localeCompare(
                          getFullCategoryName(b, categories),
                        ),
                      )
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {getFullCategoryName(cat, categories)}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Descripción
                  </label>
                  <textarea
                    rows="2"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Opcional..."
                    className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Técnico por Defecto (Auto-asignación)
                  </label>
                  <select
                    value={formData.defaultTechId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        defaultTechId: e.target.value,
                      })
                    }
                    className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="">Ninguno (Asignación manual)</option>
                    {techs.map((tech) => (
                      <option key={tech.id} value={tech.id}>
                        {tech.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    Los tickets de esta categoría se asignarán automáticamente a
                    este técnico.
                  </p>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-md transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-brand hover:bg-brand-hover text-white text-sm font-bold rounded-md shadow-sm transition cursor-pointer"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
