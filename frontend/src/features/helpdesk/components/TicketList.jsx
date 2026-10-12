import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// Importamos el icono de gráficas (BarChart2) y el de descarga
import { Download, BarChart2 } from "lucide-react";

export default function TicketList({ tickets, loading, onNewTicket }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("DEFAULT");

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Aseguramos que sea un arreglo
  const ticketsList = Array.isArray(tickets)
    ? tickets
    : tickets?.data || tickets?.results || [];
    
  const filteredTickets = ticketsList.filter((t) => {
    // FIX: Usamos username o name para la búsqueda
    const creatorName = t.creator?.username || t.creator?.name || "";
    const matchesSearch =
      t.folio.toString().includes(searchQuery) ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creatorName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (viewMode === "DEFAULT") {
      // FIX: Cambiado a created_at
      const ticketDate = new Date(t.created_at);
      const isCurrentMonth =
        ticketDate.getMonth() === currentMonth &&
        ticketDate.getFullYear() === currentYear;
      return t.status !== "CERRADO" && isCurrentMonth;
    } else if (viewMode === "OPEN_ALL") {
      return t.status !== "CERRADO";
    }
    return true;
  });

  // ==========================================
  // EXPORTAR A EXCEL (Con Descripción Segura)
  // ==========================================
  const exportToCSV = () => {
    const headers = [
      "Folio",
      "Estado",
      "Título",
      "Descripción",
      "Tipo",
      "Categoría",
      "Solicitante",
      "Técnico Asignado",
      "Fecha de Apertura",
    ];

    const rows = filteredTickets.map((t) => {
      const cleanDescription = t.description
        ? t.description.replace(/"/g, '""').replace(/[\r\n]+/g, " ")
        : "Sin descripción";

      return [
        t.folio,
        t.status,
        `"${t.title.replace(/"/g, '""')}"`,
        `"${cleanDescription}"`,
        t.caseType || "Incidente",
        `"${t.category?.name || "N/A"}"`,
        // FIX: Nombres actualizados a Django
        `"${t.creator?.username || t.creator?.name || "N/A"}"`,
        `"${t.assignedTech?.username || t.assignedTech?.name || "Sin asignar"}"`,
        // FIX: Fecha actualizada
        new Date(t.created_at).toLocaleDateString("es-MX"),
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const todayStr = new Date().toISOString().slice(0, 10);
    link.setAttribute("href", url);
    link.setAttribute("download", `Reporte_Tickets_${todayStr}.csv`);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* HEADER DASHBOARD */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Casos Registrados
          </h1>
          <p className="text-xs font-semibold text-brand uppercase tracking-wider mt-1">
            Soporte IT <span className="text-gray-400 mx-1">•</span>Casos
          </p>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/support/metrics")}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-bold rounded-md shadow-sm transition flex items-center gap-2"
            title="Ver Dashboard Analítico"
          >
            <BarChart2 size={16} className="text-brand" />
            Métricas
          </button>

          <button
            onClick={exportToCSV}
            disabled={filteredTickets.length === 0}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-bold rounded-md shadow-sm transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Descargar reporte en Excel"
          >
            <Download size={16} className="text-green-600" />
            Exportar
          </button>

          <button
            onClick={onNewTicket}
            className="px-6 py-2 bg-brand hover:bg-brand-hover text-white text-sm font-bold rounded-md shadow-sm transition flex items-center gap-2"
          >
            <span>+</span> Nuevo Ticket
          </button>
        </div>
      </div>

      {/* CONTENEDOR DE LA TABLA */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* BARRA DE BÚSQUEDA Y FILTROS */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar por ID, título o solicitante..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-xs font-bold text-gray-500 uppercase">Vista:</label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="p-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer shadow-sm"
            >
              <option value="DEFAULT">Pendientes (Mes Actual)</option>
              <option value="OPEN_ALL">Todos los Pendientes</option>
              <option value="ALL">Histórico Completo</option>
            </select>
          </div>
        </div>

        {/* TABLA */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Título</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Tipo / Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Prioridad</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Solicitante</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Técnico</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Apertura</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    Cargando tickets...
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-16 text-center">
                    <h3 className="text-sm font-bold text-gray-900">
                      No se encontraron tickets en esta vista
                    </h3>
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.folio}
                    // FIX: Usamos el folio en lugar de id para la URL, ya que folio es la Primary Key
                    onClick={() => navigate(`/support/ticket/${ticket.folio}`)}
                    className="hover:bg-indigo-50/50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      #{ticket.folio}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-md border
                        ${
                          ticket.status === "ABIERTO"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : ticket.status === "RESUELTO"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : ticket.status === "CERRADO"
                                ? "bg-gray-100 text-gray-700 border-gray-300"
                                : "bg-yellow-50 text-yellow-700 border-yellow-200"
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                      {ticket.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ticket.caseType} / {ticket.category?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Media
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {/* FIX: Usamos username o name para pintar en la tabla */}
                      {ticket.creator?.username || ticket.creator?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {/* FIX: Técnico asignado */}
                      {ticket.assignedTech?.username || ticket.assignedTech?.name || "Sin asignar"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {/* FIX: Fecha actualizada */}
                      {new Date(ticket.created_at).toLocaleDateString("es-MX")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}