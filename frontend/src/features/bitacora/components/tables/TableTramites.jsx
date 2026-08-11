import React, { useEffect, useState, useCallback } from "react";
import FormularioTramite from "@/features/bitacora/components/forms/FormularioTramite";
import TramiteRow from "./TramiteRow";

import { Toaster } from "sonner";
import { useUsuario, useCatalogos } from "../../hooks";
import { FiChevronDown, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { fetchTramites } from "../../services/tramites.service";
import {
  fetchMovimientos,
  fetchEstatus,
} from "../../services/catalogos.service";
import { useNavigate } from "react-router-dom";

const FILTERS_PAGO = ["PAGADA", "SE MANDÓ RECIBO", "NO PAGADA", "PENDIENTE"];
const PAGE_SIZE = 50;

export default function TableTramites() {
  const navigate = useNavigate();
  // --- Estado de datos ---
  const [tramites, setTramites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [afianzadoras, setAfianzadoras] = useState([]);
  const { catalogos, loading: catalogosLoading } = useCatalogos();

  // --- Estado de paginación ---
  const [pagination, setPagination] = useState({
    count: 0,
    currentPage: 1,
    totalPages: 0,
    next: null,
    previous: null,
  });

  // --- Estado de filtros (guardados en localStorage) ---
  const [filters, setFilters] = useState(() => ({
    search: localStorage.getItem("searchQuery") || "",
    numero_fianza: localStorage.getItem("searchQueryFianza") || "",
    movimiento: localStorage.getItem("movimientoFiltro") || "",
    estatus: localStorage.getItem("estatusFiltro") || "",
    estatus_pago: localStorage.getItem("pagoFilter") || "",
    agente_nombre: localStorage.getItem("agenteFiltro") || "",
  }));

  // --- Estado de catálogos ---
  const [movimientos, setMovimientos] = useState([]);
  const [estatus, setEstatus] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);

  // --- Cargar catálogos ---
  useEffect(() => {
    const loadCatalogos = async () => {
      try {
        const [movimientosData, estatusData] = await Promise.all([
          fetchMovimientos(),
          fetchEstatus(),
        ]);
        setMovimientos(movimientosData.results);
        setEstatus(estatusData.results);
      } catch (error) {
        console.error("Error al cargar catálogos:", error);
      }
    };
    loadCatalogos();
  }, []);

  useEffect(() => {
    if (catalogosLoading) return;
    const { afianzadoras } = catalogos;
    console.log(afianzadoras);
    setAfianzadoras(afianzadoras);
  }, [catalogos, catalogosLoading]);

  // --- Obtener trámites con filtros del servidor ---
  const obtenerTramites = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const data = await fetchTramites(page, filters);
        setTramites(data.data);
        setPagination({
          count: data.count,
          currentPage: page,
          totalPages: Math.ceil(data.count / PAGE_SIZE),
          next: data.next,
          previous: data.previous,
        });
      } catch (error) {
        console.error("Error al obtener los trámites:", error);
      } finally {
        setLoading(false);
      }
    },
    [filters],
  );

  // --- Cargar datos cuando cambian los filtros ---
  useEffect(() => {
    obtenerTramites(1); // Siempre volver a página 1 cuando cambian filtros
  }, [filters]);

  // --- Guardar filtros en localStorage ---
  useEffect(() => {
    localStorage.setItem("searchQuery", filters.search);

    localStorage.setItem("searchQueryFianza", filters.numero_fianza);
    localStorage.setItem("movimientoFiltro", filters.movimiento);
    localStorage.setItem("estatusFiltro", filters.estatus);
    localStorage.setItem("pagoFilter", filters.estatus_pago);
    localStorage.setItem("afianzadoraFiltro", filters.afianzadora);
  }, [filters]);

  // --- Handlers de filtros (con debounce para inputs de texto) ---
  const [searchTimeout, setSearchTimeout] = useState(null);
  const listaDeIds = tramites.map((t) => t.id);
  const handleSearchChange = (field, value) => {
    // Limpiar timeout anterior
    if (searchTimeout) clearTimeout(searchTimeout);

    // Crear nuevo timeout para esperar que el usuario termine de escribir
    const timeout = setTimeout(() => {
      setFilters((prev) => ({ ...prev, [field]: value }));
    }, 500); // Espera 500ms después de que el usuario deje de escribir

    setSearchTimeout(timeout);
  };

  const handleSelectChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  // --- Funciones de paginación ---
  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      obtenerTramites(page);
    }
  };

  const handleFormSuccess = () => {
    obtenerTramites(pagination.currentPage);
  };

  // --- Limpiar todos los filtros ---
  const limpiarFiltros = () => {
    setFilters({
      search: "",
      numero_fianza: "",
      movimiento: "",
      estatus: "",
      estatus_pago: "",
    });
  };
  const listaIds = tramites.map(t => t.id);
  // --- Verificar si hay filtros activos ---
  const hayFiltrosActivos = Object.values(filters).some((v) => v !== "");
  const tramitesList = Array.isArray(tramites) ? tramites : [];
  return (
    <div className="w-full p-5">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            Trámites
          </h1>
          <span className="text-sm text-gray-500">
            {pagination.count.toLocaleString()} trámites encontrados
          </span>
        </div>

        {/* Contenedor de filtros */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
          <div className="md:col-span-1">
            <input
              type="text"
              placeholder="# fianza, nombre fiado o beneficiario"
              defaultValue={filters.search || filters.numero_fianza}
              onChange={(e) => {
                const value = e.target.value;
                if (searchTimeout) clearTimeout(searchTimeout);
                const timeout = setTimeout(() => {
                  setFilters((prev) => ({
                    ...prev,
                    search: value,
                    numero_fianza: "", // ← limpiar, no duplicar
                  }));
                }, 500);
                setSearchTimeout(timeout);
              }}
              className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Select movimiento */}
          <div className="relative">
            <select
              value={filters.movimiento}
              onChange={(e) => handleSelectChange("movimiento", e.target.value)}
              className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
            >
              <option value="">Todos los movimientos</option>
              {movimientos.map((movimiento) => (
                <option key={movimiento.id} value={movimiento.nombre}>
                  {movimiento.nombre}
                </option>
              ))}
            </select>
            <FiChevronDown className="absolute top-1/2 right-4 transform -translate-y-1/2 pointer-events-none text-gray-500" />
          </div>

          <div className="flex items-center gap-4 relative col-span-1f">
            <div className="relative w-full">
              <select
                value={filters.estatus_pago}
                onChange={(e) =>
                  handleSelectChange("estatus_pago", e.target.value)
                }
                className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer pr-10 w-full"
              >
                <option value="">Todos los pagos</option>
                {FILTERS_PAGO.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
              <FiChevronDown className="absolute top-1/2 right-4 transform -translate-y-1/2 pointer-events-none text-gray-500" />
            </div>

            {hayFiltrosActivos && (
              <button
                onClick={limpiarFiltros}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {/* Estatus + botón nuevo trámite */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-auto flex-1">
              <select
                value={filters.estatus}
                onChange={(e) => handleSelectChange("estatus", e.target.value)}
                className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
              >
                <option value="">Todos los estatus</option>
                {estatus.map((estatusOption) => (
                  <option key={estatusOption.id} value={estatusOption.nombre}>
                    {estatusOption.nombre}
                  </option>
                ))}
              </select>
              <FiChevronDown className="absolute top-1/2 right-4 transform -translate-y-1/2 pointer-events-none text-gray-500" />
            </div>

            <button
              className="h-10 px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 whitespace-nowrap"
              onClick={() => setIsFormVisible(true)}
            >
              Nuevo trámite
            </button>
          </div>
        </div>

        {/* Filtro de pago y botón limpiar */}
        <div className="flex items-center gap-4">
          <button
            className="h-10 px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 whitespace-nowrap"
            onClick={() => navigate("/comparar-tramites")}
          >
            Comparar trámite
          </button>
          <div className="flex items-center gap-4 justify-between">
            <div className="flex items-center space-x-3">
              <label className="group flex items-center cursor-pointer gap-3">
                <div
                  className={`w-8 h-8 flex justify-center items-center rounded-md border-2 shadow-md transition-all duration-300 ${
                    filters.agente_nombre === "RBG-PP"
                      ? "bg-primary border-primary"
                      : "bg-gray-100 border-gray-400"
                  }`}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      agente_nombre:
                        prev.agente_nombre === "RBG-PP" ? "" : "RBG-PP",
                    }))
                  }
                >
                  {filters.agente_nombre === "RBG-PP" && (
                    <svg
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      className="w-5 h-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        clipRule="evenodd"
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                      />
                    </svg>
                  )}
                </div>
                <span className="text-gray-700 font-medium">PP</span>
              </label>
            </div>
          </div>
          <div className="relative sm:w-auto flex-1">
            <select
              value={filters.afianzadora_id}
              onChange={(e) => {
                const value = e.target.value;
                localStorage.setItem("afianzadoraFiltro", value);
                setFilters((prev) => ({ ...prev, afianzadora_id: value }));
              }}
              className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
            >
              <option value="">Afianzadora</option>
              {afianzadoras.map((afianzadora) => (
                <option key={afianzadora.value} value={afianzadora.value}>
                  {" "}
                  {/* ← era afianzadora.label */}
                  {afianzadora.label}
                </option>
              ))}
            </select>
            <FiChevronDown className="absolute top-1/2 right-4 transform -translate-y-1/2 pointer-events-none text-gray-500" />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 overflow-hidden mt-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Folio
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Beneficiario
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Fianza
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
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Afianzadora
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Estatus
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Responsable
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Pago
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      Cargando trámites...
                    </div>
                  </td>
                </tr>
              ) : tramitesList.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No se encontraron trámites
                    {hayFiltrosActivos && (
                      <button
                        onClick={limpiarFiltros}
                        className="ml-2 text-primary hover:underline"
                      >
                        Limpiar filtros
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                tramites.map((tramite) => (
                  <TramiteRow key={tramite.id} tramite={tramite} listaIds={listaIds}/>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Controles de Paginación */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Página {pagination.currentPage} de {pagination.totalPages}
              {" · "}
              {pagination.count.toLocaleString()} registros
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(1)}
                disabled={pagination.currentPage === 1 || loading}
                className="px-3 py-1 text-sm border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Primera
              </button>

              <button
                onClick={() => goToPage(pagination.currentPage - 1)}
                disabled={!pagination.previous || loading}
                className="p-2 border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronLeft />
              </button>

              {/* Números de página */}
              <div className="flex gap-1">
                {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (
                    pagination.currentPage >=
                    pagination.totalPages - 2
                  ) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.currentPage - 2 + i;
                  }

                  if (pageNum < 1 || pageNum > pagination.totalPages)
                    return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      disabled={loading}
                      className={`px-3 py-1 text-sm border rounded-md ${
                        pageNum === pagination.currentPage
                          ? "bg-primary text-white border-primary"
                          : "hover:bg-gray-100"
                      } disabled:cursor-not-allowed`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => goToPage(pagination.currentPage + 1)}
                disabled={!pagination.next || loading}
                className="p-2 border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronRight />
              </button>

              <button
                onClick={() => goToPage(pagination.totalPages)}
                disabled={
                  pagination.currentPage === pagination.totalPages || loading
                }
                className="px-3 py-1 text-sm border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Última
              </button>
            </div>
          </div>
        )}
      </div>
      <FormularioTramite
        isVisible={isFormVisible}
        onClose={() => setIsFormVisible(false)}
        onSuccess={handleFormSuccess}
      />
      <Toaster position="top-center" richColors />
    </div>
  );
}
