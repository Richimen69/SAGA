import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import { createSupportTicket } from "../services/supportService";

// Función auxiliar para el árbol de categorías
const getFullCategoryName = (category, allCategories) => {
  if (!category.parentId) return category.name;
  const parent = allCategories.find((c) => c.id === category.parentId);
  if (!parent) return category.name;
  return `${getFullCategoryName(parent, allCategories)} > ${category.name}`;
};
const normalizar = (texto = "") =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export default function CreateTicketForm({
  categories,
  onCancel,
  onSuccess,
  currentUser,
  users,
}) {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(
    currentUser?.role !== "ADMIN" ? currentUser?.id : "",
  );
  const dropdownRef = useRef(null);
  const usersFiltrados = userSearch.trim()
    ? users?.filter((user) =>
        normalizar(user.name).includes(normalizar(userSearch)),
      )
    : users;
  const selectedUserName =
    users?.find((u) => u.id === selectedUserId)?.name ||
    (selectedUserId === currentUser?.id
      ? currentUser?.name
      : "Seleccionar solicitante");
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handleSelectUser = (id) => {
    setSelectedUserId(id);
    setIsOpen(false);
    setUserSearch("");
  };
  // Lógica de Archivos
  const handleFileChange = (e) => {
    if (e.target.files)
      setFiles((prev) => [...prev, ...Array.from(e.target.files)]);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files)
      setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
  };
  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    const pastedFiles = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        pastedFiles.push(
          new File([file], `captura-${Date.now()}.png`, { type: file.type }),
        );
      }
    }
    if (pastedFiles.length > 0) {
      e.preventDefault();
      setFiles((prev) => [...prev, ...pastedFiles]);
    }
  };
  const removeFile = (indexToRemove) =>
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!selectedUserId) {
      alert("Por favor, selecciona un solicitante de la lista.");
      return;
    }
    setIsSubmitting(true);
    const formData = new FormData(e.target);

    const ticketData = {
      title: formData.get("title"),
      description: formData.get("description"),
      caseType: formData.get("caseType"),
      categoryId: formData.get("categoryId"),
      source: formData.get("source"),
      creatorId: selectedUserId,
      createdAt: formData.get("createdAt"),
    };

    try {
      await createSupportTicket(ticketData, files);
      onSuccess(); // Le avisa al padre que terminó con éxito
    } catch (error) {
      alert("Error al crear el ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date().toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const todayWithTime = now.toISOString().slice(0, 16);

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Crear Nueva Incidencia
          </h1>
          <p className="text-xs font-semibold text-brand uppercase tracking-wider mt-1">
            Soporte IT <span className="text-gray-400 mx-1">•</span>
            Casos <span className="text-gray-400 mx-1">•</span> Nuevo Ticket
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition cursor-pointer"
          >
            Descartar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-brand hover:bg-brand-hover text-white text-sm font-bold rounded-md shadow-sm transition disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? "Guardando..." : "Guardar Ticket"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
              Fecha de Apertura *
            </label>
            <input
              type="datetime-local"
              name="createdAt"
              required
              disabled={currentUser.role !== "ADMIN"}
              defaultValue={todayWithTime}
              className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-brand outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
              Tipo de Caso *
            </label>
            <select
              name="caseType"
              required
              className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-brand outline-none cursor-pointer"
            >
              <option value="INCIDENTE">Incidente</option>
              <option value="REQUERIMIENTO">Requerimiento</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
              Categoría *
            </label>
            <select
              name="categoryId"
              required
              className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-brand outline-none cursor-pointer"
            >
              <option value="">Seleccione...</option>
              {categories
                .filter((cat) => cat.isActive)
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
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
              Estado Actual *
            </label>
            <input
              type="text"
              value="Nuevo"
              disabled
              className="w-full p-2.5 bg-indigo-50/50 border border-indigo-100 rounded-md text-sm text-indigo-700 font-medium cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
              Fuente de Solicitud *
            </label>

            {/* Input oculto: Asegura que el valor se envíe al backend aunque el select esté deshabilitado */}
            {currentUser?.role !== "ADMIN" && (
              <input type="hidden" name="source" value="PORTAL" />
            )}

            <select
              name="source"
              required={currentUser?.role === "ADMIN"}
              disabled={currentUser?.role !== "ADMIN"}
              defaultValue="PORTAL"
              className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-brand outline-none transition-colors disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed cursor-pointer bg-white"
            >
              <option value="PORTAL">Kyojin</option>
              <option value="PRESENCIAL">Presencial</option>
              <option value="TELEFONO">Teléfono</option>
              <option value="WHATSAPP">WhatsApp</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
              Prioridad *
            </label>
            <input
              type="text"
              value="Media"
              disabled
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-500 cursor-not-allowed"
            />
          </div>
          <div className="relative" ref={dropdownRef}>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
              Solicitante *
            </label>

            {/* Input oculto: Mantiene la compatibilidad con tu formulario nativo */}

            <input
              type="hidden"
              name="solicitate"
              value={selectedUserId}
              required
            />

            {/* Botón que simula el select */}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              disabled={currentUser?.role !== "ADMIN"}
              className={`w-full p-2.5 border border-gray-300 rounded-md text-sm flex justify-between items-center focus:ring-2 focus:ring-brand outline-none transition-shadow ${
                currentUser?.role !== "ADMIN"
                  ? "bg-gray-50 cursor-not-allowed"
                  : "bg-white cursor-pointer"
              }`}
            >
              <span
                className={
                  selectedUserId ? "text-gray-900 font-medium" : "text-gray-500"
                }
              >
                {selectedUserName}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Menú Desplegable */}
            {isOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-xl flex flex-col overflow-hidden">
                {/* Barra de búsqueda estilo Modal */}
                <div className="relative p-2 border-b border-gray-100 bg-gray-50">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Buscar por nombre..."
                    autoFocus
                    className="w-full bg-white border border-gray-200 rounded-md pl-8 pr-3 py-1.5 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-shadow"
                  />
                </div>

                {/* Lista de usuarios con altura máxima y scroll */}
                <div className="max-h-40 overflow-y-auto divide-y divide-gray-100 scrollbar-thin">
                  {usersFiltrados?.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">
                      Sin coincidencias para "{userSearch}"
                    </p>
                  ) : (
                    usersFiltrados?.map((user) => {
                      const isSelected = selectedUserId === user.id;
                      return (
                        <div
                          key={user.id}
                          onClick={() => handleSelectUser(user.id)}
                          className={`flex items-center justify-between p-2.5 cursor-pointer transition-colors ${
                            isSelected ? "bg-brand/10" : "hover:bg-gray-50"
                          }`}
                        >
                          <span
                            className={`text-sm ${isSelected ? "font-semibold text-gray-900" : "text-gray-600"}`}
                          >
                            {user.name}
                          </span>

                          {/* Checkmark solo para el seleccionado */}
                          {isSelected && (
                            <Check
                              className="w-4 h-4 text-brand"
                              strokeWidth={3}
                            />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
              Asignado a *
            </label>
            <input
              type="text"
              value="Automático"
              disabled
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-400 italic cursor-not-allowed"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
              Título del Caso *
            </label>
            <input
              name="title"
              required
              placeholder="Resumen del problema..."
              className="w-full p-3 bg-white border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-brand outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
              Descripción Detallada *
            </label>
            <textarea
              name="description"
              required
              rows="5"
              onPaste={handlePaste}
              placeholder="Describe detalladamente el problema... (Puedes pegar imágenes con Ctrl+V)"
              className="w-full p-3 bg-white border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-brand outline-none resize-y"
            ></textarea>
          </div>
        </div>

        <div className="mt-8">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
            Archivos Adjuntos
          </label>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg transition-colors ${isDragging ? "border-brand bg-brand" : "border-gray-300 bg-gray-50 hover:bg-gray-100"}`}
          >
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept="image/*,.pdf,.doc,.docx"
            />
            <svg
              className="w-8 h-8 text-brand mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
            <p className="text-sm text-gray-600">
              <span className="font-bold text-brand">Sube un archivo</span> o
              arrástralo aquí
            </p>
          </div>
          {files.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-md shadow-sm"
                >
                  <div className="flex items-center space-x-2 overflow-hidden">
                    <span className="text-lg">📄</span>
                    <span className="text-xs text-gray-600 truncate">
                      {file.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-gray-400 hover:text-red-500 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
