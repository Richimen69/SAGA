import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { format, parseISO } from "date-fns";
import { Toaster, toast } from "sonner";
import { FiChevronDown, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { MessageSquare, Edit } from "lucide-react";

// Hooks y Servicios
import { useUsuario, useCatalogos } from "../../hooks";
import {
  fetchTramites,
  actualizarEstatusTramite,
} from "../../services/tramites.service";
import {
  fetchMovimientos,
  fetchEstatus,
} from "../../services/catalogos.service";
import fetchApi from "@/shared/services/apiNew";

// Componentes
import FormularioTramite from "@/features/bitacora/components/forms/FormularioTramite";
import TramiteCliente from "../../pages/TramiteCliente";
import GestionObservaciones from "../../components/GestionObservaciones";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { statusStyles } from "@/shared/utils/Constans";

const FILTERS_PAGO = ["PAGADA", "SE MANDÓ RECIBO", "NO PAGADA", "PENDIENTE"];
const PAGE_SIZE = 50;

export default function TableTramites() {
  const navigate = useNavigate();
  const usuario = useUsuario();
  const { catalogos, loading: catalogosLoading } = useCatalogos();
  // --- Estado de datos ---
  const [tramites, setTramites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [afianzadoras, setAfianzadoras] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [estatus, setEstatus] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);

  // --- Estados para Modales ---
  const [modalEdicion, setModalEdicion] = useState({
    isOpen: false,
    tramiteId: null,
  });
  const [modalObservaciones, setModalObservaciones] = useState({
    isOpen: false,
    tramiteId: null,
  });

  // --- Estado de paginación ---
  const [pagination, setPagination] = useState({
    count: 0,
    currentPage: 1,
    totalPages: 0,
    next: null,
    previous: null,
  });

  // --- Estado de filtros ---
  const [filters, setFilters] = useState(() => ({
    search: localStorage.getItem("searchQuery") || "",
    numero_fianza: localStorage.getItem("searchQueryFianza") || "",
    movimiento: localStorage.getItem("movimientoFiltro") || "",
    estatus: localStorage.getItem("estatusFiltro") || "",
    estatus_pago: localStorage.getItem("pagoFilter") || "",
    agente_nombre: localStorage.getItem("agenteFiltro") || "",
    afianzadora_id: localStorage.getItem("afianzadoraFiltro") || "",
  }));

  // --- Cargar catálogos ---
  useEffect(() => {
    const loadCatalogos = async () => {
      try {
        const [movimientosData, estatusData] = await Promise.all([
          fetchMovimientos(),
          fetchEstatus(),
        ]);
        setMovimientos(
          Array.isArray(movimientosData)
            ? movimientosData
            : movimientosData?.results || [],
        );
        setEstatus(
          Array.isArray(estatusData) ? estatusData : estatusData?.results || [],
        );
      } catch (error) {
        console.error("Error al cargar catálogos:", error);
      }
    };
    loadCatalogos();
  }, []);

  useEffect(() => {
    if (catalogosLoading) return;
    setAfianzadoras(catalogos?.afianzadoras || []);
  }, [catalogos, catalogosLoading]);

  // --- Obtener trámites ---
  const obtenerTramites = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const data = await fetchTramites(page, filters);
        const resultados = Array.isArray(data)
          ? data
          : data?.data || data?.results || [];
        setTramites(resultados);
        setPagination({
          count: data?.count || 0,
          currentPage: page,
          totalPages: Math.ceil((data?.count || 0) / PAGE_SIZE),
          next: data?.next || null,
          previous: data?.previous || null,
        });
      } catch (error) {
        console.error("Error al obtener los trámites:", error);
        setTramites([]);
      } finally {
        setLoading(false);
      }
    },
    [filters],
  );

  useEffect(() => {
    obtenerTramites(1);
  }, [filters, obtenerTramites]);

  useEffect(() => {
    localStorage.setItem("searchQuery", filters.search);
    localStorage.setItem("searchQueryFianza", filters.numero_fianza);
    localStorage.setItem("movimientoFiltro", filters.movimiento);
    localStorage.setItem("estatusFiltro", filters.estatus);
    localStorage.setItem("pagoFilter", filters.estatus_pago);
    localStorage.setItem("afianzadoraFiltro", filters.afianzadora_id || "");
  }, [filters]);

  // --- Actualización de Estatus Inline ---
  const actualizarEstatusRapido = async (tramiteId, nuevoEstatusNombre) => {
    try {
      // 1. Buscar el ID del estatus seleccionado del catálogo
      const estatusObj = estatus.find((e) => e.nombre === nuevoEstatusNombre);
      if (!estatusObj) return;

      // 2. Usar tu servicio centralizado
      const response = await actualizarEstatusTramite(tramiteId, estatusObj.id);

      // Si tu fetchApi devuelve el error o no es exitoso
      if (response?.error) {
        throw new Error(response.error);
      }

      toast.success("Estatus actualizado exitosamente");
      obtenerTramites(pagination.currentPage); // Refresca la tabla para ver el cambio
    } catch (error) {
      toast.error(
        `Error al actualizar: ${error.message || "Fallo en el servidor"}`,
      );
      console.error("Detalle del error:", error);
    }
  };

  // --- Definición de Columnas para TanStack Table ---
  const columns = useMemo(
    () => [
      { accessorKey: "folio", header: "Folio" },
      { accessorKey: "beneficiario_nombre", header: "Beneficiario" },
      { accessorKey: "numero_fianza", header: "Fianza" },
      { accessorKey: "cliente_nombre", header: "Nombre" },
      {
        accessorKey: "fecha",
        header: "Fecha",
        cell: ({ row }) => {
          const fecha = row.original.fecha;
          if (!fecha) return "";
          try {
            return format(parseISO(fecha), "dd/MM/yyyy");
          } catch (e) {
            return fecha;
          }
        },
      },
      { accessorKey: "movimiento_nombre", header: "Movimiento" },
      { accessorKey: "afianzadora_nombre", header: "Afianzadora" },
      {
        accessorKey: "estatus_nombre",
        header: "Estatus",
        cell: ({ row }) => {
          const tramite = row.original;
          return (
            <select
              className={`border border-transparent rounded-md p-1.5 text-xs font-bold cursor-pointer outline-none focus:ring-2 focus:ring-primary ${
                statusStyles[tramite.estatus_nombre] ||
                "bg-gray-200 text-gray-700"
              }`}
              value={tramite.estatus_nombre}
              onChange={(e) =>
                actualizarEstatusRapido(tramite.id, e.target.value)
              }
              onClick={(e) => e.stopPropagation()}
            >
              <option value={tramite.estatus_nombre}>
                {tramite.estatus_nombre}
              </option>
              {estatus
                .filter((e) => e.nombre !== tramite.estatus_nombre)
                .map((e) => (
                  <option key={e.id} value={e.nombre}>
                    {e.nombre}
                  </option>
                ))}
            </select>
          );
        },
      },
      { accessorKey: "tipo_proceso", header: "Responsable" },
      { accessorKey: "estatus_pago", header: "Pago" },
      {
        id: "observaciones",
        header: "Obs.",
        cell: ({ row }) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setModalObservaciones({
                isOpen: true,
                tramiteId: row.original.id,
              });
            }}
            className="flex items-center justify-center p-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-200 transition-colors"
            title="Ver/Agregar Observaciones"
          >
            <MessageSquare size={16} />
          </button>
        ),
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setModalEdicion({ isOpen: true, tramiteId: row.original.id });
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#003f4f] text-white rounded-md hover:bg-[#002b36] transition-colors text-xs font-medium"
            title="Edición Completa"
          >
            <Edit size={14} /> Editar
          </button>
        ),
      },
    ],
    [estatus, pagination.currentPage],
  );

  // --- Instancia de TanStack Table ---
  const tramitesList = Array.isArray(tramites) ? tramites : [];
  const table = useReactTable({
    data: tramitesList,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // --- Filtros Handlers ---
  const [searchTimeout, setSearchTimeout] = useState(null);

  const handleSelectChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const limpiarFiltros = () => {
    setFilters({
      search: "",
      numero_fianza: "",
      movimiento: "",
      estatus: "",
      estatus_pago: "",
      agente_nombre: "",
      afianzadora_id: "",
    });
  };

  const hayFiltrosActivos = Object.values(filters).some((v) => v !== "");
  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.totalPages) obtenerTramites(page);
  };

  return (
    <div className="w-full p-5">
      <div className="flex flex-col space-y-6">
        {/* ENCABEZADO */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            Trámites
          </h1>
          <span className="text-sm text-gray-500">
            {pagination.count.toLocaleString()} trámites encontrados
          </span>
        </div>

        {/* FILTROS */}
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
                    numero_fianza: "",
                  }));
                }, 500);
                setSearchTimeout(timeout);
              }}
              className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="relative">
            <select
              value={filters.movimiento}
              onChange={(e) => handleSelectChange("movimiento", e.target.value)}
              className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
            >
              <option value="">Todos los movimientos</option>
              {movimientos.map((m) => (
                <option key={m.id} value={m.nombre}>
                  {m.nombre}
                </option>
              ))}
            </select>
            <FiChevronDown className="absolute top-1/2 right-4 transform -translate-y-1/2 pointer-events-none text-gray-500" />
          </div>

          <div className="flex items-center gap-4 relative col-span-1">
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
                className="text-sm text-gray-500 hover:text-gray-700 underline whitespace-nowrap"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-auto flex-1">
              <select
                value={filters.estatus}
                onChange={(e) => handleSelectChange("estatus", e.target.value)}
                className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
              >
                <option value="">Todos los estatus</option>
                {estatus.map((e) => (
                  <option key={e.id} value={e.nombre}>
                    {e.nombre}
                  </option>
                ))}
              </select>
              <FiChevronDown className="absolute top-1/2 right-4 transform -translate-y-1/2 pointer-events-none text-gray-500" />
            </div>

            <button
              className="h-10 px-4 py-2 rounded-md bg-[#003f4f] text-white text-sm font-medium hover:bg-[#002b36] focus:outline-none focus:ring-2 focus:ring-green-500 whitespace-nowrap"
              onClick={() => setIsFormVisible(true)}
            >
              Nuevo trámite
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            className="h-10 px-4 py-2 rounded-md bg-[#003f4f] text-white text-sm font-medium hover:bg-[#002b36] focus:outline-none whitespace-nowrap"
            onClick={() => navigate("/comparar-tramites")}
          >
            Comparar trámite
          </button>

          <div className="flex items-center space-x-3">
            <label className="group flex items-center cursor-pointer gap-3">
              <div
                className={`w-8 h-8 flex justify-center items-center rounded-md border-2 shadow-md transition-all duration-300 ${
                  filters.agente_nombre === "RBG-PP"
                    ? "bg-[#003f4f] border-[#003f4f]"
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

          <div className="relative sm:w-auto flex-1">
            <select
              value={filters.afianzadora_id}
              onChange={(e) => {
                localStorage.setItem("afianzadoraFiltro", e.target.value);
                setFilters((prev) => ({
                  ...prev,
                  afianzadora_id: e.target.value,
                }));
              }}
              className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
            >
              <option value="">Afianzadora</option>
              {afianzadoras.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
            <FiChevronDown className="absolute top-1/2 right-4 transform -translate-y-1/2 pointer-events-none text-gray-500" />
          </div>
        </div>
      </div>

      {/* RENDERIZADO DE LA TANSTACK TABLE */}
      <div className="rounded-lg border border-gray-200 overflow-hidden mt-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="bg-gray-50 border-b border-gray-200"
                >
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left font-medium text-gray-600 whitespace-nowrap"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      Cargando trámites...
                    </div>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No se encontraron trámites
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => {
                      navigate(`/vistaprevia`, {
                        state: {
                          id: row.original.id,
                          listaIds: tramitesList.map((t) => t.id),
                        },
                      });
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 text-gray-800">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Página {pagination.currentPage} de {pagination.totalPages} {" · "}{" "}
              {pagination.count.toLocaleString()} registros
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(1)}
                disabled={pagination.currentPage === 1 || loading}
                className="px-3 py-1 text-sm border rounded-md hover:bg-gray-100 disabled:opacity-50"
              >
                Primera
              </button>
              <button
                onClick={() => goToPage(pagination.currentPage - 1)}
                disabled={!pagination.previous || loading}
                className="p-2 border rounded-md hover:bg-gray-100 disabled:opacity-50"
              >
                <FiChevronLeft />
              </button>

              <div className="flex gap-1">
                {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) pageNum = i + 1;
                  else if (pagination.currentPage <= 3) pageNum = i + 1;
                  else if (pagination.currentPage >= pagination.totalPages - 2)
                    pageNum = pagination.totalPages - 4 + i;
                  else pageNum = pagination.currentPage - 2 + i;
                  if (pageNum < 1 || pageNum > pagination.totalPages)
                    return null;

                  return (
                    <button
                      key={`page-${pageNum}`}
                      onClick={() => goToPage(pageNum)}
                      disabled={loading}
                      className={`px-3 py-1 text-sm border rounded-md ${pageNum === pagination.currentPage ? "bg-primary text-white border-primary" : "hover:bg-gray-100"} disabled:cursor-not-allowed`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => goToPage(pagination.currentPage + 1)}
                disabled={!pagination.next || loading}
                className="p-2 border rounded-md hover:bg-gray-100 disabled:opacity-50"
              >
                <FiChevronRight />
              </button>
              <button
                onClick={() => goToPage(pagination.totalPages)}
                disabled={
                  pagination.currentPage === pagination.totalPages || loading
                }
                className="px-3 py-1 text-sm border rounded-md hover:bg-gray-100 disabled:opacity-50"
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
        onSuccess={() => obtenerTramites(1)}
      />

      {/* MODAL: Edición Completa */}
      <Dialog
        open={modalEdicion.isOpen}
        onOpenChange={(open) =>
          setModalEdicion({ isOpen: open, tramiteId: null })
        }
      >
        <DialogContent className="max-w-6xl w-full p-0 overflow-hidden bg-[#f4f6f8]">
          <DialogTitle className="sr-only">Editar Trámite</DialogTitle>
          {modalEdicion.tramiteId && (
            <TramiteCliente
              idTramite={modalEdicion.tramiteId}
              onClose={() => {
                setModalEdicion({ isOpen: false, tramiteId: null });
                obtenerTramites(pagination.currentPage);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL: Observaciones */}
      <Dialog
        open={modalObservaciones.isOpen}
        onOpenChange={(open) =>
          setModalObservaciones({ isOpen: open, tramiteId: null })
        }
      >
        <DialogContent className="max-w-3xl w-full p-6">
          <DialogTitle className="sr-only">Gestionar Observaciones</DialogTitle>
          {modalObservaciones.tramiteId && (
            <GestionObservaciones
              tramiteId={modalObservaciones.tramiteId}
              usuario={usuario}
            />
          )}
        </DialogContent>
      </Dialog>

      <Toaster position="top-center" richColors />
    </div>
  );
}
